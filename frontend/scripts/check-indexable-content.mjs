#!/usr/bin/env node

/**
 * Guardarraíl de Contenido Indexable - Auguria (T-SEO-001)
 *
 * Recorre el `sitemap.xml` de un host, mide las **palabras propias** de cada URL
 * (el texto visible menos el chrome de header + footer) y falla si alguna baja
 * del umbral. También pide un slug inventado por cada ruta dinámica para
 * detectar soft-404 (páginas de "no encontrado" que responden 200).
 *
 * Existe porque la misma clase de bug —una página que trae su contenido por el
 * cliente y por lo tanto sirve un cascarón al crawler— se arregló cuatro veces
 * (tarot, artículos, rituales, servicios) y las cuatro se descubrieron midiendo
 * a mano con `curl`. Ver docs/BACKLOG_SEO_ADSENSE_2026_08.md.
 *
 * Uso:
 *   node scripts/check-indexable-content.mjs --base-url https://auguriatarot.com
 *   node scripts/check-indexable-content.mjs --base-url http://localhost:3099 --sample 3
 *   node scripts/check-indexable-content.mjs --min-words 150 --json
 *
 * Exit code 0 si todas las URLs cumplen; 1 si hay incumplimientos.
 */

import { pathToFileURL } from 'node:url';

// =============================================================================
// CONSTANTES
// =============================================================================

/** Slug que no existe en ninguna ruta dinámica; se usa para sondear soft-404. */
export const SLUG_INVENTADO = 'inventado-xyz';

/** Umbral por defecto de palabras propias (sin header ni footer). */
export const MIN_WORDS_DEFAULT = 120;

/**
 * Ruta vacía contra la que se mide el chrome. `/admin` renderiza el header y el
 * footer del layout raíz y nada más para un visitante sin sesión (el layout de
 * admin devuelve `null` mientras redirige), así que su conteo ES el chrome.
 * Medirlo en vez de hardcodear 39 evita que el guardarraíl mienta cuando alguien
 * agregue un link al menú.
 */
export const CHROME_ROUTE_DEFAULT = '/admin';

/** Cantidad mínima de hijos para considerar que un padre es una ruta dinámica. */
export const MIN_CHILDREN_DEFAULT = 3;

/**
 * Rutas que legítimamente son delgadas y no deben tumbar la corrida.
 *
 * ⚠️ Agregar acá es admitir que una URL indexable sirve poco contenido: escribí
 * el motivo y, si el motivo es "todavía no la arreglamos", usá el backlog en vez
 * de esta lista.
 *
 * Hoy está vacía a propósito: las 29 URLs delgadas medidas el 9-ago-2026
 * (horóscopo chino, signos, listados) tienen tarea asignada — T-SEO-002,
 * T-SEO-003 y T-SEO-004 — así que deben seguir fallando hasta que se arreglen.
 *
 * @type {Map<string, string>} pathname -> motivo
 */
export const RUTAS_EXENTAS = new Map();

const USER_AGENT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

const NAMED_ENTITIES = {
  nbsp: ' ',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  hellip: '…',
  mdash: '—',
  ndash: '–',
  laquo: '«',
  raquo: '»',
  deg: '°',
  aacute: 'á',
  eacute: 'é',
  iacute: 'í',
  oacute: 'ó',
  uacute: 'ú',
  uuml: 'ü',
  ntilde: 'ñ',
  Aacute: 'Á',
  Eacute: 'É',
  Iacute: 'Í',
  Oacute: 'Ó',
  Uacute: 'Ú',
  Ntilde: 'Ñ',
};

// =============================================================================
// PARSEO DEL SITEMAP Y DE URLs
// =============================================================================

/**
 * Extrae las URLs de los `<loc>` del sitemap, sin duplicados y en orden.
 *
 * @param {string} xml
 * @returns {string[]}
 */
export function parseSitemap(xml) {
  const locs = [...String(xml ?? '').matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) =>
    match[1]
      .replace(/^\s*<!\[CDATA\[/, '')
      .replace(/\]\]>\s*$/, '')
      .trim()
  );

  return [...new Set(locs.filter(Boolean))];
}

