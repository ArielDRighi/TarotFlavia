import { describe, it, expect, vi } from 'vitest';

import {
  parseSitemap,
  toPathname,
  countWords,
  sectionOf,
  groupBySection,
  stratifiedSample,
  deriveDynamicPrefixes,
  withCacheBuster,
  parseArgs,
  evaluate,
  formatReport,
  run,
  extractNavPaths,
  hasNoindex,
  SLUG_INVENTADO,
  RUTAS_EXENTAS,
} from './check-indexable-content.mjs';

// =============================================================================
// HELPERS DE TEST
// =============================================================================

/**
 * Arma un sitemap XML mínimo con las URLs dadas.
 */
function sitemapXml(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc><priority>0.8</priority></url>`).join('\n')}
</urlset>`;
}

/**
 * Arma una respuesta HTML con el chrome (header + footer) y el contenido propio.
 */
function pageHtml(palabrasPropias) {
  const chrome = '<header>uno dos tres</header><footer>cuatro cinco</footer>';
  const cuerpo = Array.from({ length: palabrasPropias }, (_, i) => `palabra${i}`).join(' ');
  return `<html><body>${chrome}<main>${cuerpo}</main></body></html>`;
}

const CHROME_WORDS = 5;

/**
 * Construye un `fetch` falso a partir de un mapa `pathname -> { status, html }`.
 * Registra las URLs pedidas para poder aseverar sobre el cache-buster.
 */
function fakeFetch(rutas, { pedidas = [] } = {}) {
  return vi.fn(async (url) => {
    pedidas.push(url);
    const { pathname } = new URL(url);
    const respuesta = rutas[pathname];

    if (!respuesta) {
      return {
        status: 404,
        ok: false,
        text: async () => '<html><body>No encontrado</body></html>',
      };
    }

    return {
      status: respuesta.status ?? 200,
      ok: (respuesta.status ?? 200) < 400,
      text: async () => respuesta.html ?? '',
    };
  });
}

// =============================================================================
// parseSitemap
// =============================================================================

describe('parseSitemap', () => {
  it('extrae las URLs de los <loc> del sitemap', () => {
    const xml = sitemapXml(['https://auguriatarot.com/', 'https://auguriatarot.com/premium']);

    expect(parseSitemap(xml)).toEqual([
      'https://auguriatarot.com/',
      'https://auguriatarot.com/premium',
    ]);
  });

  it('tolera saltos de línea y espacios dentro del <loc>', () => {
    const xml = '<urlset><url><loc>\n  https://auguriatarot.com/horoscopo\n  </loc></url></urlset>';

    expect(parseSitemap(xml)).toEqual(['https://auguriatarot.com/horoscopo']);
  });

  it('soporta <loc> envuelto en CDATA', () => {
    const xml = '<url><loc><![CDATA[https://auguriatarot.com/servicios]]></loc></url>';

    expect(parseSitemap(xml)).toEqual(['https://auguriatarot.com/servicios']);
  });

  it('descarta duplicados conservando el orden', () => {
    const xml = sitemapXml([
      'https://auguriatarot.com/premium',
      'https://auguriatarot.com/premium',
      'https://auguriatarot.com/explorar',
    ]);

    expect(parseSitemap(xml)).toEqual([
      'https://auguriatarot.com/premium',
      'https://auguriatarot.com/explorar',
    ]);
  });

  it('devuelve un array vacío si no hay <loc>', () => {
    expect(parseSitemap('<urlset></urlset>')).toEqual([]);
  });

  it('aborta con un mensaje claro ante un sitemap index', () => {
    const xml =
      '<sitemapindex><sitemap><loc>https://auguriatarot.com/sitemap/0.xml</loc></sitemap></sitemapindex>';

    expect(() => parseSitemap(xml)).toThrow(/índice/i);
  });
});

// =============================================================================
// toPathname
// =============================================================================

describe('toPathname', () => {
  it('devuelve el pathname de una URL absoluta', () => {
    expect(toPathname('https://auguriatarot.com/enciclopedia/tarot/el-loco')).toBe(
      '/enciclopedia/tarot/el-loco'
    );
  });

  it('descarta query string y hash', () => {
    expect(toPathname('https://auguriatarot.com/horoscopo?cb=1#hoy')).toBe('/horoscopo');
  });

  it('normaliza la raíz', () => {
    expect(toPathname('https://auguriatarot.com')).toBe('/');
    expect(toPathname('https://auguriatarot.com/')).toBe('/');
  });

  it('quita la barra final de rutas internas', () => {
    expect(toPathname('https://auguriatarot.com/premium/')).toBe('/premium');
  });

  it('resuelve un <loc> relativo contra la base', () => {
    expect(toPathname('/enciclopedia/tarot', 'https://auguriatarot.com')).toBe(
      '/enciclopedia/tarot'
    );
  });

  it('dice qué URL era cuando no puede parsearla', () => {
    expect(() => toPathname('no-es-una-url')).toThrow(/no-es-una-url/);
  });
});

// =============================================================================
// countWords
// =============================================================================

