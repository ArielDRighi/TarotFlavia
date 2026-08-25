import * as fs from 'fs';
import * as path from 'path';

/**
 * Guardarraíl T-SEO-013: la palabra "salud" (y sus derivados por grep —
 * `saludable`, `saludo`, `saludando`) NO debe aparecer en el corpus de
 * contenido que termina sirviéndose como HTML del sitio.
 *
 * Por qué: un sitio de tarot/astrología que habla de la *salud* del consultante
 * se lee como consejo médico — territorio YMYL (*Your Money or Your Life*),
 * donde Google exige autoría y credenciales verificables que el sitio no puede
 * acreditar. Con dos rechazos de AdSense encima es una señal negativa gratuita.
 * El término del proyecto es **"energía y bienestar"**.
 *
 * El criterio de aceptación de la tarea es un `grep -i salud` sobre el HTML
 * servido: no distingue el sentido, así que los falsos positivos ("saludo",
 * "hábitos saludables") también tienen que salir. Este test replica ese grep
 * sobre el origen —los archivos de seed y de datos— para que la palabra no
 * vuelva a entrar por un PR dentro de tres meses.
 *
 * NO cuentan como violación:
 *  - El slug `salud-bienestar`: el gating FREE filtra por slug en
 *    `reading-validator.service.ts` y en `TarotPageContent.tsx`. Renombrarlo
 *    dejaría a los usuarios FREE sin una de sus tres categorías.
 *  - Comentarios y JSDoc: no se renderizan.
 *  - Las salvaguardas que *detectan* el tema — `blockedTerms` y la categoría
 *    `'salud'` del validador del péndulo — que viven fuera de las carpetas
 *    escaneadas, y la instrucción negativa del prompt del horóscopo chino
 *    (allowlist explícita más abajo).
 *  - Los fixtures de los `.spec.ts`.
 *
 * ⚠️ Alcance: se escanean las carpetas donde vive el **corpus** (`database/seeds/`
 * y los `data/`, `seeds/`, `prompts/` y `templates/` de los módulos). Un prompt
 * que viva fuera de `prompts/` —hoy `chart-ai-synthesis.service.ts`, que tiene
 * la instrucción negativa en `application/services/`— NO pasa por acá. Si se
 * mueve un prompt a una carpeta escaneada, va a necesitar su entrada en la
 * allowlist, como la del horóscopo chino.
 */

const SRC = __dirname;

/** El mismo grep que corre el criterio de aceptación sobre el HTML servido. */
const TERMINO_PROHIBIDO = /salud/i;

/** El slug no se migra: el gating FREE filtra por él. Ver el encabezado. */
const SLUG_PERMITIDO = 'salud-bienestar';

/**
 * Strings que contienen el token pero NO son contenido servido.
 * Mantener la lista mínima y justificada.
 */
const ALLOWLIST: { file: string; snippet: string }[] = [
  {
    // Instrucción NEGATIVA dentro de un prompt al modelo: es justamente lo que
    // impide que la IA devuelva texto médico. Sacarla apagaría la protección.
    file: 'modules/horoscope/application/prompts/chinese-horoscope.prompts.ts',
    snippet: 'NO uses términos médicos o menciones condiciones de salud',
  },
  {
    // Slug de un seeder muerto que nadie importa (ver su encabezado). El
    // criterio de aceptación de T-SEO-013 permite slugs.
    file: 'database/seeds/reading-categories.seed.ts',
    snippet: "slug: 'salud',",
  },
];

/** Reemplaza un tramo por espacios preservando los saltos de línea. */
function blankKeepNewlines(match: string): string {
  return match.replace(/[^\n]/g, ' ');
}

function stripTsComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, blankKeepNewlines)
    .split('\n')
    .map((line) =>
      line.replace(/([^:"'`])\/\/.*$/, '$1').replace(/^\s*\/\/.*$/, ''),
    )
    .join('\n');
}

function stripHbsComments(src: string): string {
  return src
    .replace(/<!--[\s\S]*?-->/g, blankKeepNewlines)
    .replace(/\{\{!--[\s\S]*?--\}\}/g, blankKeepNewlines)
    .replace(/\{\{![\s\S]*?\}\}/g, blankKeepNewlines);
}

function walk(
  dir: string,
  pred: (p: string) => boolean,
  acc: string[] = [],
): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, pred, acc);
    else if (pred(full)) acc.push(full);
  }
  return acc;
}

