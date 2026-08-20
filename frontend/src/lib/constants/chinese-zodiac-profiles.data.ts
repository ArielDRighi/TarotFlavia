/**
 * Perfiles estáticos de los 12 animales del zodiaco chino (T-SEO-002).
 *
 * Es el contenido **indexable** de `/horoscopo-chino/[animal]`: no depende de la
 * API, de la sesión ni de la query string, así que se renderiza en el servidor y
 * llega completo al crawler. La predicción del año —que sí depende del elemento
 * elegido y de la sesión— sigue resolviéndose en el cliente.
 *
 * Mismo criterio que `service-intros.data.ts`: contenido rico, específico y
 * veraz por entrada, centralizado en datos tipados en vez de incrustado en JSX.
 *
 * ⚠️ El texto de cada animal debe ser **único**: doce URLs con el mismo párrafo
 * son contenido duplicado para Google, que fue el problema original.
 * `chinese-zodiac-profiles.data.test.ts` lo verifica.
 *
 * **Fuente de los datos tradicionales** (no inventar al editarlos):
 * - `compatibility`: los cuatro triángulos de afinidad del zodiaco chino más el
 *   par de "amigos secretos", y como choque el opuesto de la rueda (6 posiciones).
 *   Coinciden con `compatibleWith` / `incompatibleWith` del backend en
 *   `backend/tarot-app/src/common/utils/chinese-zodiac.utils.ts`. Si cambian allá,
 *   cambian acá: los tests verifican la coherencia interna, no la del backend.
 * - `luck.numbers` / `luck.colors` / `luck.direction`: tablas tradicionales de
 *   números, colores y direcciones favorables por animal. La fuente no es única y
 *   varía entre escuelas; la ficha los presenta como tradición, no como certeza.
 * - `element`: el elemento fijo sale de `CHINESE_ZODIAC_INFO`, no se repite acá.
 */

import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

/** Un rasgo de personalidad: término destacado + su explicación. */
export interface ChineseZodiacTrait {
  /** Nombre del rasgo (se muestra en negrita). */
  term: string;
  /** Explicación del rasgo. */
  description: string;
}

/** Datos tradicionales de la suerte de un animal. */
export interface ChineseZodiacLuck {
  /** Números afortunados según la tradición. */
  numbers: number[];
  /** Colores afortunados, en español. */
  colors: string[];
  /** Dirección favorable (feng shui), en español. */
  direction: string;
}

/** Afinidades y choques de un animal con el resto de la rueda. */
export interface ChineseZodiacCompatibility {
  /**
   * Animales afines: los dos del mismo triángulo de afinidad más el "amigo
   * secreto" (el par que suma doce en la rueda). La relación es recíproca.
   */
  best: ChineseZodiacAnimal[];
  /** Animales en choque: el opuesto de la rueda, a seis posiciones. */
  challenging: ChineseZodiacAnimal[];
}

/** Ficha estática de un animal del zodiaco chino. */
export interface ChineseZodiacProfile {
  /** Titular corto que resume el arquetipo. */
  tagline: string;
  /** Dos párrafos de introducción. */
  intro: [string, string];
  /** Rasgos de personalidad explicados. */
  personality: ChineseZodiacTrait[];
  /** Fortalezas, en etiquetas cortas. */
  strengths: string[];
  /** Desafíos, en etiquetas cortas. */
  challenges: string[];
  /** Cómo vive los vínculos afectivos. */
  love: string;
  /** Cómo se mueve en el trabajo y con el dinero. */
  career: string;
  /** Afinidades y choques. */
  compatibility: ChineseZodiacCompatibility;
  /** Números, colores y dirección tradicionales. */
  luck: ChineseZodiacLuck;
}

/**
 * Mínimo de palabras propias que debe aportar cada perfil.
 *
 * El umbral del guardarraíl de T-SEO-001 es 120 palabras **de la página entera**,
 * y el criterio de aceptación de T-SEO-002 son 150. Se pide 200 acá para dejar
 * margen: la ficha no es todo lo que la página renderiza, pero sí lo único
 * garantizado cuando la API no responde.
 */
export const MIN_PROFILE_WORDS = 200;