describe('countWords', () => {
  it('cuenta solo el texto visible, sin etiquetas', () => {
    expect(countWords('<div><p>hola  mundo</p><span>tres</span></div>')).toBe(3);
  });

  it('ignora el contenido de script, style y noscript', () => {
    const html = `
      <script>const a = 1; const b = 2; console.log('muchas palabras acá');</script>
      <style>.clase { color: red; background: blue; }</style>
      <noscript>activá javascript por favor</noscript>
      <p>solo esto cuenta</p>`;

    expect(countWords(html)).toBe(3);
  });

  it('ignora los comentarios HTML', () => {
    expect(countWords('<!-- esto no cuenta para nada --><p>uno dos</p>')).toBe(2);
  });

  it('decodifica entidades para no contarlas como palabras', () => {
    expect(countWords('<p>caf&eacute;&nbsp;con&nbsp;leche &amp; medialunas</p>')).toBe(5);
  });

  it('devuelve 0 para HTML sin texto', () => {
    expect(countWords('<html><body><div></div></body></html>')).toBe(0);
    expect(countWords('')).toBe(0);
  });

  it('no confunde un < o > sueltos del texto con etiquetas', () => {
    // Entra por el HTML que viene de la API (artículos y rituales).
    expect(countWords('<p>5 < 7 y 8 > 2 fin</p>')).toBe(8);
  });

  it('tolera un > dentro de un atributo entrecomillado', () => {
    expect(countWords('<div title="x > y z">uno dos</div>')).toBe(2);
  });

  it('ignora el doctype', () => {
    expect(countWords('<!doctype html><p>uno dos</p>')).toBe(2);
  });

  it('no inyecta el prototipo de Object ante una entidad inventada', () => {
    expect(countWords('<p>a&constructor;b</p>')).toBe(2);
  });

  it('una entidad desconocida separa, no pega, las palabras vecinas', () => {
    expect(countWords('<p>hola&iexcl;mundo chau</p>')).toBe(3);
  });
});

// =============================================================================
// sectionOf / groupBySection
// =============================================================================

describe('sectionOf', () => {
  it('trata cada ruta de primer nivel como su propia sección', () => {
    // Los hubs estáticos (/premium, /explorar, ...) no comparten nada entre sí:
    // si cayeran en un mismo grupo, un `--sample 2` mediría dos y dejaría el
    // resto sin ver, que es justo cómo se escaparon 6 hubs de la muestra de agosto.
    expect(sectionOf('/')).toBe('/');
    expect(sectionOf('/premium')).toBe('/premium');
  });

  it('usa la ruta padre como sección de las rutas anidadas', () => {
    expect(sectionOf('/horoscopo/aries')).toBe('/horoscopo');
    expect(sectionOf('/enciclopedia/tarot/el-loco')).toBe('/enciclopedia/tarot');
    expect(sectionOf('/enciclopedia/astrologia/signos/aries')).toBe(
      '/enciclopedia/astrologia/signos'
    );
  });
});

describe('groupBySection', () => {
  it('agrupa las rutas por sección conservando el orden', () => {
    const grupos = groupBySection([
      '/premium',
      '/horoscopo/aries',
      '/horoscopo/tauro',
      '/enciclopedia/tarot/el-loco',
    ]);

    expect([...grupos.keys()]).toEqual(['/premium', '/horoscopo', '/enciclopedia/tarot']);
    expect(grupos.get('/horoscopo')).toEqual(['/horoscopo/aries', '/horoscopo/tauro']);
  });
});

// =============================================================================
// stratifiedSample
// =============================================================================

describe('stratifiedSample', () => {
  const rutas = [
    '/premium',
    '/servicios',
    '/horoscopo/aries',
    '/horoscopo/tauro',
    '/horoscopo/geminis',
  ];

  it('toma como máximo N rutas por sección', () => {
    expect(stratifiedSample(rutas, 1)).toEqual(['/premium', '/servicios', '/horoscopo/aries']);
  });

  it('nunca descarta una ruta de primer nivel', () => {
    expect(stratifiedSample(rutas, 1)).toEqual(expect.arrayContaining(['/premium', '/servicios']));
  });

  it('devuelve todas las rutas si N supera el tamaño de cada sección', () => {
    // Mismo conjunto; dentro de cada sección quedan ordenadas alfabéticamente
    // para que dos corridas midan lo mismo aunque la API devuelva otro orden.
    expect(stratifiedSample(rutas, 10).sort()).toEqual([...rutas].sort());
  });

  it('es determinístico: dos corridas dan el mismo resultado', () => {
    expect(stratifiedSample(rutas, 2)).toEqual(stratifiedSample(rutas, 2));
  });

  it('devuelve todas las rutas si no se pide muestreo', () => {
    expect(stratifiedSample(rutas, undefined)).toEqual(rutas);
  });
});

// =============================================================================
// deriveDynamicPrefixes
// =============================================================================

describe('deriveDynamicPrefixes', () => {
  it('detecta como ruta dinámica el padre con suficientes hijos', () => {
    const rutas = [
      '/enciclopedia/tarot/el-loco',
      '/enciclopedia/tarot/el-mago',
      '/enciclopedia/tarot/la-sacerdotisa',
      '/premium',
    ];

    expect(deriveDynamicPrefixes(rutas, { minChildren: 3 })).toEqual(['/enciclopedia/tarot']);
  });

  it('ignora los padres con pocos hijos', () => {
    const rutas = ['/rituales/luna-llena', '/rituales/proteccion'];

    expect(deriveDynamicPrefixes(rutas, { minChildren: 3 })).toEqual([]);
  });

  it('nunca propone la raíz como ruta dinámica', () => {
    const rutas = ['/premium', '/servicios', '/explorar', '/contacto'];

    expect(deriveDynamicPrefixes(rutas, { minChildren: 3 })).toEqual([]);
  });
});

