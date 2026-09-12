/**
 * Guía permanente de `/carta-del-dia`: "Cómo usar la carta del día" (T-SEO-015).
 *
 * ## Por qué existe
 *
 * La página servía 220 palabras: el widget y la tarjeta informativa con la
 * misma plantilla que las otras herramientas (emoji + 3 bullets + "Nota"). Para
 * un revisor de AdSense eso es un "sitio de herramientas". La herramienta se
 * queda —es gratuita y funciona sin registro—; lo que cambia es que debajo hay
 * una guía de uso de verdad, y arriba la carta canónica del día con su
 * interpretación.
 *
 * ## Qué es y qué no es este texto
 *
 * Es el **cómo usar esto acá**: cómo sacar la carta, cómo leerla, qué hacer con
 * ella durante el día, cómo llevar el registro. No es el *qué es* el tarot ni
 * el significado de cada carta: eso vive en la enciclopedia, enlazada desde la
 * ficha de la carta de hoy y desde el pie de la guía.
 *
 * ## ⚠️ Al editar
 *
 * - Sin lenguaje determinista ni de promesa (T-SEO-018): la carta "sugiere",
 *   "invita", "muestra un ángulo"; nunca "garantiza" ni "predice con exactitud".
 * - Sin la palabra "salud" en texto visible (T-SEO-013).
 * - No repetir párrafos de la enciclopedia ni de las otras guías de
 *   herramientas: dos URLs con el mismo texto son contenido duplicado.
 * - El piso de palabras lo mide `daily-card-guide.data.test.ts`.
 */

import { countWords } from '@/lib/utils/text';
import { ROUTES } from './routes';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Un paso de la guía: se renderiza como `h3` + uno o más párrafos. */
export interface DailyCardGuideStep {
  heading: string;
  paragraphs: string[];
}

export interface DailyCardGuideData {
  /** Título de la guía (`h2`; el `h1` es el de la página). */
  title: string;
  lead: string;
  steps: DailyCardGuideStep[];
  /** Enlaces internos al pie: la teoría vive en la enciclopedia. */
  links: Array<{ label: string; href: string }>;
}

// ─── Guardarraíl ──────────────────────────────────────────────────────────────

/** El backlog pide 800+ palabras para la guía permanente. */
export const MIN_DAILY_CARD_GUIDE_WORDS = 800;

export function getDailyCardGuideWordCount(): number {
  return countWords([
    DAILY_CARD_GUIDE.lead,
    ...DAILY_CARD_GUIDE.steps.flatMap((step) => step.paragraphs),
  ]);
}

// ─── Contenido ────────────────────────────────────────────────────────────────

