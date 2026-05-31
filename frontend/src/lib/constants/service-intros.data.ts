import { ROUTES } from '@/lib/constants/routes';

/**
 * Un bullet de una sección informativa: un término destacado seguido de su descripción.
 */
export interface ServiceIntroSectionItem {
  /** Término destacado (se muestra en negrita, seguido de dos puntos). */
  term: string;
  /** Descripción explicativa del término. */
  description: string;
}

/**
 * Una sección de la tarjeta informativa (una columna con título y bullets).
 */
export interface ServiceIntroSection {
  /** Encabezado de la sección (puede incluir un emoji al inicio). */
  heading: string;
  /**
   * Color de acento de la sección. Si se omite, se alterna automáticamente
   * (índice par → púrpura, índice impar → índigo) para mantener la estética.
   */
  accent?: 'purple' | 'indigo';
  /** Lista de bullets explicativos. */
  items: ServiceIntroSectionItem[];
}

/**
 * Estructura de datos de una tarjeta informativa rica de servicio.
 */
export interface ServiceIntroData {
  /** data-testid del contenedor (opcional). */
  testId?: string;
  /** Título principal (heading h2). */
  title: string;
  /** Párrafo introductorio. */
  intro: string;
  /** Secciones con bullets (se muestran en grilla de 2 columnas). */
  sections: ServiceIntroSection[];
  /** Nota destacada opcional. */
  note?: string;
  /** URL destino del botón "Ver más en la Enciclopedia". */
  href: string;
}

/**
 * Claves de los servicios con tarjeta informativa rica.
 */
export type ServiceIntroKey =
  | 'numerology'
  | 'tarot'
  | 'daily-card'
  | 'western-horoscope'
  | 'chinese-horoscope'
  | 'pendulum'
  | 'birth-chart'
  | 'rituals';

/**
 * Contenido centralizado de las tarjetas informativas de cada servicio.
 *
 * Cada entrada replica el nivel de riqueza de la tarjeta de Numerología:
 * introducción + secciones con bullets explicativos + nota + enlace a la
 * enciclopedia. El contenido es específico y veraz por servicio.
 */