/**
 * Devuelve el pathname normalizado de una URL (sin query, sin hash, sin barra final).
 *
 * @param {string} url
 * @returns {string}
 */
export function toPathname(url) {
  const { pathname } = new URL(url);
  return pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
}

/**
 * Agrega un cache-buster: el edge de Railway cachea el HTML con
 * `s-maxage=31536000`, así que sin esto se mide la versión previa al deploy.
 *
 * @param {string} url
 * @param {string} token
 * @returns {string}
 */
export function withCacheBuster(url, token) {
  const parsed = new URL(url);
  parsed.searchParams.set('cb', token);
  return parsed.toString();
}

// =============================================================================
// CONTEO DE PALABRAS
// =============================================================================

/**
 * @param {string} texto
 * @returns {string}
 */
function decodeEntities(texto) {
  return texto
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (_, name) => NAMED_ENTITIES[name] ?? '');
}

/**
 * Cuenta las palabras visibles del HTML: sin scripts, estilos, noscript,
 * comentarios ni etiquetas. Equivale a lo que ve un crawler sin ejecutar JS.
 *
 * @param {string} html
 * @returns {number}
 */
export function countWords(html) {
  if (!html) return 0;

  const texto = decodeEntities(
    String(html)
      .replace(/<(script|style|noscript|template)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();

  return texto ? texto.split(' ').length : 0;
}

// =============================================================================
// SECCIONES Y MUESTREO
// =============================================================================

/**
 * Ruta padre de un pathname. Las de primer nivel cuelgan de la raíz.
 *
 * @param {string} pathname
 * @returns {string}
 */
export function parentOf(pathname) {
  const segmentos = pathname.split('/').filter(Boolean);
  return segmentos.length <= 1 ? '/' : `/${segmentos.slice(0, -1).join('/')}`;
}

/**
 * Sección de una ruta, a efectos del muestreo: su padre, salvo las de primer
 * nivel, que son cada una su propia sección.
 *
 * Los hubs estáticos (`/premium`, `/explorar`, `/servicios`, …) no tienen nada
 * que ver entre sí: meterlos en una bolsa común haría que un `--sample N`
 * midiera N y dejara el resto sin ver. Así se escaparon 6 hubs de la muestra
 * manual de agosto de 2026.
 *
 * @param {string} pathname
 * @returns {string}
 */
export function sectionOf(pathname) {
  const segmentos = pathname.split('/').filter(Boolean);
  if (segmentos.length === 0) return '/';
  return segmentos.length === 1 ? `/${segmentos[0]}` : `/${segmentos.slice(0, -1).join('/')}`;
}

/**
 * @param {string[]} pathnames
 * @returns {Map<string, string[]>} sección -> rutas
 */
export function groupBySection(pathnames) {
  const grupos = new Map();

  for (const pathname of pathnames) {
    const seccion = sectionOf(pathname);
    const actuales = grupos.get(seccion) ?? [];
    actuales.push(pathname);
    grupos.set(seccion, actuales);
  }

  return grupos;
}

/**
 * Muestreo estratificado: hasta `perSection` rutas por sección, determinístico
 * (siempre las primeras, para que dos corridas sean comparables).
 *
 * @param {string[]} pathnames
 * @param {number | undefined} perSection
 * @returns {string[]}
 */
export function stratifiedSample(pathnames, perSection) {
  if (!perSection || perSection <= 0) return [...pathnames];

  const muestra = [];
  for (const rutas of groupBySection(pathnames).values()) {
    muestra.push(...rutas.slice(0, perSection));
  }

  return muestra;
}

/**
 * Infiere las rutas dinámicas del sitemap: un padre con varios hijos es un
 * `[slug]`. Se infiere en vez de hardcodearse para que una ruta nueva quede
 * cubierta sin tocar el script.
 *
 * @param {string[]} pathnames
 * @param {{ minChildren?: number }} [opciones]
 * @returns {string[]}
 */
export function deriveDynamicPrefixes(pathnames, { minChildren = MIN_CHILDREN_DEFAULT } = {}) {
  const hijosPorPadre = new Map();

  for (const pathname of pathnames) {
    const padre = parentOf(pathname);
    if (padre === '/') continue;

    const hijos = hijosPorPadre.get(padre) ?? new Set();
    hijos.add(pathname);
    hijosPorPadre.set(padre, hijos);
  }

  return [...hijosPorPadre.entries()]
    .filter(([, hijos]) => hijos.size >= minChildren)
    .map(([padre]) => padre)
    .sort();
}

// =============================================================================
// ARGUMENTOS
// =============================================================================

/**
 * @param {string} valor
 * @param {string} flag
 * @returns {number}
 */
function toNumber(valor, flag) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) {
    throw new Error(`El valor de ${flag} debe ser un número (recibido: "${valor}")`);
  }
  return numero;
}

