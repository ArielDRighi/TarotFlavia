/**
 * Nota de uso de `/pendulo`: cómo consultar el péndulo digital acá (T-SEO-015).
 *
 * La herramienta queda arriba, usable sin registro. Este texto es el **cómo
 * usar esto acá**: cómo formular la pregunta (con ejemplos que sirven y que
 * no), cómo leer cada movimiento, qué hacer con un "quizás", qué no puede
 * decirte. La teoría —qué es la radiestesia, de dónde viene— vive en la
 * enciclopedia, enlazada al pie.
 *
 * La estructura es distinta a la de las otras guías de herramientas a
 * propósito (listas de preguntas + tabla de movimientos + secciones): 78 fichas
 * con los mismos encabezados ya son una señal de "producido en volumen"; no
 * hace falta sumar siete herramientas con la misma plantilla.
 *
 * ⚠️ Al editar: sin lenguaje determinista ni de promesa (T-SEO-018), sin
 * "salud" en texto visible (T-SEO-013), sin repetir párrafos de la
 * enciclopedia. El piso lo mide `pendulum-guide.data.test.ts`.
 */

import { countWords } from '@/lib/utils/text';
import { ROUTES } from './routes';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PendulumQuestionExample {
  question: string;
  /** Por qué sirve (o por qué no). */
  why: string;
}

export interface PendulumMovementGuide {
  /** Nombre del movimiento tal como lo muestra la herramienta. */
  movement: string;
  /** Respuesta que representa. */
  answer: string;
  body: string;
}

export interface PendulumGuideSection {
  heading: string;
  paragraphs: string[];
}

export interface PendulumGuideData {
  title: string;
  lead: string;
  goodQuestions: { heading: string; intro: string; items: PendulumQuestionExample[] };
  badQuestions: { heading: string; intro: string; items: PendulumQuestionExample[] };
  movements: { heading: string; intro: string; items: PendulumMovementGuide[] };
  sections: PendulumGuideSection[];
  links: Array<{ label: string; href: string }>;
}

// ─── Guardarraíl ──────────────────────────────────────────────────────────────

export const MIN_PENDULUM_GUIDE_WORDS = 800;

export function getPendulumGuideWordCount(): number {
  const { lead, goodQuestions, badQuestions, movements, sections } = PENDULUM_GUIDE;
  return countWords([
    lead,
    goodQuestions.intro,
    ...goodQuestions.items.flatMap((item) => [item.question, item.why]),
    badQuestions.intro,
    ...badQuestions.items.flatMap((item) => [item.question, item.why]),
    movements.intro,
    ...movements.items.map((item) => item.body),
    ...sections.flatMap((section) => section.paragraphs),
  ]);
}

// ─── Contenido ────────────────────────────────────────────────────────────────