/** Carpetas de contenido: lo que escriben los seeders y termina en la base. */
const isCorpusFile = (p: string): boolean => {
  if (p.endsWith('.spec.ts') || p.endsWith('.e2e-spec.ts')) return false;
  if (!/\.(ts|md|hbs)$/.test(p)) return false;
  const rel = path.relative(SRC, p);
  return (
    rel.startsWith(`database${path.sep}seeds${path.sep}`) ||
    /(^|[\\/])(data|seeds|prompts|templates)[\\/]/.test(rel)
  );
};

function scan(file: string): string[] {
  const rel = path.relative(SRC, file);
  const permitidos = ALLOWLIST.filter((a) => a.file === rel);
  const raw = fs.readFileSync(file, 'utf8');
  const stripped = file.endsWith('.hbs')
    ? stripHbsComments(raw)
    : file.endsWith('.md')
      ? raw
      : stripTsComments(raw);

  const hits: string[] = [];
  stripped.split('\n').forEach((line, i) => {
    if (!TERMINO_PROHIBIDO.test(line)) return;

    // Se borran los tramos permitidos y se vuelve a mirar. Eximir la LÍNEA
    // entera dejaría pasar `{ slug: 'salud-bienestar', name: 'Salud y
    // Bienestar' }`, que es una sola línea que prettier puede generar en
    // cualquier objeto corto.
    let resto = line.split(SLUG_PERMITIDO).join('');
    permitidos.forEach((a) => {
      resto = resto.split(a.snippet).join('');
    });
    if (!TERMINO_PROHIBIDO.test(resto)) return;

    hits.push(`${rel}:${i + 1} → ${line.trim()}`);
  });
  return hits;
}

/**
 * La otra mitad de YMYL —la *Money* de "Your Money or Your Life"—: prometer un
 * desenlace económico o legal concreto. Salieron en T-SEO-013 seis casos: tres
 * arcanos mayores de la enciclopedia ("garantiza resolución a favor en temas
 * legales"), dos del seed de lecturas ("augura llegada de dinero inesperado") y
 * el de El Carro ("augura victorias… promociones merecidas").
 *
 * El test cruza **dentro de la misma oración** un verbo de promesa con
 * vocabulario económico o legal. Cruzarlos es lo que lo hace preciso: sobre el
 * corpus actual da 0 hits y, medido antes de arreglar, daba exactamente los 3
 * que quedaban, sin un solo falso positivo.
 *
 * ⚠️ `promete` queda FUERA de los verbos, por el mismo motivo que `sanar` está
 * fuera de la lista médica: el corpus de T-SEO-009 lo usa 13 veces y casi
 * siempre para *negar* la promesa ("no promete continuidad", "la que menos
 * promete atajos"). Con `garanti` y `augur` alcanza: en este corpus solo
 * aparecieron garantizando un resultado.
 */
const VERBO_DE_PROMESA = /\b(garanti\w*|augur\w*)\b/i;

const VOCABULARIO_ECONOMICO_LEGAL =
  /\b(financier\w*|econ[oó]mic\w*|dinero|finanzas|inversi[oó]n\w*|inversiones|contrato\w*|legal\w*|juicio\w*|deuda\w*|ingresos?|sueldo\w*|salario\w*|prosperidad|ganancias?|capital|patrimonio|laboral\w*|negocios?|ascensos?|promoci[oó]n\w*|promociones)\b/i;

function scanPromesas(file: string): string[] {
  const rel = path.relative(SRC, file);
  const raw = fs.readFileSync(file, 'utf8');
  const stripped = file.endsWith('.md') ? raw : stripTsComments(raw);

  const hits: string[] = [];
  stripped.split('\n').forEach((line, i) => {
    line.split(/(?<=[.!?])\s+/).forEach((oracion) => {
      if (
        VERBO_DE_PROMESA.test(oracion) &&
        VOCABULARIO_ECONOMICO_LEGAL.test(oracion)
      ) {
        hits.push(`${rel}:${i + 1} → ${oracion.trim()}`);
      }
    });
  });
  return hits;
}

describe('Guardarraíl: sin señales YMYL en el corpus de contenido (T-SEO-013)', () => {
  const corpusFiles = walk(SRC, isCorpusFile);

  it('encuentra archivos de corpus para escanear', () => {
    expect(corpusFiles.length).toBeGreaterThan(10);
  });

  it('no usa la palabra "salud" en seeds, datos, prompts ni plantillas', () => {
    const violaciones = corpusFiles.flatMap(scan);
    expect(violaciones).toEqual([]);
  });

  it('no promete resultados económicos ni legales', () => {
    const violaciones = corpusFiles.flatMap(scanPromesas);
    expect(violaciones).toEqual([]);
  });
});
