/**
 * Índice editorial de `/rituales` (T-SEO-015).
 *
 * El hub servía 223 palabras: la grilla de rituales (que llegaba por el
 * cliente) y la tarjeta informativa de plantilla. Ahora la grilla se siembra
 * desde el servidor y, debajo, este texto presenta el catálogo con contexto:
 * qué fase de la Luna acompaña a cada tipo de ritual, cuándo conviene cada
 * categoría, qué preparar y qué esperar. Estructura propia (fases como lista
 * de definiciones + categorías como lista), distinta a la de las otras
 * herramientas.
 *
 * ⚠️ Al editar: sin lenguaje determinista ni de promesa (T-SEO-018), sin
 * "salud" ni "sanación" en texto visible (T-SEO-013), sin repetir la guía de la
 * enciclopedia. El piso lo mide `rituals-hub.data.test.ts`.
 */

import { countWords } from '@/lib/utils/text';
import { ROUTES } from './routes';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RitualsLunarPhaseItem {
  phase: string;
  /** Para qué sirve esa fase. */
  purpose: string;
  body: string;
}

export interface RitualsCategoryItem {
  name: string;
  body: string;
}

export interface RitualsGuideSection {
  heading: string;
  paragraphs: string[];
}

export interface RitualsHubGuideData {
  title: string;
  lead: string;
  phases: { heading: string; intro: string; items: RitualsLunarPhaseItem[] };
  categories: { heading: string; intro: string; items: RitualsCategoryItem[] };
  sections: RitualsGuideSection[];
  links: Array<{ label: string; href: string }>;
}

// ─── Guardarraíl ──────────────────────────────────────────────────────────────

/** El backlog pide 600+ palabras para el hub. */
export const MIN_RITUALS_HUB_GUIDE_WORDS = 600;

export function getRitualsHubGuideWordCount(): number {
  const { lead, phases, categories, sections } = RITUALS_HUB_GUIDE;
  return countWords([
    lead,
    phases.intro,
    ...phases.items.flatMap((item) => [item.purpose, item.body]),
    categories.intro,
    ...categories.items.map((item) => item.body),
    ...sections.flatMap((section) => section.paragraphs),
  ]);
}

// ─── Contenido ────────────────────────────────────────────────────────────────

