/**
 * Nota de uso de `/carta-astral`: cómo leer el resultado (T-SEO-015).
 *
 * El formulario queda arriba, con una carta gratis sin registro. Este texto
 * explica qué necesitás para calcularla (y qué pasa si falta la hora), por
 * dónde empezar a leerla, en qué orden seguir, un ejemplo de lectura, los
 * errores más frecuentes y qué no dice una carta natal. Estructura propia
 * (glosario del trío + ejemplo + lista de errores), distinta a la del péndulo
 * y a la de numerología a propósito.
 *
 * ⚠️ Al editar: sin lenguaje determinista ni de promesa (T-SEO-018), sin
 * "salud" en texto visible (T-SEO-013), sin repetir la entrada de la
 * enciclopedia. El piso lo mide `birth-chart-guide.data.test.ts`.
 */

import { countWords } from '@/lib/utils/text';
import { ROUTES } from './routes';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BirthChartTrioItem {
  /** Sol, Luna o Ascendente. */
  term: string;
  /** Qué pregunta responde. */
  question: string;
  body: string;
}

export interface BirthChartGuideSection {
  heading: string;
  paragraphs: string[];
}

export interface BirthChartGuideData {
  title: string;
  lead: string;
  requirements: BirthChartGuideSection;
  trio: { heading: string; intro: string; items: BirthChartTrioItem[] };
  order: BirthChartGuideSection;
  example: BirthChartGuideSection;
  mistakes: { heading: string; intro: string; items: string[] };
  limits: BirthChartGuideSection;
  links: Array<{ label: string; href: string }>;
}

// ─── Guardarraíl ──────────────────────────────────────────────────────────────

export const MIN_BIRTH_CHART_GUIDE_WORDS = 800;

export function getBirthChartGuideWordCount(): number {
  const { lead, requirements, trio, order, example, mistakes, limits } = BIRTH_CHART_GUIDE;
  return countWords([
    lead,
    ...requirements.paragraphs,
    trio.intro,
    ...trio.items.flatMap((item) => [item.question, item.body]),
    ...order.paragraphs,
    ...example.paragraphs,
    mistakes.intro,
    ...mistakes.items,
    ...limits.paragraphs,
  ]);
}

// ─── Contenido ────────────────────────────────────────────────────────────────

