/**
 * Contenido indexable de los listados y hubs públicos (T-SEO-003).
 *
 * Las rutas de listado servían entre 3 y 70 palabras propias: el grueso de lo
 * que muestran son datos que llegan por el cliente (cartas, artículos,
 * servicios, tarotistas), así que el crawler veía el esqueleto. Sembrar esos
 * datos desde el servidor resuelve la mayor parte, pero deja el contenido de
 * cada URL atado a que la API responda durante el build.
 *
 * Este archivo es el **piso garantizado**: texto propio, escrito, que no depende
 * de la API ni de la sesión y que se renderiza siempre en el servidor. Mismo
 * criterio que `chinese-zodiac-profiles.data.ts` (T-SEO-002) y
 * `service-intros.data.ts`: contenido rico y específico, centralizado en datos
 * tipados en vez de incrustado en JSX.
 *
 * ⚠️ El texto de cada ruta debe ser **único**: dos URLs con el mismo párrafo son
 * contenido duplicado para Google, que fue el problema original.
 * `listing-intros.data.test.ts` lo verifica, igual que el mínimo de palabras.
 */

import { ROUTES } from './routes';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Un bloque temático dentro de la introducción. */
export interface ListingIntroSection {
  /** Encabezado del bloque (se renderiza como `h3`). */
  heading: string;
  /** Cuerpo del bloque. */
  body: string;
}

/** Enlace interno al pie de la introducción. */
export interface ListingIntroLink {
  /** Texto del enlace. */
  label: string;
  /** Ruta interna (siempre empieza con `/`). */
  href: string;
}

/** Introducción editorial de una ruta de listado o hub. */
export interface ListingIntroData {
  /** Título del bloque (se renderiza como `h2`; el `h1` es el de la página). */
  title: string;
  /** Párrafo de entrada. */
  lead: string;
  /** Bloques temáticos, al menos dos. */
  sections: ListingIntroSection[];
  /** Enlaces internos relacionados, para que el crawler siga recorriendo. */
  links?: ListingIntroLink[];
}

/** Claves de las rutas cubiertas. */
export type ListingIntroKey =
  | 'enciclopedia'
  | 'enciclopediaTarot'
  | 'enciclopediaGuias'
  | 'enciclopediaAstrologia'
  | 'enciclopediaSignos'
  | 'enciclopediaPlanetas'
  | 'enciclopediaCasas'
  | 'servicios'
  | 'explorar'
  | 'contacto';

// ─── Guardarraíl ──────────────────────────────────────────────────────────────

/**
 * Mínimo de palabras propias que debe aportar cada introducción.
 *
 * El umbral del guardarraíl de T-SEO-001 es 120 palabras **de la página
 * entera**. Se pide 130 acá para dejar margen: la introducción no es todo lo que
 * la ruta renderiza, pero sí lo único garantizado cuando la API no responde.
 */
export const MIN_LISTING_INTRO_WORDS = 130;

