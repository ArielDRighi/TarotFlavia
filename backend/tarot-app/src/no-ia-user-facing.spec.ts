import * as fs from 'fs';
import * as path from 'path';

/**
 * Guardarraíl T-FBK-004 (Hallazgo FBK-003): el texto de cara al usuario NO debe
 * mencionar "IA" / "inteligencia artificial". Debe usarse el glosario de marca
 * ("interpretaciones personalizadas", "análisis profundo", etc.).
 *
 * Este test escanea las superficies user-facing del backend (mensajes de guards,
 * services y controllers —excepciones/validaciones—, asuntos de email, plantillas
 * .hbs, descripción del plan en el seed y las constantes de mensajes) y falla si
 * reaparece el token.
 *
 * NO cuentan como violación (por decisión de producto — ver FBK-003):
 *  - Documentación Swagger (@ApiOperation/@ApiProperty/.addTag/.setDescription) y sus strings.
 *  - Comentarios y JSDoc.
 *  - Logs (this.logger.*, console.*): no son texto de cara al usuario.
 *  - Nombres de variables/clases/archivos (AISynthesis, aiQuota, OPENAI_*, etc.).
 *  - Panel de admin (solo lo ven administradores).
 *  - Los strings de ALLOWLIST (error interno de infra + prompts al modelo).
 *
 * Si en el futuro se agrega una NUEVA superficie user-facing, quedará cubierta si
 * es un guard/service/controller; para otros tipos, añadirla al set.
 */

const SRC = __dirname;
const IA_WORD = /\bIA\b/;
const IA_PHRASE = /inteligencia artificial/i;

/** Líneas de logging/consola: NO son texto de cara al usuario (FBK-003 excluye logs). */
const LOG_LINE = /this\.logger\.|console\.|new Logger\(/;

/**
 * Strings que mencionan "IA" pero NO son copy de feature (excluidos por FBK-003).
 * Se identifican por (archivo relativo, fragmento). Mantener la lista mínima y justificada.
 */
const ALLOWLIST: { file: string; snippet: string }[] = [
  {
    // Error interno de infraestructura (falta API key), no copy de feature — decisión de Ariel.
    file: 'modules/ai/application/services/ai-provider.service.ts',
    snippet: 'No hay ningún proveedor de IA configurado',
  },
  {
    // Instrucción dentro de un prompt al modelo (no se muestra al usuario) — FBK-003 excluye prompts.
    file: 'modules/birth-chart/application/services/chart-ai-synthesis.service.ts',
    snippet: 'Menciones de que eres una IA',
  },
];

/** Reemplaza un tramo por espacios preservando los saltos de línea (líneas exactas). */
function blankKeepNewlines(match: string): string {
  return match.replace(/[^\n]/g, ' ');
}

/** Elimina spans balanceados de @Api...(...) y .addTag(...) (metadata Swagger), respetando strings. */
function stripSwagger(src: string): string {
  const triggers = [/@Api\w+\(/g, /\.addTag\(/g, /\.setDescription\(/g];
  for (const rx of triggers) {
    let m: RegExpExecArray | null;
    while ((m = rx.exec(src))) {
      const openParen = m.index + m[0].length - 1;
      let depth = 0;
      let i = openParen;
      let str: string | null = null;
      for (; i < src.length; i++) {
        const c = src[i];
        if (str) {
          if (c === '\\') {
            i++;
            continue;
          }
          if (c === str) str = null;
          continue;
        }
        if (c === '"' || c === "'" || c === '`') {
          str = c;
          continue;
        }
        if (c === '(') depth++;
        else if (c === ')') {
          depth--;
          if (depth === 0) {
            i++;
            break;
          }
        }
      }
      src =
        src.slice(0, m.index) +
        blankKeepNewlines(src.slice(m.index, i)) +
        src.slice(i);
      rx.lastIndex = 0;
    }
  }
  return src;
}

function stripTsComments(src: string): string {
  let out = src.replace(/\/\*[\s\S]*?\*\//g, blankKeepNewlines);
  out = out
    .split('\n')
    .map((l) => l.replace(/([^:"'`])\/\/.*$/, '$1').replace(/^\s*\/\/.*$/, ''))
    .join('\n');
  return out;
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
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, pred, acc);
    else if (pred(p)) acc.push(p);
  }
  return acc;
}

const isAdmin = (p: string): boolean =>
  /\/admin\//.test(p) || /admin/i.test(path.basename(p));

/** Superficies runtime que ve el usuario final. */
const explicitFiles = [
  'modules/email/email.service.ts',
  'modules/ai-usage/constants/ai-usage.constants.ts',
  'database/seeds/plans.seeder.ts',
  'modules/tarot/readings/dto/create-reading.dto.ts',
].map((f) => path.join(SRC, f));

function scanTs(file: string): string[] {
  const rel = path.relative(SRC, file);
  const allowed = ALLOWLIST.filter((a) => a.file === rel);
  const lines = stripTsComments(
    stripSwagger(fs.readFileSync(file, 'utf8')),
  ).split('\n');
  const hits: string[] = [];
  lines.forEach((line, i) => {
    if (LOG_LINE.test(line)) return;
    if (allowed.some((a) => line.includes(a.snippet))) return;
    if (IA_WORD.test(line) || IA_PHRASE.test(line)) {
      hits.push(`${rel}:${i + 1} → ${line.trim()}`);
    }
  });
  return hits;
}

function scanHbs(file: string): string[] {
  const lines = stripHbsComments(fs.readFileSync(file, 'utf8')).split('\n');
  const hits: string[] = [];
  lines.forEach((line, i) => {
    if (IA_WORD.test(line) || IA_PHRASE.test(line)) {
      hits.push(`${path.relative(SRC, file)}:${i + 1} → ${line.trim()}`);
    }
  });
  return hits;
}

describe('Guardarraíl: sin "IA" en texto user-facing del backend (FBK-003)', () => {
  const isScannableTs = (suffix: string) => (p: string) =>
    p.endsWith(suffix) && !p.endsWith('.spec.ts') && !isAdmin(p);
  const tsFiles = walk(
    SRC,
    (p) =>
      isScannableTs('.guard.ts')(p) ||
      isScannableTs('.service.ts')(p) ||
      isScannableTs('.controller.ts')(p),
  );
  const hbsFiles = walk(SRC, (p) => p.endsWith('.hbs') && !isAdmin(p));

  it('no menciona "IA" ni "inteligencia artificial" en guards, services, controllers, DTOs, emails, seed ni constantes', () => {
    const violations = [
      ...explicitFiles.flatMap(scanTs),
      ...tsFiles.flatMap(scanTs),
      ...hbsFiles.flatMap(scanHbs),
    ];
    expect(violations).toEqual([]);
  });
});
