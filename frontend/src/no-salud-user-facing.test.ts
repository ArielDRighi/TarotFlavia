import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect } from 'vitest';

/**
 * Guardarraíl T-SEO-013 (+ T-SEO-018): la palabra "salud" —y sus derivados por
 * grep, `saludable` y `saludo`— NO debe aparecer en texto de cara al usuario.
 * T-SEO-018 extendió el mismo barrido a las familias de lenguaje determinista
 * de `TERMINOS_PROHIBIDOS` (más abajo).
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

/**
 * T-SEO-018 — lenguaje determinista (YMYL). Cuatro familias, calcadas del
 * alcance de la tarea: promesas de resultado, salud (lo que quedó después de
 * T-SEO-013), dinero/legal accionable y miedo/urgencia. Cada patrón es un token
 * o una frase hecha, nunca un verbo suelto: el criterio es cero falsos positivos
 * sobre copy de tarot sano, porque un guardarraíl que se relaja no sirve.
 *
 * ⚠️ Es la MISMA lista que `backend/tarot-app/src/no-salud-user-facing.spec.ts`.
 * Si se agrega una familia acá, se agrega allá.
 */
export const TERMINOS_PROHIBIDOS: { familia: string; patron: RegExp }[] = [
  // 1. Promesas de resultado
  {
    familia: 'promesa',
    patron: /\b(amarre\w*|endulzamiento\w*|garanti\w*|infalible\w*)\b/i,
  },
  {
    familia: 'promesa',
    patron:
      /\b100 ?% ?(de )?(precis\w+|exact\w+|efectiv\w+|segur\w+|acert\w+|fiable\w*|certer\w+)/i,
  },
  {
    familia: 'promesa',
    patron: /\bpredicci[oó]n(es)? (exacta|precisa|infalible|certera|segura|garantizada)s?\b/i,
  },
  {
    familia: 'promesa',
    patron: /\b(te|le) (devuelve|devolver[aá]|trae|traer[aá]) a (tu|su) (ex|pareja|amor)\b/i,
  },
  // 2. Salud
  { familia: 'salud', patron: /\bsana\w*/i },
  { familia: 'salud', patron: /\bcura\w*/i },
  // 3. Dinero y legal accionable
  {
    familia: 'dinero-legal',
    patron: /\bcu[aá]ndo (invertir|comprar|vender|apostar)\b/i,
  },
  {
    familia: 'dinero-legal',
    patron:
      /\b(vas|va|van|voy|vamos) a ganar (el|la|un|una|ese|esa|los|las )?\s?(juicio|pleito|demanda|litigio|loter[ií]a|apuesta)/i,
  },
  {
    familia: 'dinero-legal',
    patron: /\bganar[aá]s? (el|un) (juicio|pleito|litigio)\b/i,
  },
  // 4. Miedo y urgencia
  { familia: 'miedo', patron: /\b(advertencia\w*|peligro\w*)\b/i },
  {
    familia: 'miedo',
    patron: /\b(tu|su) (destino|vida|futuro) (est[aá]|corre) (en )?(riesgo|peligro)\b/i,
  },
  { familia: 'miedo', patron: /\blo que nadie te (dice|cuenta)\b/i },
];

/**
 * Fragmentos que contienen un término pero NO son lenguaje determinista de cara
 * al usuario. Se eximen por (archivo, fragmento), nunca por archivo entero.
 * Mantener la lista mínima y justificada.
 */
const ALLOWLIST_DETERMINISTA: { file: string; snippet: string }[] = [];

function scanDeterminista(file: string): string[] {
  const rel = path.relative(SRC, file);
  const permitidos = ALLOWLIST_DETERMINISTA.filter((a) => a.file === rel);
  const hits: string[] = [];

  stripComments(fs.readFileSync(file, 'utf8'))
    .split('\n')
    .forEach((line, i) => {
      let resto = line;
      permitidos.forEach((a) => {
        resto = resto.split(a.snippet).join('');
      });
      TERMINOS_PROHIBIDOS.forEach(({ familia, patron }) => {
        const match = patron.exec(resto);
        if (match) {
          hits.push(`${rel}:${i + 1} [${familia}: "${match[0]}"] → ${line.trim()}`);
        }
      });
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

  describe('lenguaje determinista (T-SEO-018)', () => {
    it('falla ante cada familia de términos prohibidos', () => {
      const muestras = [
        'Este amarre de amor te devuelve a tu ex en siete días.',
        'Un endulzamiento con resultado garantizado.',
        'Predicción 100 % precisa de tu futuro.',
        'Una predicción exacta de lo que viene.',
        'Esta carta sana las heridas del pasado.',
        'La sanación llega con la Estrella.',
        'El As de Oros cura la escasez.',
        'La carta te dice cuándo invertir.',
        'Vas a ganar el juicio.',
        'Advertencia: tu destino está en riesgo.',
        'Hay un peligro que nadie ve.',
        'Lo que nadie te dice sobre tu signo.',
      ];
      const sinDeteccion = muestras.filter(
        (muestra) => !TERMINOS_PROHIBIDOS.some(({ patron }) => patron.test(muestra))
      );
      expect(sinDeteccion).toEqual([]);
    });

    it('no marca copy de tarot sano (falsos positivos conocidos)', () => {
      const sanas = [
        'La Muerte marca un cierre inevitable y un renacimiento.',
        'La carta no promete continuidad.',
        'El Sol augura matrimonios felices.',
        'Un vínculo sano, con acuerdos claros.',
        'Curiosidad, cursos y curvas de aprendizaje.',
        'Puede haber engaños que pongan en riesgo tu economía.',
      ];
      const marcadas = sanas.filter((frase) =>
        TERMINOS_PROHIBIDOS.some(({ patron }) => patron.test(frase))
      );
      expect(marcadas).toEqual([]);
    });

    it('no usa lenguaje determinista en componentes ni páginas', () => {
      const violaciones = walk(SRC).flatMap(scanDeterminista);
      expect(violaciones).toEqual([]);
    });
  });
});