/** Palabras propias que aporta una introducción (lead + cuerpo de secciones). */
export function getListingIntroWordCount(intro: ListingIntroData): number {
  return [intro.lead, ...intro.sections.map((section) => section.body)]
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

// ─── Contenido ────────────────────────────────────────────────────────────────

export const LISTING_INTROS: Record<ListingIntroKey, ListingIntroData> = {
  enciclopedia: {
    title: 'Cómo usar la Enciclopedia Mística',
    lead: 'La enciclopedia reúne el material de referencia de Auguria en un solo lugar: el significado de las 78 cartas del tarot, los artículos de astrología y las guías prácticas que explican cómo se hace cada consulta. Está pensada para leerse suelta, sin orden obligatorio, y para volver a ella cada vez que aparece un término que no termina de cerrar.',
    sections: [
      {
        heading: 'Tres secciones, tres profundidades',
        body: 'Tarot funciona como diccionario: se entra por una carta puntual y se sale con su significado derecho, su significado invertido, sus palabras clave y las cartas con las que se relaciona. Astrología es un curso corto repartido en signos, planetas y casas. Guías es el manual de uso: qué hace cada herramienta, cuándo conviene usarla y cómo interpretar el resultado.',
      },
      {
        heading: 'Para quien recién empieza',
        body: 'Conviene arrancar por la guía de tarot, seguir con los arcanos mayores y recién después mirar los menores, que son cuatro palos con lógica propia. En astrología el orden natural es signo, planeta y casa: el planeta dice qué función está en juego, el signo de qué manera se expresa y la casa en qué área de la vida se nota.',
      },
    ],
    links: [
      { label: 'Cartas del tarot', href: ROUTES.ENCICLOPEDIA_TAROT },
      { label: 'Astrología', href: ROUTES.ENCICLOPEDIA_ASTROLOGIA },
      { label: 'Guías prácticas', href: ROUTES.ENCICLOPEDIA_GUIAS },
    ],
  },

  enciclopediaTarot: {
    title: 'Las 78 cartas, carta por carta',
    lead: 'El mazo de tarot se divide en 22 arcanos mayores y 56 menores. Los mayores narran las grandes etapas de un proceso —el impulso inicial, la crisis, el cierre—; los menores bajan esa historia a lo cotidiano y la reparten en cuatro palos. En este listado están las 78 con su ficha propia.',
    sections: [
      {
        heading: 'Mayores y menores',
        body: 'Un arcano mayor en la tirada marca el tema de fondo, y varios seguidos suelen indicar que la situación excede lo que la persona controla. Los menores, en cambio, hablan de hechos concretos y plazos cortos: son los que aterrizan la lectura en decisiones de esta semana.',
      },
      {
        heading: 'Los cuatro palos',
        body: 'Bastos es la acción, el impulso y el trabajo que empuja. Copas es el mundo afectivo y los vínculos. Espadas es el pensamiento, el conflicto y la palabra. Oros es el cuerpo, el dinero y todo lo que se puede contar. Cada palo va del as al diez y sigue con cuatro figuras.',
      },
    ],
    links: [
      { label: 'Guías prácticas', href: ROUTES.ENCICLOPEDIA_GUIAS },
      { label: 'Volver a la enciclopedia', href: ROUTES.ENCICLOPEDIA },
    ],
  },

  enciclopediaGuias: {
    title: 'Guías prácticas, de la teoría al primer intento',
    lead: 'Cada guía explica una herramienta completa de punta a punta: qué pregunta responde, qué necesita quien la consulta y cómo se lee el resultado sin quedarse en la superficie. Son textos de lectura corrida, pensados tanto para quien nunca hizo una consulta como para quien quiere ordenar lo que ya venía practicando.',
    sections: [
      {
        heading: 'Qué cubren',
        body: 'Hay una guía por cada práctica disponible en Auguria: tarot, numerología, péndulo, carta astral, rituales, horóscopo y horóscopo chino. Ninguna pide conocimientos previos y todas terminan en un ejemplo concreto, para que la teoría no quede colgada de definiciones.',
      },
      {
        heading: 'Cómo aprovecharlas',
        body: 'Conviene leer la guía antes de la primera consulta y volver a ella después, con el resultado a la vista: la segunda lectura es la que ordena el vocabulario. Cada guía enlaza a las fichas de la enciclopedia donde se amplía cada término que aparece en el camino.',
      },
    ],
    links: [
      { label: 'Cartas del tarot', href: ROUTES.ENCICLOPEDIA_TAROT },
      { label: 'Astrología', href: ROUTES.ENCICLOPEDIA_ASTROLOGIA },
    ],
  },

  enciclopediaAstrologia: {
    title: 'Los tres ejes de una carta astral',
    lead: 'Toda interpretación astrológica se apoya en tres piezas que se combinan: el signo, el planeta y la casa. Separarlas es lo que evita el error más común, que es leer el horóscopo como si el signo solar explicara por sí solo todo lo que le pasa a una persona.',
    sections: [
      {
        heading: 'Qué aporta cada pieza',
        body: 'El planeta indica la función en juego: la voluntad con el Sol, el afecto con Venus, la palabra con Mercurio. El signo describe el estilo con el que esa función se expresa. La casa señala el área concreta donde se nota: la pareja, el trabajo, la familia o el estudio.',
      },
      {
        heading: 'Por qué el signo solar no alcanza',
        body: 'El signo solar es apenas uno de los diez planetas de una carta. La Luna describe la vida emocional, el ascendente la primera impresión que alguien deja y Marte la forma de pelear. Dos personas del mismo signo con lunas distintas se parecen mucho menos de lo que promete un horóscopo diario.',
      },
    ],
    links: [
      { label: 'Signos zodiacales', href: ROUTES.ENCICLOPEDIA_ASTROLOGIA_SIGNOS },
      { label: 'Planetas', href: ROUTES.ENCICLOPEDIA_ASTROLOGIA_PLANETAS },
      { label: 'Casas astrales', href: ROUTES.ENCICLOPEDIA_ASTROLOGIA_CASAS },
    ],
  },

  enciclopediaSignos: {
    title: 'Cómo se ordenan los doce signos',
    lead: 'Los doce signos no son doce etiquetas sueltas: forman un ciclo que puede recorrerse por elemento, por modalidad y por polaridad. Entender esas divisiones vuelve previsible buena parte de lo que después detalla cada ficha, y ahorra tener que memorizar doce listas de rasgos.',
    sections: [
      {
        heading: 'Los cuatro elementos',
        body: 'Fuego —Aries, Leo y Sagitario— aporta iniciativa. Tierra —Tauro, Virgo y Capricornio— aporta permanencia y resultados. Aire —Géminis, Libra y Acuario— aporta ideas y vínculos. Agua —Cáncer, Escorpio y Piscis— aporta emoción y memoria. Los signos de un mismo elemento se entienden entre sí casi sin traducción.',
      },
      {
        heading: 'Las tres modalidades',
        body: 'Los cardinales —Aries, Cáncer, Libra y Capricornio— abren cada estación y empujan lo nuevo. Los fijos —Tauro, Leo, Escorpio y Acuario— sostienen y resisten el cambio. Los mutables —Géminis, Virgo, Sagitario y Piscis— adaptan y cierran el ciclo antes de que empiece el siguiente.',
      },
    ],
    links: [
      { label: 'Planetas', href: ROUTES.ENCICLOPEDIA_ASTROLOGIA_PLANETAS },
      { label: 'Casas astrales', href: ROUTES.ENCICLOPEDIA_ASTROLOGIA_CASAS },
    ],
  },

  enciclopediaPlanetas: {
    title: 'Personales, sociales y generacionales',
    lead: 'La astrología clásica trabaja con diez planetas y los agrupa por la velocidad con la que recorren el zodiaco. Esa velocidad decide cuánto de una carta natal es propio de la persona y cuánto comparte con todos los que nacieron en los mismos años.',
    sections: [
      {
        heading: 'Los planetas personales',
        body: 'El Sol, la Luna, Mercurio, Venus y Marte cambian de signo en cuestión de días o semanas, así que describen lo particular de cada uno: la voluntad, la emoción, la manera de pensar, de querer y de actuar. Son los que más se reconocen en el día a día.',
      },
      {
        heading: 'Sociales y generacionales',
        body: 'Júpiter y Saturno tardan uno y casi tres años por signo: hablan de crecimiento y de límite, del lugar de cada uno en el mundo compartido. Urano, Neptuno y Plutón pasan años enteros en el mismo signo y describen el clima de época que le tocó a una generación.',
      },
    ],
    links: [
      { label: 'Signos zodiacales', href: ROUTES.ENCICLOPEDIA_ASTROLOGIA_SIGNOS },
      { label: 'Casas astrales', href: ROUTES.ENCICLOPEDIA_ASTROLOGIA_CASAS },
    ],
  },

  enciclopediaCasas: {
    title: 'Doce casas, doce áreas de la vida',
    lead: 'Si el planeta es el qué y el signo el cómo, la casa es el dónde. Las doce casas dividen la carta en ámbitos concretos —el cuerpo, el dinero, los estudios, la familia, la pareja, el trabajo— y dependen de la hora y del lugar de nacimiento, no solo de la fecha.',
    sections: [
      {
        heading: 'Ángulos y ejes',
        body: 'Las casas 1, 4, 7 y 10 son los ángulos y sostienen la estructura de la carta: la identidad, el origen familiar, los vínculos de a dos y la vocación pública. Las casas opuestas se leen de a pares, porque cada una compensa aquello que la otra tiende a exagerar.',
      },
      {
        heading: 'Por qué hace falta la hora',
        body: 'El ascendente se corre un grado cada cuatro minutos: dos personas nacidas el mismo día con dos horas de diferencia tienen las mismas posiciones planetarias repartidas en casas distintas. Sin hora de nacimiento se puede leer el signo de cada planeta, pero no el área donde se juega.',
      },
    ],
    links: [
      { label: 'Signos zodiacales', href: ROUTES.ENCICLOPEDIA_ASTROLOGIA_SIGNOS },
      { label: 'Planetas', href: ROUTES.ENCICLOPEDIA_ASTROLOGIA_PLANETAS },
    ],
  },

  servicios: {
    title: 'Cómo funcionan los servicios holísticos',
    lead: 'Los servicios holísticos son sesiones con una persona real, agendadas en un día y un horario concretos, distintas de las lecturas automáticas del sitio. Cada servicio tiene su ficha con la duración, el precio en pesos y el detalle de lo que incluye la sesión.',
    sections: [
      {
        heading: 'Cómo se reserva',
        body: 'Se elige el servicio, se abre su ficha y se selecciona un turno entre los disponibles del calendario. El pago se procesa antes de confirmar la reserva y queda registrado en la cuenta, junto con el detalle del turno y la vía de contacto acordada.',
      },
      {
        heading: 'Qué esperar de una sesión',
        body: 'Antes de reservar conviene leer la descripción completa: cada práctica trabaja sobre algo distinto y no todas sirven para la misma consulta. Ninguna sesión reemplaza atención médica ni psicológica, y así las presentamos: son acompañamientos, no tratamientos.',
      },
      {
        heading: 'En qué se diferencian de una lectura del sitio',
        body: 'Las lecturas de tarot, numerología y carta astral se generan al instante y se pueden repetir cuantas veces haga falta. Un servicio holístico ocupa una agenda y a otra persona: por eso tiene turno, precio y una duración pactada de antemano.',
      },
    ],
    links: [
      { label: 'Ver los guías espirituales', href: ROUTES.EXPLORAR },
      { label: 'Guías prácticas', href: ROUTES.ENCICLOPEDIA_GUIAS },
    ],
  },

  explorar: {
    title: 'Cómo elegir un guía espiritual',
    lead: 'Este listado reúne a los tarotistas y guías que atienden en Auguria. Cada tarjeta muestra sus especialidades, la valoración promedio, la cantidad de reseñas que la respaldan y una biografía breve; el perfil completo suma los años de experiencia y las lecturas realizadas, para que la elección no dependa solamente de la foto.',
    sections: [
      {
        heading: 'Buscar por especialidad',
        body: 'Los filtros acotan por tema: amor, dinero, carrera, energía y bienestar o espiritual. Un guía especializado no adivina mejor que otro, pero conoce el vocabulario y las preguntas típicas de ese terreno, y eso se nota en el ida y vuelta de la sesión.',
      },
      {
        heading: 'Qué mirar en un perfil',
        body: 'La valoración promedio dice poco sin la cantidad de reseñas que la sostiene: cinco estrellas sobre tres opiniones pesan menos que cuatro y media sobre doscientas. La biografía es el otro dato útil, porque anticipa el estilo de la lectura, más directo o más acompañante.',
      },
    ],
    links: [{ label: 'Servicios holísticos', href: ROUTES.SERVICIOS }],
  },

  contacto: {
    title: 'Antes de escribirnos',
    lead: 'El formulario llega directo al equipo de Auguria. Sirve para consultas sobre la cuenta, problemas con un pago o con una reserva, sugerencias sobre el sitio y pedidos de baja. La respuesta llega siempre por correo, a la casilla desde la que se escribió, dentro del plazo indicado más arriba.',
    sections: [
      {
        heading: 'Qué conviene incluir',
        body: 'Si el mensaje es por un pago o una reserva, ayuda mucho indicar el correo con el que está registrada la cuenta y la fecha de la operación. Con ese par de datos el caso se resuelve en un solo ida y vuelta en lugar de tres.',
      },
      {
        heading: 'Lo que no se resuelve por acá',
        body: 'Las consultas espirituales no se responden por el formulario: para eso están las lecturas del sitio y las sesiones con los guías. Tampoco pedimos ni recibimos datos de tarjeta por correo — ningún mensaje nuestro va a solicitarlos nunca.',
      },
    ],
  },
};