export const RITUALS_HUB_GUIDE: RitualsHubGuideData = {
  title: 'Cómo elegir un ritual (y cuándo hacerlo)',
  lead: 'Los rituales de arriba son guías paso a paso: cada uno indica materiales, duración, dificultad y la fase lunar que mejor lo acompaña. El catálogo se filtra por categoría y por dificultad, y la sección de destacados cambia con la Luna. Esta nota explica cómo se lee esa información para elegir uno: qué aporta cada fase, para qué sirve cada categoría, qué preparar antes y qué esperar después.',
  phases: {
    heading: 'Las cuatro fases de la Luna y qué ritual va con cada una',
    intro:
      'La Luna es el reloj de la práctica ritual porque marca un ciclo corto —unos 29 días— con cuatro momentos claros. No es obligatorio esperar la fase indicada, pero cuando el ritual y la fase coinciden, la intención tiene un contexto que la sostiene:',
    items: [
      {
        phase: 'Luna nueva',
        purpose: 'Para empezar',
        body: 'El cielo sin Luna visible es el momento de sembrar: escribir una intención, abrir un ciclo, plantear un proyecto. Los rituales de esta fase son cortos y suelen terminar con algo escrito o guardado, que se revisa en la Luna llena siguiente.',
      },
      {
        phase: 'Luna creciente',
        purpose: 'Para hacer crecer',
        body: 'Entre la nueva y la llena, la Luna suma luz cada noche. Es la fase de los rituales de abundancia y de los que piden constancia: se enciende una vela varios días seguidos, se repite una afirmación, se alimenta lo que se sembró.',
      },
      {
        phase: 'Luna llena',
        purpose: 'Para culminar y agradecer',
        body: 'El punto de máxima luz. Rituales de gratitud, de celebración y de claridad; también los de carga energética de objetos (cristales, mazos de tarot) que se dejan bajo su luz. Es la fase más popular y la que menos preparación necesita.',
      },
      {
        phase: 'Luna menguante',
        purpose: 'Para soltar',
        body: 'De la llena a la nueva, la luz baja. Es la fase de las limpiezas —de espacios, de objetos, de hábitos— y de los cierres: terminar lo que quedó abierto, despedir una etapa, ordenar. Lo que se suelta acá deja lugar a lo que se siembra en la nueva.',
      },
    ],
  },
  categories: {
    heading: 'Por categoría: cuándo conviene cada una',
    intro:
      'El filtro de categoría agrupa los rituales por propósito. Una orientación breve para cada grupo, pensada para elegir sin leer todo el catálogo:',
    items: [
      {
        name: 'Lunar',
        body: 'Rituales atados a una fase concreta (nueva o llena, casi siempre). Son el mejor punto de entrada si nunca hiciste uno: la fecha la pone el calendario, no vos.',
      },
      {
        name: 'Limpieza',
        body: 'Para espacios, objetos o después de una etapa pesada. Van con la Luna menguante y con hierbas, humo o sal; conviene ventilar y tener a mano qué hacer con los restos.',
      },
      {
        name: 'Protección',
        body: 'Para marcar un límite: un espacio nuevo, un vínculo que se cierra, un período de exposición. Suelen combinar un objeto que queda (una vela, una piedra, un cordón) con una frase que se repite.',
      },
      {
        name: 'Abundancia',
        body: 'Para poner en marcha un proyecto o pedir con claridad lo que se quiere. Funcionan mejor con una intención concreta y escrita que con una general, y van con la Luna creciente.',
      },
      {
        name: 'Amor',
        body: 'Para el vínculo con uno mismo y para los vínculos que ya existen. En Auguria no hay rituales para atraer o retener a una persona en particular: la intención se dirige a lo que depende de vos.',
      },
      {
        name: 'Meditación y tarot',
        body: 'Prácticas de atención: respiración guiada, visualización, o una tirada con un encuadre ritual. No piden materiales especiales y sirven cualquier día del ciclo.',
      },
    ],
  },
  sections: [
    {
      heading: 'Antes de empezar: materiales, espacio y tiempo',
      paragraphs: [
        'Cada ficha lista los materiales en tres grupos: necesarios, opcionales y alternativas. Si falta uno de los necesarios, la ficha suele proponer un reemplazo; si falta más de uno, elegí otro ritual antes que improvisar demasiado. Reservá el tiempo que indica la duración más diez minutos de margen: la parte que más se apura es el cierre, y es la que ordena todo lo anterior. Y un espacio donde nadie entre mientras dure, aunque sea un rincón.',
        'Si usás velas o humo, apoyalas sobre una superficie que no se queme y no las dejes solas. Es una recomendación práctica, no simbólica, y vale para todos los rituales del catálogo.',
      ],
    },
    {
      heading: 'Qué esperar (y qué no)',
      paragraphs: [
        'Un ritual ordena una intención: la nombra, le da forma, le pone fecha. Lo que se nota después, cuando se hace con atención, es claridad sobre lo que se quiere y una manera más consciente de actuar en esa dirección. Lo que no hace es cambiar hechos externos por sí solo, decidir por otra persona ni reemplazar una consulta profesional en temas médicos, legales o financieros. Si tenés cuenta, el historial guarda cada ritual completado con la fecha y la fase lunar, y con unos meses de registro se ve qué prácticas volvés a elegir y en qué momentos del ciclo.',
      ],
    },
  ],
  links: [
    {
      label: 'Guía: qué es un ritual y cómo se arma',
      href: ROUTES.ENCICLOPEDIA_GUIA('guia-rituales'),
    },
    { label: 'La carta del día, para empezar la jornada', href: ROUTES.CARTA_DEL_DIA },
  ],
};