// =============================================================================
// withCacheBuster
// =============================================================================

describe('withCacheBuster', () => {
  it('agrega el parámetro cb a una URL sin query', () => {
    expect(withCacheBuster('https://auguriatarot.com/premium', 'abc')).toBe(
      'https://auguriatarot.com/premium?cb=abc'
    );
  });

  it('conserva la query existente', () => {
    const resultado = withCacheBuster('https://auguriatarot.com/horoscopo?elemento=fuego', 'abc');

    expect(resultado).toContain('elemento=fuego');
    expect(resultado).toContain('cb=abc');
  });
});

// =============================================================================
// parseArgs
// =============================================================================

describe('parseArgs', () => {
  it('aplica los valores por defecto', () => {
    const opciones = parseArgs([], { NEXT_PUBLIC_APP_URL: 'https://auguriatarot.com' });

    expect(opciones.baseUrl).toBe('https://auguriatarot.com');
    expect(opciones.minWords).toBe(120);
    expect(opciones.sample).toBeUndefined();
    expect(opciones.checkSoft404).toBe(true);
  });

  it('acepta --flag valor y --flag=valor', () => {
    expect(parseArgs(['--base-url', 'http://localhost:3099', '--min-words', '150']).baseUrl).toBe(
      'http://localhost:3099'
    );
    expect(parseArgs(['--base-url=http://localhost:3099', '--min-words=150']).minWords).toBe(150);
  });

  it('parsea --sample como número', () => {
    expect(parseArgs(['--sample', '3', '--base-url=http://x']).sample).toBe(3);
  });

  it('desactiva la detección de soft-404 con --no-soft-404', () => {
    expect(parseArgs(['--no-soft-404', '--base-url=http://x']).checkSoft404).toBe(false);
  });

  it('rechaza opciones desconocidas', () => {
    expect(() => parseArgs(['--inventada', '--base-url=http://x'])).toThrow(/desconocida/i);
  });

  it('rechaza valores numéricos inválidos', () => {
    expect(() => parseArgs(['--min-words', 'muchas', '--base-url=http://x'])).toThrow(/número/i);
  });

  it('exige una base URL cuando no hay variable de entorno', () => {
    expect(() => parseArgs([], {})).toThrow(/--base-url/);
  });

  it('acepta --full, --json, --chrome-route, --concurrency y --timeout', () => {
    const opciones = parseArgs([
      '--base-url=http://x',
      '--sample=5',
      '--full',
      '--json',
      '--chrome-route=/vacia',
      '--concurrency=2',
      '--timeout=5000',
    ]);

    expect(opciones).toMatchObject({
      sample: undefined,
      json: true,
      chromeRoute: '/vacia',
      concurrency: 2,
      timeout: 5000,
    });
  });

  it('no exige base URL para pedir la ayuda', () => {
    expect(parseArgs(['--help'], {}).help).toBe(true);
    expect(parseArgs(['-h'], {}).help).toBe(true);
  });

  it('falla si una opción se queda sin valor', () => {
    expect(() => parseArgs(['--base-url'])).toThrow(/falta el valor/i);
  });

  it('rechaza umbrales que apagarían el guardarraíl en silencio', () => {
    expect(() => parseArgs(['--base-url=http://x', '--min-words='])).toThrow(/entero/i);
    expect(() => parseArgs(['--base-url=http://x', '--min-words=-5'])).toThrow(/entero/i);
    expect(() => parseArgs(['--base-url=http://x', '--concurrency=0'])).toThrow(/entero/i);
  });

  it('exige que la base URL traiga esquema', () => {
    expect(() => parseArgs(['--base-url=localhost:3099'])).toThrow(/esquema/i);
  });

  it('acepta --fail-on-soft-404 y --user-agent', () => {
    const opciones = parseArgs([
      '--base-url=http://x',
      '--fail-on-soft-404',
      '--user-agent=Auguria/1.0',
    ]);

    expect(opciones.failOnSoft404).toBe(true);
    expect(opciones.userAgent).toBe('Auguria/1.0');
  });

  it('⚠️ T-SEO-006: los soft-404 cuentan para el exit code por default', () => {
    expect(parseArgs(['--base-url=http://x']).failOnSoft404).toBe(true);
  });

  it('--no-fail-on-soft-404 los vuelve a dejar fuera del exit code', () => {
    const opciones = parseArgs(['--base-url=http://x', '--no-fail-on-soft-404']);

    expect(opciones.failOnSoft404).toBe(false);
    expect(opciones.checkSoft404).toBe(true);
  });
});

// =============================================================================
// evaluate
// =============================================================================

