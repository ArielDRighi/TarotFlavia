import * as fs from 'fs';
import * as path from 'path';

/**
 * Guardarraíl T-SEO-013 (+ T-SEO-018): la palabra "salud" (y sus derivados por
 * grep — `saludable`, `saludo`, `saludando`) NO debe aparecer en el corpus de
 * contenido que termina sirviéndose como HTML del sitio. T-SEO-018 extendió el
 * mismo barrido a las familias de lenguaje determinista de `TERMINOS_PROHIBIDOS`
 * (más abajo).
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
 * y los `data/`, `seeds/`, `prompts/`, `templates/` y `enums/` de los módulos;
 * `enums/` entró en T-SEO-018 porque `reading-patterns.enums.ts` guarda mensajes
 * que el dashboard renderiza tal cual). Un prompt
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
  {
    // Regla de lenguaje compartida por todos los prompts (T-SEO-018): nombra
    // la palabra para prohibirla. Misma lógica que la del horóscopo chino.
    file: 'common/prompts/ymyl-language.prompt.ts',
    snippet:
      'Prohibido: "salud", "curar", "sanar", "sanación", "sanador", diagnósticos, síntomas, tratamientos.',
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
    /(^|[\\/])(data|seeds|prompts|templates|enums)[\\/]/.test(rel)
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

/**
 * T-SEO-018 — lenguaje determinista (YMYL). Lo que hunde a los sitios
 * esotéricos en AdSense no es el tarot: es el vocabulario de **promesa** y de
 * **daño**. Cuatro familias, calcadas del alcance de la tarea:
 *
 *  1. Promesas de resultado: amarres, endulzamientos, garantizado, "100 %
 *     preciso", "predicción exacta", "te devuelve a tu ex".
 *  2. Salud (lo que quedó después de T-SEO-013): cura, sana, sanación,
 *     sanador. El término del proyecto es acompañamiento / reflexión /
 *     autoconocimiento.
 *  3. Dinero y legal accionable: "cuándo invertir", "vas a ganar el juicio".
 *  4. Miedo y urgencia: advertencia, peligro, "tu destino está en riesgo",
 *     "lo que nadie te dice".
 *
 * Cada patrón es un token o una frase hecha, no un verbo suelto: el criterio
 * (T-SEO-013) es que el guardarraíl dé **cero falsos positivos** sobre copy de
 * tarot sano, porque un guardarraíl que se relaja no sirve. Por eso `inevitable`
 * (La Muerte, La Torre), `promete` (13 usos, casi todos negados) y `sano` como
 * adjetivo quedan fuera; `sana` entra porque el criterio de aceptación es un
 * grep sobre el HTML servido y no distingue el adjetivo del verbo.
 *
 * ⚠️ Es la MISMA lista que `frontend/src/no-salud-user-facing.test.ts`. Si se
 * agrega una familia acá, se agrega allá.
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
    patron:
      /\bpredicci[oó]n(es)? (exacta|precisa|infalible|certera|segura|garantizada)s?\b/i,
  },
  {
    familia: 'promesa',
    patron:
      /\b(te|le) (devuelve|devolver[aá]|trae|traer[aá]) a (tu|su) (ex|pareja|amor)\b/i,
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
    patron:
      /\b(tu|su) (destino|vida|futuro) (est[aá]|corre) (en )?(riesgo|peligro)\b/i,
  },
  { familia: 'miedo', patron: /\blo que nadie te (dice|cuenta)\b/i },
];

/**
 * Instrucciones NEGATIVAS a los modelos: nombran las palabras para prohibirlas.
 * Igual que la entrada del horóscopo chino en `ALLOWLIST`: sacarlas apagaría la
 * protección. Se eximen por (archivo, fragmento), nunca por archivo entero.
 */
const ALLOWLIST_DETERMINISTA: { file: string; snippet: string }[] = [
  'Prohibido: "garantizado", "100 % preciso", "predicción exacta", "infalible", "va a pasar", "definitivamente".',
  'Nunca ofrezcas amarres ni endulzamientos',
  'Prohibido: "salud", "curar", "sanar", "sanación", "sanador", diagnósticos, síntomas, tratamientos.',
  'no digas cuándo invertir, comprar o vender',
  'Prohibido: "advertencia", "peligro", "tu destino está en riesgo", "lo que nadie te dice".',
].map((snippet) => ({
  file: 'common/prompts/ymyl-language.prompt.ts',
  snippet,
}));

function scanDeterminista(file: string): string[] {
  const rel = path.relative(SRC, file);
  const permitidos = ALLOWLIST_DETERMINISTA.filter((a) => a.file === rel);
  const raw = fs.readFileSync(file, 'utf8');
  const stripped = file.endsWith('.hbs')
    ? stripHbsComments(raw)
    : file.endsWith('.md')
      ? raw
      : stripTsComments(raw);

  const hits: string[] = [];
  stripped.split('\n').forEach((line, i) => {
    let resto = line;
    permitidos.forEach((a) => {
      resto = resto.split(a.snippet).join('');
    });
    TERMINOS_PROHIBIDOS.forEach(({ familia, patron }) => {
      const match = patron.exec(resto);
      if (match) {
        hits.push(
          `${rel}:${i + 1} [${familia}: "${match[0]}"] → ${line.trim()}`,
        );
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

  describe('lenguaje determinista (T-SEO-018)', () => {
    it('falla ante cada familia de términos prohibidos', () => {
      const muestras = [
        'Este amarre de amor te devuelve a tu ex en siete días.',
        'Un endulzamiento con resultado garantizado.',
        'Predicción 100 % precisa de tu futuro.',
        'Una predicción exacta de lo que viene.',
        'Esta carta sana las heridas del pasado.',
        'La sanación llega con la Estrella.',
        'Eres un sanador natural.',
        'El As de Oros cura la escasez.',
        'La carta te dice cuándo invertir.',
        'Vas a ganar el juicio.',
        'Ganarás el pleito sin dudas.',
        'Advertencia: tu destino está en riesgo.',
        'Hay un peligro que nadie ve.',
        'Lo que nadie te dice sobre tu signo.',
      ];
      const sinDeteccion = muestras.filter(
        (muestra) =>
          !TERMINOS_PROHIBIDOS.some(({ patron }) => patron.test(muestra)),
      );
      expect(sinDeteccion).toEqual([]);
    });

    it('no marca copy de tarot sano (falsos positivos conocidos)', () => {
      const sanas = [
        'La Muerte marca un cierre inevitable y un renacimiento.',
        'La carta no promete continuidad.',
        'El Sol augura matrimonios felices.',
        'Un vínculo sano, con acuerdos claros.',
        'Sanea tus cuentas antes de decidir.',
        'Curiosidad, cursos y curvas de aprendizaje.',
        'Revisá bien cada acuerdo y no firmes nada sin entender.',
        'Puede haber engaños que pongan en riesgo tu economía.',
      ];
      const marcadas = sanas.filter((frase) =>
        TERMINOS_PROHIBIDOS.some(({ patron }) => patron.test(frase)),
      );
      expect(marcadas).toEqual([]);
    });

    it('no usa lenguaje determinista en seeds, datos, prompts ni plantillas', () => {
      const violaciones = corpusFiles.flatMap(scanDeterminista);
      expect(violaciones).toEqual([]);
    });
  });
});
