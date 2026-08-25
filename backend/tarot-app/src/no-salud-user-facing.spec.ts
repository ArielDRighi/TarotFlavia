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
    if (line.includes(SLUG_PERMITIDO)) return;
    if (permitidos.some((a) => line.includes(a.snippet))) return;
    hits.push(`${rel}:${i + 1} → ${line.trim()}`);
  });
  return hits;
}

describe('Guardarraíl: sin "salud" en el corpus de contenido (T-SEO-013)', () => {
  const corpusFiles = walk(SRC, isCorpusFile);

  it('encuentra archivos de corpus para escanear', () => {
    expect(corpusFiles.length).toBeGreaterThan(10);
  });

  it('no usa la palabra "salud" en seeds, datos, prompts ni plantillas', () => {
    const violaciones = corpusFiles.flatMap(scan);
    expect(violaciones).toEqual([]);
  });
});