describe('evaluate', () => {
  const mediciones = [
    { pathname: '/premium', status: 200, ownWords: 3 },
    { pathname: '/horoscopo/aries', status: 200, ownWords: 31 },
    { pathname: '/enciclopedia/tarot/el-loco', status: 200, ownWords: 200 },
  ];

  it('marca como fallidas las rutas por debajo del umbral', () => {
    const resultado = evaluate(mediciones, { minWords: 120, exceptions: new Map() });

    expect(resultado.failures.map((m) => m.pathname)).toEqual(['/premium', '/horoscopo/aries']);
    expect(resultado.exitCode).toBe(1);
  });

  it('ordena las mediciones de menos a más palabras', () => {
    const resultado = evaluate(mediciones, { minWords: 120, exceptions: new Map() });

    expect(resultado.rows.map((m) => m.ownWords)).toEqual([3, 31, 200]);
  });

  it('devuelve exit code 0 si el umbral queda por debajo de todas', () => {
    const resultado = evaluate(mediciones, { minWords: 3, exceptions: new Map() });

    expect(resultado.failures).toEqual([]);
    expect(resultado.exitCode).toBe(0);
  });

  it('no falla por las rutas exentas, pero las reporta', () => {
    const exceptions = new Map([['/premium', 'motivo documentado']]);
    const resultado = evaluate(mediciones, { minWords: 120, exceptions });

    expect(resultado.failures.map((m) => m.pathname)).toEqual(['/horoscopo/aries']);
    expect(resultado.exempt.map((m) => m.pathname)).toEqual(['/premium']);
  });

  it('falla ante una ruta que no responde 200 aunque tenga palabras', () => {
    const resultado = evaluate([{ pathname: '/roto', status: 500, ownWords: 500 }], {
      minWords: 120,
      exceptions: new Map(),
    });

    expect(resultado.failures.map((m) => m.pathname)).toEqual(['/roto']);
    expect(resultado.exitCode).toBe(1);
  });
});

// =============================================================================
// formatReport
// =============================================================================

describe('formatReport', () => {
  it('arma una tabla con la ruta y las palabras propias', () => {
    const salida = formatReport({
      rows: [{ pathname: '/premium', status: 200, ownWords: 3, totalWords: 42 }],
      failures: [{ pathname: '/premium', status: 200, ownWords: 3, totalWords: 42 }],
      exempt: [],
      minWords: 120,
      chromeWords: 39,
      softNotFound: [],
    });

    expect(salida).toContain('/premium');
    expect(salida).toContain('3');
    expect(salida).toContain('120');
  });

  it('lista los soft-404 detectados', () => {
    const salida = formatReport({
      rows: [],
      failures: [],
      exempt: [],
      minWords: 120,
      chromeWords: 39,
      softNotFound: [{ pathname: '/enciclopedia/tarot/inventado-xyz', status: 200 }],
    });

    expect(salida).toContain('/enciclopedia/tarot/inventado-xyz');
    expect(salida).toMatch(/soft-404/i);
  });

  it('no afirma que no hay soft-404 cuando el sondeo está apagado', () => {
    const salida = formatReport({
      rows: [],
      failures: [],
      exempt: [],
      minWords: 120,
      chromeWords: 39,
      softNotFound: [],
      checkSoft404: false,
    });

    expect(salida).toMatch(/sin sondear|omitid/i);
  });
});

// =============================================================================
// run (orquestación con fetch inyectado)
// =============================================================================

