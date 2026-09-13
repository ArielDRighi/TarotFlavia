import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect } from 'vitest';

import type { BrandIconFamily } from '@/lib/constants/brand-icons';

/**
 * Guardarraíl T-UI-12: sin emojis ni glifos del sistema en texto user-facing.
 *
 * La iconografía de dominio (signos, animales, elementos, fases, arquetipos,
 * hubs) va como asset de marca vía `<BrandIcon>`; la iconografía de UI genérica
 * (✓ ⚠️ 🔔 💡 🎉…) va con `lucide-react`. Un emoji del sistema se ve distinto en
 * cada SO/navegador y rompe la línea visual del sitio (ver
 * `docs/BACKLOG_CONSISTENCIA_UI.md`, T-UI-12).
 *
 * Escanea todo `src/` (excepto admin y tests) y falla si aparece un carácter de
 * los bloques emoji / Misc Symbols / Dingbats fuera de comentarios.
 *
 * NO cuentan como violación:
 *  - Comentarios y JSDoc (ahí van libres).
 *  - Panel de admin: `app/admin/**` y `components/features/admin/**`.
 *  - Flechas (→ ↑ ↓) y otros signos tipográficos: no son emojis.
 *
 * Dos listas de excepciones, las dos con justificación y las dos verificadas
 * (un archivo listado que ya no tiene emojis hace fallar el test, para que la
 * lista no se pudra):
 *  - `ALLOWLIST`: permanentes.
 *  - `PENDIENTES_FASE_2`: archivos que migran a `<BrandIcon>` cuando llegue su
 *    familia de assets (Fase 0 es manual). Cada PR de familia saca sus
 *    archivos de acá; la meta es que quede vacía.
 */

const SRC = path.dirname(fileURLToPath(import.meta.url));

/**
 * Bloques Unicode que renderizan como emoji/pictograma del sistema:
 *  - U+1F000–U+1FAFF: naipes 🃏, pictogramas 🌙🔮, emoticonos, transporte, suplementarios.
 *  - U+2300–U+23FF: Misc Technical (⏰ ⌛ ⏳ ⏱).
 *  - U+25A0–U+25FF: Geometric Shapes (▶ ◀ ◼ □ △).
 *  - U+2600–U+27BF: Misc Symbols (☀ ★ ♈ ⚠ ⚙) + Dingbats (✓ ✦ ✨ ❌).
 *  - U+2B00–U+2BFF: Misc Symbols & Arrows (⭐ ⭕).
 *  - U+2139 ℹ, U+203C ‼, U+2049 ⁉.
 *  - U+FE0E/U+FE0F: selectores de presentación texto/emoji.
 */
const EMOJI =
  /[\u{1F000}-\u{1FAFF}\u{2300}-\u{23FF}\u{25A0}-\u{25FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2139}\u{203C}\u{2049}\u{FE0E}\u{FE0F}]/u;

/**
 * Lo mismo escrito como escape (`'\\uFE0E'`, `'\\u{1F409}'`, par sustituto
 * `'\\uD83D\\uDC09'`): el escaneo es sobre el código fuente, no sobre el string
 * evaluado, así que sin esto un emoji escapado pasaría.
 */
const EMOJI_ESCAPE =
  /\\u(?:\{(?:1F[0-9A-F]{3}|2[3567][0-9A-F]{2}|2B[0-9A-F]{2}|FE0[EF])\}|(?:2[3567][0-9A-F]{2}|2B[0-9A-F]{2}|FE0[EF]|D83[C-E][0-9A-F]{2}))/i;

/** Permanentes. Clave relativa a `src/`, valor = por qué. */
const ALLOWLIST: Record<string, string> = {
  'types/birth-chart.enums.ts':
    'Notación astrológica estándar (☉ ☽ ♃ ☌ ☍ ⚹): es lenguaje de la disciplina, no decoración. Se mantiene como texto con ZodiacSymbol/U+FE0E.',
  'components/features/daily-reading/DailyReadingCard.tsx':
    'Texto de "compartir" que sale a WhatsApp/redes vía navigator.share, no se renderiza en el sitio.',
  'components/features/daily-reading/DailyCardExperience.tsx':
    'Texto de "compartir" que sale a WhatsApp/redes vía navigator.share, no se renderiza en el sitio.',
  'components/features/encyclopedia/MarkdownArticle.tsx':
    'Separador editorial ✦ (U+2726): ornamento tipográfico sin presentación emoji en Unicode, renderiza igual en todos los SO, en dorado de marca.',
  'components/features/encyclopedia/GuiasContent.tsx':
    'Placeholder ✦ (U+2726) sobre degradé de marca cuando la guía no tiene miniatura; mismo ornamento tipográfico que MarkdownArticle.',
  'lib/utils/zodiac.ts':
    'ZodiacSignInfo.symbol es el símbolo Unicode del signo como DATO (♈…♓); ZodiacSymbol lo resuelve al asset de marca y ningún componente lo renderiza como glifo desde T-UI-12 (familia zodiac/).',
};

/**
 * Pendientes de la Fase 2 de T-UI-12 (migración por familia de assets).
 * Clave relativa a `src/`, valor = familia de `BRAND_ICONS` que los reemplaza.
 */
const PENDIENTES_FASE_2: Record<string, BrandIconFamily> = {};

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

const rel = (file: string): string => path.relative(SRC, file).split(path.sep).join('/');

function scan(file: string): string[] {
  const lines = stripComments(fs.readFileSync(file, 'utf8')).split('\n');
  const hits: string[] = [];
  lines.forEach((line, i) => {
    if (EMOJI.test(line) || EMOJI_ESCAPE.test(line)) {
      hits.push(`${rel(file)}:${i + 1} → ${line.trim()}`);
    }
  });
  return hits;
}

describe('Guardarraíl: sin emojis en texto user-facing del frontend (T-UI-12)', () => {
  const files = walk(SRC);
  const exempt = new Set([...Object.keys(ALLOWLIST), ...Object.keys(PENDIENTES_FASE_2)]);

  it('no hay emojis fuera de comentarios, admin y las excepciones justificadas', () => {
    const violations = files.filter((f) => !exempt.has(rel(f))).flatMap(scan);
    expect(violations).toEqual([]);
  });

  it('cada excepción sigue existiendo y sigue teniendo emojis (la lista no se pudre)', () => {
    const stale = [...exempt].filter((r) => {
      const abs = path.join(SRC, r);
      return !fs.existsSync(abs) || scan(abs).length === 0;
    });
    expect(stale).toEqual([]);
  });

  it('ningún archivo está en las dos listas a la vez', () => {
    const dup = Object.keys(ALLOWLIST).filter((k) => k in PENDIENTES_FASE_2);
    expect(dup).toEqual([]);
  });
});