export const CHINESE_ZODIAC_PROFILES: Record<ChineseZodiacAnimal, ChineseZodiacProfile> = {
  [ChineseZodiacAnimal.RAT]: {
    tagline: 'El estratega que ve la oportunidad antes que nadie',
    intro: [
      'La Rata abre el ciclo de doce años del zodiaco chino, y esa primera posición la define: es el signo de quien llega temprano, estudia el terreno y se queda con la mejor jugada. La tradición la asocia al agua que se filtra por cualquier rendija, con una inteligencia práctica que resuelve mientras el resto todavía evalúa.',
      'Quien nace bajo la Rata suele tener memoria fina para los detalles y un radar afinado para el riesgo. No es un signo temerario: acumula, guarda y planifica, y por eso la tradición china lo vincula a la prosperidad doméstica y al ahorro que sostiene una casa en los años difíciles.',
    ],
    personality: [
      {
        term: 'Astucia práctica',
        description:
          'Lee rápido las reglas de cualquier situación y encuentra el atajo que nadie había mirado. No improvisa por gusto, sino porque ya calculó las alternativas.',
      },
      {
        term: 'Sociabilidad selectiva',
        description:
          'Se mueve con soltura en grupos grandes, pero reserva su confianza para un círculo chico y comprobado, que después cuida durante años.',
      },
      {
        term: 'Prudencia con los recursos',
        description:
          'Guarda para el invierno por instinto. Esa cautela la vuelve una consejera natural en asuntos de dinero, aunque a veces le cueste disfrutar lo que consiguió.',
      },
    ],
    strengths: ['Ingenio veloz', 'Encanto social', 'Olfato para la oportunidad', 'Constancia'],
    challenges: ['Desconfianza', 'Necesidad de controlar', 'Crítica afilada', 'Cuesta delegar'],
    love: 'En pareja es leal y protectora, aunque tarda en bajar la guardia: necesita pruebas antes que promesas. Cuando confía se vuelve un sostén cotidiano y muy concreto, más de gestos que de discursos largos.',
    career:
      'Rinde en oficios que premian leer rápido el contexto: comercio, negociación, análisis, comunicación, administración de recursos. Trabaja mejor con margen de maniobra que con procedimientos rígidos, y detecta la falla de un plan antes de que se ejecute.',
    compatibility: {
      best: [ChineseZodiacAnimal.DRAGON, ChineseZodiacAnimal.MONKEY, ChineseZodiacAnimal.OX],
      challenging: [ChineseZodiacAnimal.HORSE],
    },
    luck: { numbers: [2, 3], colors: ['Azul', 'Dorado', 'Verde'], direction: 'Sudeste' },
  },

  [ChineseZodiacAnimal.OX]: {
    tagline: 'La fuerza tranquila que termina lo que empieza',
    intro: [
      'El Buey es el signo del trabajo sostenido. Donde otros buscan el atajo, él elige el surco derecho y lo recorre entero, sin apuro y sin abandonarlo a mitad de camino. La tradición lo asocia a la tierra labrada: nada crece de un día para el otro, pero lo que crece se queda.',
      'Su prestigio en el zodiaco chino viene de la confiabilidad. Cuando el Buey da una palabra, esa palabra vale, y su entorno lo sabe: es el signo al que se le encargan las cosas que no pueden fallar. La contracara es una terquedad honesta que no se negocia con argumentos apresurados.',
    ],
    personality: [
      {
        term: 'Perseverancia',
        description:
          'Sostiene el esfuerzo mucho después de que se apagó el entusiasmo inicial. Los proyectos largos son su terreno natural, no su castigo.',
      },
      {
        term: 'Integridad',
        description:
          'Prefiere una verdad incómoda a una diplomacia hueca. Esa franqueza le gana respeto duradero y algún enemigo circunstancial.',
      },
      {
        term: 'Necesidad de orden',
        description:
          'Trabaja mejor con reglas claras y tiempos previsibles. El caos no lo paraliza, pero lo agota más de lo que admite.',
      },
    ],
    strengths: ['Confiabilidad', 'Paciencia', 'Fuerza de voluntad', 'Sentido de la justicia'],
    challenges: ['Terquedad', 'Rigidez frente al cambio', 'Poca expresividad', 'Exceso de trabajo'],
    love: 'Ama sin espectáculo: aparece, cumple y se queda. No promete lo que no piensa sostener, y necesita una pareja que sepa leer el afecto en la constancia más que en las palabras o los gestos vistosos.',
    career:
      'Se destaca en la construcción, la agricultura, la producción, la contabilidad, la ingeniería y cualquier oficio donde el resultado se mida en obra terminada. Su valor aparece con el tiempo: es el que sigue firme cuando el proyecto deja de ser novedad.',
    compatibility: {
      best: [ChineseZodiacAnimal.SNAKE, ChineseZodiacAnimal.ROOSTER, ChineseZodiacAnimal.RAT],
      challenging: [ChineseZodiacAnimal.GOAT],
    },
    luck: { numbers: [1, 9], colors: ['Blanco', 'Amarillo', 'Verde'], direction: 'Norte' },
  },

  [ChineseZodiacAnimal.TIGER]: {
    tagline: 'El coraje que abre camino donde no había sendero',
    intro: [
      'El Tigre es el signo del arranque. Entra a las situaciones de frente, con una autoridad natural que no necesita cargo ni permiso, y suele ser el primero en decir en voz alta lo que los demás piensan en silencio. La tradición china lo considera protector: su rugido espanta lo que amenaza a los suyos.',
      'Vive en ciclos de intensidad. Se entrega por completo a lo que lo apasiona y pierde interés de golpe cuando algo se vuelve rutina. Ese vaivén explica tanto sus logros grandes como sus proyectos a medio terminar, y lo vuelve un compañero estimulante y algo imprevisible.',
    ],
    personality: [
      {
        term: 'Valentía frontal',
        description:
          'No esquiva el conflicto cuando cree que hay una injusticia. Prefiere la confrontación clara a la incomodidad que se acumula sin nombrarse.',
      },
      {
        term: 'Liderazgo magnético',
        description:
          'Arrastra voluntades por convicción y no por jerarquía. La gente lo sigue porque cree en su impulso, no porque le deba obediencia.',
      },
      {
        term: 'Impaciencia',
        description:
          'Le cuesta esperar tiempos ajenos. Cuando la energía no encuentra salida, se transforma en irritación o en un cambio brusco de rumbo.',
      },
    ],
    strengths: ['Coraje', 'Generosidad', 'Iniciativa', 'Carisma'],
    challenges: ['Impulsividad', 'Orgullo', 'Aburrimiento fácil', 'Reacciones desmedidas'],
    love: 'Ama con intensidad y quiere reciprocidad en el mismo tono. Necesita admirar a su pareja y sentirse admirado; la rutina lo apaga más rápido que cualquier discusión, y una vida compartida sin proyecto lo inquieta.',
    career:
      'Brilla en roles de arranque y de exposición: emprender, dirigir equipos, competir, defender causas, actuar en público, trabajar en emergencias. Rinde poco en estructuras donde debe pedir permiso para cada decisión, y mucho cuando se le confía el rumbo.',
    compatibility: {
      best: [ChineseZodiacAnimal.HORSE, ChineseZodiacAnimal.DOG, ChineseZodiacAnimal.PIG],
      challenging: [ChineseZodiacAnimal.MONKEY],
    },
    luck: { numbers: [1, 3, 4], colors: ['Azul', 'Gris', 'Naranja'], direction: 'Este' },
  },

  [ChineseZodiacAnimal.RABBIT]: {
    tagline: 'La elegancia que resuelve sin levantar la voz',
    intro: [
      'El Conejo consigue por la vía suave lo que otros persiguen a los empujones. Es diplomático por naturaleza, atento al clima de una habitación antes de que alguien hable, y encuentra la salida elegante de los conflictos que parecían trabados. La tradición lo asocia a la Luna, a la prudencia y a una suerte que acompaña a quien no fuerza.',
      'Su sensibilidad es su radar y también su punto débil: registra tensiones muy finas y se retira cuando el ambiente se vuelve hostil. Necesita belleza, calma y un refugio propio para recuperar energía, y desde ahí sostiene a los suyos con una constancia silenciosa.',
    ],
    personality: [
      {
        term: 'Diplomacia',
        description:
          'Negocia sin dejar heridos. Encuentra la formulación que permite a las dos partes ceder algo sin sentir que perdieron la dignidad.',
      },
      {
        term: 'Sensibilidad estética',
        description:
          'Le importa cómo se ven y cómo se sienten los espacios y los vínculos. La armonía no le resulta un lujo, sino una condición para funcionar.',
      },
      {
        term: 'Aversión al conflicto',
        description:
          'Prefiere retirarse antes que discutir, y ese silencio a veces deja problemas sin resolver durante mucho más tiempo que una conversación difícil.',
      },
    ],
    strengths: ['Cortesía', 'Intuición social', 'Paciencia', 'Buen gusto'],
    challenges: ['Evita confrontar', 'Susceptibilidad', 'Indecisión', 'Se guarda las molestias'],
    love: 'Busca ternura, previsibilidad y un vínculo sin sobresaltos. Es un compañero atento a los detalles chicos, pero se aleja en silencio si siente dureza o brusquedad sostenida en el trato cotidiano.',
    career:
      'Funciona muy bien en diseño, cuidado de personas, educación, mediación, atención al público, diplomacia y todo lo que requiera trato fino con personas. Prefiere ambientes cordiales y estables, donde su cuidado del detalle no compita contra la urgencia permanente.',
    compatibility: {
      best: [ChineseZodiacAnimal.GOAT, ChineseZodiacAnimal.PIG, ChineseZodiacAnimal.DOG],
      challenging: [ChineseZodiacAnimal.ROOSTER],
    },
    luck: { numbers: [3, 4, 6], colors: ['Rosa', 'Violeta', 'Azul'], direction: 'Sudeste' },
  },

  [ChineseZodiacAnimal.DRAGON]: {
    tagline: 'La ambición que arrastra a los demás con su entusiasmo',
    intro: [
      'El Dragón es el único animal mítico de la rueda china y el más celebrado: nacer en su año se considera una bendición. Encarna la energía que se muestra, el gesto grande, la confianza que convence antes de tener pruebas. Cuando entra en una sala, algo cambia en la temperatura del ambiente.',
      'Piensa en grande y detesta lo mediocre, propio o ajeno. Esa exigencia lo lleva lejos y también lo vuelve impaciente con los tiempos lentos y con las tareas menudas. Su lealtad, cuando la entrega, es total y protectora: defiende a los suyos con la misma desmesura con la que persigue sus proyectos.',
    ],
    personality: [
      {
        term: 'Confianza expansiva',
        description:
          'Cree en lo que se propone antes de tener evidencia, y ese entusiasmo contagia a quienes lo rodean hasta volver posible lo improbable.',
      },
      {
        term: 'Generosidad señorial',
        description:
          'Da sin llevar la cuenta, tanto tiempo como recursos, y espera a cambio reconocimiento más que devolución material.',
      },
      {
        term: 'Intolerancia al detalle',
        description:
          'Se aburre con la letra chica y la delega apenas puede. Muchos de sus tropiezos nacen ahí y no en la idea original.',
      },
    ],
    strengths: ['Visión amplia', 'Energía', 'Generosidad', 'Determinación'],
    challenges: ['Soberbia', 'Impaciencia', 'Todo o nada', 'Descuida lo pequeño'],
    love: 'Conquista con intensidad y necesita sentirse elegido cada día. Es un compañero espléndido y presente, siempre que la pareja tolere su necesidad de brillar y le devuelva admiración sincera.',
    career:
      'Se realiza donde hay escenario y decisión: dirección de empresas, política, espectáculo, arquitectura, ventas de alto vuelo, proyectos fundacionales. Necesita autonomía real; un cargo decorativo lo apaga más rápido que la falta de dinero.',
    compatibility: {
      best: [ChineseZodiacAnimal.RAT, ChineseZodiacAnimal.MONKEY, ChineseZodiacAnimal.ROOSTER],
      challenging: [ChineseZodiacAnimal.DOG],
    },
    luck: { numbers: [1, 6, 7], colors: ['Dorado', 'Plateado', 'Blanco'], direction: 'Oeste' },
  },

  [ChineseZodiacAnimal.SNAKE]: {
    tagline: 'La sabiduría que observa en silencio y actúa una sola vez',
    intro: [
      'La Serpiente es el signo de la reserva. Habla poco, mira mucho y guarda para sí lo que fue entendiendo, hasta que llega el momento exacto de moverse. La tradición china la asocia a la sabiduría, al misterio y a una elegancia que no necesita mostrarse para imponerse.',
      'Detrás de esa calma hay una mente analítica que rara vez improvisa. Cuando decide, ya evaluó el escenario completo, y por eso sus movimientos parecen certeros a quien no vio el trabajo previo. Su intimidad es un territorio cerrado al que solo entran unos pocos elegidos.',
    ],
    personality: [
      {
        term: 'Perspicacia',
        description:
          'Percibe intenciones detrás de las palabras. Es difícil venderle una historia armada, porque escucha más los silencios que los argumentos.',
      },
      {
        term: 'Discreción',
        description:
          'Administra la información con cuidado, incluso la propia. Prefiere que lo subestimen antes que exponer una carta sin necesidad.',
      },
      {
        term: 'Posesividad',
        description:
          'Se apega con fuerza a lo que considera suyo y le cuesta compartirlo. Los celos aparecen antes que el reproche, y no siempre se dicen.',
      },
    ],
    strengths: ['Intuición', 'Elegancia', 'Concentración', 'Autocontrol'],
    challenges: ['Desconfianza', 'Reserva excesiva', 'Rencor', 'Tendencia a aislarse'],
    love: 'Ama con hondura y exclusividad, sin necesidad de demostraciones públicas. Requiere pruebas de lealtad y una intimidad protegida; la traición, aun pequeña, la deja marcada mucho tiempo.',
    career:
      'Se destaca en investigación, psicología, finanzas, derecho, filosofía y todo oficio que premie el análisis paciente. Es una excelente asesora entre bambalinas y una negociadora temible cuando le toca cerrar el acuerdo.',
    compatibility: {
      best: [ChineseZodiacAnimal.OX, ChineseZodiacAnimal.ROOSTER, ChineseZodiacAnimal.MONKEY],
      challenging: [ChineseZodiacAnimal.PIG],
    },
    luck: {
      numbers: [2, 8, 9],
      colors: ['Rojo', 'Negro', 'Amarillo claro'],
      direction: 'Sudoeste',
    },
  },

  [ChineseZodiacAnimal.HORSE]: {
    tagline: 'La libertad hecha movimiento',
    intro: [
      'El Caballo necesita horizonte. Es entusiasta, franco y sociable, y se enciende con lo que recién empieza: un viaje, una idea, una conversación con alguien que acaba de conocer. La tradición china lo asocia al fuego que se ve de lejos y al galope que no tolera la brida apretada.',
      'Su honestidad es directa, casi sin filtro, y eso lo hace transparente y a veces imprudente. Aprende haciendo, no leyendo instrucciones, y necesita sentir que puede irse para quedarse a gusto: la libertad no es un capricho suyo, es la condición de su compromiso.',
    ],
    personality: [
      {
        term: 'Entusiasmo contagioso',
        description:
          'Levanta el ánimo de un grupo con su energía y su humor. Es el que propone la salida y consigue que los demás salgan del sillón.',
      },
      {
        term: 'Franqueza',
        description:
          'Dice lo que piensa en el momento en que lo piensa. Ahorra malentendidos y de vez en cuando abre alguno nuevo por falta de rodeos.',
      },
      {
        term: 'Inquietud',
        description:
          'Cambia de foco cuando algo se vuelve previsible. Sostener lo empezado le exige un esfuerzo consciente que no le nace solo.',
      },
    ],
    strengths: ['Optimismo', 'Sociabilidad', 'Independencia', 'Adaptabilidad'],
    challenges: ['Dispersión', 'Impaciencia', 'Habla de más', 'Se aburre pronto'],
    love: 'Se enamora rápido y con ganas, y sostiene el vínculo mientras haya aire y proyectos por delante. El control lo espanta; la complicidad y las aventuras compartidas lo fijan mucho más que las exigencias.',
    career:
      'Rinde en ventas, turismo, deporte, transporte, comunicación, capacitación y cualquier trabajo con movimiento y contacto humano. La oficina sin ventanas y la tarea repetitiva lo desgastan, aun cuando paguen bien.',
    compatibility: {
      best: [ChineseZodiacAnimal.TIGER, ChineseZodiacAnimal.DOG, ChineseZodiacAnimal.GOAT],
      challenging: [ChineseZodiacAnimal.RAT],
    },
    luck: { numbers: [2, 3, 7], colors: ['Amarillo', 'Verde'], direction: 'Sur' },
  },

  [ChineseZodiacAnimal.GOAT]: {
    tagline: 'La sensibilidad que cuida y crea',
    intro: [
      'La Cabra es el signo del cuidado. Percibe el estado de ánimo ajeno antes de que se declare y acomoda su conducta para que nadie quede afuera. La tradición china la asocia a la compasión, al arte y a una vida de rebaño donde el bienestar del grupo pesa más que el propio protagonismo.',
      'Es creativa y de mundo interior amplio, con una imaginación que necesita canal. Cuando no lo encuentra, esa energía se vuelve hacia adentro en forma de preocupación. Prefiere la seguridad de lo conocido y florece en entornos amables donde no tiene que defenderse todo el tiempo.',
    ],
    personality: [
      {
        term: 'Empatía',
        description:
          'Se pone en el lugar del otro casi sin esfuerzo y ofrece consuelo concreto. Es a quien el grupo llama cuando algo duele de verdad.',
      },
      {
        term: 'Creatividad',
        description:
          'Piensa en imágenes, texturas y climas. Su aporte aparece en cómo se siente un resultado, no solo en si funciona.',
      },
      {
        term: 'Necesidad de contención',
        description:
          'La crítica dura la desarma más de lo que muestra. Necesita un entorno que le confirme su valor para arriesgarse a proponer.',
      },
    ],
    strengths: ['Amabilidad', 'Imaginación', 'Lealtad afectiva', 'Sentido estético'],
    challenges: ['Preocupación crónica', 'Indecisión', 'Piel fina', 'Dependencia emocional'],
    love: 'Se entrega con una devoción cálida y muy atenta a lo cotidiano. Necesita palabras de afirmación y un vínculo estable; la frialdad o la ironía sostenida le hacen más daño que una pelea abierta.',
    career:
      'Encuentra su lugar en el arte, el diseño, la enseñanza, la enfermería, la gastronomía, la jardinería y los oficios de cuidado. Trabaja mejor acompañada que al frente, y su aporte se nota en la calidad del clima además del resultado.',
    compatibility: {
      best: [ChineseZodiacAnimal.RABBIT, ChineseZodiacAnimal.PIG, ChineseZodiacAnimal.HORSE],
      challenging: [ChineseZodiacAnimal.OX],
    },
    luck: { numbers: [2, 7], colors: ['Verde', 'Rojo', 'Violeta'], direction: 'Norte' },
  },

  [ChineseZodiacAnimal.MONKEY]: {
    tagline: 'El ingenio que encuentra la solución impensada',
    intro: [
      'El Mono resuelve jugando. Es curioso, veloz y de una versatilidad que le permite entrar y salir de cualquier tema con soltura, casi siempre con humor de por medio. La tradición china lo asocia a la inventiva y a la astucia que se ríe del problema mientras lo desarma pieza por pieza.',
      'Aprende por experimentación y se aburre cuando ya entendió cómo funciona algo. Ese apetito de novedad lo hace ingenioso y a veces inconstante: acumula habilidades dispares y necesita disciplina prestada para convertirlas en un oficio profundo en lugar de una colección de trucos.',
    ],
    personality: [
      {
        term: 'Inventiva',
        description:
          'Encuentra soluciones laterales que a nadie se le habían ocurrido, y suele llegar antes por un camino que parecía absurdo.',
      },
      {
        term: 'Humor',
        description:
          'Desactiva tensiones con una broma en el momento justo. Su liviandad es una herramienta social, no una falta de seriedad.',
      },
      {
        term: 'Inquietud mental',
        description:
          'Necesita estímulo constante. Sin desafíos nuevos empieza a moverse por moverse, y ahí llegan los cambios innecesarios.',
      },
    ],
    strengths: ['Creatividad', 'Rapidez mental', 'Sociabilidad', 'Versatilidad'],
    challenges: ['Inconstancia', 'Picardía', 'Dificultad para profundizar', 'Impaciencia'],
    love: 'Enamora con juego, conversación y sorpresas. Necesita una pareja que le siga el ritmo y no le pida solemnidad; el vínculo se sostiene mientras haya complicidad y risas, y se enfría con la rutina rígida.',
    career:
      'Se destaca en tecnología, publicidad, comercio, entretenimiento, ingeniería y consultoría, donde el problema cambia seguido. Es un solucionador excelente en la urgencia y necesita apoyo para las etapas largas de mantenimiento.',
    compatibility: {
      best: [ChineseZodiacAnimal.RAT, ChineseZodiacAnimal.DRAGON, ChineseZodiacAnimal.SNAKE],
      challenging: [ChineseZodiacAnimal.TIGER],
    },
    luck: { numbers: [1, 7, 8], colors: ['Blanco', 'Dorado', 'Azul'], direction: 'Noroeste' },
  },

  [ChineseZodiacAnimal.ROOSTER]: {
    tagline: 'La precisión que anuncia el día en punto',
    intro: [
      'El Gallo es el signo del orden visible. Puntual, observador y directo, canta a la hora exacta y espera que el mundo responda con la misma exactitud. La tradición china lo asocia a la vigilancia: es quien avisa, quien nota lo que falta y quien no deja pasar el error por comodidad.',
      'Cuida la forma tanto como el fondo: su apariencia, su discurso y su trabajo llevan la misma marca de prolijidad. Esa exigencia lo vuelve confiable y, cuando se le va la mano, crítico de más. Detrás de la franqueza hay un compromiso real con hacer las cosas bien.',
    ],
    personality: [
      {
        term: 'Meticulosidad',
        description:
          'Revisa lo que otros dan por hecho y encuentra la inconsistencia. Su ojo para el detalle evita problemas que nadie llegó a ver.',
      },
      {
        term: 'Franqueza directa',
        description:
          'Dice lo que observa sin adornos. Se agradece cuando hay algo en juego y molesta cuando el otro esperaba contención.',
      },
      {
        term: 'Orgullo del trabajo propio',
        description:
          'Le importa el reconocimiento de lo que hizo bien. No busca aplauso vacío, sino constancia de que su esfuerzo se registró.',
      },
    ],
    strengths: ['Organización', 'Honestidad', 'Puntualidad', 'Compromiso'],
    challenges: ['Crítica dura', 'Perfeccionismo', 'Vanidad', 'Poca tolerancia al desorden'],
    love: 'Es un compañero fiel y presente, atento a lo práctico de la vida en común. Necesita reglas claras y acuerdos explícitos; la ambigüedad lo pone nervioso más que un desacuerdo dicho de frente.',
    career:
      'Brilla en administración, auditoría, control de calidad, medicina, gastronomía, peluquería, comunicación y todo oficio donde la prolijidad se note. Es quien deja el proceso documentado y el lugar mejor ordenado de lo que lo encontró.',
    compatibility: {
      best: [ChineseZodiacAnimal.OX, ChineseZodiacAnimal.SNAKE, ChineseZodiacAnimal.DRAGON],
      challenging: [ChineseZodiacAnimal.RABBIT],
    },
    luck: { numbers: [5, 7, 8], colors: ['Dorado', 'Marrón', 'Amarillo'], direction: 'Sur' },
  },

  [ChineseZodiacAnimal.DOG]: {
    tagline: 'La lealtad que no se negocia',
    intro: [
      'El Perro es el signo de la fidelidad y de la justicia. Elige un bando por convicción moral y se queda ahí, aun cuando conviene lo contrario. La tradición china lo asocia al guardián: escucha en la noche, avisa del peligro y pone el cuerpo por quienes están de su lado.',
      'Tiene un sentido agudo de lo que está bien y lo que no, y le cuesta mirar hacia otro lado frente a un abuso. Esa vigilancia lo vuelve un compañero seguro y, hacia adentro, algo ansioso: se preocupa por adelantado y necesita señales de que el vínculo sigue firme.',
    ],
    personality: [
      {
        term: 'Lealtad',
        description:
          'Sostiene a los suyos en la dificultad, sin cálculo de conveniencia. La confianza que da es difícil de ganar y más difícil de perder.',
      },
      {
        term: 'Sentido de la justicia',
        description:
          'Reacciona ante lo que considera injusto, incluso si no lo afecta directamente. Es el que interviene cuando el resto mira el piso.',
      },
      {
        term: 'Cautela ansiosa',
        description:
          'Anticipa el peligro más de lo necesario. Esa alarma temprana protege al grupo y le cobra tranquilidad a él.',
      },
    ],
    strengths: ['Honestidad', 'Solidaridad', 'Responsabilidad', 'Coraje moral'],
    challenges: ['Pesimismo', 'Ansiedad', 'Rigidez moral', 'Cuesta perdonar'],
    love: 'Ama de manera estable y sin dobleces, con una entrega que se prueba en los tramos difíciles. Necesita seguridad y transparencia; la duda instalada lo desgasta más que cualquier conflicto abierto.',
    career:
      'Encuentra sentido en el derecho, la docencia, el acompañamiento terapéutico, la seguridad, el trabajo social, el sindicalismo y las causas colectivas. Trabaja con integridad aun sin supervisión y se vuelve el referente ético informal de su equipo.',
    compatibility: {
      best: [ChineseZodiacAnimal.TIGER, ChineseZodiacAnimal.HORSE, ChineseZodiacAnimal.RABBIT],
      challenging: [ChineseZodiacAnimal.DRAGON],
    },
    luck: { numbers: [3, 4, 9], colors: ['Rojo', 'Verde', 'Violeta'], direction: 'Este' },
  },

  [ChineseZodiacAnimal.PIG]: {
    tagline: 'La abundancia de quien disfruta y comparte',
    intro: [
      'El Cerdo cierra la rueda de doce años y lo hace con un signo de disfrute y sinceridad. Es generoso, tolerante y sin doble fondo: cree en la palabra ajena y le resulta ajeno el cálculo de la manipulación. La tradición china lo asocia a la abundancia, a la mesa compartida y a la buena fortuna que llega por la vía honesta.',
      'Trabaja fuerte para darse una vida buena y no le ve ninguna virtud al sacrificio innecesario. Su optimismo lo sostiene en los tramos malos y, a veces, lo deja expuesto a quien abusa de su confianza; aun así, prefiere equivocarse creyendo antes que vivir sospechando de todos.',
    ],
    personality: [
      {
        term: 'Generosidad',
        description:
          'Comparte lo que tiene sin llevar registro. Su casa y su tiempo están disponibles para los suyos sin que haga falta pedirlo dos veces.',
      },
      {
        term: 'Sinceridad',
        description:
          'Dice lo que siente y espera lo mismo. La intriga lo desorienta más que la mala noticia, porque no forma parte de su repertorio.',
      },
      {
        term: 'Gusto por el placer',
        description:
          'Valora la comida, el descanso y la compañía como parte del sentido de la vida, no como recompensas que haya que merecer.',
      },
    ],
    strengths: ['Bondad', 'Tolerancia', 'Optimismo', 'Laboriosidad'],
    challenges: ['Ingenuidad', 'Postergación', 'Exceso de indulgencia', 'Evita conflictos'],
    love: 'Es un compañero cálido, afectuoso y sin cálculo, que construye el vínculo alrededor de lo compartido. Necesita reciprocidad concreta: cuando siente que lo aprovechan, se va tarde pero sin volver.',
    career:
      'Se desempeña bien en gastronomía, comercio, hotelería, recursos humanos, medicina y oficios donde la calidez sea parte del servicio. Es un socio confiable que sostiene el ánimo del grupo y prospera cuando alguien lo ayuda a poner límites.',
    compatibility: {
      best: [ChineseZodiacAnimal.RABBIT, ChineseZodiacAnimal.GOAT, ChineseZodiacAnimal.TIGER],
      challenging: [ChineseZodiacAnimal.SNAKE],
    },
    luck: { numbers: [2, 5, 8], colors: ['Amarillo', 'Gris', 'Marrón'], direction: 'Sudoeste' },
  },
};

/**
 * Obtiene el perfil estático de un animal del zodiaco chino.
 */
export function getChineseZodiacProfile(animal: ChineseZodiacAnimal): ChineseZodiacProfile {
  return CHINESE_ZODIAC_PROFILES[animal];
}

/**
 * Cuenta las palabras de texto que aporta un perfil.
 *
 * Sirve de guardarraíl en los tests: replica el criterio de conteo del script
 * `check-indexable-content.mjs` sobre las secciones de texto de la ficha.
 */
export function getProfileWordCount(animal: ChineseZodiacAnimal): number {
  const profile = CHINESE_ZODIAC_PROFILES[animal];
  const text = [
    profile.tagline,
    ...profile.intro,
    ...profile.personality.flatMap((trait) => [trait.term, trait.description]),
    ...profile.strengths,
    ...profile.challenges,
    profile.love,
    profile.career,
  ].join(' ');

  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter((word) => word.length > 0).length;
}
