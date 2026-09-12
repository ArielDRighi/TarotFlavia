/**
 * Nota de uso de `/numerologia`: qué muestra el informe y cómo leerlo (T-SEO-015).
 *
 * La calculadora queda arriba. Este texto explica cómo se calcula el número
 * de vida (con un ejemplo hecho a mano), qué representa cada número, cómo leer
 * el resultado por capas y qué no dice la numerología. La estructura —pasos,
 * tabla de los nueve números y preguntas frecuentes— es distinta a la del
 * péndulo y a la de la carta astral a propósito.
 *
 * ⚠️ Al editar: sin lenguaje determinista ni de promesa (T-SEO-018), sin
 * "salud" en texto visible (T-SEO-013), sin repetir la entrada de la
 * enciclopedia. El piso lo mide `numerology-guide.data.test.ts`.
 */

import { countWords } from '@/lib/utils/text';
import { ROUTES } from './routes';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NumerologyNumberRow {
  number: string;
  theme: string;
  summary: string;
}

export interface NumerologyFaqItem {
  question: string;
  answer: string;
}

export interface NumerologyGuideSection {
  heading: string;
  paragraphs: string[];
}

export interface NumerologyGuideData {
  title: string;
  lead: string;
  /** Cómo se calcula, con el ejemplo. */
  calculation: NumerologyGuideSection;
  numbers: { heading: string; intro: string; rows: NumerologyNumberRow[] };
  reading: NumerologyGuideSection;
  faq: { heading: string; items: NumerologyFaqItem[] };
  limits: NumerologyGuideSection;
  links: Array<{ label: string; href: string }>;
}

// ─── Guardarraíl ──────────────────────────────────────────────────────────────

export const MIN_NUMEROLOGY_GUIDE_WORDS = 800;

export function getNumerologyGuideWordCount(): number {
  const { lead, calculation, numbers, reading, faq, limits } = NUMEROLOGY_GUIDE;
  return countWords([
    lead,
    ...calculation.paragraphs,
    numbers.intro,
    ...numbers.rows.flatMap((row) => [row.theme, row.summary]),
    ...reading.paragraphs,
    ...faq.items.flatMap((item) => [item.question, item.answer]),
    ...limits.paragraphs,
  ]);
}

// ─── Contenido ────────────────────────────────────────────────────────────────