describe('run', () => {
  const BASE = 'https://auguriatarot.com';

  const rutasBase = {
    '/sitemap.xml': {
      html: sitemapXml([
        `${BASE}/premium`,
        `${BASE}/horoscopo/aries`,
        `${BASE}/horoscopo/tauro`,
        `${BASE}/horoscopo/geminis`,
      ]),
    },
    '/admin': { html: pageHtml(0) },
    '/premium': { html: pageHtml(3) },
    '/horoscopo/aries': { html: pageHtml(300) },
    '/horoscopo/tauro': { html: pageHtml(300) },
    '/horoscopo/geminis': { html: pageHtml(300) },
  };

  const opcionesBase = {
    baseUrl: BASE,
    minWords: 120,
    chromeRoute: '/admin',
    concurrency: 4,
    checkSoft404: false,
    exceptions: new Map(),
  };

  it('descuenta el chrome medido contra la ruta vacía', async () => {
    const fetchImpl = fakeFetch(rutasBase);
    const resultado = await run(opcionesBase, { fetchImpl, log: vi.fn() });

    expect(resultado.chromeWords).toBe(CHROME_WORDS);
    const premium = resultado.rows.find((r) => r.pathname === '/premium');
    expect(premium.totalWords).toBe(3 + CHROME_WORDS);
    expect(premium.ownWords).toBe(3);
  });

  it('falla con exit code 1 cuando hay rutas delgadas', async () => {
    const resultado = await run(opcionesBase, { fetchImpl: fakeFetch(rutasBase), log: vi.fn() });

    expect(resultado.failures.map((f) => f.pathname)).toEqual(['/premium']);
    expect(resultado.exitCode).toBe(1);
  });

  it('devuelve exit code 0 si se baja el umbral por debajo de las delgadas', async () => {
    const resultado = await run(
      { ...opcionesBase, minWords: 3 },
      { fetchImpl: fakeFetch(rutasBase), log: vi.fn() }
    );

    expect(resultado.exitCode).toBe(0);
  });

  it('pide todas las URLs con cache-buster', async () => {
    const pedidas = [];
    await run(opcionesBase, { fetchImpl: fakeFetch(rutasBase, { pedidas }), log: vi.fn() });

    expect(pedidas.length).toBeGreaterThan(0);
    expect(pedidas.every((url) => url.includes('cb='))).toBe(true);
  });

  it('respeta el muestreo estratificado', async () => {
    const resultado = await run(
      { ...opcionesBase, sample: 1 },
      { fetchImpl: fakeFetch(rutasBase), log: vi.fn() }
    );

    expect(resultado.rows.map((r) => r.pathname).sort()).toEqual(['/horoscopo/aries', '/premium']);
  });

  it('detecta el soft-404 de una ruta dinámica', async () => {
    const rutas = {
      ...rutasBase,
      [`/horoscopo/${SLUG_INVENTADO}`]: { status: 200, html: pageHtml(2) },
    };

    const resultado = await run(
      { ...opcionesBase, checkSoft404: true },
      { fetchImpl: fakeFetch(rutas), log: vi.fn() }
    );

    expect(resultado.softNotFound.map((s) => s.pathname)).toEqual([`/horoscopo/${SLUG_INVENTADO}`]);
  });

  it('no reporta soft-404 cuando la ruta inventada responde 404', async () => {
    const resultado = await run(
      { ...opcionesBase, checkSoft404: true },
      { fetchImpl: fakeFetch(rutasBase), log: vi.fn() }
    );

    expect(resultado.softNotFound).toEqual([]);
  });

  it('marca como fallida una ruta que responde con error', async () => {
    const rutas = { ...rutasBase, '/premium': { status: 500, html: pageHtml(400) } };
    const resultado = await run(opcionesBase, { fetchImpl: fakeFetch(rutas), log: vi.fn() });

    expect(resultado.failures.map((f) => f.pathname)).toEqual(['/premium']);
  });

  it('aborta con un mensaje claro si el sitemap no responde', async () => {
    const fetchImpl = fakeFetch({});

    await expect(run(opcionesBase, { fetchImpl, log: vi.fn() })).rejects.toThrow(/sitemap/i);
  });

  it('aborta si no puede medir el chrome, en vez de ablandar el umbral', async () => {
    // Con chromeWords = 0 cada página ganaría ~39 palabras fantasma y el
    // guardarraíl dejaría pasar páginas delgadas sin decir nada.
    const rutas = { ...rutasBase, '/admin': { status: 302, html: '' } };

    await expect(run(opcionesBase, { fetchImpl: fakeFetch(rutas), log: vi.fn() })).rejects.toThrow(
      /chrome/i
    );
  });

  it('una request que rechaza no tumba la corrida: se reporta como fila fallida', async () => {
    const fetchImpl = vi.fn(async (url) => {
      const { pathname } = new URL(url);
      if (pathname === '/horoscopo/tauro') throw new TypeError('fetch failed');
      return fakeFetch(rutasBase)(url);
    });

    const resultado = await run(opcionesBase, { fetchImpl, log: vi.fn() });

    expect(resultado.rows).toHaveLength(4);
    const caida = resultado.rows.find((r) => r.pathname === '/horoscopo/tauro');
    expect(caida).toMatchObject({ status: 0, ownWords: 0, error: 'fetch failed' });
    expect(resultado.failures.map((f) => f.pathname)).toContain('/horoscopo/tauro');
    expect(resultado.rows.find((r) => r.pathname === '/horoscopo/aries').ownWords).toBe(300);
  });

  it('respeta el tope de concurrencia', async () => {
    let enVuelo = 0;
    let pico = 0;
    const base = fakeFetch(rutasBase);
    const fetchImpl = vi.fn(async (url) => {
      enVuelo += 1;
      pico = Math.max(pico, enVuelo);
      await new Promise((resolve) => setTimeout(resolve, 1));
      enVuelo -= 1;
      return base(url);
    });

    await run({ ...opcionesBase, concurrency: 2 }, { fetchImpl, log: vi.fn() });

    expect(pico).toBeLessThanOrEqual(2);
  });

  it('⚠️ T-SEO-006: un soft-404 hace fallar la corrida salvo --no-fail-on-soft-404', async () => {
    const rutas = {
      ...rutasBase,
      '/premium': { html: pageHtml(300) },
      [`/horoscopo/${SLUG_INVENTADO}`]: { status: 200, html: pageHtml(2) },
    };

    const porDefault = await run(
      { ...opcionesBase, checkSoft404: true, failOnSoft404: true },
      { fetchImpl: fakeFetch(rutas), log: vi.fn() }
    );
    expect(porDefault.softNotFound).toHaveLength(1);
    expect(porDefault.exitCode).toBe(1);

    const ignorados = await run(
      { ...opcionesBase, checkSoft404: true, failOnSoft404: false },
      { fetchImpl: fakeFetch(rutas), log: vi.fn() }
    );
    expect(ignorados.softNotFound).toHaveLength(1);
    expect(ignorados.exitCode).toBe(0);
  });

  it('reporta la ruta final cuando hubo redirect', async () => {
    const fetchImpl = vi.fn(async (url) => {
      const respuesta = await fakeFetch(rutasBase)(url);
      const { pathname } = new URL(url);
      return {
        ...respuesta,
        url: pathname === '/premium' ? 'https://auguriatarot.com/login' : url,
      };
    });

    const resultado = await run(opcionesBase, { fetchImpl, log: vi.fn() });

    expect(resultado.rows.find((r) => r.pathname === '/premium').redirectedTo).toBe('/login');
  });

  it('aborta si el sitemap no declara ninguna URL', async () => {
    const fetchImpl = fakeFetch({ '/sitemap.xml': { html: sitemapXml([]) } });

    await expect(run(opcionesBase, { fetchImpl, log: vi.fn() })).rejects.toThrow(/ninguna URL/i);
  });

  it('emite JSON cuando se pide --json', async () => {
    const log = vi.fn();
    await run({ ...opcionesBase, json: true }, { fetchImpl: fakeFetch(rutasBase), log });

    expect(() => JSON.parse(log.mock.calls[0][0])).not.toThrow();
  });

  it('no falla por las rutas exentas configuradas', async () => {
    const resultado = await run(
      { ...opcionesBase, exceptions: new Map([['/premium', 'landing sin texto, T-SEO-003']]) },
      { fetchImpl: fakeFetch(rutasBase), log: vi.fn() }
    );

    expect(resultado.failures).toEqual([]);
    expect(resultado.exempt.map((e) => e.pathname)).toEqual(['/premium']);
    expect(resultado.exitCode).toBe(0);
  });

  it('nunca reporta palabras propias negativas', async () => {
    const rutas = { ...rutasBase, '/admin': { html: pageHtml(500) } };
    const resultado = await run(opcionesBase, { fetchImpl: fakeFetch(rutas), log: vi.fn() });

    expect(resultado.rows.every((r) => r.ownWords >= 0)).toBe(true);
  });
});

