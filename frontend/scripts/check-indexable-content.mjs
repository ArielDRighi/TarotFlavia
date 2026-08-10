#!/usr/bin/env node
// @ts-check

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

/** @type {Record<string, string>} */
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
  const texto = String(xml ?? '');

  // Un sitemap index apunta a otros sitemaps, no a páginas: medirlo daría
  // "palabras" de XML. Hoy `src/app/sitemap.ts` devuelve una lista plana, pero
  // si alguien agrega `generateSitemaps()` conviene un error legible.
  if (/<sitemapindex[\s>]/i.test(texto)) {
    throw new Error(
      'El sitemap es un índice (<sitemapindex>): apunta a otros sitemaps, no a páginas. ' +
        'Pasá cada sub-sitemap por separado o extendé el script para recorrerlos.'
    );
  }

  const locs = [...texto.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) =>
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
 * @param {string} [base] Base para resolver `<loc>` relativos.
 * @returns {string}
 */
export function toPathname(url, base) {
  try {
    const { pathname } = new URL(url, base);
    return pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  } catch {
    throw new Error(`URL inválida en el sitemap: "${url}"`);
  }
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
  return (
    texto
      .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
      // `Object.hasOwn` y no `NAMED_ENTITIES[name]`: sin eso, `&constructor;`
      // inyecta el prototipo de Object como texto. La desconocida se reemplaza
      // por un espacio, no por nada, para no pegar las palabras vecinas.
      .replace(/&([a-z]+);/gi, (_, name) =>
        Object.hasOwn(NAMED_ENTITIES, name) ? NAMED_ENTITIES[name] : ' '
      )
  );
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
      .replace(/<![^>]*>/g, ' ') // doctype
      // Solo lo que empieza con letra es etiqueta, y los atributos entre
      // comillas pueden contener '>'. Un `<[^>]+>` a secas se comía "5 < 7 y
      // 8 > 2" como si fuera un tag y contaba de menos en el HTML que viene de
      // la API (artículos y rituales entran por `dangerouslySetInnerHTML`).
      .replace(/<\/?[a-zA-Z][^\s>/]*(?:"[^"]*"|'[^']*'|[^'">])*>/g, ' ')
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
  return segmentos.length === 1 ? `/${segmentos[0]}` : parentOf(pathname);
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
 * Muestreo estratificado: hasta `perSection` rutas por sección.
 *
 * Dentro de cada sección se ordena alfabéticamente antes de recortar: el orden
 * del sitemap lo arma `buildSitemap()` con datos de la API, así que sin ordenar
 * dos corridas podrían medir URLs distintas y no serían comparables.
 *
 * @param {string[]} pathnames
 * @param {number | undefined} perSection
 * @returns {string[]}
 */
