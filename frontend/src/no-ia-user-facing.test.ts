import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect } from 'vitest';

/**
 * Guardarraíl T-FBK-004 (Hallazgo FBK-003): el texto de cara al usuario NO debe
 * mencionar "IA" / "inteligencia artificial". Debe usarse el glosario de marca
 * ("interpretaciones personalizadas", "análisis profundo", etc.).
 *
 * Escanea todo `src/` (excepto el panel de admin y los tests) y falla si aparece
 * el token en código que llega al usuario.
 *
 * NO cuentan como violación (ver FBK-003):
 *  - Comentarios y JSDoc.
 *  - Nombres de variables/componentes/hooks en inglés (AISynthesis, useAdminAIUsage…),
 *    que usan "AI" y no matchean el token español "IA".
 *  - Panel de admin: `app/admin/**` y `components/features/admin/**`.
 */

const SRC = path.dirname(fileURLToPath(import.meta.url));
const IA_WORD = /\bIA\b/;
const IA_PHRASE = /inteligencia artificial/i;

function blankKeepNewlines(match: string): string {
  return match.replace(/[^\n]/g, ' ');
}

/** Elimina comentarios de bloque/JSDoc/JSX y de línea, preservando saltos de línea. */
function stripComments(src: string): string {
  let out = src.replace(/\/\*[\s\S]*?\*\//g, blankKeepNewlines);
  out = out
    .split('\n')
    .map((l) => l.replace(/([^:"'`])\/\/.*$/, '$1').replace(/^\s*\/\/.*$/, ''))
    .join('\n');
  return out;
}

const ADMIN_DIR = /[/\\](app[/\\]admin|components[/\\]features[/\\]admin)[/\\]/;
const isExcluded = (p: string): boolean =>
  ADMIN_DIR.test(p) || /\.(test|spec)\.(ts|tsx)$/.test(p) || /\.d\.ts$/.test(p);

function walk(dir: string, acc: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (/[/\\]admin$/.test(p)) continue;
      walk(p, acc);
    } else if (/\.(ts|tsx)$/.test(p) && !isExcluded(p)) {
      acc.push(p);
    }
  }
  return acc;
}

function scan(file: string): string[] {
  const lines = stripComments(fs.readFileSync(file, 'utf8')).split('\n');
  const hits: string[] = [];
  lines.forEach((line, i) => {
    if (IA_WORD.test(line) || IA_PHRASE.test(line)) {
      hits.push(`${path.relative(SRC, file)}:${i + 1} → ${line.trim()}`);
    }
  });
  return hits;
}

describe('Guardarraíl: sin "IA" en texto user-facing del frontend (FBK-003)', () => {
  it('no menciona "IA" ni "inteligencia artificial" en componentes/páginas user-facing', () => {
    const violations = walk(SRC).flatMap(scan);
    expect(violations).toEqual([]);
  });
});