// =============================================================================
// T-SEO-015: menú (header + footer) y coherencia noindex ↔ sitemap
// =============================================================================

/**
 * Chrome con links en el header y el footer, como el que sirve `/admin` para un
 * visitante sin sesión. Los `href` externos y los `mailto:` no son rutas.
 */
function chromeConMenu() {
  return (
    '<header><a href="/">Auguria</a><nav><a href="/carta-del-dia">Carta</a>' +
    '<a href="/premium?ref=header#planes">Premium</a><a href="https://x.com/a">X</a>' +
    '<a href="mailto:hola@auguriatarot.com">Mail</a></nav></header>' +
    '<footer><a href="/contacto/">Contacto</a><a href="/carta-del-dia">Carta</a></footer>'
  );
}

function pageConChrome(chrome, palabrasPropias, { noindex = false } = {}) {
  const cuerpo = Array.from({ length: palabrasPropias }, (_, i) => `palabra${i}`).join(' ');
  const meta = noindex ? '<meta name="robots" content="noindex, follow"/>' : '';
  return `<html><head>${meta}</head><body>${chrome}<main>${cuerpo}</main></body></html>`;
}

describe('extractNavPaths', () => {
  it('devuelve las rutas internas del header y del footer, sin duplicar', () => {
    expect(extractNavPaths(chromeConMenu())).toEqual([
      '/',
      '/carta-del-dia',
      '/premium',
      '/contacto',
    ]);
  });

  it('ignora los links de fuera del header y del footer', () => {
    const html = '<header><a href="/a">a</a></header><main><a href="/b">b</a></main>';

    expect(extractNavPaths(html)).toEqual(['/a']);
  });

  it('descarta externos, mailto y anclas', () => {
    const html =
      '<footer><a href="https://auguriatarot.com/x">x</a><a href="mailto:a@b.c">m</a>' +
      '<a href="#top">t</a><a href="/ok">ok</a></footer>';

    expect(extractNavPaths(html)).toEqual(['/ok']);
  });

  it('acepta atributos con comillas simples y el href en cualquier posición', () => {
    const html = "<header><a class='x' href='/uno'>1</a><a href=\"/dos\" id='y'>2</a></header>";

    expect(extractNavPaths(html)).toEqual(['/uno', '/dos']);
  });

  it('devuelve vacío si no hay header ni footer', () => {
    expect(extractNavPaths('<main><a href="/a">a</a></main>')).toEqual([]);
  });
});

describe('hasNoindex', () => {
  it('detecta la meta robots con noindex, en cualquier orden de atributos', () => {
    expect(hasNoindex('<meta name="robots" content="noindex, follow"/>')).toBe(true);
    expect(hasNoindex('<meta content="noindex" name="robots">')).toBe(true);
    expect(hasNoindex('<META NAME="ROBOTS" CONTENT="NOINDEX">')).toBe(true);
  });

  it('no confunde index con noindex ni otras metas', () => {
    expect(hasNoindex('<meta name="robots" content="index, follow"/>')).toBe(false);
    expect(hasNoindex('<meta name="description" content="noindex"/>')).toBe(false);
    expect(hasNoindex('')).toBe(false);
  });

  it('acepta googlebot como nombre de la meta', () => {
    expect(hasNoindex('<meta name="googlebot" content="noindex"/>')).toBe(true);
  });
});