export const SERVICE_INTROS: Record<ServiceIntroKey, ServiceIntroData> = {
  numerology: {
    testId: 'numerology-intro',
    title: '¿Qué es la Numerología?',
    intro:
      'La numerología es un sistema ancestral que revela tu propósito de vida, talentos y desafíos a través de los números derivados de tu fecha de nacimiento y nombre completo.',
    sections: [
      {
        heading: '📅 Desde tu Fecha de Nacimiento',
        accent: 'purple',
        items: [
          {
            term: 'Camino de Vida',
            description:
              'El número más importante. Revela tu propósito de vida, las lecciones que debes aprender y el camino que seguirás para alcanzar tu máximo potencial.',
          },
          {
            term: 'Número de Cumpleaños',
            description:
              'Derivado del día en que naciste, revela talentos específicos y habilidades naturales que puedes desarrollar a lo largo de tu vida.',
          },
          {
            term: 'Año Personal',
            description:
              'Un ciclo de 9 años que indica las oportunidades y desafíos del año actual. Cada número (1-9) trae diferentes energías: inicios, relaciones, creatividad, trabajo, cambios, hogar, introspección, poder o culminación.',
          },
          {
            term: 'Mes Personal',
            description:
              'Combina tu Año Personal con el mes actual, refinando las energías anuales para darte orientación más específica sobre las influencias y oportunidades de cada mes.',
          },
        ],
      },
      {
        heading: '✍️ Desde tu Nombre Completo',
        accent: 'indigo',
        items: [
          {
            term: 'Número de Expresión',
            description:
              'Calculado con todas las letras de tu nombre. Representa tus talentos innatos, habilidades y el potencial que puedes desarrollar en esta vida.',
          },
          {
            term: 'Número del Alma',
            description:
              'Derivado solo de las vocales de tu nombre. Revela tus deseos más profundos, lo que realmente te motiva y lo que tu corazón anhela.',
          },
          {
            term: 'Personalidad',
            description:
              'Calculado con las consonantes. Muestra la imagen que proyectas al mundo y cómo te perciben los demás en un primer encuentro.',
          },
        ],
      },
    ],
    note: 'Los números maestros (11, 22, 33) poseen una vibración especial y no se reducen a un solo dígito.',
    href: ROUTES.ENCICLOPEDIA_GUIA('guia-numerologia'),
  },

  tarot: {
    testId: 'tarot-intro',
    title: '¿Qué es la Tirada de Tarot?',
    intro:
      'El tarot es un sistema simbólico de 78 cartas que actúa como un espejo de tu mundo interior. Cada tirada combina las cartas, sus posiciones y tu pregunta para ofrecerte una guía reflexiva sobre tu presente y tus posibilidades.',
    sections: [
      {
        heading: '🃏 Los Arcanos Mayores',
        accent: 'purple',
        items: [
          {
            term: '22 Cartas Maestras',
            description:
              'Desde El Loco hasta El Mundo, representan las grandes etapas y lecciones de la vida. Su aparición señala temas profundos y momentos de transformación importantes.',
          },
          {
            term: 'Arquetipos Universales',
            description:
              'Cada arcano encarna una energía esencial —el amor, la justicia, el cambio, la sabiduría— que resuena con situaciones clave de tu camino.',
          },
          {
            term: 'Mensajes de Fondo',
            description:
              'Cuando dominan una tirada, invitan a mirar el panorama general más allá de los detalles cotidianos.',
          },
        ],
      },
      {
        heading: '🗂️ Los Arcanos Menores',
        accent: 'indigo',
        items: [
          {
            term: 'Cuatro Palos',
            description:
              'Copas (emociones), Oros (lo material), Espadas (la mente) y Bastos (la acción) describen las áreas concretas de tu vida diaria.',
          },
          {
            term: 'Cartas Numeradas',
            description:
              'Del As al Diez, narran el desarrollo de una situación, sus altibajos y su evolución en el tiempo.',
          },
          {
            term: 'Las Figuras',
            description:
              'Sota, Caballo, Reina y Rey representan personas, actitudes o energías que intervienen en tu consulta.',
          },
        ],
      },
    ],
    note: 'La posición de cada carta y su orientación (derecha o invertida) matizan su significado: el tarot orienta, no determina; las decisiones siempre son tuyas.',
    href: ROUTES.ENCICLOPEDIA_GUIA('guia-tarot'),
  },

  'daily-card': {
    testId: 'daily-card-intro',
    title: '¿Qué es el Tarot del Día?',
    intro:
      'El Tarot del Día te ofrece una sola carta como mensaje y guía para tu jornada. Es una práctica breve y poderosa para sintonizar con la energía del momento y cultivar una intención clara.',
    sections: [
      {
        heading: '🌅 Una Carta para tu Día',
        accent: 'purple',
        items: [
          {
            term: 'Mensaje del Día',
            description:
              'La carta elegida resume la energía dominante de tu jornada y te invita a reflexionar sobre aquello a lo que conviene prestar atención.',
          },
          {
            term: 'Enfoque y Atención',
            description:
              'Señala oportunidades, cuidados o actitudes recomendadas para aprovechar mejor las horas que tienes por delante.',
          },
          {
            term: 'Ritual Sencillo',
            description:
              'Una práctica diaria que no requiere experiencia: una carta, una intención y un momento de pausa consciente.',
          },
        ],
      },
      {
        heading: '🔮 Cómo Aprovecharla',
        accent: 'indigo',
        items: [
          {
            term: 'Lee con Calma',
            description:
              'Observa la imagen, los símbolos y la sensación que te transmite antes de leer el significado.',
          },
          {
            term: 'Relaciónala con tu Día',
            description:
              'Pregúntate cómo se conecta el mensaje con lo que tienes entre manos hoy: trabajo, vínculos o decisiones.',
          },
          {
            term: 'Vuelve al Anochecer',
            description:
              'Al final del día, revisa qué de la carta se hizo presente: así afinas tu intuición con el tiempo.',
          },
        ],
      },
    ],
    note: 'La carta del día es una guía de reflexión, no una predicción cerrada: úsala para inspirarte y tomar mejores decisiones.',
    href: ROUTES.ENCICLOPEDIA_GUIA('guia-tarot'),
  },

  'western-horoscope': {
    testId: 'western-horoscope-intro',
    title: '¿Qué es el Horóscopo Occidental?',
    intro:
      'El horóscopo occidental interpreta la posición del Sol en el zodíaco para describir tendencias, energías y oportunidades. Tu signo solar es la base de tu carácter astrológico y de las predicciones diarias.',
    sections: [
      {
        heading: '♈ Los 12 Signos',
        accent: 'purple',
        items: [
          {
            term: 'Signo Solar',
            description:
              'Determinado por la fecha de nacimiento, refleja tu esencia, tu voluntad y la forma en que brillas en el mundo.',
          },
          {
            term: 'Rueda Zodiacal',
            description:
              'De Aries a Piscis, cada signo cubre un tramo del año y aporta cualidades propias: iniciativa, estabilidad, comunicación, sensibilidad y más.',
          },
          {
            term: 'Regente Planetario',
            description:
              'Cada signo está regido por un planeta que tiñe su manera de sentir, pensar y actuar.',
          },
        ],
      },
      {
        heading: '🌗 Elementos y Modalidades',
        accent: 'indigo',
        items: [
          {
            term: 'Los Cuatro Elementos',
            description:
              'Fuego (acción), Tierra (materia), Aire (mente) y Agua (emoción) agrupan a los signos según su temperamento básico.',
          },
          {
            term: 'Las Tres Modalidades',
            description:
              'Cardinal (inicia), Fija (sostiene) y Mutable (adapta) describen cómo cada signo despliega su energía.',
          },
          {
            term: 'Predicción Diaria',
            description:
              'A partir de los tránsitos del día, el horóscopo sugiere oportunidades, cuidados y enfoques para tu signo.',
          },
        ],
      },
    ],
    note: 'El horóscopo describe tendencias y energías generales: es una guía de inspiración, no un destino inevitable.',
    href: ROUTES.ENCICLOPEDIA_GUIA('guia-horoscopo-occidental'),
  },

  'chinese-horoscope': {
    testId: 'chinese-horoscope-intro',
    title: '¿Qué es el Horóscopo Chino?',
    intro:
      'El horóscopo chino es una tradición milenaria que asocia cada año a un animal y a un elemento. Tu animal del zodíaco describe tu temperamento, tus fortalezas y la energía que te acompaña a lo largo de la vida.',
    sections: [
      {
        heading: '🐉 Los 12 Animales',
        accent: 'purple',
        items: [
          {
            term: 'Tu Animal',
            description:
              'Rata, Buey, Tigre, Conejo, Dragón, Serpiente, Caballo, Cabra, Mono, Gallo, Perro o Cerdo: definido por tu año de nacimiento, marca tu carácter esencial.',
          },
          {
            term: 'Ciclo de 12 Años',
            description:
              'Los animales se suceden año tras año, y cada uno trae un clima energético distinto para todos.',
          },
          {
            term: 'Compatibilidades',
            description:
              'Algunos animales se armonizan y otros se desafían, lo que ilumina tus vínculos personales y profesionales.',
          },
        ],
      },
      {
        heading: '🌳 Los Cinco Elementos',
        accent: 'indigo',
        items: [
          {
            term: 'Madera, Fuego, Tierra, Metal y Agua',
            description:
              'Cada elemento modula la personalidad del animal, aportando matices de crecimiento, pasión, estabilidad, rigor o sensibilidad.',
          },
          {
            term: 'Yin y Yang',
            description:
              'La polaridad de cada año equilibra las energías activas y receptivas que influyen en el clima del período.',
          },
          {
            term: 'Ciclo de 60 Años',
            description:
              'La combinación de animales y elementos forma un gran ciclo que no se repite hasta pasadas seis décadas.',
          },
        ],
      },
    ],
    note: 'El horóscopo chino ofrece una lectura de tu energía anual y de tu carácter: úsalo como brújula, no como sentencia.',
    href: ROUTES.ENCICLOPEDIA_GUIA('guia-horoscopo-chino'),
  },

  pendulum: {
    testId: 'pendulum-intro',
    title: '¿Qué es el Péndulo?',
    intro:
      'El péndulo es una herramienta de radiestesia que te ayuda a conectar con tu intuición. A través de sus movimientos, ofrece respuestas claras a preguntas concretas y favorece la reflexión y el autoconocimiento.',
    sections: [
      {
        heading: '🔮 Radiestesia e Intuición',
        accent: 'purple',
        items: [
          {
            term: 'Respuestas Claras',
            description:
              'El péndulo responde con movimientos definidos —sí, no o quizás— a las preguntas cerradas que le planteas.',
          },
          {
            term: 'Puente con el Inconsciente',
            description:
              'Sus oscilaciones reflejan impulsos sutiles que ayudan a sacar a la luz lo que ya intuyes en tu interior.',
          },
          {
            term: 'Foco en la Pregunta',
            description:
              'Cuanto más precisa y honesta es tu pregunta, más útil y nítida será la guía que recibes.',
          },
        ],
      },
      {
        heading: '✨ Cómo Consultarlo',
        accent: 'indigo',
        items: [
          {
            term: 'Formula tu Pregunta',
            description:
              'Plantea consultas concretas que puedan responderse de forma cerrada, evitando dobles sentidos.',
          },
          {
            term: 'Serénate y Respira',
            description:
              'Un estado de calma y neutralidad permite que la respuesta fluya sin interferencias.',
          },
          {
            term: 'Interpreta con Apertura',
            description:
              'Toma la respuesta como una guía para reflexionar, no como una orden a obedecer.',
          },
        ],
      },
    ],
    note: 'El péndulo es una ayuda para escuchar tu intuición: las decisiones finales siempre dependen de ti.',
    href: ROUTES.ENCICLOPEDIA_GUIA('guia-pendulo'),
  },

  'birth-chart': {
    testId: 'birth-chart-intro',
    title: '¿Qué es la Carta Astral?',
    intro:
      'La carta astral es un mapa del cielo en el instante exacto de tu nacimiento. Combina planetas, signos y casas para ofrecer un retrato profundo de tu personalidad, tus talentos y tus desafíos vitales.',
    sections: [
      {
        heading: '🪐 Planetas y Signos',
        accent: 'purple',
        items: [
          {
            term: 'Sol, Luna y Ascendente',
            description:
              'El trío fundamental: tu esencia (Sol), tu mundo emocional (Luna) y la forma en que te muestras al mundo (Ascendente).',
          },
          {
            term: 'Los Planetas',
            description:
              'Mercurio, Venus, Marte y los demás describen tu manera de pensar, amar, actuar y crecer.',
          },
          {
            term: 'Los Signos',
            description:
              'Cada planeta se ubica en un signo que matiza su expresión con un color y un temperamento propios.',
          },
        ],
      },
      {
        heading: '🏠 Casas y Aspectos',
        accent: 'indigo',
        items: [
          {
            term: 'Las 12 Casas',
            description:
              'Representan las áreas de la vida —identidad, recursos, vínculos, vocación— donde se manifiesta la energía de cada planeta.',
          },
          {
            term: 'Los Aspectos',
            description:
              'Los ángulos entre planetas revelan tensiones y armonías que dan forma a tu dinámica interior.',
          },
          {
            term: 'Una Imagen Integral',
            description:
              'La carta no juzga: describe tu potencial y te ayuda a comprender tu camino con mayor claridad.',
          },
        ],
      },
    ],
    note: 'La carta astral muestra tendencias y potenciales: es una herramienta de autoconocimiento, no un destino escrito.',
    href: ROUTES.ENCICLOPEDIA_GUIA('guia-carta-astral'),
  },

  rituals: {
    testId: 'rituals-intro',
    title: '¿Qué son los Rituales?',
    intro:
      'Los rituales son prácticas simbólicas que canalizan tu intención hacia un propósito: protección, prosperidad, amor o claridad. Combinan elementos, palabras y momentos para acompañar tu transformación personal.',
    sections: [
      {
        heading: '🕯️ Elementos del Ritual',
        accent: 'purple',
        items: [
          {
            term: 'Intención',
            description:
              'El corazón de todo ritual: definir con claridad qué deseas atraer, soltar o transformar.',
          },
          {
            term: 'Velas, Hierbas y Símbolos',
            description:
              'Los elementos materiales —colores, aromas y objetos— concentran y refuerzan el propósito de la práctica.',
          },
          {
            term: 'Palabras y Gestos',
            description:
              'Afirmaciones, visualizaciones y movimientos conscientes dan forma a la energía que pones en marcha.',
          },
        ],
      },
      {
        heading: '🌙 Fases y Momentos',
        accent: 'indigo',
        items: [
          {
            term: 'Las Fases Lunares',
            description:
              'Luna nueva para comenzar, creciente para hacer crecer, llena para culminar y menguante para soltar.',
          },
          {
            term: 'El Momento Adecuado',
            description:
              'Elegir el día y la hora afines a tu intención potencia la coherencia y la fuerza del ritual.',
          },
          {
            term: 'Constancia y Respeto',
            description:
              'Repetir la práctica con cuidado y presencia consolida el cambio que buscas cultivar.',
          },
        ],
      },
    ],
    note: 'Los rituales ordenan y enfocan tu intención: son un apoyo simbólico para tu proceso, siempre desde el respeto y la responsabilidad.',
    href: ROUTES.ENCICLOPEDIA_GUIA('guia-rituales'),
  },
};