export function stratifiedSample(pathnames, perSection) {
  if (!perSection || perSection <= 0) return [...pathnames];

  const muestra = [];
  for (const rutas of groupBySection(pathnames).values()) {
    muestra.push(...[...rutas].sort((a, b) => a.localeCompare(b)).slice(0, perSection));
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
 * Entero no negativo. `Number.isFinite` a secas dejaba pasar `--min-words=`
 * (`Number('')` es 0) y `--min-words=-5`, que apagan el guardarraíl en silencio.
 *
 * @param {string} valor
 * @param {string} flag
 * @param {number} [minimo]
 * @returns {number}
 */
function toNumber(valor, flag, minimo = 0) {
  const numero = Number(valor);
  if (valor.trim() === '' || !Number.isInteger(numero) || numero < minimo) {
    throw new Error(
      `El valor de ${flag} debe ser un número entero >= ${minimo} (recibido: "${valor}")`
    );
  }
  return numero;
}

/**
 * @typedef {object} Opciones
 * @property {string} baseUrl
 * @property {number} minWords
 * @property {number | undefined} sample
 * @property {string} chromeRoute
 * @property {number} concurrency
 * @property {number} timeout
 * @property {boolean} checkSoft404
 * @property {boolean} failOnSoft404
 * @property {string} userAgent
 * @property {boolean} json
 * @property {boolean} help
 * @property {Map<string, string>} [exceptions] Solo se pasa desde los tests.
 */

/**
 * @param {string[]} argv
 * @param {Record<string, string | undefined>} [env]
 * @returns {Opciones}
 */
export function parseArgs(argv = [], env = process.env) {
  /** @type {Opciones} */
  const opciones = {
    baseUrl: env.NEXT_PUBLIC_APP_URL ?? '',
    minWords: MIN_WORDS_DEFAULT,
    sample: undefined,
    chromeRoute: CHROME_ROUTE_DEFAULT,
    concurrency: 6,
    timeout: 20000,
    checkSoft404: true,
    failOnSoft404: false,
    userAgent: USER_AGENT,
    json: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const igual = argv[i].indexOf('=');
    const flag = igual === -1 ? argv[i] : argv[i].slice(0, igual);
    const valorInline = igual === -1 ? undefined : argv[i].slice(igual + 1);
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
        opciones.concurrency = toNumber(siguiente(), flag, 1);
        break;
      case '--timeout':
        opciones.timeout = toNumber(siguiente(), flag, 1);
        break;
      case '--user-agent':
        opciones.userAgent = siguiente();
        break;
      case '--no-soft-404':
        opciones.checkSoft404 = false;
        break;
      case '--fail-on-soft-404':
        opciones.failOnSoft404 = true;
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

  // `new URL('localhost:3099')` no tira: lo lee como protocolo "localhost:".
  // Por eso se exige http/https explícito y no solo que parsee.
  if (opciones.baseUrl) {
    let protocolo = '';
    try {
      protocolo = new URL(opciones.baseUrl).protocol;
    } catch {
      protocolo = '';
    }

    if (protocolo !== 'http:' && protocolo !== 'https:') {
      throw new Error(
        `La URL base debe incluir el esquema http:// o https:// (recibido: "${opciones.baseUrl}"). ` +
          'Ejemplo: http://localhost:3099'
      );
    }
  }

  return opciones;
}

// =============================================================================
// EVALUACIÓN Y REPORTE
// =============================================================================

/**
 * @typedef {object} Medicion
 * @property {string} pathname
 * @property {number} status 0 cuando la request ni siquiera llegó.
 * @property {number} ownWords
 * @property {number} [totalWords]
 * @property {string} [error] Motivo cuando la request falló.
 * @property {string} [redirectedTo] Pathname final si hubo redirect.
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
 *   checkSoft404?: boolean,
 *   failOnSoft404?: boolean,
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
  failOnSoft404 = false,
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
    const nota = row.error
      ? `  ⚠️ ${row.error}`
      : row.redirectedTo
        ? `  ↪ ${row.redirectedTo}`
        : '';
    lineas.push(
      `${padRight(row.pathname, anchoRuta)}  ${String(row.status).padStart(4)}  ` +
        `${String(row.ownWords).padStart(7)}  ${String(row.totalWords ?? row.ownWords).padStart(5)}  ${icono}${nota}`
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
    lineas.push(
      failOnSoft404
        ? '   Ver T-SEO-006. Cuentan para el exit code (--fail-on-soft-404).'
        : '   Ver T-SEO-006. NO cuentan para el exit code: usá --fail-on-soft-404 si querés que fallen.'
    );
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
 * @param {Opciones} opciones
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
    failOnSoft404 = false,
    userAgent = USER_AGENT,
    exceptions = RUTAS_EXENTAS,
    json = false,
  } = opciones;

  const token = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

  /**
   * @param {string} pathname
   * @returns {Promise<{ status: number, html: string, finalPathname?: string }>}
   */
  const pedir = async (pathname) => {
    const url = withCacheBuster(new URL(pathname, baseUrl).toString(), token);
    const respuesta = await fetchImpl(url, {
      headers: { 'User-Agent': userAgent, 'Cache-Control': 'no-cache' },
      redirect: 'follow',
      ...(timeout ? { signal: AbortSignal.timeout(timeout) } : {}),
    });

    return {
      status: respuesta.status,
      html: await respuesta.text(),
      finalPathname: respuesta.url ? toPathname(respuesta.url, baseUrl) : undefined,
    };
  };

  const sitemap = await pedir('/sitemap.xml');
  if (sitemap.status !== 200) {
    throw new Error(`No se pudo leer el sitemap de ${baseUrl} (HTTP ${sitemap.status})`);
  }

  const pathnames = [...new Set(parseSitemap(sitemap.html).map((url) => toPathname(url, baseUrl)))];
  if (pathnames.length === 0) {
    throw new Error(`El sitemap de ${baseUrl} no declara ninguna URL`);
  }

  // Sin línea base no hay medición: si `chromeWords` cayera a 0 por un 302,
  // cada página ganaría ~39 palabras fantasma y el umbral se ablandaría solo.
  const chrome = await pedir(chromeRoute);
  if (chrome.status !== 200) {
    throw new Error(
      `No se pudo medir el chrome contra ${chromeRoute} (HTTP ${chrome.status}). ` +
        'Pasá otra ruta vacía con --chrome-route: sin línea base, el umbral mentiría.'
    );
  }
  const chromeWords = countWords(chrome.html);

  const objetivo = stratifiedSample(pathnames, sample);

  // Una request que rechaza (timeout, DNS, socket) NO debe tumbar la corrida:
  // se reporta como fila fallida y las otras 177 URLs siguen midiéndose.
  const mediciones = await mapWithConcurrency(objetivo, concurrency, async (pathname) => {
    try {
      const { status, html, finalPathname } = await pedir(pathname);
      const totalWords = countWords(html);

      return {
        pathname,
        status,
        totalWords,
        ownWords: Math.max(0, totalWords - chromeWords),
        ...(finalPathname && finalPathname !== pathname ? { redirectedTo: finalPathname } : {}),
      };
    } catch (error) {
      return {
        pathname,
        status: 0,
        totalWords: 0,
        ownWords: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

  const softNotFound = [];
  if (checkSoft404) {
    const sondas = deriveDynamicPrefixes(pathnames).map(
      (prefijo) => `${prefijo}/${SLUG_INVENTADO}`
    );
    const respuestas = await mapWithConcurrency(sondas, concurrency, async (pathname) => {
      try {
        return { pathname, status: (await pedir(pathname)).status };
      } catch {
        return { pathname, status: 404 }; // sin respuesta no hay soft-404 que reportar
      }
    });

    softNotFound.push(...respuestas.filter((probe) => probe.status !== 404));
  }

  const evaluacion = evaluate(mediciones, { minWords, exceptions });
  const exitCode = /** @type {0 | 1} */ (
    evaluacion.exitCode === 1 || (failOnSoft404 && softNotFound.length > 0) ? 1 : 0
  );
  const resultado = { ...evaluacion, softNotFound, chromeWords, exitCode };

  log(
    json
      ? JSON.stringify(resultado, null, 2)
      : formatReport({
          ...evaluacion,
          minWords,
          chromeWords,
          softNotFound,
          exceptions,
          checkSoft404,
          failOnSoft404,
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
  --user-agent <ua>     User-Agent de las requests (default: Googlebot)
  --no-soft-404         No sondear slugs inventados en rutas dinámicas
  --fail-on-soft-404    Que los soft-404 también cuenten para el exit code
  --json                Salida en JSON en vez de tabla
  -h, --help            Esta ayuda

Exit code 1 si alguna URL queda por debajo del umbral. Los soft-404 se reportan
pero NO afectan el exit code salvo que se pase --fail-on-soft-404.
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