describe('evaluate — menú y noindex (T-SEO-015)', () => {
  const opciones = {
    minWords: 120,
    navMinWords: 500,
    exceptions: new Map(),
  };

  it('una ruta del menú sin noindex y bajo el umbral alto falla aunque supere el general', () => {
    const resultado = evaluate(
      [{ pathname: '/pendulo', status: 200, ownWords: 215, inSitemap: true, inNav: true }],
      opciones
    );

    expect(resultado.failures).toEqual([]);
    expect(resultado.navFailures.map((m) => m.pathname)).toEqual(['/pendulo']);
    expect(resultado.exitCode).toBe(1);
  });

  it('una ruta del menú con noindex y fuera del sitemap no falla por el umbral alto', () => {
    const resultado = evaluate(
      [{ pathname: '/premium', status: 200, ownWords: 280, inNav: true, noindex: true }],
      opciones
    );

    expect(resultado.navFailures).toEqual([]);
    expect(resultado.crossFailures).toEqual([]);
    expect(resultado.exitCode).toBe(0);
  });

  it('una ruta del menú que supera el umbral alto cumple', () => {
    const resultado = evaluate(
      [{ pathname: '/horoscopo', status: 200, ownWords: 640, inSitemap: true, inNav: true }],
      opciones
    );

    expect(resultado.navFailures).toEqual([]);
    expect(resultado.exitCode).toBe(0);
  });

  it('⚠️ una URL con noindex dentro del sitemap es un cruce prohibido', () => {
    const resultado = evaluate(
      [{ pathname: '/premium', status: 200, ownWords: 900, inSitemap: true, noindex: true }],
      opciones
    );

    expect(resultado.crossFailures.map((m) => m.pathname)).toEqual(['/premium']);
    expect(resultado.exitCode).toBe(1);
  });

  it('una ruta del menú que no responde 200 falla', () => {
    const resultado = evaluate([{ pathname: '/roto', status: 500, ownWords: 0, inNav: true }], {
      ...opciones,
    });

    expect(resultado.navFailures.map((m) => m.pathname)).toEqual(['/roto']);
  });

  it('las rutas exentas tampoco tumban la corrida por el umbral del menú', () => {
    const resultado = evaluate(
      [{ pathname: '/pendulo', status: 200, ownWords: 215, inSitemap: true, inNav: true }],
      { ...opciones, exceptions: new Map([['/pendulo', 'motivo']]) }
    );

    expect(resultado.navFailures).toEqual([]);
    expect(resultado.exempt.map((m) => m.pathname)).toEqual(['/pendulo']);
    expect(resultado.exitCode).toBe(0);
  });

  it('sin navMinWords ni banderas, se comporta como antes', () => {
    const resultado = evaluate([{ pathname: '/x', status: 200, ownWords: 130 }], {
      minWords: 120,
      exceptions: new Map(),
    });

    expect(resultado.failures).toEqual([]);
    expect(resultado.navFailures).toEqual([]);
    expect(resultado.crossFailures).toEqual([]);
    expect(resultado.exitCode).toBe(0);
  });
});

describe('parseArgs — --nav-min-words', () => {
  it('usa 500 por defecto', () => {
    expect(parseArgs(['--base-url', 'https://x.com'], {}).navMinWords).toBe(500);
  });

  it('acepta --nav-min-words', () => {
    expect(parseArgs(['--base-url', 'https://x.com', '--nav-min-words=700'], {}).navMinWords).toBe(
      700
    );
  });

  it('rechaza un --nav-min-words que apagaría el guardarraíl', () => {
    expect(() => parseArgs(['--base-url', 'https://x.com', '--nav-min-words', '-1'], {})).toThrow();
  });
});

describe('formatReport — menú y cruces', () => {
  const base = {
    exempt: [],
    minWords: 120,
    navMinWords: 500,
    chromeWords: 5,
    softNotFound: [],
  };

  it('lista las rutas del menú por debajo del umbral alto', () => {
    const fila = { pathname: '/pendulo', status: 200, ownWords: 215, inSitemap: true, inNav: true };
    const texto = formatReport({
      ...base,
      rows: [fila],
      failures: [],
      navFailures: [fila],
      crossFailures: [],
    });

    expect(texto).toMatch(/menú/i);
    expect(texto).toMatch(/500/);
    expect(texto).toMatch(/\/pendulo/);
  });

  it('lista los cruces noindex ↔ sitemap', () => {
    const fila = {
      pathname: '/premium',
      status: 200,
      ownWords: 900,
      inSitemap: true,
      noindex: true,
    };
    const texto = formatReport({
      ...base,
      rows: [fila],
      failures: [],
      navFailures: [],
      crossFailures: [fila],
    });

    expect(texto).toMatch(/noindex/);
    expect(texto).toMatch(/\/premium/);
  });

  it('marca en la tabla qué rutas son del menú y cuáles tienen noindex', () => {
    const texto = formatReport({
      ...base,
      rows: [
        { pathname: '/premium', status: 200, ownWords: 280, inNav: true, noindex: true },
        { pathname: '/horoscopo', status: 200, ownWords: 640, inSitemap: true, inNav: true },
      ],
      failures: [],
      navFailures: [],
      crossFailures: [],
    });

    const lineaPremium = texto.split('\n').find((l) => l.startsWith('/premium'));
    expect(lineaPremium).toMatch(/noindex/);
    expect(lineaPremium).toMatch(/menú/);
    expect(lineaPremium).toMatch(/✅/);
  });
});