export const BIRTH_CHART_GUIDE: BirthChartGuideData = {
  title: 'Cómo leer tu carta natal',
  lead: 'La calculadora de arriba dibuja el cielo del momento en que naciste: dónde estaba cada planeta, en qué signo y en qué casa, y qué ángulos formaban entre sí. El gráfico impresiona y, sin una guía, no dice nada. Esta nota explica qué datos hacen falta y qué pasa si falta uno, por dónde empezar a leer el resultado, en qué orden seguir, cómo se arma una lectura con un ejemplo, qué errores se cometen al principio y qué queda fuera de lo que una carta puede decir.',
  requirements: {
    heading: 'Qué necesitás para calcularla (y qué pasa si falta la hora)',
    paragraphs: [
      'Tres datos: fecha, lugar y hora de nacimiento. La fecha y el lugar los sabés; la hora es la que suele faltar, y es la que define el Ascendente y las casas, porque el horizonte da una vuelta completa cada 24 horas y cambia de signo cada dos, aproximadamente. En Argentina la hora figura en el certificado de nacimiento del Registro Civil y, casi siempre, en la libreta de la maternidad. Si tenés que elegir, buscá el certificado: la memoria familiar suele redondear ("a la tarde", "de madrugada").',
      'Si no hay manera de conseguirla, calculá la carta igual con las 12:00 del mediodía. El Sol, Mercurio, Venus, Marte y los planetas lentos van a estar en el signo correcto (salvo que el planeta haya cambiado de signo ese mismo día, algo que la carta indica). Lo que no podés leer con confianza es el Ascendente, las casas y, a veces, la Luna, que recorre un signo en unos dos días y medio. Una carta sin hora es una carta de planetas y signos; sigue siendo útil, pero conviene saber qué parte está en pausa.',
    ],
  },
  trio: {
    heading: 'Por dónde empezar: el trío Sol, Luna y Ascendente',
    intro:
      'Antes de leer diez planetas, leé tres. El resultado los muestra juntos como "Big Three", y cada uno responde una pregunta distinta:',
    items: [
      {
        term: 'Sol',
        question: '¿Hacia dónde voy?',
        body: 'El signo solar es el que ya conocés por el horóscopo. En la carta natal habla de identidad y propósito: qué te hace sentir vos, qué te ordena la vida cuando lo tenés y qué te desordena cuando no. Mirá también su casa: un Sol en Casa 10 busca ese propósito en lo público; en Casa 4, en lo íntimo.',
      },
      {
        term: 'Luna',
        question: '¿Qué necesito para estar bien?',
        body: 'El mundo emocional y los hábitos: cómo reaccionás antes de pensar, qué te calma, qué te da seguridad. Muchas veces explica mejor la vida cotidiana que el Sol, porque la Luna es lo que hacés cuando nadie te mira. Si tu Sol y tu Luna están en signos muy distintos, ese contraste suele ser un tema central.',
      },
      {
        term: 'Ascendente',
        question: '¿Cómo entro al mundo?',
        body: 'El signo que salía por el horizonte en el este cuando naciste. Es la primera impresión que das, la manera en que arrancás las cosas, y el filtro por el que pasa todo lo demás. Depende de la hora exacta: si la carta se calculó con hora aproximada, leelo con cuidado o dejalo para más adelante.',
      },
    ],
  },
  order: {
    heading: 'Después del trío: planetas, casas y aspectos, en ese orden',
    paragraphs: [
      'Con el trío claro, seguí por los planetas personales: Mercurio (cómo pensás y hablás), Venus (cómo te vinculás y qué valorás) y Marte (cómo actuás y te enojás). Cada uno en un signo. Los planetas sociales, Júpiter y Saturno, agregan expansión y límite; los lentos —Urano, Neptuno, Plutón— son generacionales y pesan más por la casa en la que caen que por el signo.',
      'Después, las casas: son las doce áreas de la vida, y un planeta en una casa muestra dónde se juega ese tema. Por último, los aspectos, que son los ángulos entre planetas: una conjunción los funde, un trígono los facilita, una cuadratura los tensa. El informe los lista; no hace falta leerlos todos. Con los que involucran al Sol, la Luna y el Ascendente alcanza para empezar.',
    ],
  },
  example: {
    heading: 'Un ejemplo de lectura',
    paragraphs: [
      'Supongamos Sol en Capricornio en Casa 6, Luna en Leo en Casa 1, Ascendente Leo, y una cuadratura entre el Sol y la Luna. Leído por capas: el propósito pasa por el trabajo y la disciplina, en un área de rutina y servicio (Sol en Capricornio en 6). La necesidad emocional es de reconocimiento y calidez, y está a la vista de todos (Luna en Leo en 1, sobre el Ascendente). La cuadratura entre ambos nombra la tensión: lo que esta persona quiere hacer —cumplir, rendir, sostener— y lo que necesita sentir —ser vista, jugar, brillar— no van en la misma dirección, y una parte de su vida es negociar entre las dos.',
      'Fijate qué hizo la lectura: no describió un carácter, describió una dinámica. Eso es lo que la carta natal sabe hacer. Si el informe de arriba te da tus posiciones, probá escribir un párrafo así con tus tres primeros datos antes de seguir con el resto.',
    ],
  },
  mistakes: {
    heading: 'Errores frecuentes al leer la primera carta',
    intro: 'Los cinco que más se repiten en las consultas, y que se evitan sabiendo que existen:',
    items: [
      'Leer el Sol como si fuera toda la carta. Es un tercio del trío y una décima parte de los planetas.',
      'Buscar "el planeta malo". Saturno, Plutón o una cuadratura no son castigos; son los lugares donde la carta pide trabajo, y suelen ser los que más rinden.',
      'Confiar en el Ascendente con una hora aproximada. Dos horas de diferencia pueden cambiarlo de signo.',
      'Leer las casas vacías como carencias. Una casa sin planetas no es un área ausente; se lee por el signo de su cúspide y por el planeta que rige ese signo.',
      'Comparar la carta con la de otra persona para decidir un vínculo. La sinastría es otra técnica, con otras reglas, y una carta sola no dice nada sobre compatibilidad.',
    ],
  },
  limits: {
    heading: 'Qué no dice una carta natal',
    paragraphs: [
      'No dice qué te va a pasar ni cuándo: para eso existen otras técnicas (tránsitos, progresiones) que la calculadora no incluye. No describe un destino cerrado ni decide por vos; dos personas con cartas casi idénticas —gemelos, por ejemplo— viven vidas distintas con los mismos temas. Y no reemplaza a un profesional en asuntos médicos, legales, financieros o psicológicos. Lo que hace es ofrecer un mapa de tendencias y tensiones para conocerse mejor. Para la teoría de cada elemento —signos, planetas, casas—, la enciclopedia tiene una entrada por cada uno.',
    ],
  },
  links: [
    { label: 'Guía: qué es la carta astral', href: ROUTES.ENCICLOPEDIA_GUIA('guia-carta-astral') },
    { label: 'Los 12 signos', href: ROUTES.ENCICLOPEDIA_ASTROLOGIA_SIGNOS },
    { label: 'Los 10 planetas', href: ROUTES.ENCICLOPEDIA_ASTROLOGIA_PLANETAS },
    { label: 'Las 12 casas', href: ROUTES.ENCICLOPEDIA_ASTROLOGIA_CASAS },
  ],
};
