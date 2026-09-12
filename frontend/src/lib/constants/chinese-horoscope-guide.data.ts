/**
 * Nota de uso de `/horoscopo-chino` (T-SEO-015).
 *
 * El hub está en el header y en el footer, y el guardarraíl exige 500
 * palabras propias a toda URL del menú. Servía 255: calculadora + selector +
 * tarjeta informativa. Esta nota es el **cómo usar esto acá**: cómo saber tu
 * animal si naciste cerca del Año Nuevo chino, qué cambia el elemento, cómo
 * leer la predicción anual y qué no dice. La teoría (origen del zodíaco chino,
 * la leyenda de los doce animales) sigue en la enciclopedia.
 *
 * ⚠️ Al editar: sin lenguaje determinista ni de promesa (T-SEO-018), sin
 * "salud" en texto visible (T-SEO-013). El piso lo mide
 * `chinese-horoscope-guide.data.test.ts`.
 */

import { countWords } from '@/lib/utils/text';
import { ROUTES } from './routes';

export interface ChineseHoroscopeGuideSection {
  heading: string;
  paragraphs: string[];
}

export interface ChineseHoroscopeGuideData {
  title: string;
  lead: string;
  sections: ChineseHoroscopeGuideSection[];
  links: Array<{ label: string; href: string }>;
}

/**
 * Con la calculadora, el selector y la tarjeta informativa la página suma ~255
 * palabras; la nota pone el resto para superar las 500 del menú con margen.
 */
export const MIN_CHINESE_HOROSCOPE_GUIDE_WORDS = 320;

export function getChineseHoroscopeGuideWordCount(): number {
  return countWords([
    CHINESE_HOROSCOPE_GUIDE.lead,
    ...CHINESE_HOROSCOPE_GUIDE.sections.flatMap((section) => section.paragraphs),
  ]);
}

export const CHINESE_HOROSCOPE_GUIDE: ChineseHoroscopeGuideData = {
  title: 'Cómo consultar tu horóscopo chino acá',
  lead: 'La calculadora de arriba toma tu fecha de nacimiento y devuelve tu animal y tu elemento; el selector permite leer la predicción del año de cualquiera de los doce. Antes de tomar el resultado como definitivo, conviene saber tres cosas: cuándo empieza el año chino, qué agrega el elemento y cómo se lee una predicción anual.',
  sections: [
    {
      heading: 'Si naciste en enero o febrero, revisá el año',
      paragraphs: [
        'El año chino no arranca el 1 de enero: empieza con la segunda Luna nueva después del solsticio de diciembre, que cae entre el 21 de enero y el 20 de febrero según el año. Quien nació el 3 de febrero de 1991, por ejemplo, pertenece todavía al año del Caballo (1990) y no al de la Cabra, que recién empezó el 15 de febrero. La calculadora lo tiene en cuenta; si en otro sitio te dio un animal distinto, casi siempre es por esto.',
      ],
    },
    {
      heading: 'Qué cambia el elemento',
      paragraphs: [
        'Cada animal se combina con uno de cinco elementos —madera, fuego, tierra, metal y agua— que rotan cada dos años, así que el ciclo completo dura sesenta. Dos personas del mismo animal con distinto elemento comparten el temperamento base y difieren en el tono: un Dragón de Fuego y un Dragón de Agua no se leen igual. Cuando el selector te pida el elemento, elegí el que te dio la calculadora; si no lo sabés, la lectura por animal solo sigue siendo válida, aunque más general.',
      ],
    },
    {
      heading: 'Cómo leer la predicción anual',
      paragraphs: [
        'La predicción de cada animal describe cómo se lleva con el animal que rige el año en curso: afinidad, tensión o neutralidad, y en qué áreas se nota. Leela como una tendencia para todo el año, no como un pronóstico por fecha; las secciones de amor, trabajo y dinero señalan dónde conviene poner atención, y el apartado de compatibilidad sirve para entender vínculos, no para decidirlos. Si tenés cuenta con fecha de nacimiento cargada, tu predicción aparece arriba de todo al entrar.',
      ],
    },
    {
      heading: 'Qué no dice',
      paragraphs: [
        'El horóscopo chino no anticipa hechos ni fechas, no reemplaza una consulta profesional en temas médicos, legales o financieros, y no describe a nadie de forma cerrada: el animal nombra un temperamento, no un destino. Para la historia del sistema, la leyenda de la carrera de los doce animales y el detalle de cada elemento, la enciclopedia tiene la guía completa.',
      ],
    },
  ],
  links: [
    {
      label: 'Guía: origen del horóscopo chino y los cinco elementos',
      href: ROUTES.ENCICLOPEDIA_GUIA('guia-horoscopo-chino'),
    },
    { label: 'Horóscopo occidental de hoy', href: ROUTES.HOROSCOPO },
  ],
};