/**
 * @param {string[]} argv
 * @param {Record<string, string | undefined>} [env]
 * @returns {{
 *   baseUrl: string,
 *   minWords: number,
 *   sample: number | undefined,
 *   chromeRoute: string,
 *   concurrency: number,
 *   timeout: number,
 *   checkSoft404: boolean,
 *   json: boolean,
 *   help: boolean,
 * }}
 */
export function parseArgs(argv = [], env = process.env) {
  const opciones = {
    baseUrl: env.NEXT_PUBLIC_APP_URL ?? '',
    minWords: MIN_WORDS_DEFAULT,
    sample: undefined,
    chromeRoute: CHROME_ROUTE_DEFAULT,
    concurrency: 6,
    timeout: 20000,
    checkSoft404: true,
    json: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const [flag, valorInline] = argv[i].split(/=(.*)/s);
    const siguiente = () => {
      if (valorInline !== undefined) return valorInline;
      i += 1;
      if (i >= argv.length) throw new Error(`Falta el valor de ${flag}`);
      return argv[i];
    };

    switch (flag) {
      case '--base-url':
        opciones.baseUrl = siguiente();
        break;
      case '--min-words':
        opciones.minWords = toNumber(siguiente(), flag);
        break;
      case '--sample':
        opciones.sample = toNumber(siguiente(), flag);
        break;
      case '--full':
        opciones.sample = undefined;
        break;
      case '--chrome-route':
        opciones.chromeRoute = siguiente();
        break;
      case '--concurrency':
        opciones.concurrency = toNumber(siguiente(), flag);
        break;
      case '--timeout':
        opciones.timeout = toNumber(siguiente(), flag);
        break;
      case '--no-soft-404':
        opciones.checkSoft404 = false;
        break;
      case '--json':
        opciones.json = true;
        break;
      case '--help':
      case '-h':
        opciones.help = true;
        break;
      default:
        throw new Error(`Opción desconocida: ${flag}`);
    }
  }

  if (!opciones.help && !opciones.baseUrl) {
    throw new Error('Falta la URL base: pasá --base-url o definí NEXT_PUBLIC_APP_URL');
  }

  return opciones;
}

// =============================================================================
// EVALUACIÓN Y REPORTE
// =============================================================================

/**
 * @typedef {{ pathname: string, status: number, ownWords: number, totalWords?: number }} Medicion
 */

/**
 * Clasifica las mediciones contra el umbral.
 *
 * @param {Medicion[]} mediciones
 * @param {{ minWords: number, exceptions?: Map<string, string> }} opciones
 * @returns {{ rows: Medicion[], failures: Medicion[], exempt: Medicion[], exitCode: 0 | 1 }}
 */
export function evaluate(mediciones, { minWords, exceptions = RUTAS_EXENTAS }) {
  const rows = [...mediciones].sort(
    (a, b) => a.ownWords - b.ownWords || a.pathname.localeCompare(b.pathname)
  );

  const failures = [];
  const exempt = [];

  for (const medicion of rows) {
    const incumple = medicion.status !== 200 || medicion.ownWords < minWords;
    if (!incumple) continue;

    if (exceptions.has(medicion.pathname)) {
      exempt.push(medicion);
    } else {
      failures.push(medicion);
    }
  }

  return { rows, failures, exempt, exitCode: failures.length > 0 ? 1 : 0 };
}

/**
 * @param {string} texto
 * @param {number} ancho
 * @returns {string}
 */
function padRight(texto, ancho) {
  return texto.length >= ancho ? texto : texto + ' '.repeat(ancho - texto.length);
}

