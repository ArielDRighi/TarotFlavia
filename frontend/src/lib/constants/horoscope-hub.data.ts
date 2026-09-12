/**
 * Texto propio del hub `/horoscopo` (T-SEO-015).
 *
 * Los 12 extractos del día llegan de la API (`getCanonicalDailyHoroscopes`) y,
 * con ellos, el hub supera de sobra las 500 palabras que el guardarraíl le
 * exige a toda URL del menú. Este bloque es el **piso garantizado** cuando la
 * API no responde durante el ISR: cómo se lee el horóscopo diario acá. La
 * teoría (qué es un signo, los elementos, las modalidades) sigue en la tarjeta
 * informativa de debajo y en la enciclopedia.
 *
 * ⚠️ Al editar: sin lenguaje determinista ni de promesa (T-SEO-018), sin
 * "salud" en texto visible (T-SEO-013). El piso lo mide
 * `horoscope-hub.data.test.ts`.
 */

import { countWords } from '@/lib/utils/text';

export interface HoroscopeHubSection {
  heading: string;
  body: string;
}

export interface HoroscopeHubGuideData {
  title: string;
  sections: HoroscopeHubSection[];
}

/** Con la cabecera, el selector y la tarjeta informativa, el hub sin API queda cerca de 320 palabras. */
export const MIN_HOROSCOPE_HUB_GUIDE_WORDS = 200;

export function getHoroscopeHubGuideWordCount(): number {
  return countWords(HOROSCOPE_HUB_GUIDE.sections.map((section) => section.body));
}

export const HOROSCOPE_HUB_GUIDE: HoroscopeHubGuideData = {
  title: 'Cómo leer el horóscopo diario',
  sections: [
    {
      heading: 'De qué día es',
      body: 'El horóscopo se genera cada madrugada para el día calendario de Argentina, y la fecha que figura arriba es la de la predicción que estás leyendo. Si entrás desde otra zona horaria y tu día ya cambió, la ficha de cada signo muestra la tuya al cargar; si el de hoy todavía se está preparando, se avisa y se muestra el de ayer en lugar de dejar un hueco.',
    },
    {
      heading: 'Qué mirar primero',
      body: 'El extracto de arriba es la energía general de la jornada; la ficha completa la reparte en amor, dinero y bienestar, con una puntuación por área y el número, el color y la franja horaria del día. Conviene leer primero el general y después sólo el área que te importa hoy: leer las tres como si fueran una lista de tareas es la manera más segura de no sacarle nada.',
    },
    {
      heading: 'Sol, Luna o Ascendente',
      body: 'El horóscopo diario se escribe para el signo solar, que es el que da la fecha de nacimiento. Si conocés tu Ascendente, leer también el suyo suele describir mejor cómo se ve el día desde afuera; el de la Luna, cómo se siente por dentro. La carta astral del sitio calcula los tres.',
    },
    {
      heading: 'Qué no es',
      body: 'No es una predicción de hechos ni un consejo médico, legal o financiero: es una lectura simbólica de la posición de los planetas para invitar a mirar el día con un poco más de atención. Si algo te preocupa de verdad, la persona indicada es un profesional, no un signo.',
    },
  ],
};
