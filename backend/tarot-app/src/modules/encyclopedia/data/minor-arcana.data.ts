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
    imageUrl: '/images/tarot/minor/wands/01-ace-of-wands.jpg',
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
    imageUrl: '/images/tarot/minor/wands/02-two-of-wands.jpg',
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
    imageUrl: '/images/tarot/minor/wands/03-three-of-wands.jpg',
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
    imageUrl: '/images/tarot/minor/wands/04-four-of-wands.jpg',
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
    imageUrl: '/images/tarot/minor/wands/05-five-of-wands.jpg',
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
    imageUrl: '/images/tarot/minor/wands/06-six-of-wands.jpg',
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
    imageUrl: '/images/tarot/minor/wands/07-seven-of-wands.jpg',
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
    imageUrl: '/images/tarot/minor/wands/08-eight-of-wands.jpg',
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
    imageUrl: '/images/tarot/minor/wands/09-nine-of-wands.jpg',
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
    imageUrl: '/images/tarot/minor/wands/10-ten-of-wands.jpg',
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
    imageUrl: '/images/tarot/minor/wands/11-page-of-wands.jpg',
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
    imageUrl: '/images/tarot/minor/wands/12-knight-of-wands.jpg',
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
    imageUrl: '/images/tarot/minor/wands/13-queen-of-wands.jpg',
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
    imageUrl: '/images/tarot/minor/wands/14-king-of-wands.jpg',
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
      'Nuevo amor, abundancia emocional, intuición despertada y conexión espiritual profunda. La copa rebosa de sentimientos puros y posibilidades emocionales.',
    meaningReversed:
      'Emociones reprimidas, corazón cerrado, oportunidades de amor rechazadas y bloqueo de la intuición.',
    description:
      'Una mano celestial emerge de las nubes sosteniendo una copa de la que brota agua abundante. Una paloma desciende sosteniendo una oblea. Flores de loto flotan en el estanque de abajo. Representa el nacimiento de sentimientos profundos, la apertura del corazón y el flujo desbordante del amor y la intuición.',
    keywords: {
      upright: [
        'amor',
        'intuición',
        'emoción',
        'abundancia emocional',
        'conexión espiritual',
        'apertura',
      ],
      reversed: [
        'represión',
        'corazón cerrado',
        'rechazo emocional',
        'bloqueo',
        'pérdida de oportunidad',
      ],
    },
    imageUrl: '/images/tarot/minor/cups/01-ace-of-cups.jpg',
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
      'Unión, atracción mutua, asociación amorosa y conexión profunda entre dos personas que se reconocen mutuamente.',
    meaningReversed:
      'Ruptura de relaciones, desconexión emocional, desequilibrio en una asociación y pérdida de la armonía.',
    description:
      'Un hombre y una mujer intercambian copas bajo el símbolo del caduceo coronado por una cabeza de león alada. La escena refleja el intercambio igualitario de amor y la alianza entre dos personas. Representa la unión de corazones, la atracción recíproca y el vínculo profundo que nace cuando dos almas se reconocen.',
    keywords: {
      upright: [
        'unión',
        'amor recíproco',
        'conexión',
        'asociación',
        'armonía',
        'atracción',
      ],
      reversed: [
        'ruptura',
        'desconexión',
        'desequilibrio',
        'conflicto',
        'separación',
      ],
    },
    imageUrl: '/images/tarot/minor/cups/02-two-of-cups.jpg',
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
      'Celebración, amistad, comunidad y alegría compartida. Es el tiempo de festejar con los seres queridos y disfrutar de la abundancia emocional en compañía.',
    meaningReversed:
      'Excesos sociales, frivolidad, chismes entre amigos o distanciamiento de personas cercanas.',
    description:
      'Tres mujeres danzan juntas en un jardín lleno de flores y frutos, alzando sus copas en celebración. Representan la alegría de la amistad femenina, la comunidad y los festejos que celebran la vida y sus bendiciones compartidas entre personas que se quieren.',
    keywords: {
      upright: [
        'celebración',
        'amistad',
        'comunidad',
        'alegría',
        'festejo',
        'apoyo mutuo',
      ],
      reversed: [
        'exceso',
        'frivolidad',
        'chismes',
        'distanciamiento',
        'soledad social',
      ],
    },
    imageUrl: '/images/tarot/minor/cups/03-three-of-cups.jpg',
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
      'Contemplación, apatía emocional, descontento con lo que se tiene e ignorar las oportunidades que el universo presenta.',
    meaningReversed:
      'Despertar de la apatía, aceptar una nueva oportunidad, apertura emocional y salir de la introversión excesiva.',
    description:
      'Un hombre sentado con los brazos cruzados bajo un árbol contempla tres copas ante él mientras ignora una cuarta copa que una mano celestial le ofrece. Representa el descontento, la introspección excesiva y la tendencia a ignorar las oportunidades que nos rodean cuando estamos atrapados en nuestros pensamientos.',
    keywords: {
      upright: [
        'apatía',
        'contemplación',
        'descontento',
        'introspección',
        'oportunidades ignoradas',
        'desengaño',
      ],
      reversed: [
        'apertura',
        'nueva oportunidad',
        'despertar',
        'gratitud',
        'salir del caparazón',
      ],
    },
    imageUrl: '/images/tarot/minor/cups/04-four-of-cups.jpg',
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
      'Pérdida, duelo, decepción y enfoque en lo que se perdió en lugar de ver lo que permanece. Es el tiempo del dolor emocional necesario.',
    meaningReversed:
      'Aceptación del duelo, perdonar el pasado, renovación emocional y capacidad de ver que aún hay razones para seguir adelante.',
    description:
      'Una figura encapuchada y vestida de negro llora frente a tres copas derramadas, sin notar las dos copas que permanecen de pie detrás de ella. Un río fluye entre ella y un castillo. Representa el enfoque en las pérdidas y decepciones mientras se ignoran las bendiciones que todavía están presentes.',
    keywords: {
      upright: [
        'pérdida',
        'duelo',
        'decepción',
        'tristeza',
        'lamento',
        'foco en lo negativo',
      ],
      reversed: [
        'aceptación',
        'perdón',
        'renovación',
        'mirar hacia adelante',
        'sanación emocional',
      ],
    },
    imageUrl: '/images/tarot/minor/cups/05-five-of-cups.jpg',
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
      'Nostalgia, recuerdos del pasado, inocencia infantil y reconexión con la alegría simple de los primeros años.',
    meaningReversed:
      'Vivir atrapado en el pasado, idealización de tiempos idos y dificultad para avanzar hacia el presente y el futuro.',
    description:
      'Un niño mayor le ofrece flores en una copa a una niña más pequeña en el jardín de una antigua mansión. Otras copas llenas de flores los rodean. Representa los recuerdos dulces de la infancia, la nostalgia sana, los reencuentros con personas del pasado y la inocencia recuperada.',
    keywords: {
      upright: [
        'nostalgia',
        'recuerdos',
        'infancia',
        'inocencia',
        'reencuentro',
        'pasado feliz',
      ],
      reversed: [
        'pasado idealizado',
        'atrapado en recuerdos',
        'incapacidad de avanzar',
        'añoranza dañina',
        'regresión',
      ],
    },
    imageUrl: '/images/tarot/minor/cups/06-six-of-cups.jpg',
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
      'Ilusiones, ensoñación, múltiples opciones abrumadoras y confusión entre lo que es real y lo que es deseo o fantasía.',
    meaningReversed:
      'Claridad entre la fantasía y la realidad, toma de decisiones con fundamento y enfoque en metas alcanzables.',
    description:
      'Una figura contempla siete copas flotando en las nubes, cada una conteniendo algo diferente: una serpiente, un castillo, una corona, un dragón, una figura cubierta, joyas y una cabeza laureada. Representa la multiplicidad de ilusiones, los sueños no anclados en la realidad y la dificultad de elegir cuando todo parece posible.',
    keywords: {
      upright: [
        'ilusiones',
        'fantasía',
        'confusión',
        'opciones',
        'ensoñación',
        'wishful thinking',
      ],
      reversed: [
        'claridad',
        'realismo',
        'decisión',
        'enfoque',
        'discernimiento',
        'propósito',
      ],
    },
    imageUrl: '/images/tarot/minor/cups/07-seven-of-cups.jpg',
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
      'Abandonar lo que ya no satisface, búsqueda de algo más profundo y el coraje de dejar atrás lo conocido aunque sea difícil.',
    meaningReversed:
      'Miedo a dejar ir, apego a situaciones agotadas y postergación de una partida necesaria.',
    description:
      'Una figura con capa roja y bastón camina de espaldas hacia montañas oscuras bajo una luna menguante, dejando atrás ocho copas apiladas pero incompletas. Representa la decisión valiente de buscar algo más significativo, de abandonar lo familiar aunque funcione y de responder al llamado de una vida más auténtica.',
    keywords: {
      upright: [
        'abandono',
        'búsqueda',
        'partida',
        'crecimiento',
        'dejar ir',
        'profundidad',
      ],
      reversed: [
        'miedo a dejar ir',
        'apego',
        'postergación',
        'quedarse por comodidad',
        'resignación',
      ],
    },
    imageUrl: '/images/tarot/minor/cups/08-eight-of-cups.jpg',
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
      'Satisfacción emocional, deseos cumplidos, contentamiento y el disfrute pleno de los placeres de la vida. Es la carta del deseo que se hace realidad.',
    meaningReversed:
      'Insatisfacción a pesar de los logros, materialismo vacío y deseos cumplidos que no aportan la felicidad esperada.',
    description:
      'Un hombre satisfecho y de brazos cruzados está sentado frente a un arco adornado con nueve copas. Su postura y sonrisa expresan contentamiento total. Conocida como la "carta del deseo", representa la satisfacción plena, los sueños realizados y el goce de los frutos del propio esfuerzo y las bendiciones de la vida.',
    keywords: {
      upright: [
        'satisfacción',
        'deseos cumplidos',
        'contentamiento',
        'placer',
        'abundancia',
        'gratitud',
      ],
      reversed: [
        'insatisfacción',
        'materialismo',
        'vacío interno',
        'deseos sin sentido',
        'apego',
      ],
    },
    imageUrl: '/images/tarot/minor/cups/09-nine-of-cups.jpg',
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
      'Plenitud familiar, armonía en el hogar, felicidad duradera y la realización del ideal de amor en comunidad.',
    meaningReversed:
      'Conflictos familiares, expectativas no cumplidas y armonía que se rompe en el entorno más cercano.',
    description:
      'Una pareja se abraza mientras sus hijos danzan en el jardín de su hermoso hogar bajo un arco iris adornado con diez copas. Representa la plenitud emocional en su forma más completa: el amor familiar, la armonía del hogar y la felicidad compartida que trasciende lo individual.',
    keywords: {
      upright: [
        'plenitud',
        'familia',
        'armonía',
        'felicidad',
        'hogar',
        'amor duradero',
      ],
      reversed: [
        'conflicto familiar',
        'expectativas',
        'armonía rota',
        'desunión',
        'tristeza familiar',
      ],
    },
    imageUrl: '/images/tarot/minor/cups/10-ten-of-cups.jpg',
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
      'Mensajes emocionales, intuición juvenil, creatividad imaginativa y apertura a las señales del mundo interior.',
    meaningReversed:
      'Inmadurez emocional, sueños sin fundamento y sensibilidad que desborda los límites saludables.',
    description:
      'Un joven elegante sostiene una copa de la que asoma un pez que parece hablarle. El océano se agita detrás de él. Representa la sensibilidad intuitiva, la apertura a los mensajes del subconsciente, la creatividad imaginativa y la disponibilidad para escuchar al corazón con inocencia y asombro.',
    keywords: {
      upright: [
        'intuición',
        'creatividad',
        'sensibilidad',
        'mensajes',
        'imaginación',
        'apertura',
      ],
      reversed: [
        'inmadurez',
        'sueños irreales',
        'sensibilidad excesiva',
        'fantasía',
        'falta de dirección',
      ],
    },
    imageUrl: '/images/tarot/minor/cups/11-page-of-cups.jpg',
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
      'Romanticismo, propuestas emocionales, mensajes del corazón y la búsqueda de lo bello y lo sublime en la vida.',
    meaningReversed:
      'Moodiness, decepción romántica, promesas que no se cumplen y fantasía que reemplaza a la acción real.',
    description:
      'Un caballero avanza lentamente sobre su caballo blanco, sosteniendo una copa con delicadeza frente a él. Su yelmo y capa están adornados con peces y alas. Es el mensajero del amor, el galán romántico que lleva los sueños del corazón hacia la realidad con elegancia y sentimiento.',
    keywords: {
      upright: [
        'romanticismo',
        'propuesta',
        'encanto',
        'mensaje de amor',
        'sensibilidad',
        'creatividad',
      ],
      reversed: [
        'decepción',
        'promesas rotas',
        'moodiness',
        'fantasía sin base',
        'manipulación emocional',
      ],
    },
    imageUrl: '/images/tarot/minor/cups/12-knight-of-cups.jpg',
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
      'Empatía profunda, compasión, intuición desarrollada y la capacidad de nutrir emocionalmente a los demás con amor incondicional.',
    meaningReversed:
      'Dependencia emocional, inestabilidad, manipulación sutil y pérdida de los propios límites por exceso de empatía.',
    description:
      'Una reina de aspecto soñador está sentada en un trono ornamentado sobre el agua, contemplando una copa cerrada y elaborada que sostiene con ambas manos. Su trono está decorado con ninfas del agua y peces. Representa la maestría del mundo emocional, la sabiduría intuitiva y la capacidad de sostener y sanar emocionalmente a quienes la rodean.',
    keywords: {
      upright: [
        'empatía',
        'compasión',
        'intuición',
        'nurtura',
        'sabiduría emocional',
        'amor incondicional',
      ],
      reversed: [
        'dependencia',
        'inestabilidad',
        'manipulación',
        'límites perdidos',
        'absorción de energía',
      ],
    },
    imageUrl: '/images/tarot/minor/cups/13-queen-of-cups.jpg',
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
      'Madurez emocional, dominio de los sentimientos, compasión y la capacidad de liderar con el corazón sin perder la cabeza.',
    meaningReversed:
      'Represión emocional, manipulación, inestabilidad bajo presión y uso de la frialdad como mecanismo de defensa.',
    description:
      'Un rey de aspecto sereno está sentado en un trono que flota sobre el mar agitado, con una copa en una mano y un cetro en la otra. A su alrededor el mar es turbulento pero él permanece en calma. Representa el dominio maduro de las emociones, la sabiduría compasiva y la capacidad de mantener la serenidad en medio del caos.',
    keywords: {
      upright: [
        'madurez emocional',
        'compasión',
        'dominio',
        'serenidad',
        'liderazgo con el corazón',
        'sabiduría',
      ],
      reversed: [
        'represión',
        'manipulación',
        'inestabilidad',
        'frialdad',
        'desconexión emocional',
      ],
    },
    imageUrl: '/images/tarot/minor/cups/14-king-of-cups.jpg',
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
    imageUrl: '/images/tarot/minor/swords/01-ace-of-swords.jpg',
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
    imageUrl: '/images/tarot/minor/swords/02-two-of-swords.jpg',
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
    imageUrl: '/images/tarot/minor/swords/03-three-of-swords.jpg',
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
    imageUrl: '/images/tarot/minor/swords/04-four-of-swords.jpg',
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
    imageUrl: '/images/tarot/minor/swords/05-five-of-swords.jpg',
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
    imageUrl: '/images/tarot/minor/swords/06-six-of-swords.jpg',
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
    imageUrl: '/images/tarot/minor/swords/07-seven-of-swords.jpg',
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
    imageUrl: '/images/tarot/minor/swords/08-eight-of-swords.jpg',
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
    imageUrl: '/images/tarot/minor/swords/09-nine-of-swords.jpg',
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
    imageUrl: '/images/tarot/minor/swords/10-ten-of-swords.jpg',
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
    imageUrl: '/images/tarot/minor/swords/11-page-of-swords.jpg',
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
    imageUrl: '/images/tarot/minor/swords/12-knight-of-swords.jpg',
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
    imageUrl: '/images/tarot/minor/swords/13-queen-of-swords.jpg',
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
    imageUrl: '/images/tarot/minor/swords/14-king-of-swords.jpg',
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
    imageUrl: '/images/tarot/minor/pentacles/01-ace-of-pentacles.jpg',
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
    imageUrl: '/images/tarot/minor/pentacles/02-two-of-pentacles.jpg',
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
    imageUrl: '/images/tarot/minor/pentacles/03-three-of-pentacles.jpg',
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
    imageUrl: '/images/tarot/minor/pentacles/04-four-of-pentacles.jpg',
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
    imageUrl: '/images/tarot/minor/pentacles/05-five-of-pentacles.jpg',
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
    imageUrl: '/images/tarot/minor/pentacles/06-six-of-pentacles.jpg',
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
    imageUrl: '/images/tarot/minor/pentacles/07-seven-of-pentacles.jpg',
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
    imageUrl: '/images/tarot/minor/pentacles/08-eight-of-pentacles.jpg',
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
    imageUrl: '/images/tarot/minor/pentacles/09-nine-of-pentacles.jpg',
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
    imageUrl: '/images/tarot/minor/pentacles/10-ten-of-pentacles.jpg',
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
    imageUrl: '/images/tarot/minor/pentacles/11-page-of-pentacles.jpg',
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
    imageUrl: '/images/tarot/minor/pentacles/12-knight-of-pentacles.jpg',
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
    imageUrl: '/images/tarot/minor/pentacles/13-queen-of-pentacles.jpg',
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
    imageUrl: '/images/tarot/minor/pentacles/14-king-of-pentacles.jpg',
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