export const NUMEROLOGY_GUIDE: NumerologyGuideData = {
  title: 'Qué muestra tu informe numerológico y cómo leerlo',
  lead: 'La calculadora de arriba toma una fecha de nacimiento —y, si lo cargás, un nombre completo— y devuelve un informe con varios números: camino de vida, cumpleaños, año y mes personal, y con el nombre, expresión, alma y personalidad. Son muchos números para leer de una vez. Esta nota explica cómo se calcula el principal, qué significa cada cifra, en qué orden conviene leer el resultado y qué preguntas no se responden con numerología.',
  calculation: {
    heading: 'Cómo se calcula el número de vida (y por qué conviene hacerlo a mano una vez)',
    paragraphs: [
      'El camino de vida sale de la fecha de nacimiento completa. Se reduce cada parte —día, mes y año— a un solo dígito sumando sus cifras, y después se suman los tres resultados y se vuelve a reducir. Ejemplo con el 19 de octubre de 1979: el día 19 da 1 + 9 = 10, y 1 + 0 = 1; el mes 10 da 1 + 0 = 1; el año 1979 da 1 + 9 + 7 + 9 = 26, y 2 + 6 = 8. Se suman 1 + 1 + 8 = 10, que reduce a 1. Camino de vida 1.',
      'Hay una excepción: si en algún paso aparece 11, 22 o 33, no se reduce. Son los números maestros, y la calculadora los conserva. Vale la pena hacer la cuenta a mano una sola vez, no por desconfiar de la herramienta sino porque entender de dónde sale el número cambia cómo se lee: el camino de vida no es un rasgo asignado, es una suma de fecha, y eso lo vuelve más una clave de lectura que una etiqueta.',
    ],
  },
  numbers: {
    heading: 'Los nueve números y los tres maestros',
    intro:
      'Cada número tiene un tema. Esta tabla resume el de cada uno en una línea, para orientar la lectura del informe; la ficha completa de cada número está en la guía de la enciclopedia.',
    rows: [
      {
        number: '1',
        theme: 'Inicio e independencia',
        summary: 'Abrir camino, decidir solo, aprender a no arrasar con los demás en el intento.',
      },
      {
        number: '2',
        theme: 'Vínculo y cooperación',
        summary: 'Sostener, mediar, escuchar; el desafío es no desaparecer detrás del otro.',
      },
      {
        number: '3',
        theme: 'Expresión',
        summary: 'Comunicar, crear, alegrar; la dispersión es su sombra habitual.',
      },
      {
        number: '4',
        theme: 'Estructura',
        summary: 'Construir con método y paciencia; cuidado con la rigidez.',
      },
      {
        number: '5',
        theme: 'Cambio y libertad',
        summary: 'Moverse, probar, viajar; el riesgo es no terminar nada.',
      },
      {
        number: '6',
        theme: 'Cuidado y responsabilidad',
        summary: 'Hogar, servicio, armonía; tiende a cargar con lo que no le corresponde.',
      },
      {
        number: '7',
        theme: 'Introspección',
        summary: 'Estudiar, analizar, buscar sentido; puede aislarse de más.',
      },
      {
        number: '8',
        theme: 'Poder y gestión',
        summary: 'Organizar recursos y ambiciones; el aprendizaje es el uso justo del poder.',
      },
      {
        number: '9',
        theme: 'Cierre y entrega',
        summary: 'Soltar, completar ciclos, dar; le cuesta despedirse.',
      },
      {
        number: '11',
        theme: 'Maestro: intuición',
        summary: 'Un 2 amplificado: sensibilidad y visión, con la tensión nerviosa que traen.',
      },
      {
        number: '22',
        theme: 'Maestro: constructor',
        summary: 'Un 4 en gran escala: proyectos que exceden a la persona.',
      },
      {
        number: '33',
        theme: 'Maestro: servicio',
        summary: 'Un 6 elevado: cuidado que se vuelve vocación; raro y exigente.',
      },
    ],
  },
  reading: {
    heading: 'Cómo leer el resultado, en tres capas',
    paragraphs: [
      'Primera capa: el camino de vida. Es el número que más pesa y el único que conviene leer solo, antes de mirar el resto. Preguntate si el tema de ese número aparece en tu historia —no si "sos así", sino si es un asunto que vuelve. Un 4 que vivió mudándose no es un error del cálculo: es alguien a quien la estructura le cuesta y por eso se le presenta una y otra vez.',
      'Segunda capa: los números del nombre, si lo cargaste. Expresión (todas las letras), alma (las vocales) y personalidad (las consonantes) describen talentos, deseos e imagen. Lo interesante no es cada uno por separado sino los contrastes: un alma 7 con una personalidad 3 es alguien que por fuera parece sociable y por dentro necesita silencio, y ese desajuste explica más que cualquiera de los dos números solos.',
      'Tercera capa: el año y el mes personal, que cambian con el calendario. Son los únicos números del informe que tienen fecha de vencimiento, y sirven para otra pregunta: no "quién soy" sino "qué momento del ciclo estoy atravesando". Un año personal 9 no es malo; es un año de cierres, y planificar un comienzo grande en él suele costar el doble.',
    ],
  },
  faq: {
    heading: 'Preguntas frecuentes',
    items: [
      {
        question:
          '¿Qué pasa si cargo el nombre con un solo apellido, o el nombre por el que me conocen?',
        answer:
          'Cambia el resultado de expresión, alma y personalidad. La convención más extendida usa el nombre completo tal como figura en el documento; si querés comparar, calculá las dos versiones en días distintos y anotá en cuál te reconocés más. El camino de vida no cambia: sale sólo de la fecha.',
      },
      {
        question: '¿Por qué mi número de vida es 11 y en otro sitio me dio 2?',
        answer:
          'Porque hay dos criterios: reducir siempre, o conservar los maestros. Auguria conserva 11, 22 y 33 cuando aparecen en la suma final. Ninguno de los dos es "el correcto"; conviene leer el 11 con su 2 de base.',
      },
      {
        question: '¿Puedo calcular la numerología de otra persona?',
        answer:
          'Sí, la calculadora acepta cualquier fecha y nombre, y no guarda el resultado si no tenés cuenta. Es útil para entender un vínculo (el contraste entre dos caminos de vida dice bastante), no para juzgar a nadie con un número.',
      },
      {
        question: '¿Cada cuánto conviene volver a mirar el informe?',
        answer:
          'Los números de fecha y nombre no cambian; con leerlos bien una vez alcanza. El año y el mes personal sí: vale la pena revisarlos en enero y, si estás en un cambio, al comienzo de cada mes.',
      },
    ],
  },
  limits: {
    heading: 'Qué no dice la numerología',
    paragraphs: [
      'No dice qué te va a pasar ni cuándo, no elige por vos entre dos opciones y no describe a nadie de forma cerrada: dos personas con el mismo camino de vida pueden no parecerse en nada, porque el número nombra un tema, no un carácter. Tampoco sirve para decisiones médicas, legales o financieras; para eso están los profesionales de cada campo. Usada con criterio, es un lenguaje para ordenar lo que ya sabés de vos y darle nombre a lo que se repite. Si querés la teoría completa —de dónde viene el sistema pitagórico, cómo se asignan las letras—, la guía de la enciclopedia la desarrolla.',
    ],
  },
  links: [
    {
      label: 'Guía: qué es la numerología y de dónde viene',
      href: ROUTES.ENCICLOPEDIA_GUIA('guia-numerologia'),
    },
    { label: 'Tu carta natal: el otro mapa de nacimiento', href: ROUTES.CARTA_ASTRAL },
  ],
};
