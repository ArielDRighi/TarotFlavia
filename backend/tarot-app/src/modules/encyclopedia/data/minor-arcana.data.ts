import { ArcanaType, CourtRank, Element, Suit } from '../enums/tarot.enums';
import { CardSeedData } from './cards-seed.data';

/**
 * Datos de los 56 Arcanos Menores del Tarot
 * Divididos en cuatro palos: Bastos (Fuego), Copas (Agua), Espadas (Aire), Oros/Pentáculos (Tierra)
 * Cada palo tiene 14 cartas: As al 10 + Paje + Caballero + Reina + Rey
 */

// ============================================================================
// BASTOS (WANDS) — Elemento Fuego — 14 cartas
// ============================================================================

const WANDS_CARDS: CardSeedData[] = [
  {
    slug: 'ace-of-wands',
    nameEn: 'Ace of Wands',
    nameEs: 'As de Bastos',
    arcanaType: ArcanaType.MINOR,
    number: 1,
    suit: Suit.WANDS,
    element: Element.FIRE,
    meaningUpright:
      'Nuevo comienzo lleno de potencial creativo, inspiración, entusiasmo y chispa de acción. Es el inicio de un proyecto o aventura con energía vital desbordante.',
    meaningReversed:
      'Retrasos, falta de energía o motivación, proyectos bloqueados y creatividad reprimida que no encuentra salida.',
    description:
      'Una mano surge de las nubes sosteniendo una vara floreciente de la que brotan hojas y ramas. El paisaje al fondo es fértil y lleno de vida. Representa la chispa inicial de la inspiración, el fuego del entusiasmo y el potencial ilimitado de lo que aún no ha comenzado pero está listo para nacer.',
    keywords: {
      upright: [
        'inspiración',
        'potencial',
        'entusiasmo',
        'acción',
        'inicio',
        'creatividad',
      ],
      reversed: [
        'bloqueo creativo',
        'retraso',
        'falta de energía',
        'proyectos estancados',
        'impotencia',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Wands01.jpg',
  },
  {
    slug: 'two-of-wands',
    nameEn: 'Two of Wands',
    nameEs: 'Dos de Bastos',
    arcanaType: ArcanaType.MINOR,
    number: 2,
    suit: Suit.WANDS,
    element: Element.FIRE,
    meaningUpright:
      'Planificación futura, toma de decisiones, expansión y visión de largo plazo. Es el momento de definir el camino antes de emprender el viaje.',
    meaningReversed:
      'Miedo al desconocido, planes que no se concretan, falta de visión y dificultad para salir de la zona de confort.',
    description:
      'Un hombre vestido con ropa de viaje sostiene un globo terráqueo y una vara mientras mira desde lo alto de un castillo hacia el horizonte. Representa la planificación estratégica, la visión de futuro y la decisión de expandir los horizontes más allá de lo conocido.',
    keywords: {
      upright: [
        'planificación',
        'visión',
        'expansión',
        'decisión',
        'futuro',
        'ambición',
      ],
      reversed: [
        'miedo',
        'indecisión',
        'planes fallidos',
        'zona de confort',
        'falta de visión',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Wands02.jpg',
  },
  {
    slug: 'three-of-wands',
    nameEn: 'Three of Wands',
    nameEs: 'Tres de Bastos',
    arcanaType: ArcanaType.MINOR,
    number: 3,
    suit: Suit.WANDS,
    element: Element.FIRE,
    meaningUpright:
      'Expansión, anticipación de resultados, oportunidades que llegan desde lejos y primeras señales de éxito en los proyectos iniciados.',
    meaningReversed:
      'Retrasos en los planes de expansión, obstáculos inesperados y oportunidades que se escapan antes de poder aprovecharlas.',
    description:
      'Una figura de espaldas observa desde un promontorio el mar donde navegan sus barcos. Tres varas están plantadas a su alrededor. Representa la anticipación de los frutos del trabajo, la expansión hacia nuevos territorios y la confianza en el proceso que ya está en marcha.',
    keywords: {
      upright: [
        'expansión',
        'anticipación',
        'éxito',
        'oportunidades',
        'horizonte',
        'progreso',
      ],
      reversed: [
        'retraso',
        'obstáculos',
        'oportunidades perdidas',
        'frustración',
        'retroceso',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Wands03.jpg',
  },
  {
    slug: 'four-of-wands',
    nameEn: 'Four of Wands',
    nameEs: 'Cuatro de Bastos',
    arcanaType: ArcanaType.MINOR,
    number: 4,
    suit: Suit.WANDS,
    element: Element.FIRE,
    meaningUpright:
      'Celebración, hogar, armonía, estabilidad y hitos alcanzados. Es el momento de festejar los logros y disfrutar de la estabilidad ganada con esfuerzo.',
    meaningReversed:
      'Falta de armonía en el hogar, celebraciones postergadas y transición sin la estabilidad esperada.',
    description:
      'Dos figuras con flores en las manos celebran bajo un pórtico adornado con guirnaldas formado por cuatro varas. Al fondo se ve un castillo. Representa la alegría de los logros, la celebración comunitaria, el sentido de pertenencia y la estabilidad del hogar.',
    keywords: {
      upright: [
        'celebración',
        'hogar',
        'armonía',
        'estabilidad',
        'logro',
        'comunidad',
      ],
      reversed: [
        'disarmonía',
        'transición difícil',
        'falta de hogar',
        'conflicto familiar',
        'celebración postergada',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Wands04.jpg',
  },
  {
    slug: 'five-of-wands',
    nameEn: 'Five of Wands',
    nameEs: 'Cinco de Bastos',
    arcanaType: ArcanaType.MINOR,
    number: 5,
    suit: Suit.WANDS,
    element: Element.FIRE,
    meaningUpright:
      'Conflicto, competencia, desacuerdo y caos creativo. Las fuerzas chocan pero el resultado puede ser el fortalecimiento a través del desafío.',
    meaningReversed:
      'Conflictos evitados, fin de las disputas, acuerdo alcanzado y energía competitiva redirigida de forma constructiva.',
    description:
      'Cinco jóvenes se enfrentan entre sí blandiendo sus varas en aparente batalla o competición. La escena es caótica pero no hay heridos. Representa la energía del conflicto, la competencia sana, el debate de ideas y el caos creativo que puede conducir al crecimiento.',
    keywords: {
      upright: [
        'conflicto',
        'competencia',
        'desacuerdo',
        'caos',
        'lucha',
        'tensión',
      ],
      reversed: [
        'resolución',
        'acuerdo',
        'paz',
        'evitar conflicto',
        'armonía restaurada',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Wands05.jpg',
  },
  {
    slug: 'six-of-wands',
    nameEn: 'Six of Wands',
    nameEs: 'Seis de Bastos',
    arcanaType: ArcanaType.MINOR,
    number: 6,
    suit: Suit.WANDS,
    element: Element.FIRE,
    meaningUpright:
      'Victoria pública, reconocimiento, éxito y confianza en uno mismo tras superar desafíos. Es el momento del triunfo merecido y del reconocimiento de los logros.',
    meaningReversed:
      'Falta de reconocimiento, orgullo excesivo y caída después de la victoria por soberbia o falta de humildad.',
    description:
      'Un jinete victorioso avanza en su caballo mientras la multitud lo aclama con ramos de laurel. Lleva una corona de laurel y sostiene una vara adornada con otra corona. Representa el triunfo después de la batalla, el reconocimiento público y la confianza en uno mismo tras alcanzar el éxito.',
    keywords: {
      upright: [
        'victoria',
        'reconocimiento',
        'éxito',
        'confianza',
        'triunfo',
        'logro público',
      ],
      reversed: [
        'falta de reconocimiento',
        'orgullo',
        'soberbia',
        'caída',
        'fracaso temporal',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Wands06.jpg',
  },
  {
    slug: 'seven-of-wands',
    nameEn: 'Seven of Wands',
    nameEs: 'Siete de Bastos',
    arcanaType: ArcanaType.MINOR,
    number: 7,
    suit: Suit.WANDS,
    element: Element.FIRE,
    meaningUpright:
      'Defensa de la posición, perseverancia ante la adversidad, valentía y determinación para mantener lo ganado frente a los desafíos.',
    meaningReversed:
      'Rendición ante la presión, agotamiento de la lucha y ceder posiciones que no deberían abandonarse.',
    description:
      'Un hombre en un promontorio defiende su posición contra seis varas que se alzan desde abajo. Aunque está en desventaja numérica, su posición elevada le da ventaja. Representa la determinación de defender las propias convicciones y logros ante la oposición y los desafíos.',
    keywords: {
      upright: [
        'defensa',
        'perseverancia',
        'valentía',
        'determinación',
        'resistencia',
        'posición',
      ],
      reversed: [
        'rendición',
        'agotamiento',
        'ceder',
        'presión excesiva',
        'derrota por fatiga',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Wands07.jpg',
  },
  {
    slug: 'eight-of-wands',
    nameEn: 'Eight of Wands',
    nameEs: 'Ocho de Bastos',
    arcanaType: ArcanaType.MINOR,
    number: 8,
    suit: Suit.WANDS,
    element: Element.FIRE,
    meaningUpright:
      'Movimiento rápido, acción acelerada, viajes, comunicaciones y eventos que se precipitan. Todo avanza a gran velocidad hacia su destino.',
    meaningReversed:
      'Retrasos, obstáculos en el camino, comunicaciones bloqueadas y energía frenada justo cuando debería fluir.',
    description:
      'Ocho varas vuelan a través del cielo despejado en dirección diagonal, apuntando hacia la tierra. No hay figuras humanas en la carta. Representa el movimiento acelerado, los mensajes que viajan rápido, los viajes y la energía que fluye libremente hacia su objetivo sin obstáculos.',
    keywords: {
      upright: [
        'velocidad',
        'movimiento',
        'viaje',
        'comunicación',
        'acción',
        'urgencia',
      ],
      reversed: [
        'retraso',
        'obstáculos',
        'comunicación bloqueada',
        'frustración',
        'espera',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Wands08.jpg',
  },
  {
    slug: 'nine-of-wands',
    nameEn: 'Nine of Wands',
    nameEs: 'Nueve de Bastos',
    arcanaType: ArcanaType.MINOR,
    number: 9,
    suit: Suit.WANDS,
    element: Element.FIRE,
    meaningUpright:
      'Resiliencia, coraje de continuar, límites saludables y la fuerza de seguir adelante aunque se esté cansado. La batalla no ha terminado pero la victoria está cerca.',
    meaningReversed:
      'Agotamiento total, paranoia, incapacidad de confiar y rendirse cuando falta poco para llegar a la meta.',
    description:
      'Una figura vendada y cansada se apoya en una vara mientras mira por encima del hombro a las ocho varas que la rodean. A pesar del cansancio, sigue de pie y alerta. Representa la resiliencia del guerrero que sigue en pie a pesar de las heridas, manteniendo su posición con determinación.',
    keywords: {
      upright: [
        'resiliencia',
        'persistencia',
        'límites',
        'coraje',
        'últimas fuerzas',
        'alerta',
      ],
      reversed: [
        'agotamiento',
        'paranoia',
        'rendición prematura',
        'desconfianza',
        'colapso',
      ],
    },
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/4/4d/Tarot_Nine_of_Wands.jpg',
  },
  {
    slug: 'ten-of-wands',
    nameEn: 'Ten of Wands',
    nameEs: 'Diez de Bastos',
    arcanaType: ArcanaType.MINOR,
    number: 10,
    suit: Suit.WANDS,
    element: Element.FIRE,
    meaningUpright:
      'Carga excesiva, responsabilidad abrumadora, el peso del éxito y la necesidad de delegar o soltar algunas responsabilidades.',
    meaningReversed:
      'Soltar cargas, delegación efectiva, liberación de responsabilidades innecesarias y encontrar alivio al compartir el peso.',
    description:
      'Una figura encorvada camina con dificultad cargando diez varas pesadas hacia una ciudad en el horizonte. No puede ver hacia adelante a causa del peso que lleva. Representa la carga del éxito, las responsabilidades acumuladas y la necesidad de revisar qué cargas son realmente necesarias de llevar.',
    keywords: {
      upright: [
        'sobrecarga',
        'responsabilidad',
        'carga',
        'agotamiento',
        'deber',
        'peso',
      ],
      reversed: [
        'liberación',
        'delegar',
        'soltar',
        'alivio',
        'equilibrio',
        'prioridades',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Wands10.jpg',
  },
  {
    slug: 'page-of-wands',
    nameEn: 'Page of Wands',
    nameEs: 'Paje de Bastos',
    arcanaType: ArcanaType.MINOR,
    number: 11,
    suit: Suit.WANDS,
    courtRank: CourtRank.PAGE,
    element: Element.FIRE,
    meaningUpright:
      'Entusiasmo juvenil, exploración, nuevas ideas y mensajes emocionantes. Es la energía del aventurero que se lanza al mundo con curiosidad y pasión.',
    meaningReversed:
      'Ideas sin concretar, falta de dirección, energía dispersa y promesas que no se cumplen por falta de seguimiento.',
    description:
      'Un joven vestido con ropas decoradas con salamandras sostiene una vara y la observa con curiosidad mientras está de pie en un paisaje desértico. Representa la energía juvenil del fuego, la curiosidad por el mundo, el entusiasmo ante lo nuevo y la disposición para aprender y explorar.',
    keywords: {
      upright: [
        'entusiasmo',
        'exploración',
        'curiosidad',
        'aventura',
        'mensajes',
        'nuevas ideas',
      ],
      reversed: [
        'indisciplina',
        'ideas sin concretar',
        'energía dispersa',
        'promesas rotas',
        'falta de dirección',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Wands11.jpg',
  },
  {
    slug: 'knight-of-wands',
    nameEn: 'Knight of Wands',
    nameEs: 'Caballero de Bastos',
    arcanaType: ArcanaType.MINOR,
    number: 12,
    suit: Suit.WANDS,
    courtRank: CourtRank.KNIGHT,
    element: Element.FIRE,
    meaningUpright:
      'Acción audaz, aventura, energía impulsiva y pasión que se lanza sin miedo. El Caballero de Bastos actúa rápido y con gran entusiasmo.',
    meaningReversed:
      'Impulsividad excesiva, arrogancia, temeridad y proyectos que fracasan por falta de planificación.',
    description:
      'Un caballero en armadura de fuego galopa sobre un caballo encabritado en un paisaje árido. Su yelmo y capa están adornados con llamas. Representa la energía impetuosa del fuego en movimiento, el valor sin límites, la acción audaz y la pasión que se lanza al mundo con fuerza arrolladora.',
    keywords: {
      upright: [
        'acción',
        'audacia',
        'aventura',
        'pasión',
        'impulso',
        'energía',
      ],
      reversed: [
        'impulsividad',
        'arrogancia',
        'temeridad',
        'proyectos fallidos',
        'dispersión',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Wands12.jpg',
  },
  {
    slug: 'queen-of-wands',
    nameEn: 'Queen of Wands',
    nameEs: 'Reina de Bastos',
    arcanaType: ArcanaType.MINOR,
    number: 13,
    suit: Suit.WANDS,
    courtRank: CourtRank.QUEEN,
    element: Element.FIRE,
    meaningUpright:
      'Carisma, determinación, vitalidad, independencia y liderazgo apasionado. La Reina de Bastos irradia confianza y atrae a los demás con su energía magnética.',
    meaningReversed:
      'Temperamento explosivo, celos, manipulación y agotamiento de la energía vital por exceso de compromiso.',
    description:
      'Una reina de porte majestuoso está sentada en un trono adornado con leones y girasoles, sosteniendo una vara y un girasol. A sus pies descansa un gato negro. Representa el poder femenino del fuego, el liderazgo carismático, la creatividad apasionada y la capacidad de inspirar a otros con vitalidad.',
    keywords: {
      upright: [
        'carisma',
        'determinación',
        'liderazgo',
        'vitalidad',
        'independencia',
        'magnetismo',
      ],
      reversed: [
        'celos',
        'temperamento',
        'manipulación',
        'agotamiento',
        'autoritarismo',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Wands13.jpg',
  },
  {
    slug: 'king-of-wands',
    nameEn: 'King of Wands',
    nameEs: 'Rey de Bastos',
    arcanaType: ArcanaType.MINOR,
    number: 14,
    suit: Suit.WANDS,
    courtRank: CourtRank.KING,
    element: Element.FIRE,
    meaningUpright:
      'Liderazgo visionario, emprendimiento, carisma y la capacidad de inspirar a otros hacia grandes objetivos. Es el maestro de la energía creativa y el fuego del espíritu.',
    meaningReversed:
      'Impulsividad dominante, autoritarismo, intolerancia y visión que no se concreta por falta de paciencia.',
    description:
      'Un rey de aspecto poderoso está sentado en un trono adornado con leones y salamandras, sosteniendo una vara floreciente. Una salamandra pequeña aparece a sus pies. Representa el dominio maduro del elemento fuego, el liderazgo visionario y la capacidad de transformar las ideas en realidades a través de la voluntad y el carisma.',
    keywords: {
      upright: [
        'liderazgo',
        'visión',
        'emprendimiento',
        'carisma',
        'inspiración',
        'maestría',
      ],
      reversed: [
        'autoritarismo',
        'impulsividad',
        'intolerancia',
        'visión sin acción',
        'dominio excesivo',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Wands14.jpg',
  },
];

// ============================================================================
// COPAS (CUPS) — Elemento Agua — 14 cartas
// ============================================================================

const CUPS_CARDS: CardSeedData[] = [
  {
    slug: 'ace-of-cups',
    nameEn: 'Ace of Cups',
    nameEs: 'As de Copas',
    arcanaType: ArcanaType.MINOR,
    number: 1,
    suit: Suit.CUPS,
    element: Element.WATER,
    meaningUpright:
      'El As de Copas representa el recipiente puro de la gracia divina y el despertar emocional. Es el inicio de un flujo profundo de amor, compasión y receptividad espiritual. Indica un momento donde el corazón se abre a nuevas relaciones, inspiración creativa o un profundo despertar intuitivo. Es la semilla de la conexión anímica incondicional.',
    meaningReversed:
      'En su aspecto sombrío, señala un bloqueo severo en la capacidad de dar o recibir amor. Representa la represión de las emociones, un corazón cerrado por el dolor pasado, o el agotamiento espiritual. La energía del agua divina se estanca, generando una sensación de vacío interior, egoísmo emocional o una intuición ignorada sistemáticamente.',
    description:
      'Una mano luminosa emerge de una nube gris, ofreciendo un cáliz dorado rebosante. De la copa brotan cinco corrientes de agua (los cinco sentidos) que caen sobre un lago cubierto de flores de loto en flor, símbolo del despertar espiritual. Una paloma blanca que sostiene una hostia consagrada desciende hacia la copa, representando la encarnación del espíritu y el amor divino.',
    keywords: {
      upright: [
        'amor incondicional',
        'despertar emocional',
        'intuición pura',
        'fertilidad',
        'receptividad',
        'inspiración',
      ],
      reversed: [
        'bloqueo emocional',
        'represión',
        'vacío interior',
        'desconexión',
        'egoísmo',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Cups01.jpg',
  },
  {
    slug: 'two-of-cups',
    nameEn: 'Two of Cups',
    nameEs: 'Dos de Copas',
    arcanaType: ArcanaType.MINOR,
    number: 2,
    suit: Suit.CUPS,
    element: Element.WATER,
    meaningUpright:
      'Esta carta encarna la alquimia de dos almas que se encuentran en perfecto equilibrio y respeto mutuo. Trasciende el romance superficial para hablar de asociaciones sagradas, contratos anímicos y la profunda armonía que surge cuando dos individuos sanos deciden unir sus fuerzas y compartir sus copas sin perder su propia individualidad.',
    meaningReversed:
      'La distorsión del Dos de Copas revela asimetría en los vínculos. Apunta a la codependencia, la falta de comunicación o la pérdida de respeto dentro de una relación. Señala la desconexión emocional, la proyección de heridas no sanadas en la pareja, o alianzas donde uno entrega su energía mientras el otro simplemente la consume sin reciprocidad.',
    description:
      'Un hombre y una mujer se miran a los ojos mientras intercambian cálidamente sus copas. Sobre ellos se alza el Caduceo de Hermes coronado por la cabeza de un león rojo con alas, simbolizando la pasión terrenal purificada y elevada al plano espiritual mediante la comunicación honesta. Al fondo, una casa representa el hogar y la estabilidad que brinda esta unión.',
    keywords: {
      upright: [
        'asociación mutua',
        'unión sagrada',
        'atracción profunda',
        'equilibrio',
        'compromiso',
        'empatía',
      ],
      reversed: [
        'codependencia',
        'desequilibrio',
        'desconexión',
        'ruptura',
        'falta de armonía',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Cups02.jpg',
  },
  {
    slug: 'three-of-cups',
    nameEn: 'Three of Cups',
    nameEs: 'Tres de Copas',
    arcanaType: ArcanaType.MINOR,
    number: 3,
    suit: Suit.CUPS,
    element: Element.WATER,
    meaningUpright:
      'El Tres de Copas es la expresión vibrante de la sororidad, la comunidad y el apoyo mutuo. Esotéricamente, marca la manifestación emocional: la energía compartida crea un campo de vibración superior. Habla de celebraciones, amistades verdaderas y el florecimiento que ocurre cuando nos rodeamos de tu "tribu" anímica en un entorno de pura alegría compartida.',
    meaningReversed:
      'En su sombra, la carta advierte sobre el exceso, la superficialidad y la desconexión del grupo. Puede indicar que te estás perdiendo en la vida social para evadir tu vacío interno (escapismo), o revela dinámicas tóxicas en un círculo de amistades: chismes, exclusión, o la pérdida de la individualidad por la presión y el conformismo del rebaño.',
    description:
      'Tres doncellas con túnicas fluidas (blanca, roja y dorada) danzan en círculo, elevando sus copas en un brindis festivo. A sus pies, la tierra rebosa de frutas y cosechas, representando la abundancia que surge del esfuerzo colectivo. Sus brazos se entrelazan suavemente, simbolizando la conexión sincera, el respeto mutuo y la red de apoyo incondicional.',
    keywords: {
      upright: [
        'celebración',
        'comunidad',
        'sororidad',
        'alegría compartida',
        'abundancia',
        'apoyo mutuo',
      ],
      reversed: [
        'exceso',
        'aislamiento',
        'chismes',
        'superficialidad',
        'conformismo',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Cups03.jpg',
  },
  {
    slug: 'four-of-cups',
    nameEn: 'Four of Cups',
    nameEs: 'Cuatro de Copas',
    arcanaType: ArcanaType.MINOR,
    number: 4,
    suit: Suit.CUPS,
    element: Element.WATER,
    meaningUpright:
      'Representa el letargo místico y el ensimismamiento. A nivel espiritual, es la apatía que surge tras la desilusión terrenal; el individuo se desconecta de su entorno buscando respuestas internas, pero en el proceso se vuelve ciego a las nuevas oportunidades (gracia divina) que el universo le ofrece. Es un periodo de reevaluación emocional pasiva.',
    meaningReversed:
      'El despertar repentino de un estado de apatía profunda. La sombra se rompe y la persona finalmente toma consciencia de los dones y oportunidades que había ignorado. Señala el fin de una depresión o estancamiento, el momento en que se abandona la actitud defensiva para volver a interactuar de forma proactiva con las corrientes de la vida.',
    description:
      'Un hombre joven está sentado bajo un árbol en la cima de una montaña, con los brazos y las piernas fuertemente cruzados en actitud defensiva o meditabunda. Frente a él hay tres copas alineadas en el suelo que él ignora. Desde una nube mística, una mano fantasmal le ofrece una cuarta copa, pero su mirada baja y desconectada no le permite verla.',
    keywords: {
      upright: [
        'apatía',
        'ensimismamiento',
        'letargo emocional',
        'insatisfacción',
        'meditación',
        'desilusión',
      ],
      reversed: [
        'despertar',
        'renovación',
        'aceptación',
        'proactividad',
        'reconexión',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Cups04.jpg',
  },
  {
    slug: 'five-of-cups',
    nameEn: 'Five of Cups',
    nameEs: 'Cinco de Copas',
    arcanaType: ArcanaType.MINOR,
    number: 5,
    suit: Suit.CUPS,
    element: Element.WATER,
    meaningUpright:
      'El Cinco de Copas es el arquetipo del luto, el arrepentimiento y el enfoque en lo que se ha perdido. Es un estado emocional de dolor profundo donde la mente se queda anclada en el trauma o el error pasado. Sin embargo, encierra una lección crucial: la tristeza es válida, pero la ceguera al amor y a las posibilidades que aún quedan en pie perpetúa el sufrimiento.',
    meaningReversed:
      'El perdón, la sanación y la capacidad de dejar el pasado atrás. La persona atraviesa la noche oscura del alma y, al voltearse, descubre las copas que aún siguen en pie. Es la integración dolorosa pero necesaria de una pérdida, permitiendo que la energía emocional vuelva a fluir hacia la reconstrucción y la aceptación del presente.',
    description:
      'Una figura vestida con una pesada y oscura capa negra se encorva en señal de luto profundo, mirando hacia tres copas derramadas en el suelo (cuya agua se filtra en la tierra). A sus espaldas, y fuera de su campo de visión, dos copas permanecen de pie e intactas. A lo lejos fluye un río con un puente que conduce a un castillo, símbolo de un futuro que aún puede cruzarse.',
    keywords: {
      upright: [
        'duelo',
        'arrepentimiento',
        'pérdida',
        'pesimismo',
        'tristeza profunda',
        'enfoque negativo',
      ],
      reversed: [
        'sanación',
        'aceptación',
        'perdón',
        'reconstrucción',
        'superación',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Cups05.jpg',
  },
  {
    slug: 'six-of-cups',
    nameEn: 'Six of Cups',
    nameEs: 'Seis de Copas',
    arcanaType: ArcanaType.MINOR,
    number: 6,
    suit: Suit.CUPS,
    element: Element.WATER,
    meaningUpright:
      'El retorno a la inocencia original del alma. Representa los vínculos kármicos, las raíces familiares y la pureza de las emociones sin condiciones. Esotéricamente, alude al "niño interior" y a la curación que proviene de recordar quiénes éramos antes de ser condicionados por el mundo. Momentos de profunda nostalgia que nutren el alma.',
    meaningReversed:
      'Aferramiento patológico al pasado. El individuo se niega a crecer o asumir responsabilidades adultas, viviendo en una ilusión melancólica ("cualquier tiempo pasado fue mejor"). Puede indicar traumas infantiles no resueltos, una idealización tóxica de viejos amores, o el estancamiento evolutivo por miedo a enfrentar el presente y el futuro.',
    description:
      'En un patio soleado, seguro y acogedor (quizás un castillo antiguo), un niño mayor ofrece una copa rebosante de flores blancas (símbolo de pureza) a una niña pequeña. Alrededor de ellos hay cinco copas adicionales, también llenas de flores. Un guardia vestido de manera adulta camina alejándose en el fondo, marcando el abandono de las preocupaciones mundanas.',
    keywords: {
      upright: [
        'inocencia',
        'nostalgia',
        'niño interior',
        'recuerdos',
        'raíces',
        'pureza',
      ],
      reversed: [
        'estancamiento',
        'inmadurez',
        'aferramiento',
        'trauma infantil',
        'idealización',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Cups06.jpg',
  },
  {
    slug: 'seven-of-cups',
    nameEn: 'Seven of Cups',
    nameEs: 'Siete de Copas',
    arcanaType: ArcanaType.MINOR,
    number: 7,
    suit: Suit.CUPS,
    element: Element.WATER,
    meaningUpright:
      'El laberinto de la psique y el mundo de las ilusiones. Representa la confrontación con nuestras fantasías, deseos proyectados y las trampas del ego. Múltiples opciones se presentan, pero carecen de sustancia material. Es un momento de fuerte imaginación y sueños, advirtiendo sobre la necesidad de discernimiento para no perderse en los "espejismos" de la mente.',
    meaningReversed:
      'El colapso de las ilusiones. La caída dolorosa pero liberadora a la realidad. Se toman decisiones claras tras un periodo de confusión mental profunda. Los velos de Maya (la ilusión esotérica) se rasgan, permitiendo ver las opciones por lo que realmente son. Fin del autoengaño y enfoque pragmático frente a las opciones disponibles.',
    description:
      'Una sombra humana, de espaldas al espectador, contempla asombrado siete copas que flotan mágicamente en nubes de humo espeso (simbolizando la ilusión). Cada copa contiene un arquetipo diferente: una cabeza humana (ego), una figura brillante velada (espíritu), una serpiente (sabiduría/tentación), un castillo (poder), joyas (riqueza), una corona (gloria) y un dragón (miedo vital).',
    keywords: {
      upright: [
        'ilusiones',
        'fantasía',
        'opciones múltiples',
        'espejismos',
        'proyección',
        'ensueño',
      ],
      reversed: [
        'claridad',
        'discernimiento',
        'realidad',
        'toma de decisiones',
        'desengaño',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Cups07.jpg',
  },
  {
    slug: 'eight-of-cups',
    nameEn: 'Eight of Cups',
    nameEs: 'Ocho de Copas',
    arcanaType: ArcanaType.MINOR,
    number: 8,
    suit: Suit.CUPS,
    element: Element.WATER,
    meaningUpright:
      'El viaje del buscador espiritual. Esta carta marca el momento valiente en el que decides abandonar lo que ya se ha consolidado pero que, secretamente, ha dejado de nutrir tu alma. Representa el desapego, el viaje hacia el autodescubrimiento en la soledad, dejando atrás el éxito emocional o material hueco en busca de un propósito superior y más auténtico.',
    meaningReversed:
      'El miedo paralizante a lo desconocido que te mantiene anclado a una situación marchita. Sabes internamente que debes partir (de una relación, un trabajo, un estado mental), pero la cobardía emocional o el apego a la familiaridad te impiden dar el paso. Es conformarse con la mediocridad espiritual por temor a caminar en la oscuridad temporal.',
    description:
      'Bajo la luz de un eclipse o una luna menguante (que representa el fin de un ciclo y el instinto), una figura envuelta en una capa roja camina alejándose con la ayuda de un bastón hacia montañas escarpadas y desoladas. En el primer plano deja atrás ocho copas apiladas cuidadosamente; ninguna está volcada, simbolizando que no huye del caos, sino de la falta de plenitud.',
    keywords: {
      upright: [
        'desapego',
        'búsqueda espiritual',
        'abandono voluntario',
        'transición',
        'introspección',
        'evolución',
      ],
      reversed: [
        'estancamiento',
        'miedo al cambio',
        'apego paralizante',
        'conformismo',
        'evasión',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Cups08.jpg',
  },
  {
    slug: 'nine-of-cups',
    nameEn: 'Nine of Cups',
    nameEs: 'Nueve de Copas',
    arcanaType: ArcanaType.MINOR,
    number: 9,
    suit: Suit.CUPS,
    element: Element.WATER,
    meaningUpright:
      'Conocida tradicionalmente como "la carta de los deseos cumplidos". Esotéricamente, representa la saturación de Júpiter: el momento de profunda complacencia, amor propio y satisfacción material y emocional. Es la celebración de la independencia afectiva, la recompensa después de tiempos difíciles, disfrutando de los placeres sensuales y la abundancia del cosmos con total confianza.',
    meaningReversed:
      'La soberbia espiritual o el hedonismo egoísta. Cuando se invierte, advierte sobre un deseo que se cumplió pero trajo consigo un profundo vacío existencial (el síndrome de "es esto todo lo que hay"). Puede indicar presunción, indulgencia excesiva en placeres terrenales, o la arrogancia de creer que el éxito material reemplaza a la verdadera evolución espiritual.',
    description:
      'Un hombre de aspecto próspero, robusto y bien vestido, está sentado en un taburete de madera con los brazos cruzados sobre el pecho, mostrando una expresión de profunda autosatisfacción y orgullo. Detrás de él, sobre una mesa o estructura de madera semicircular cubierta con una tela azul, reposan nueve copas doradas perfectamente ordenadas como trofeos de sus conquistas.',
    keywords: {
      upright: [
        'deseo cumplido',
        'satisfacción',
        'abundancia',
        'amor propio',
        'placer',
        'recompensa',
      ],
      reversed: [
        'hedonismo',
        'soberbia',
        'vacío existencial',
        'indulgencia',
        'insatisfacción profunda',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Cups09.jpg',
  },
  {
    slug: 'ten-of-cups',
    nameEn: 'Ten of Cups',
    nameEs: 'Diez de Copas',
    arcanaType: ArcanaType.MINOR,
    number: 10,
    suit: Suit.CUPS,
    element: Element.WATER,
    meaningUpright:
      'El estado de gracia terrenal y la bienaventuranza máxima. Representa la alineación divina donde los valores espirituales y las relaciones humanas coexisten en perfecta armonía. Simboliza la familia de alma, la paz duradera y el destino final del amor maduro. Es la confirmación de que seguir al corazón, con integridad, nos lleva a nuestro verdadero hogar vibracional.',
    meaningReversed:
      'La ilusión rota del "felices para siempre". El Diez de Copas invertido revela fisuras profundas en el núcleo familiar o en la comunidad. Denota disputas domésticas, la presión por mantener las apariencias frente a los demás escondiendo la infelicidad real, o la desconexión profunda de nuestros valores fundamentales debido a conflictos prolongados.',
    description:
      'Una pareja amorosa está de pie, con los brazos alrededor del otro, levantando sus manos libres hacia el cielo en un gesto de reverencia y gratitud. Junto a ellos, dos niños bailan alegremente. Por encima de la idílica escena campestre, un arcoíris brillante atraviesa el cielo conteniendo diez copas doradas, el puente cósmico que sella el pacto de paz y plenitud.',
    keywords: {
      upright: [
        'bienaventuranza',
        'armonía familiar',
        'plenitud total',
        'alineación divina',
        'paz duradera',
        'hogar',
      ],
      reversed: [
        'conflictos familiares',
        'falsa apariencia',
        'desarmonía',
        'desconexión',
        'ideales rotos',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Cups10.jpg',
  },
  {
    slug: 'page-of-cups',
    nameEn: 'Page of Cups',
    nameEs: 'Paje de Copas',
    arcanaType: ArcanaType.MINOR,
    number: 11,
    suit: Suit.CUPS,
    courtRank: CourtRank.PAGE,
    element: Element.WATER,
    meaningUpright:
      'El arquetipo del soñador místico y el nacimiento de la intuición consciente. Como mensajero del agua, trae inspiración creativa pura, sincronías y una invitación a explorar el subconsciente sin miedo. Es el niño interior despierto, curioso por el arte, la espiritualidad y los sentimientos emergentes. Te anima a prestar atención a tus sueños y corazonadas irracionales.',
    meaningReversed:
      'Escapismo crónico y vulnerabilidad extrema. El paje invertido pierde su anclaje y se ahoga en sus propias fantasías, volviéndose caprichoso, hipersensible o emocionalmente inmaduro. Puede representar bloqueos creativos severos, la tendencia a huir de la realidad dura mediante adicciones emocionales, o el rechazo directo del niño interior herido.',
    description:
      'Un joven vestido con una túnica extravagante de motivos florales se encuentra de pie a la orilla del mar agitado. Sostiene una copa en sus manos, y de ella emerge sorprendentemente un pez vivo que parece mirarle a los ojos, como si le estuviera comunicando un mensaje del abismo del subconsciente. Su postura es relajada, receptiva y maravillada.',
    keywords: {
      upright: [
        'inspiración',
        'curiosidad intuitiva',
        'mensajes oníricos',
        'niño interior',
        'asombro',
        'arte incipiente',
      ],
      reversed: [
        'inmadurez emocional',
        'escapismo',
        'capricho',
        'hipersensibilidad',
        'bloqueo creativo',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Cups11.jpg',
  },
  {
    slug: 'knight-of-cups',
    nameEn: 'Knight of Cups',
    nameEs: 'Caballero de Copas',
    arcanaType: ArcanaType.MINOR,
    number: 12,
    suit: Suit.CUPS,
    courtRank: CourtRank.KNIGHT,
    element: Element.WATER,
    meaningUpright:
      'El poeta guerrero impulsado por la devoción. Este arquetipo domina el arte de llevar el romanticismo, la visión y la imaginación hacia el mundo exterior a través de la acción (el fuego del Caballero actuando sobre el agua de las Copas). Invita a seguir la brújula del corazón por encima de la lógica, abrazando la belleza, el idealismo y la caballerosidad con gracia.',
    meaningReversed:
      'El encantador manipulador o el soñador paralizado. En la sombra, el idealismo se vuelve tóxico: expectativas románticas poco realistas, promesas vacías y la incapacidad de concretar las grandes visiones creativas. Muestra a alguien que se deja llevar por los cambios bruscos de humor, celos y el drama emocional continuo, sin bases terrenales reales.',
    description:
      'Un caballero apuesto, adornado con una capa cubierta de imágenes de peces rojos y alas de Hermes en su yelmo y talones (símbolos de imaginación y mensajes psíquicos), cabalga lentamente y con gracia sobre un caballo blanco majestuoso y dócil. Avanza pacíficamente a través de un paisaje árido con un río serpenteante, sosteniendo una copa como si fuera el Santo Grial.',
    keywords: {
      upright: [
        'idealismo',
        'devoción',
        'acción romántica',
        'visión artística',
        'encanto',
        'seguir al corazón',
      ],
      reversed: [
        'manipulación',
        'promesas vacías',
        'humor inestable',
        'falta de realismo',
        'drama emocional',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Cups12.jpg',
  },
  {
    slug: 'queen-of-cups',
    nameEn: 'Queen of Cups',
    nameEs: 'Reina de Copas',
    arcanaType: ArcanaType.MINOR,
    number: 13,
    suit: Suit.CUPS,
    courtRank: CourtRank.QUEEN,
    element: Element.WATER,
    meaningUpright:
      'La suma sacerdotisa del mundo cotidiano y el dominio del elemento agua. Ella es la empatía encarnada, capaz de comprender las profundidades del dolor humano sin hundirse en ellas. Arquetipo de la sanadora, canalizadora y madre espiritual, rige mediante la contención amorosa y la sabiduría intuitiva profunda. Confía en lo invisible con absoluta certeza.',
    meaningReversed:
      'La esponja emocional saturada. La Reina invertida sufre de agotamiento por empatía, adoptando el rol de mártir. Al carecer de límites energéticos, absorbe los problemas ajenos hasta perderse a sí misma. Puede volverse codependiente, manipuladora emocional pasivo-agresiva, utilizando el chantaje afectivo y la victimización para mantener el control sobre los demás.',
    description:
      'Una mujer de gran belleza serena se sienta en un trono de piedra tallado con querubines y sirenas, justo donde la tierra se encuentra con el mar. Contempla fijamente y sostiene con ambas manos un cáliz ornamentado y cerrado (la única copa tapada del mazo), indicando que los misterios y las emociones que custodia provienen de las profundidades sagradas y ocultas del inconsciente.',
    keywords: {
      upright: [
        'empatía profunda',
        'sanación',
        'sabiduría intuitiva',
        'contención',
        'amor maternal',
        'canalización',
      ],
      reversed: [
        'codependencia',
        'martirio',
        'chantaje emocional',
        'agotamiento empático',
        'falta de límites',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Cups13.jpg',
  },
  {
    slug: 'king-of-cups',
    nameEn: 'King of Cups',
    nameEs: 'Rey de Copas',
    arcanaType: ArcanaType.MINOR,
    number: 14,
    suit: Suit.CUPS,
    courtRank: CourtRank.KING,
    element: Element.WATER,
    meaningUpright:
      'El maestro de la inteligencia emocional. Este arquetipo ha aprendido a navegar por mares turbulentos sin perder el equilibrio. No reprime el agua (las emociones), sino que le da estructura (la autoridad del Rey). Es compasivo, diplomático, sabio y ecuánime. Un guía espiritual o consejero que lidera desde el corazón, pero mantiene la templanza mental y la madurez total.',
    meaningReversed:
      'El narcisista encubierto o la represión emocional destructiva. Un Rey de Copas invertido usa su profundo conocimiento de la psicología humana para manipular, controlar y hacer luz de gas (gaslighting) a los demás. Oculta sus verdaderos sentimientos detrás de un muro gélido de poder intelectual, volviéndose volátil en privado y vengativo, gobernado por pasiones reprimidas.',
    description:
      'El monarca está sentado en un pesado trono de piedra que inexplicablemente flota sobre el mar agitado, simbolizando su total dominio sobre las turbulencias emocionales. Lleva un collar con un amuleto en forma de pez. En una mano sostiene firmemente su cetro dorado (poder del mundo material) y en la otra una copa (el reino del espíritu). A lo lejos, un barco sortea las olas de forma segura.',
    keywords: {
      upright: [
        'inteligencia emocional',
        'madurez',
        'diplomacia',
        'compasión ecuánime',
        'equilibrio psíquico',
        'sabio consejero',
      ],
      reversed: [
        'manipulación oculta',
        'narcisismo',
        'represión tóxica',
        'volatilidad',
        'control afectivo',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Cups14.jpg',
  },
];

// ============================================================================
// ESPADAS (SWORDS) — Elemento Aire — 14 cartas
// ============================================================================

const SWORDS_CARDS: CardSeedData[] = [
  {
    slug: 'ace-of-swords',
    nameEn: 'Ace of Swords',
    nameEs: 'As de Espadas',
    arcanaType: ArcanaType.MINOR,
    number: 1,
    suit: Suit.SWORDS,
    element: Element.AIR,
    meaningUpright:
      'Claridad mental, verdad cortante, nueva perspectiva intelectual y la fuerza para cortar con lo que ya no sirve.',
    meaningReversed:
      'Confusión mental, desinformación, crueldad verbal y pensamiento que causa daño en lugar de iluminar.',
    description:
      'Una mano celestial surge de las nubes sosteniendo una espada erguida coronada con una corona adornada con laurel y palma. Montañas escarpadas aparecen al fondo. Representa el poder de la mente clara, la verdad que corta la ilusión, el pensamiento afilado y la capacidad de comunicar con precisión y fuerza.',
    keywords: {
      upright: [
        'claridad',
        'verdad',
        'mente',
        'decisión',
        'comunicación',
        'corte',
      ],
      reversed: [
        'confusión',
        'desinformación',
        'crueldad',
        'pensamiento dañino',
        'caos mental',
      ],
    },
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/1/1a/Swords01.jpg',
  },
  {
    slug: 'two-of-swords',
    nameEn: 'Two of Swords',
    nameEs: 'Dos de Espadas',
    arcanaType: ArcanaType.MINOR,
    number: 2,
    suit: Suit.SWORDS,
    element: Element.AIR,
    meaningUpright:
      'Bloqueo, decisión difícil, punto muerto y la necesidad de elegir entre dos opciones igualmente desafiantes con los ojos tapados.',
    meaningReversed:
      'Parálisis superada, información que llega para tomar decisiones y rendirse ante una situación de impasse.',
    description:
      'Una figura con los ojos vendados está sentada frente al mar agitado con dos espadas cruzadas sobre el pecho. La luna ilumina la escena desde arriba. Representa la negativa a ver la realidad, el punto muerto en una decisión difícil y la tensión entre dos opciones que parecen imposibles de reconciliar.',
    keywords: {
      upright: [
        'bloqueo',
        'decisión difícil',
        'punto muerto',
        'negación',
        'tensión',
        'impasse',
      ],
      reversed: [
        'información nueva',
        'decisión tomada',
        'ver la realidad',
        'superar el bloqueo',
        'claridad',
      ],
    },
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/9/9e/Swords02.jpg',
  },
  {
    slug: 'three-of-swords',
    nameEn: 'Three of Swords',
    nameEs: 'Tres de Espadas',
    arcanaType: ArcanaType.MINOR,
    number: 3,
    suit: Suit.SWORDS,
    element: Element.AIR,
    meaningUpright:
      'Dolor emocional, traición, pérdida, separación y el sufrimiento que viene cuando la verdad lastima el corazón.',
    meaningReversed:
      'Recuperación del dolor, sanar heridas del pasado, perdonar la traición y encontrar alivio después de una tormenta emocional.',
    description:
      'Un corazón rojo atravesado por tres espadas flota bajo nubes tormentosas y lluvia. La imagen es directa y sin ambigüedades: representa el dolor del corazón roto, la traición, la pérdida de un ser querido o la verdad dolorosa que no puede evitarse.',
    keywords: {
      upright: [
        'dolor',
        'traición',
        'pérdida',
        'corazón roto',
        'tristeza',
        'separación',
      ],
      reversed: [
        'recuperación',
        'sanación',
        'perdón',
        'alivio',
        'superación del dolor',
      ],
    },
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/02/Swords03.jpg',
  },
  {
    slug: 'four-of-swords',
    nameEn: 'Four of Swords',
    nameEs: 'Cuatro de Espadas',
    arcanaType: ArcanaType.MINOR,
    number: 4,
    suit: Suit.SWORDS,
    element: Element.AIR,
    meaningUpright:
      'Descanso, recuperación, meditación y el necesario retiro para restaurar las energías antes de continuar la batalla.',
    meaningReversed:
      'Inquietud, incapacidad de descansar y la necesidad de volver a la acción antes de haber recuperado las fuerzas.',
    description:
      'Una figura yace en posición horizontal sobre un sarcófago de piedra en una iglesia. Una espada está debajo de él y tres espadas cuelgan encima. Una vidriera ilumina la escena. Representa la necesidad de pausar, el descanso reparador, la meditación y el retiro estratégico para sanar y recuperar fuerzas.',
    keywords: {
      upright: [
        'descanso',
        'recuperación',
        'meditación',
        'retiro',
        'pausa',
        'restauración',
      ],
      reversed: [
        'inquietud',
        'incapacidad de descansar',
        'agitación',
        'volver a la acción',
        'estrés',
      ],
    },
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/b/bf/Swords04.jpg',
  },
  {
    slug: 'five-of-swords',
    nameEn: 'Five of Swords',
    nameEs: 'Cinco de Espadas',
    arcanaType: ArcanaType.MINOR,
    number: 5,
    suit: Suit.SWORDS,
    element: Element.AIR,
    meaningUpright:
      'Conflicto sin ganadores reales, derrota humillante, traición y victoria pírrica que deja un sabor amargo.',
    meaningReversed:
      'Reconciliación después del conflicto, aprender la lección de las batallas perdidas y soltar el rencor.',
    description:
      'Una figura sonríe recogiendo tres espadas mientras dos figuras derrotadas caminan en dirección opuesta. El cielo está nublado y tormentoso. Representa los conflictos en los que nadie gana realmente, las victorias que tienen un costo demasiado alto y las situaciones donde el orgullo causa más daño que el conflicto en sí.',
    keywords: {
      upright: [
        'conflicto',
        'derrota',
        'traición',
        'victoria pírrica',
        'orgullo',
        'humillación',
      ],
      reversed: [
        'reconciliación',
        'aprender la lección',
        'soltar el rencor',
        'paz',
        'rendición',
      ],
    },
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/2/23/Swords05.jpg',
  },
  {
    slug: 'six-of-swords',
    nameEn: 'Six of Swords',
    nameEs: 'Seis de Espadas',
    arcanaType: ArcanaType.MINOR,
    number: 6,
    suit: Suit.SWORDS,
    element: Element.AIR,
    meaningUpright:
      'Transición hacia aguas más calmas, alejarse de la dificultad, viaje mental o físico y movimiento hacia un futuro más tranquilo.',
    meaningReversed:
      'Resistencia al movimiento necesario, quedarse atrapado en las dificultades y dificultad para soltar el pasado difícil.',
    description:
      'Una figura con capucha y un niño son transportados en barca por un barquero a través de aguas que cambian de turbulentas a tranquilas. Seis espadas están clavadas en la proa de la barca. Representa el movimiento necesario para alejarse de las dificultades, la transición hacia tiempos mejores y el viaje que sana.',
    keywords: {
      upright: [
        'transición',
        'viaje',
        'aguas más calmas',
        'alejarse',
        'movimiento',
        'sanación',
      ],
      reversed: [
        'resistencia',
        'atrapado en el pasado',
        'imposibilidad de huir',
        'estancamiento',
        'regreso difícil',
      ],
    },
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/2/29/Swords06.jpg',
  },
  {
    slug: 'seven-of-swords',
    nameEn: 'Seven of Swords',
    nameEs: 'Siete de Espadas',
    arcanaType: ArcanaType.MINOR,
    number: 7,
    suit: Suit.SWORDS,
    element: Element.AIR,
    meaningUpright:
      'Engaño, estrategia encubierta, actuar solo y la tendencia a evadir los problemas de forma deshonesta o por las vías indirectas.',
    meaningReversed:
      'Confesar las mentiras, abandonar las estrategias deshonestas y la posibilidad de una segunda oportunidad después del engaño.',
    description:
      'Un hombre escapa furtivamente de un campamento sosteniendo cinco espadas mientras deja atrás otras dos. Mira hacia atrás con sigilo sobre el hombro. Representa el engaño, la astucia deshonesta, los planes secretos y la tendencia a evitar la confrontación directa mediante la manipulación o el escaqueo.',
    keywords: {
      upright: [
        'engaño',
        'estrategia',
        'deshonestidad',
        'sigilo',
        'evasión',
        'traición',
      ],
      reversed: [
        'confesión',
        'honestidad',
        'segunda oportunidad',
        'arrepentimiento',
        'abandonar el engaño',
      ],
    },
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/3/34/Swords07.jpg',
  },
  {
    slug: 'eight-of-swords',
    nameEn: 'Eight of Swords',
    nameEs: 'Ocho de Espadas',
    arcanaType: ArcanaType.MINOR,
    number: 8,
    suit: Suit.SWORDS,
    element: Element.AIR,
    meaningUpright:
      'Restricción autoimpuesta, trampa mental, impotencia percibida y la jaula de creencias limitantes que no permiten ver las salidas disponibles.',
    meaningReversed:
      'Liberación de la trampa mental, recuperación del poder personal y ver con claridad las opciones que siempre estuvieron disponibles.',
    description:
      'Una figura con ojos vendados y atada con cuerdas está rodeada de ocho espadas clavadas en el suelo. Aunque parece atrapada, las cuerdas son flojas y las espadas no la tocan directamente. Representa la prisión de la mente, las restricciones autoimpuestas y la creencia de estar atrapado cuando en realidad siempre hay una salida.',
    keywords: {
      upright: [
        'restricción',
        'trampa mental',
        'impotencia',
        'creencias limitantes',
        'confusión',
        'parálisis',
      ],
      reversed: [
        'liberación',
        'ver las opciones',
        'poder personal',
        'claridad',
        'salida encontrada',
      ],
    },
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/a/a7/Swords08.jpg',
  },
  {
    slug: 'nine-of-swords',
    nameEn: 'Nine of Swords',
    nameEs: 'Nueve de Espadas',
    arcanaType: ArcanaType.MINOR,
    number: 9,
    suit: Suit.SWORDS,
    element: Element.AIR,
    meaningUpright:
      'Ansiedad, pesadillas, preocupaciones nocturnas, miedo y pensamiento catastrófico que genera sufrimiento en la mente.',
    meaningReversed:
      'Alivio de la ansiedad, hablar de los miedos, buscar ayuda y el comienzo de la salida del espiral negativo.',
    description:
      'Una figura está sentada en la cama en plena noche, con las manos cubriendo el rostro en angustia. Nueve espadas cuelgan horizontalmente en la pared oscura detrás de ella. Representa el tormento mental, la ansiedad nocturna, las preocupaciones que crecen en la oscuridad y el sufrimiento que a menudo es peor que la realidad.',
    keywords: {
      upright: [
        'ansiedad',
        'pesadillas',
        'miedo',
        'preocupación',
        'sufrimiento mental',
        'catastrofismo',
      ],
      reversed: [
        'alivio',
        'pedir ayuda',
        'hablar de los miedos',
        'salir del espiral',
        'esperanza',
      ],
    },
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/2/2f/Swords09.jpg',
  },
  {
    slug: 'ten-of-swords',
    nameEn: 'Ten of Swords',
    nameEs: 'Diez de Espadas',
    arcanaType: ArcanaType.MINOR,
    number: 10,
    suit: Suit.SWORDS,
    element: Element.AIR,
    meaningUpright:
      'Final doloroso, traición profunda, derrota total y el punto más bajo antes del inevitable renacimiento que sigue a cada cierre.',
    meaningReversed:
      'Resistencia al final inevitable, recuperación lenta pero cierta y la resurrección que sigue al colapso total.',
    description:
      'Una figura yace boca abajo con diez espadas clavadas en la espalda. Sin embargo, el horizonte muestra un amanecer brillante detrás de las nubes oscuras. Representa el final de un ciclo de forma dramática, la derrota total y la traición, pero también la promesa del amanecer que siempre sigue a la noche más oscura.',
    keywords: {
      upright: [
        'fin doloroso',
        'derrota',
        'traición',
        'punto más bajo',
        'cierre',
        'colapso',
      ],
      reversed: [
        'recuperación',
        'resurrección',
        'resistencia',
        'renacimiento lento',
        'sobrevivir',
      ],
    },
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/d/d4/Swords10.jpg',
  },
  {
    slug: 'page-of-swords',
    nameEn: 'Page of Swords',
    nameEs: 'Paje de Espadas',
    arcanaType: ArcanaType.MINOR,
    number: 11,
    suit: Suit.SWORDS,
    courtRank: CourtRank.PAGE,
    element: Element.AIR,
    meaningUpright:
      'Curiosidad intelectual, vigilancia, nuevas ideas y la energía del joven pensador que cuestiona todo con agudeza mental.',
    meaningReversed:
      'Chismorreo, pensamiento superficial, comunicación hiriente y curiosidad que se convierte en entrometimiento.',
    description:
      'Un joven empuña una espada apuntando al cielo mientras el viento agita su ropa y cabello en una colina. Su mirada es aguda y alerta. Representa la energía juvenil del intelecto, la curiosidad sin filtros, la agilidad mental y el deseo de aprender mediante el cuestionamiento y la observación aguda.',
    keywords: {
      upright: [
        'curiosidad',
        'intelecto',
        'vigilancia',
        'nuevas ideas',
        'agudeza',
        'aprendizaje',
      ],
      reversed: [
        'chismorreo',
        'superficialidad',
        'crueldad verbal',
        'entrometimiento',
        'pensamiento dañino',
      ],
    },
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/4/4c/Swords11.jpg',
  },
  {
    slug: 'knight-of-swords',
    nameEn: 'Knight of Swords',
    nameEs: 'Caballero de Espadas',
    arcanaType: ArcanaType.MINOR,
    number: 12,
    suit: Suit.SWORDS,
    courtRank: CourtRank.KNIGHT,
    element: Element.AIR,
    meaningUpright:
      'Acción rápida y decisiva, ambición sin límites, comunicación directa y la determinación de ir hacia adelante sin mirar atrás.',
    meaningReversed:
      'Impulsividad destructiva, arrogancia intelectual y acción sin consideración de las consecuencias.',
    description:
      'Un caballero en armadura galopa furiosamente hacia adelante con la espada alzada, mientras el viento dobla los árboles a su paso. Representa la energía del intelecto en plena acción, la determinación feroz, la velocidad del pensamiento que se convierte en acción y la ambición que no se detiene ante ningún obstáculo.',
    keywords: {
      upright: [
        'acción decisiva',
        'ambición',
        'velocidad',
        'determinación',
        'comunicación directa',
        'avance',
      ],
      reversed: [
        'impulsividad',
        'arrogancia',
        'consecuencias ignoradas',
        'caos',
        'agresión verbal',
      ],
    },
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/b/b0/Swords12.jpg',
  },
  {
    slug: 'queen-of-swords',
    nameEn: 'Queen of Swords',
    nameEs: 'Reina de Espadas',
    arcanaType: ArcanaType.MINOR,
    number: 13,
    suit: Suit.SWORDS,
    courtRank: CourtRank.QUEEN,
    element: Element.AIR,
    meaningUpright:
      'Claridad mental, independencia, comunicación directa y la sabiduría que viene de haber sufrido y aprendido de la experiencia.',
    meaningReversed:
      'Frialdad excesiva, crueldad disfrazada de honestidad y distancia emocional que se usa como arma.',
    description:
      'Una reina de aspecto serio está sentada en un trono elevado que asoma entre las nubes, con una espada alzada en la mano derecha y la mano izquierda extendida. Su expresión es serena pero firme. Representa la inteligencia aguda, la comunicación precisa, la independencia y la sabiduría ganada a través de la experiencia dolorosa.',
    keywords: {
      upright: [
        'claridad',
        'independencia',
        'honestidad',
        'inteligencia',
        'sabiduría',
        'directa',
      ],
      reversed: [
        'frialdad',
        'crueldad',
        'distancia',
        'amargura',
        'juicio duro',
      ],
    },
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/d/d4/Swords13.jpg',
  },
  {
    slug: 'king-of-swords',
    nameEn: 'King of Swords',
    nameEs: 'Rey de Espadas',
    arcanaType: ArcanaType.MINOR,
    number: 14,
    suit: Suit.SWORDS,
    courtRank: CourtRank.KING,
    element: Element.AIR,
    meaningUpright:
      'Autoridad intelectual, liderazgo con principios, pensamiento estratégico y la capacidad de aplicar la verdad con justicia y sin favoritismo.',
    meaningReversed:
      'Tiranía intelectual, abuso del poder mental, manipulación mediante la lógica y distorsión de la verdad para fines propios.',
    description:
      'Un rey poderoso está sentado en su trono sosteniendo una espada erguida, con la mirada directa y penetrante. Las mariposas decoran su trono y el cielo azul lo rodea. Representa el dominio maduro del intelecto, la autoridad basada en principios, el pensamiento estratégico y la capacidad de liderar con claridad, justicia y objetividad.',
    keywords: {
      upright: [
        'autoridad intelectual',
        'justicia',
        'estrategia',
        'liderazgo',
        'principios',
        'objetividad',
      ],
      reversed: [
        'tiranía',
        'manipulación',
        'frialdad extrema',
        'abuso de poder',
        'distorsión de la verdad',
      ],
    },
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/3/33/Swords14.jpg',
  },
];

// ============================================================================
// OROS / PENTÁCULOS (PENTACLES) — Elemento Tierra — 14 cartas
// ============================================================================

const PENTACLES_CARDS: CardSeedData[] = [
  {
    slug: 'ace-of-pentacles',
    nameEn: 'Ace of Pentacles',
    nameEs: 'As de Oros',
    arcanaType: ArcanaType.MINOR,
    number: 1,
    suit: Suit.PENTACLES,
    element: Element.EARTH,
    meaningUpright:
      'Nueva oportunidad material, prosperidad naciente, manifestación de recursos y el inicio de un proyecto con bases sólidas.',
    meaningReversed:
      'Oportunidades materiales perdidas, falta de planificación financiera y proyectos sin fundamentos sólidos.',
    description:
      'Una mano celestial emerge de las nubes sosteniendo una moneda de oro con un pentáculo inscrito. Un jardín exuberante con un arco de flores conduce a una montaña en el horizonte. Representa el inicio de la prosperidad material, la semilla de la abundancia y la oportunidad de construir algo sólido y duradero.',
    keywords: {
      upright: [
        'prosperidad',
        'oportunidad material',
        'abundancia',
        'inicio',
        'manifestación',
        'recursos',
      ],
      reversed: [
        'oportunidad perdida',
        'falta de planificación',
        'inseguridad financiera',
        'proyectos sin base',
        'materialismo',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Pents01.jpg',
  },
  {
    slug: 'two-of-pentacles',
    nameEn: 'Two of Pentacles',
    nameEs: 'Dos de Oros',
    arcanaType: ArcanaType.MINOR,
    number: 2,
    suit: Suit.PENTACLES,
    element: Element.EARTH,
    meaningUpright:
      'Equilibrio financiero, malabarismo con recursos, adaptabilidad y la capacidad de manejar múltiples responsabilidades simultáneamente.',
    meaningReversed:
      'Desequilibrio financiero, sobrecarga de responsabilidades y dificultad para mantener todas las pelotas en el aire.',
    description:
      'Un joven baila haciendo malabarismos con dos monedas unidas por una cinta en forma de infinito, mientras barcos navegan en el mar agitado al fondo. Representa la habilidad para equilibrar las demandas financieras, adaptarse a las circunstancias cambiantes y mantener el ritmo en medio de la fluctuación.',
    keywords: {
      upright: [
        'equilibrio',
        'malabarismo',
        'adaptabilidad',
        'recursos',
        'flexibilidad',
        'prioridades',
      ],
      reversed: [
        'desequilibrio',
        'sobrecarga',
        'caos financiero',
        'falta de organización',
        'agotamiento',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Pents02.jpg',
  },
  {
    slug: 'three-of-pentacles',
    nameEn: 'Three of Pentacles',
    nameEs: 'Tres de Oros',
    arcanaType: ArcanaType.MINOR,
    number: 3,
    suit: Suit.PENTACLES,
    element: Element.EARTH,
    meaningUpright:
      'Trabajo en equipo, maestría en el oficio, colaboración y el reconocimiento del talento a través de los resultados concretos.',
    meaningReversed:
      'Falta de colaboración, trabajo solitario poco efectivo, habilidades subvaloradas y proyectos en grupo disfuncionales.',
    description:
      'Un artesano trabaja en el interior de una catedral mientras un monje y un noble consultan sus planos. Los tres trabajan juntos hacia un objetivo común. Representa la maestría artesanal, la colaboración efectiva entre personas con diferentes roles y el reconocimiento de la calidad del trabajo bien hecho.',
    keywords: {
      upright: [
        'trabajo en equipo',
        'maestría',
        'colaboración',
        'habilidad',
        'reconocimiento',
        'oficio',
      ],
      reversed: [
        'trabajo solitario',
        'falta de colaboración',
        'mediocridad',
        'habilidades subvaloradas',
        'conflicto grupal',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Pents03.jpg',
  },
  {
    slug: 'four-of-pentacles',
    nameEn: 'Four of Pentacles',
    nameEs: 'Cuatro de Oros',
    arcanaType: ArcanaType.MINOR,
    number: 4,
    suit: Suit.PENTACLES,
    element: Element.EARTH,
    meaningUpright:
      'Seguridad financiera, conservar recursos, estabilidad material y la tendencia a aferrarse a lo que se tiene por miedo a perderlo.',
    meaningReversed:
      'Generosidad reprimida que fluye, soltar el control sobre los recursos y apertura a compartir la abundancia.',
    description:
      'Una figura coronada está sentada con una moneda sobre la cabeza, abrazando otras dos con los brazos y manteniendo una cuarta bajo sus pies. Tiene la espalda vuelta a la ciudad. Representa la seguridad que da poseer bienes, pero también el riesgo del apego excesivo a lo material y la avaricia que impide el flujo.',
    keywords: {
      upright: [
        'seguridad',
        'conservar',
        'estabilidad',
        'control',
        'apego',
        'posesividad',
      ],
      reversed: [
        'generosidad',
        'soltar el control',
        'compartir',
        'desapego',
        'apertura',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Pents04.jpg',
  },
  {
    slug: 'five-of-pentacles',
    nameEn: 'Five of Pentacles',
    nameEs: 'Cinco de Oros',
    arcanaType: ArcanaType.MINOR,
    number: 5,
    suit: Suit.PENTACLES,
    element: Element.EARTH,
    meaningUpright:
      'Dificultad financiera, pobreza, aislamiento y el sentimiento de ser excluido de la prosperidad y el calor del cobijo.',
    meaningReversed:
      'Recuperación económica, encontrar ayuda disponible, superar la escasez y ver la luz al final del túnel de la dificultad.',
    description:
      'Dos figuras con aspecto de mendigos caminan en la nieve frente a una iglesia con una vidriera iluminada que muestra cinco pentáculos. No parecen ver la luz que tienen detrás. Representa la dificultad material, la sensación de exclusión, la pobreza y el aislamiento, pero también la ayuda que existe aunque no se vea.',
    keywords: {
      upright: [
        'dificultad',
        'pobreza',
        'aislamiento',
        'exclusión',
        'escasez',
        'adversidad',
      ],
      reversed: [
        'recuperación',
        'ayuda disponible',
        'luz al final',
        'superar la escasez',
        'esperanza',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Pents05.jpg',
  },
  {
    slug: 'six-of-pentacles',
    nameEn: 'Six of Pentacles',
    nameEs: 'Seis de Oros',
    arcanaType: ArcanaType.MINOR,
    number: 6,
    suit: Suit.PENTACLES,
    element: Element.EARTH,
    meaningUpright:
      'Generosidad, dar y recibir con equilibrio, caridad y la circulación sana de la abundancia en la comunidad.',
    meaningReversed:
      'Dar con condiciones, caridad con expectativas ocultas y desequilibrio en el flujo de dar y recibir.',
    description:
      'Un comerciante próspero usa una balanza y da monedas a dos mendigos arrodillados ante él. Representa el flujo generoso de la abundancia, el dar desde la riqueza con equilibrio, la caridad genuina y el reconocimiento de que la prosperidad se sostiene cuando circula y beneficia a todos.',
    keywords: {
      upright: [
        'generosidad',
        'dar y recibir',
        'caridad',
        'abundancia compartida',
        'equilibrio',
        'circulación',
      ],
      reversed: [
        'condiciones',
        'deuda',
        'caridad interesada',
        'desequilibrio',
        'tacañería disfrazada',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Pents06.jpg',
  },
  {
    slug: 'seven-of-pentacles',
    nameEn: 'Seven of Pentacles',
    nameEs: 'Siete de Oros',
    arcanaType: ArcanaType.MINOR,
    number: 7,
    suit: Suit.PENTACLES,
    element: Element.EARTH,
    meaningUpright:
      'Paciencia, inversión a largo plazo, evaluación del progreso y la sabiduría de esperar a que el trabajo dé sus frutos.',
    meaningReversed:
      'Impaciencia, trabajo sin resultados visibles, inversión que no rinde y dudas sobre si el esfuerzo vale la pena.',
    description:
      'Un labrador se apoya en su azada observando pensativo una planta cargada de siete monedas, evaluando el trabajo realizado. Representa la pausa reflexiva del trabajo bien hecho, la evaluación del progreso, la paciencia necesaria para que las semillas germinen y la satisfacción contemplativa del esfuerzo sostenido.',
    keywords: {
      upright: [
        'paciencia',
        'inversión',
        'evaluación',
        'espera',
        'frutos del trabajo',
        'reflexión',
      ],
      reversed: [
        'impaciencia',
        'trabajo sin frutos',
        'dudas',
        'inversión fallida',
        'frustración',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Pents07.jpg',
  },
  {
    slug: 'eight-of-pentacles',
    nameEn: 'Eight of Pentacles',
    nameEs: 'Ocho de Oros',
    arcanaType: ArcanaType.MINOR,
    number: 8,
    suit: Suit.PENTACLES,
    element: Element.EARTH,
    meaningUpright:
      'Maestría, diligencia, aprendizaje de un oficio, trabajo meticuloso y el disfrute del proceso de perfeccionar una habilidad.',
    meaningReversed:
      'Trabajo de baja calidad, falta de atención al detalle y habilidades que no se desarrollan por falta de dedicación.',
    description:
      'Un artesano concentrado trabaja en esculpir monedas, con seis ya terminadas a su lado y una en la mano mientras comienza otra. Trabaja solo y con dedicación plena. Representa el aprendizaje del oficio, la maestría a través de la práctica constante, la atención al detalle y la satisfacción del trabajo artesanal bien ejecutado.',
    keywords: {
      upright: [
        'maestría',
        'diligencia',
        'aprendizaje',
        'oficio',
        'atención al detalle',
        'perfeccionamiento',
      ],
      reversed: [
        'baja calidad',
        'descuido',
        'falta de dedicación',
        'habilidades sin desarrollar',
        'trabajo mediocre',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Pents08.jpg',
  },
  {
    slug: 'nine-of-pentacles',
    nameEn: 'Nine of Pentacles',
    nameEs: 'Nueve de Oros',
    arcanaType: ArcanaType.MINOR,
    number: 9,
    suit: Suit.PENTACLES,
    element: Element.EARTH,
    meaningUpright:
      'Abundancia material lograda, independencia, autoconfianza y el disfrute pleno de los frutos del propio esfuerzo y las decisiones sabias.',
    meaningReversed:
      'Dependencia de otros para la seguridad material y éxito que no es completamente propio.',
    description:
      'Una mujer elegante pasea sola por su jardín abundante, con un halcón posado en su brazo enguantado y rodeada de nueve pentáculos dorados. Representa la prosperidad ganada a través del propio esfuerzo, la independencia financiera, el lujo que se disfruta sin culpa y la autoconfianza de quien sabe su valor.',
    keywords: {
      upright: [
        'abundancia',
        'independencia',
        'autoconfianza',
        'lujo merecido',
        'prosperidad',
        'éxito propio',
      ],
      reversed: [
        'dependencia',
        'éxito prestado',
        'falta de independencia',
        'inseguridad',
        'autoestima baja',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Pents09.jpg',
  },
  {
    slug: 'ten-of-pentacles',
    nameEn: 'Ten of Pentacles',
    nameEs: 'Diez de Oros',
    arcanaType: ArcanaType.MINOR,
    number: 10,
    suit: Suit.PENTACLES,
    element: Element.EARTH,
    meaningUpright:
      'Riqueza familiar heredada, legado duradero, prosperidad multigeneracional y la estabilidad material que se transmite de generación en generación.',
    meaningReversed:
      'Conflictos familiares por herencia, pérdida del patrimonio y ruptura del legado familiar.',
    description:
      'Un anciano patriarca sentado en el umbral de su hogar observa a su familia (un hombre, una mujer y un niño) mientras sus perros descansan a sus pies. Diez pentáculos están distribuidos en el fondo formando el árbol de la vida. Representa la culminación de la prosperidad material, el legado familiar y la riqueza que trasciende lo individual.',
    keywords: {
      upright: [
        'legado',
        'prosperidad familiar',
        'riqueza',
        'patrimonio',
        'herencia',
        'estabilidad duradera',
      ],
      reversed: [
        'conflicto por herencia',
        'pérdida del patrimonio',
        'ruptura familiar',
        'deudas',
        'inestabilidad',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Pents10.jpg',
  },
  {
    slug: 'page-of-pentacles',
    nameEn: 'Page of Pentacles',
    nameEs: 'Paje de Oros',
    arcanaType: ArcanaType.MINOR,
    number: 11,
    suit: Suit.PENTACLES,
    courtRank: CourtRank.PAGE,
    element: Element.EARTH,
    meaningUpright:
      'Ambición práctica, estudiante dedicado, nuevas oportunidades de aprendizaje y la energía del aprendiz que da sus primeros pasos en el mundo material.',
    meaningReversed:
      'Falta de concentración, sueños sin planificación y oportunidades de aprendizaje desaprovechadas.',
    description:
      'Un joven sostiene una moneda dorada con ambas manos, estudiándola con atención y asombro en un paisaje verde y florido. Representa el comienzo del camino hacia la maestría material, el estudiante aplicado, la mentalidad práctica del aprendiz y el potencial de crecer en el mundo a través del estudio y la dedicación.',
    keywords: {
      upright: [
        'aprendizaje',
        'ambición práctica',
        'oportunidad',
        'estudio',
        'dedicación',
        'primer paso',
      ],
      reversed: [
        'falta de concentración',
        'sueños sin planificación',
        'pereza',
        'oportunidades perdidas',
        'dispersión',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Pents11.jpg',
  },
  {
    slug: 'knight-of-pentacles',
    nameEn: 'Knight of Pentacles',
    nameEs: 'Caballero de Oros',
    arcanaType: ArcanaType.MINOR,
    number: 12,
    suit: Suit.PENTACLES,
    courtRank: CourtRank.KNIGHT,
    element: Element.EARTH,
    meaningUpright:
      'Responsabilidad, constancia, trabajo metódico y la determinación de construir con solidez aunque el proceso sea lento.',
    meaningReversed:
      'Rutina excesiva, falta de progreso, rigidez ante el cambio y trabajo que no avanza por exceso de cautela.',
    description:
      'Un caballero en armadura oscura está inmóvil sobre su caballo en un campo cultivado, sosteniendo una moneda y contemplándola con seriedad. A diferencia de otros caballeros, este no avanza a toda velocidad. Representa la constancia, el trabajo responsable, la paciencia del agricultor y la construcción sólida que requiere tiempo y dedicación.',
    keywords: {
      upright: [
        'constancia',
        'responsabilidad',
        'trabajo metódico',
        'solidez',
        'paciencia',
        'fiabilidad',
      ],
      reversed: [
        'rigidez',
        'rutina paralizante',
        'exceso de cautela',
        'falta de progreso',
        'estancamiento',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Pents12.jpg',
  },
  {
    slug: 'queen-of-pentacles',
    nameEn: 'Queen of Pentacles',
    nameEs: 'Reina de Oros',
    arcanaType: ArcanaType.MINOR,
    number: 13,
    suit: Suit.PENTACLES,
    courtRank: CourtRank.QUEEN,
    element: Element.EARTH,
    meaningUpright:
      'Nurtura práctica, abundancia generosa, seguridad material y el cuidado amoroso que se expresa a través de los gestos concretos.',
    meaningReversed:
      'Dependencia económica, descuido del hogar o de uno mismo y materialismo que reemplaza a la conexión emocional.',
    description:
      'Una reina sostiene una moneda dorada con ternura en su trono adornado con frutos, flores y animales, en un jardín exuberante. Un conejo aparece en la esquina inferior. Representa la prosperidad del hogar, el cuidado práctico y nutritivo, la seguridad material que se comparte con generosidad y la sabiduría de quien sabe cultivar la abundancia.',
    keywords: {
      upright: [
        'nurtura práctica',
        'abundancia',
        'seguridad',
        'cuidado',
        'generosidad',
        'hogar próspero',
      ],
      reversed: [
        'dependencia',
        'descuido',
        'materialismo',
        'inseguridad financiera',
        'falta de cuidado',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Pents13.jpg',
  },
  {
    slug: 'king-of-pentacles',
    nameEn: 'King of Pentacles',
    nameEs: 'Rey de Oros',
    arcanaType: ArcanaType.MINOR,
    number: 14,
    suit: Suit.PENTACLES,
    courtRank: CourtRank.KING,
    element: Element.EARTH,
    meaningUpright:
      'Prosperidad material maestría, liderazgo empresarial, generosidad con los frutos del trabajo y la sabiduría del hombre de negocios que construyó su reino.',
    meaningReversed:
      'Materialismo que lo consume todo, corrupción, abuso del poder económico y pérdida del sentido más allá del dinero.',
    description:
      'Un rey robusto está sentado en su trono adornado con toros y vides, rodeado de frutos y flores, sosteniendo un cetro y una moneda dorada. Lleva una corona de flores y su manto está decorado con uvas. Representa la maestría del elemento tierra, la prosperidad material ganada con trabajo, la generosidad del que tiene mucho y la sabiduría de gestionar los recursos con visión.',
    keywords: {
      upright: [
        'prosperidad',
        'maestría material',
        'liderazgo',
        'generosidad',
        'negocios',
        'sabiduría práctica',
      ],
      reversed: [
        'materialismo',
        'corrupción',
        'abuso económico',
        'avaricia',
        'pérdida del sentido',
      ],
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Pents14.jpg',
  },
];

/**
 * Todos los Arcanos Menores combinados
 */
export const MINOR_ARCANA_DATA: CardSeedData[] = [
  ...WANDS_CARDS,
  ...CUPS_CARDS,
  ...SWORDS_CARDS,
  ...PENTACLES_CARDS,
];
