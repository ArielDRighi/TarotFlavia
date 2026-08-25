import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect } from 'vitest';

/**
 * Guardarraíl T-SEO-013: la palabra "salud" —y sus derivados por grep,
 * `saludable` y `saludo`— NO debe aparecer en texto de cara al usuario.
 *
 * Un sitio de tarot/astrología que habla de la *salud* del consultante se lee
 * como consejo médico: territorio YMYL, donde Google exige autoría y
 * credenciales verificables que el sitio no puede acreditar. El término del
 * proyecto es "energía y bienestar".
 *
 * Es el espejo de `backend/tarot-app/src/no-salud-user-facing.spec.ts`, que
 * cubre el corpus sembrado, y sigue el mismo patrón que
 * `no-ia-user-facing.test.ts` (FBK-003). Escanea todo `src/` (menos el panel de
 * admin y los tests) y falla si el token aparece en código que llega al
 * usuario.
 *
 * NO cuentan como violación:
 *  - Comentarios y JSDoc.
 *  - El slug `salud-bienestar`: el gating FREE filtra por slug
 *    (`TarotPageContent.tsx`, `reading-validator.service.ts` del backend).
 *    Renombrarlo dejaría a los usuarios FREE sin una de sus tres categorías.
 *  - Los valores **guardados** que nunca se renderizan crudos: la clave `Salud`
 *    de los mapas de `marketplace.ts`, el valor `'Salud'` del filtro de
 *    especialidades y la clave `salud` que devuelve el validador del péndulo.
 *    Todos pasan por una etiqueta visible antes de llegar a la pantalla.
 *  - Panel de admin: solo lo ven administradores.
 */

const SRC = path.dirname(fileURLToPath(import.meta.url));

const TERMINO_PROHIBIDO = /salud/i;

/** El slug no se migra: el gating FREE filtra por él. */
const SLUG_PERMITIDO = 'salud-bienestar';

/**
 * Valores guardados que el usuario nunca ve crudos. Se identifican por
 * (archivo relativo, fragmento). Mantener la lista mínima y justificada.
 */
const ALLOWLIST: { file: string; snippet: string }[] = [
  {
    // Clave del mapa de colores: el valor viene de la API sin cambios.
    file: path.join('lib', 'constants', 'marketplace.ts'),
    snippet: "Salud: 'bg-orange-100 text-orange-700'",
  },
  {
    // Clave → etiqueta visible. Es LA pieza que impide que se muestre.
    file: path.join('lib', 'constants', 'marketplace.ts'),
    snippet: "Salud: 'Energía y Bienestar'",
  },
  {
    // Valor guardado del filtro; se renderiza con `specialtyLabel()`.
    file: path.join('components', 'features', 'marketplace', 'TarotistasExplorer.tsx'),
    snippet: "'Carrera', 'Salud', 'Espiritual'",
  },
  {
    // Clave que devuelve el validador del péndulo del backend. Renombrarla
    // apagaría la detección de preguntas médicas.
    file: path.join('components', 'features', 'pendulum', 'PendulumBlockedContent.tsx'),
    snippet: 'salud: {',
  },
];

function blankKeepNewlines(match: string): string {
  return match.replace(/[^\n]/g, ' ');
}

/** Elimina comentarios de bloque/JSDoc/JSX y de línea, preservando saltos. */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, blankKeepNewlines)
    .split('\n')
    .map((l) => l.replace(/([^:"'`])\/\/.*$/, '$1').replace(/^\s*\/\/.*$/, ''))
    .join('\n');
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
  const rel = path.relative(SRC, file);
  const permitidos = ALLOWLIST.filter((a) => a.file === rel);
  const hits: string[] = [];

  stripComments(fs.readFileSync(file, 'utf8'))
    .split('\n')
    .forEach((line, i) => {
      if (!TERMINO_PROHIBIDO.test(line)) return;

      // Se borran los tramos permitidos y se vuelve a mirar. Eximir la LÍNEA
      // entera dejaría pasar un objeto corto donde el slug convive con copy.
      let resto = line.split(SLUG_PERMITIDO).join('');
      permitidos.forEach((a) => {
        resto = resto.split(a.snippet).join('');
      });
      if (!TERMINO_PROHIBIDO.test(resto)) return;

      hits.push(`${rel}:${i + 1} → ${line.trim()}`);
    });

  return hits;
}

describe('Guardarraíl: sin "salud" en texto user-facing del frontend (T-SEO-013)', () => {
  it('encuentra archivos para escanear', () => {
    expect(walk(SRC).length).toBeGreaterThan(50);
  });

  it('no usa la palabra "salud" en componentes ni páginas', () => {
    const violaciones = walk(SRC).flatMap(scan);
    expect(violaciones).toEqual([]);
  });
});