describe('run — rastrea el menú (T-SEO-015)', () => {
  const BASE = 'https://auguriatarot.com';
  const chrome = chromeConMenu();

  const rutas = {
    '/sitemap.xml': { html: sitemapXml([`${BASE}/`, `${BASE}/carta-del-dia`, `${BASE}/contacto`]) },
    '/admin': { html: pageConChrome(chrome, 0) },
    '/': { html: pageConChrome(chrome, 900) },
    '/carta-del-dia': { html: pageConChrome(chrome, 220) },
    '/contacto': { html: pageConChrome(chrome, 600) },
    '/premium': { html: pageConChrome(chrome, 280, { noindex: true }) },
  };

  const opciones = {
    baseUrl: BASE,
    minWords: 120,
    navMinWords: 500,
    chromeRoute: '/admin',
    concurrency: 4,
    checkSoft404: false,
    exceptions: new Map(),
  };

  it('mide también las rutas del menú que no están en el sitemap', async () => {
    const pedidas = [];
    const resultado = await run(opciones, {
      fetchImpl: fakeFetch(rutas, { pedidas }),
      log: vi.fn(),
    });

    expect(pedidas.some((url) => new URL(url).pathname === '/premium')).toBe(true);
    const premium = resultado.rows.find((r) => r.pathname === '/premium');
    expect(premium).toMatchObject({ inNav: true, inSitemap: false, noindex: true });
  });

  it('falla por una ruta del menú con 220 palabras aunque pase el umbral general', async () => {
    const resultado = await run(opciones, { fetchImpl: fakeFetch(rutas), log: vi.fn() });

    expect(resultado.failures).toEqual([]);
    expect(resultado.navFailures.map((m) => m.pathname)).toEqual(['/carta-del-dia']);
    expect(resultado.exitCode).toBe(1);
  });

  it('no falla por /premium: tiene noindex y no está en el sitemap', async () => {
    const resultado = await run(opciones, { fetchImpl: fakeFetch(rutas), log: vi.fn() });

    expect(resultado.navFailures.map((m) => m.pathname)).not.toContain('/premium');
    expect(resultado.crossFailures).toEqual([]);
  });

  it('⚠️ falla si una URL del sitemap sirve noindex', async () => {
    const conCruce = {
      ...rutas,
      '/sitemap.xml': { html: sitemapXml([`${BASE}/`, `${BASE}/contacto`, `${BASE}/premium`]) },
    };
    const resultado = await run(opciones, { fetchImpl: fakeFetch(conCruce), log: vi.fn() });

    expect(resultado.crossFailures.map((m) => m.pathname)).toEqual(['/premium']);
    expect(resultado.exitCode).toBe(1);
  });

  it('pasa cuando todo el menú supera el umbral alto', async () => {
    const sano = { ...rutas, '/carta-del-dia': { html: pageConChrome(chrome, 800) } };
    const resultado = await run(opciones, { fetchImpl: fakeFetch(sano), log: vi.fn() });

    expect(resultado.exitCode).toBe(0);
    expect(resultado.navPaths).toEqual(['/', '/carta-del-dia', '/premium', '/contacto']);
  });

  it('el muestreo no deja fuera a las rutas del menú', async () => {
    const resultado = await run(
      { ...opciones, sample: 1 },
      { fetchImpl: fakeFetch(rutas), log: vi.fn() }
    );

    expect(resultado.rows.map((r) => r.pathname).sort()).toEqual(
      ['/', '/carta-del-dia', '/contacto', '/premium'].sort()
    );
  });
});

describe('run — host entero con noindex (staging / local)', () => {
  const BASE = 'http://localhost:3099';
  const chrome = chromeConMenu();
  // En staging y local el root layout pone `noindex` en TODAS las páginas
  // (`isIndexingAllowed()` es fail-closed): la meta no dice nada de la ruta.
  const rutas = {
    '/sitemap.xml': { html: sitemapXml([`${BASE}/`, `${BASE}/carta-del-dia`, `${BASE}/contacto`]) },
    '/admin': { html: pageConChrome(chrome, 0, { noindex: true }) },
    '/': { html: pageConChrome(chrome, 900, { noindex: true }) },
    '/carta-del-dia': { html: pageConChrome(chrome, 220, { noindex: true }) },
    '/contacto': { html: pageConChrome(chrome, 600, { noindex: true }) },
    '/premium': { html: pageConChrome(chrome, 280, { noindex: true }) },
  };

  const opciones = {
    baseUrl: BASE,
    minWords: 120,
    navMinWords: 500,
    chromeRoute: '/admin',
    concurrency: 4,
    checkSoft404: false,
    exceptions: new Map(),
  };

  it('no reporta cruces noindex ↔ sitemap: la meta es del entorno, no de la ruta', async () => {
    const resultado = await run(opciones, { fetchImpl: fakeFetch(rutas), log: vi.fn() });

    expect(resultado.noindexKnown).toBe(false);
    expect(resultado.crossFailures).toEqual([]);
  });

  it('el menú bajo el umbral se reporta pero no tumba la corrida: no se puede saber si lleva noindex', async () => {
    const log = vi.fn();
    const resultado = await run(opciones, { fetchImpl: fakeFetch(rutas), log });

    expect(resultado.navUnverified.map((m) => m.pathname).sort()).toEqual(
      ['/carta-del-dia', '/premium'].sort()
    );
    expect(resultado.navFailures).toEqual([]);
    expect(resultado.exitCode).toBe(0);
    expect(log.mock.calls[0][0]).toMatch(/no verificable/i);
  });

  it('el umbral general sigue aplicando igual', async () => {
    const delgada = {
      ...rutas,
      '/contacto': { html: pageConChrome(chrome, 50, { noindex: true }) },
    };
    const resultado = await run(opciones, { fetchImpl: fakeFetch(delgada), log: vi.fn() });

    expect(resultado.failures.map((m) => m.pathname)).toEqual(['/contacto']);
    expect(resultado.exitCode).toBe(1);
  });
});

describe('RUTAS_EXENTAS (T-SEO-015)', () => {
  it('exime sólo a las dos páginas legales del footer, con motivo escrito', () => {
    expect([...RUTAS_EXENTAS.keys()].sort()).toEqual(['/privacidad', '/terminos']);
    for (const motivo of RUTAS_EXENTAS.values()) {
      expect(motivo).toMatch(/legal/i);
    }
  });
});