export const PENDULUM_GUIDE: PendulumGuideData = {
  title: 'Cómo consultar el péndulo acá',
  lead: 'El péndulo de arriba responde sí, no o quizás a una pregunta que formulás en silencio (o por escrito, si tenés Premium). Es la herramienta más rápida del sitio y también la que más depende de cómo se pregunta: una consulta bien armada da una respuesta que se puede usar; una consulta vaga da un movimiento que no significa nada. Esta nota explica cómo formular la pregunta en Auguria, cómo leer cada movimiento, qué hacer cuando sale "quizás" y qué queda fuera de lo que el péndulo puede decirte.',
  goodQuestions: {
    heading: 'Preguntas que funcionan',
    intro:
      'Una buena pregunta para el péndulo se responde con sí o no, refiere a una sola cosa, está en presente o en un futuro corto, y depende de vos. Ejemplos:',
    items: [
      {
        question: '¿Me conviene mandar hoy el mensaje que tengo escrito?',
        why: 'Una acción concreta, un plazo claro y una decisión que es tuya.',
      },
      {
        question: '¿Estoy listo para hablar de este tema en la reunión del jueves?',
        why: 'Pregunta por tu estado, no por el resultado de la reunión: eso sí se puede responder.',
      },
      {
        question: '¿Le doy una semana más a este proyecto antes de decidir?',
        why: 'Delimita el tiempo y la alternativa; el sí y el no significan cosas distintas y claras.',
      },
      {
        question: '¿Hay algo que estoy evitando mirar en esta situación?',
        why: 'Abierta pero cerrada a la vez: la respuesta es sí o no, y un sí te manda a pensar.',
      },
    ],
  },
  badQuestions: {
    heading: 'Preguntas que no funcionan',
    intro:
      'Las siguientes son las que más se hacen, y las que menos sirven. No porque el péndulo "se equivoque", sino porque la pregunta no tiene una respuesta binaria honesta:',
    items: [
      {
        question: '¿Me va a ir bien?',
        why: 'Bien en qué, cuándo, comparado con qué. Cualquier movimiento se puede leer como confirmación.',
      },
      {
        question: '¿Vuelve o no vuelve?',
        why: 'Depende de otra persona. El péndulo trabaja con tu intuición sobre tu situación, no con la voluntad ajena.',
      },
      {
        question: '¿Me cambio de trabajo o me quedo, o pido aumento?',
        why: 'Tres preguntas en una. Separalas y consultá una por vez, en días distintos si hace falta.',
      },
      {
        question: '¿Tengo que preocuparme por lo del estudio médico?',
        why: 'Ninguna herramienta de este sitio responde sobre temas médicos, legales o de dinero concreto. Esa pregunta es para un profesional.',
      },
    ],
  },
  movements: {
    heading: 'Cómo leer cada movimiento',
    intro:
      'La herramienta anima el péndulo unos segundos y se detiene en uno de tres movimientos. El significado de cada uno es fijo en Auguria —no hay que "calibrarlo" como con un péndulo físico— y se muestra debajo con una breve explicación:',
    items: [
      {
        movement: 'Vertical',
        answer: 'Sí',
        body: 'Un vaivén de adelante hacia atrás. Es un sí, pero un sí a lo que preguntaste, no a lo que esperabas: si preguntaste "¿me conviene esperar?" y sale vertical, la respuesta es esperar, aunque tuvieras ganas de actuar. Releé la pregunta exacta antes de sacar conclusiones.',
      },
      {
        movement: 'Horizontal',
        answer: 'No',
        body: 'Un vaivén de izquierda a derecha. Un no del péndulo no es un cierre: es una invitación a preguntar de otra manera. Muchas veces el no aparece porque la pregunta tenía una suposición escondida ("¿debería insistir?" da por hecho que insistir es la única opción).',
      },
      {
        movement: 'Circular',
        answer: 'Quizás',
        body: 'Un giro en círculos. Es la respuesta más frecuente cuando la pregunta es amplia, cuando faltan datos o cuando la decisión todavía no está madura. No es un error de la herramienta y no conviene repetir la consulta para forzar un sí o un no: leé la sección siguiente.',
      },
    ],
  },
  sections: [
    {
      heading: 'Qué hacer con un «quizás»',
      paragraphs: [
        'El quizás es información, no ruido. Casi siempre señala una de tres cosas: la pregunta mezclaba dos asuntos, la respuesta depende de algo que todavía no pasó, o vos ya sabés la respuesta y no querés escucharla. Antes de volver a consultar, reescribí la pregunta más chica. "¿Acepto la propuesta?" se convierte en "¿Acepto la propuesta si mantienen las condiciones que me dijeron?" y, si sale sí, en "¿Confío en que las van a mantener?". Dos preguntas cerradas valen más que una abierta.',
        'Si después de reformular vuelve a salir circular, dejalo ahí. Anotá la pregunta y volvé en unos días: el péndulo no tiene apuro, y una decisión que hoy da quizás suele tener un sí o un no claro cuando cambia algo del contexto.',
      ],
    },
    {
      heading: 'Antes de tocar «Consultar»',
      paragraphs: [
        'Formulá la pregunta completa en tu cabeza (o en el campo de texto, si tu plan lo incluye) antes de tocar el botón, no mientras el péndulo se mueve. Respirá una vez. Un estado neutro —sin querer que salga algo en particular— es lo que hace que la respuesta sirva para pensar en vez de para confirmar. Si notás que ya decidiste y sólo querés que el péndulo te dé la razón, la consulta más útil es otra: "¿estoy consultando para escuchar o para que me apruebe?".',
      ],
    },
    {
      heading: 'Cuántas veces consultar (y por qué hay un límite)',
      paragraphs: [
        'Sin cuenta, la herramienta permite una consulta por día; con cuenta, el límite depende del plan y se muestra en la franja de arriba. El límite no es sólo comercial: consultar la misma pregunta diez veces seguidas anula la práctica, porque en algún intento va a salir lo que querías y te vas a quedar con ese. Una consulta, una respuesta, una nota. Si el tema es importante, volvé mañana con la pregunta afinada.',
      ],
    },
    {
      heading: 'Qué no puede decirte',
      paragraphs: [
        'El péndulo digital no adivina hechos: no sabe si alguien te mintió, si un número va a salir ni qué va a decidir otra persona. Tampoco reemplaza una consulta profesional en temas médicos, legales, financieros o psicológicos; si tu pregunta es de ese tipo, la herramienta te lo va a indicar y no va a responder. Lo que hace es más modesto y más útil: te obliga a formular con precisión lo que te pasa y te devuelve una respuesta cerrada para contrastar con tu intuición. La decisión, siempre, es tuya.',
      ],
    },
  ],
  links: [
    {
      label: 'Guía: qué es el péndulo y de dónde viene',
      href: ROUTES.ENCICLOPEDIA_GUIA('guia-pendulo'),
    },
    { label: 'Una pregunta más amplia: tirada de tarot', href: ROUTES.TAROT },
  ],
};