export const DAILY_CARD_GUIDE: DailyCardGuideData = {
  title: 'Cómo usar la carta del día',
  lead: 'La carta del día es la práctica más corta del tarot y, por eso mismo, la que más se malinterpreta. No es una tirada: es una sola carta, sacada a la mañana o cuando arranca tu jornada, que funciona como un ángulo desde el cual mirar lo que te pase en las próximas horas. Esta guía explica cómo sacarla en Auguria, cómo leer lo que salió, qué hacer con una carta que no te gusta y cómo aprovechar el registro que la herramienta guarda por vos.',
  steps: [
    {
      heading: 'Antes de sacarla: un momento y una intención',
      paragraphs: [
        'La herramienta de arriba entrega una carta por día, con o sin cuenta. Antes de tocar el mazo, tomate diez segundos. No hace falta una pregunta cerrada —para eso están las tiradas y el péndulo—, alcanza con una intención abierta: "qué me conviene tener presente hoy", "con qué actitud entro a esta reunión", "qué estoy pasando por alto en esta semana". Si sacás la carta con el teléfono en una mano y el café en la otra, la vas a leer igual de apurado que como la sacaste.',
        'Un detalle práctico: sacala una sola vez. Si la carta no te convence y volvés a probar, ya no estás usando la carta del día, estás buscando la que querías escuchar. La herramienta lo evita por diseño —una por día— y ese límite es parte de la práctica, no una restricción del sitio.',
      ],
    },
    {
      heading: 'Cómo leer la carta que salió',
      paragraphs: [
        'Mirá primero la imagen antes que el texto. Qué figura hay, hacia dónde mira, qué está haciendo con las manos, si el paisaje es abierto o cerrado. La lectura del tarot Rider-Waite se apoya en esos detalles, y el texto que aparece debajo de la carta —el significado al derecho y el consejo— es un resumen, no la única lectura posible.',
        'Después, cruzá ese significado con tu día concreto. Si salió el Ocho de Oros y hoy tenés que terminar un trabajo tedioso, la carta habla de oficio y constancia; si salió el mismo Ocho de Oros y tenés el día libre, quizá te está hablando de una habilidad que venís posponiendo practicar. La carta no cambia; cambia el lugar de tu vida donde la apoyás. Si querés la ficha completa —amor, trabajo, simbolismo, combinaciones—, el enlace "Ver la ficha de la carta" te lleva a la enciclopedia.',
      ],
    },
    {
      heading: 'Derecha e invertida',
      paragraphs: [
        'La carta del día puede salir invertida. En Auguria eso se muestra con la imagen dada vuelta y con un significado propio, que no es "lo contrario" del derecho sino su versión bloqueada, excesiva o todavía interna. Una Emperatriz invertida no es esterilidad: suele hablar de un cuidado que se volvió sobreprotección, o de una creatividad que no encuentra por dónde salir.',
        'Si recién empezás, no te pelees con la invertida. Leé el significado derecho, después el invertido, y preguntate cuál de los dos describe mejor tu momento. Con el tiempo vas a notar que la invertida no aparece al azar: tiende a salir cuando algo de lo que la carta representa está costando más de lo normal.',
      ],
    },
    {
      heading: 'Cuando la carta no te gusta',
      paragraphs: [
        'Van a salir la Torre, el Diez de Espadas, el Diablo. Son cartas incómodas y, justamente por eso, de las más útiles para el día. La Torre a la mañana no anuncia una catástrofe: te propone revisar qué estructura de tu rutina está sostenida con alfileres, antes de que se caiga sola. El Diez de Espadas suele señalar algo que ya terminó y que seguís cargando.',
        'La regla es simple: ninguna carta del día es una sentencia sobre lo que va a pasar. Es una lente. Si la lente te resulta oscura, preguntate qué parte del día merece mirarse con más cuidado, y después seguí con tu vida. Volver a sacar la carta hasta que salga una amable no es tarot, es esquivar lo que la primera te mostró.',
      ],
    },
    {
      heading: 'Qué hacer con la carta durante el día',
      paragraphs: [
        'La carta del día se aprovecha cuando la volvés a mirar. Dejá una nota en el teléfono con el nombre de la carta y una palabra clave, y releela a la tarde. Muchas veces el significado que a la mañana te pareció abstracto se vuelve obvio después de una conversación, de una decisión chica o de un imprevisto. Ese "ah, era esto" es la parte formativa de la práctica: te enseña a reconocer el arquetipo en situaciones reales.',
        'Si tenés cuenta, la carta queda guardada con la fecha y podés agregarle una nota. Escribí una línea a la noche: qué pasó, y si la carta te ayudó a leerlo. No hace falta más.',
      ],
    },
    {
      heading: 'Llevar un registro: qué muestra a los treinta días',
      paragraphs: [
        'Con un mes de cartas guardadas aparecen patrones que una carta suelta nunca muestra. Cartas que se repiten —una Luna que vuelve tres veces en dos semanas suele estar señalando una confusión que no terminás de nombrar—, palos que dominan un período —muchas Espadas en días de decisiones, muchas Copas en semanas afectivas—, o la ausencia total de un palo, que también dice algo.',
        'Para eso está el historial de la herramienta para usuarios registrados, y más abajo, el archivo con la carta canónica de cada uno de los últimos treinta días, que es la misma que muestra la portada del sitio. Son dos registros distintos: el tuyo es personal y depende de tu sorteo; el archivo es el del sitio, una carta por día para todos, que sirve para releer el mes en clave colectiva o para comparar con la tuya.',
      ],
    },
    {
      heading: 'Qué no es la carta del día',
      paragraphs: [
        'No es una predicción de lo que va a ocurrir, ni un permiso o una prohibición. No decide por vos si mandar un mensaje, firmar un contrato o cancelar un turno. Tampoco reemplaza una consulta con un profesional cuando el tema es médico, legal, financiero o psicológico: el tarot es una práctica de reflexión y autoconocimiento, y la carta del día es su formato más breve.',
        'Lo que sí hace, si la usás con constancia, es entrenar una manera de mirar: detenerse un instante, nombrar la energía de la jornada y volver sobre ella con lo que pasó. Es poco, y es exactamente lo que la práctica promete.',
      ],
    },
  ],
  links: [
    { label: 'Significado de las 78 cartas', href: ROUTES.ENCICLOPEDIA_TAROT },
    { label: 'Guía: cómo leer el tarot', href: ROUTES.ENCICLOPEDIA_GUIA('guia-tarot') },
    { label: 'Tirada de tarot completa', href: ROUTES.TAROT },
  ],
};