/**
 * Arma el reporte en texto: tabla ascendente por palabras propias + resumen.
 *
 * @param {{
 *   rows: Medicion[],
 *   failures: Medicion[],
 *   exempt: Medicion[],
 *   minWords: number,
 *   chromeWords: number,
 *   softNotFound: Array<{ pathname: string, status: number }>,
 *   exceptions?: Map<string, string>,
 * }} resultado
 * @returns {string}
 */
export function formatReport({
  rows,
  failures,
  exempt,
  minWords,
  chromeWords,
  softNotFound,
  exceptions = RUTAS_EXENTAS,
  checkSoft404 = true,
}) {
  const lineas = [];
  const anchoRuta = Math.max(20, ...rows.map((row) => row.pathname.length));

  lineas.push('');
  lineas.push('🔎 Guardarraíl de contenido indexable');
  lineas.push(`   Umbral: ${minWords} palabras propias · Chrome medido: ${chromeWords} palabras`);
  lineas.push('');
  lineas.push(`${padRight('RUTA', anchoRuta)}  ESTADO  PROPIAS  TOTAL`);
  lineas.push('-'.repeat(anchoRuta + 24));

  for (const row of rows) {
    const cumple = row.status === 200 && row.ownWords >= minWords;
    const icono = cumple ? '✅' : exceptions.has(row.pathname) ? '⚠️ ' : '❌';
    lineas.push(
      `${padRight(row.pathname, anchoRuta)}  ${String(row.status).padStart(4)}  ` +
        `${String(row.ownWords).padStart(7)}  ${String(row.totalWords ?? row.ownWords).padStart(5)}  ${icono}`
    );
  }

  lineas.push('');
  lineas.push(
    `Resultado: ${rows.length - failures.length - exempt.length}/${rows.length} cumplen · ` +
      `${failures.length} por debajo del umbral · ${exempt.length} exentas`
  );

  if (exempt.length > 0) {
    lineas.push('');
    lineas.push('⚠️  Rutas exentas (documentadas en RUTAS_EXENTAS):');
    for (const row of exempt) {
      lineas.push(`   ${row.pathname} — ${exceptions.get(row.pathname)}`);
    }
  }

  lineas.push('');
  if (!checkSoft404) {
    lineas.push('ℹ️  Sondeo de soft-404 omitido (--no-soft-404): rutas dinámicas sin sondear.');
  } else if (softNotFound.length > 0) {
    lineas.push(`❌ soft-404 detectados (${softNotFound.length}): responden 200 en vez de 404`);
    for (const probe of softNotFound) {
      lineas.push(`   ${probe.pathname} → ${probe.status}`);
    }
    lineas.push('   Ver T-SEO-006.');
  } else {
    lineas.push('✅ Sin soft-404: las rutas dinámicas responden 404 ante un slug inventado.');
  }

  return lineas.join('\n');
}

// =============================================================================
// ORQUESTACIÓN
// =============================================================================

/**
 * Corre `tarea` sobre `items` con un pool de tamaño acotado, conservando el
 * orden de entrada en el resultado.
 *
 * @template T, R
 * @param {T[]} items
 * @param {number} concurrency
 * @param {(item: T) => Promise<R>} tarea
 * @returns {Promise<R[]>}
 */
async function mapWithConcurrency(items, concurrency, tarea) {
  const resultados = new Array(items.length);
  let siguiente = 0;

  const trabajadores = Array.from(
    { length: Math.max(1, Math.min(concurrency, items.length)) },
    () =>
      (async () => {
        while (siguiente < items.length) {
          const indice = siguiente;
          siguiente += 1;
          resultados[indice] = await tarea(items[indice]);
        }
      })()
  );

  await Promise.all(trabajadores);
  return resultados;
}

/**
 * Ejecuta la verificación completa contra un host.
 *
 * @param {ReturnType<typeof parseArgs>} opciones
 * @param {{ fetchImpl?: typeof fetch, log?: (mensaje: string) => void }} [deps]
 * @returns {Promise<{
 *   rows: Medicion[],
 *   failures: Medicion[],
 *   exempt: Medicion[],
 *   softNotFound: Array<{ pathname: string, status: number }>,
 *   chromeWords: number,
 *   exitCode: 0 | 1,
 * }>}
 */
export async function run(opciones, { fetchImpl = fetch, log = console.log } = {}) {
  const {
    baseUrl,
    minWords = MIN_WORDS_DEFAULT,
    sample,
    chromeRoute = CHROME_ROUTE_DEFAULT,
    concurrency = 6,
    timeout,
    checkSoft404 = true,
    exceptions = RUTAS_EXENTAS,
    json = false,
  } = opciones;

  const token = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

  /**
   * @param {string} pathname
   * @returns {Promise<{ status: number, html: string }>}
   */
  const pedir = async (pathname) => {
    const url = withCacheBuster(new URL(pathname, baseUrl).toString(), token);
    const respuesta = await fetchImpl(url, {
      headers: { 'User-Agent': USER_AGENT, 'Cache-Control': 'no-cache' },
      redirect: 'follow',
      ...(timeout ? { signal: AbortSignal.timeout(timeout) } : {}),
    });

    return { status: respuesta.status, html: await respuesta.text() };
  };

  const sitemap = await pedir('/sitemap.xml');
  if (sitemap.status !== 200) {
    throw new Error(`No se pudo leer el sitemap de ${baseUrl} (HTTP ${sitemap.status})`);
  }

  const pathnames = [...new Set(parseSitemap(sitemap.html).map(toPathname))];
  if (pathnames.length === 0) {
    throw new Error(`El sitemap de ${baseUrl} no declara ninguna URL`);
  }

  const chrome = await pedir(chromeRoute);
  const chromeWords = chrome.status === 200 ? countWords(chrome.html) : 0;

  const objetivo = stratifiedSample(pathnames, sample);
  const mediciones = await mapWithConcurrency(objetivo, concurrency, async (pathname) => {
    const { status, html } = await pedir(pathname);
    const totalWords = countWords(html);

    return { pathname, status, totalWords, ownWords: Math.max(0, totalWords - chromeWords) };
  });

  const softNotFound = [];
  if (checkSoft404) {
    const sondas = deriveDynamicPrefixes(pathnames).map(
      (prefijo) => `${prefijo}/${SLUG_INVENTADO}`
    );
    const respuestas = await mapWithConcurrency(sondas, concurrency, async (pathname) => ({
      pathname,
      status: (await pedir(pathname)).status,
    }));

    softNotFound.push(...respuestas.filter((probe) => probe.status !== 404));
  }

  const { rows, failures, exempt, exitCode } = evaluate(mediciones, { minWords, exceptions });
  const resultado = { rows, failures, exempt, softNotFound, chromeWords, exitCode };

  log(
    json
      ? JSON.stringify(resultado, null, 2)
      : formatReport({
          rows,
          failures,
          exempt,
          minWords,
          chromeWords,
          softNotFound,
          exceptions,
          checkSoft404,
        })
  );

  return resultado;
}

// =============================================================================
// CLI
// =============================================================================

const AYUDA = `
Guardarraíl de contenido indexable (T-SEO-001)

Uso: node scripts/check-indexable-content.mjs [opciones]

  --base-url <url>      Host a medir (default: NEXT_PUBLIC_APP_URL)
  --min-words <n>       Umbral de palabras propias (default: ${MIN_WORDS_DEFAULT})
  --sample <n>          Muestreo estratificado: hasta n URLs por sección
  --full                Modo completo: todas las URLs del sitemap (default)
  --chrome-route <ruta> Ruta vacía para medir el chrome (default: ${CHROME_ROUTE_DEFAULT})
  --concurrency <n>     Requests en paralelo (default: 6)
  --timeout <ms>        Timeout por request (default: 20000)
  --no-soft-404         No sondear slugs inventados en rutas dinámicas
  --json                Salida en JSON en vez de tabla
  -h, --help            Esta ayuda

Exit code 1 si alguna URL queda por debajo del umbral.
`;

async function main() {
  try {
    const opciones = parseArgs(process.argv.slice(2));

    if (opciones.help) {
      console.log(AYUDA);
      return;
    }

    const { exitCode } = await run(opciones);
    process.exitCode = exitCode;
  } catch (error) {
    console.error(`\n❌ ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
