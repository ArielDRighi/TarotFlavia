import { ArticleCategory } from '../enums/article.enums';
import { ArticleSeedData } from './zodiac-signs.data';

/**
 * 4 Elementos + 3 Modalidades — datos seed para la Enciclopedia Mística
 *
 * Elementos: Fuego, Tierra, Aire, Agua (sortOrder 1-4)
 * Modalidades: Cardinal, Fija, Mutable (sortOrder 1-3)
 */
export const ELEMENTS: ArticleSeedData[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // FUEGO
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'elemento-fuego',
    nameEs: 'Elemento Fuego',
    nameEn: 'Fire Element',
    category: ArticleCategory.ELEMENT,
    snippet:
      'El elemento Fuego representa la energía vital, el entusiasmo y la chispa creadora. Los signos de fuego (Aries, Leo y Sagitario) son apasionados, inspiradores y líderes naturales. Su energía calienta, ilumina y transforma todo lo que toca con su ardiente vitalidad.',
    content: `# Elemento Fuego

**Signos:** Aries ♈, Leo ♌, Sagitario ♐
**Cualidad:** Caliente y seco
**Polaridad:** Masculina / Yang
**Modalidades:** Cardinal (Aries), Fija (Leo), Mutable (Sagitario)

## Significado Astrológico

El elemento Fuego es la energía primordial de la vida, el principio activo y creador. En astrología, los signos de fuego poseen una vitalidad desbordante, un entusiasmo contagioso y una capacidad natural de inspirar y liderar.

Como el fuego físico, los signos de fuego necesitan combustible (motivación y desafíos) para mantenerse encendidos. Cuando están en su mejor momento, son una fuente de luz y calor para todos. Cuando se descontrolan, pueden consumirlo todo.

## Características Generales

- Energía vital desbordante
- Optimismo y entusiasmo natural
- Liderazgo e iniciativa
- Creatividad espontánea
- Pasión por la vida
- Necesidad de acción y movimiento

## Los Tres Signos de Fuego

- **Aries (Cardinal):** El chispazo inicial, el coraje de empezar
- **Leo (Fijo):** La llama sostenida, el calor del corazón
- **Sagitario (Mutable):** El fuego que se propaga, la llama de la sabiduría

## Fuego en Equilibrio

En equilibrio, la energía de Fuego da propósito, vitalidad y la capacidad de iluminar la vida de los demás. En desequilibrio, puede manifestarse como impulsividad, egocentrismo, arrogancia o agotamiento de la energía vital.

## Fuego y los Otros Elementos

- **Fuego + Aire:** El aire aviva el fuego — relación energizante y estimulante
- **Fuego + Tierra:** La tierra contiene el fuego — tensión entre acción y prudencia
- **Fuego + Agua:** El agua apaga el fuego — tensión entre pasión y emoción

## Fuego en la Práctica Espiritual

Rituals de fuego: velas, fogatas sagradas, quema de intenciones. El fuego purifica, transforma y marca el inicio de nuevos ciclos. Las ceremonias con fuego son poderosas herramientas de manifestación y liberación.
`,
    metadata: {
      signs: ['aries', 'leo', 'sagittarius'],
      quality: 'caliente y seco',
      polarity: 'yang',
    },
    relatedTarotCards: null,
    sortOrder: 1,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TIERRA
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'elemento-tierra',
    nameEs: 'Elemento Tierra',
    nameEn: 'Earth Element',
    category: ArticleCategory.ELEMENT,
    snippet:
      'El elemento Tierra representa la estabilidad, la practicidad y la conexión con el mundo material. Los signos de tierra (Tauro, Virgo y Capricornio) son confiables, pacientes y constructores naturales de estructuras duraderas que nutren y sostienen la vida.',
    content: `# Elemento Tierra

**Signos:** Tauro ♉, Virgo ♍, Capricornio ♑
**Cualidad:** Fría y seca
**Polaridad:** Femenina / Yin
**Modalidades:** Fija (Tauro), Mutable (Virgo), Cardinal (Capricornio)

## Significado Astrológico

El elemento Tierra es el principio de la manifestación concreta, la materia y la realidad tangible. Los signos de tierra son los constructores del zodíaco: pacientes, confiables y capaces de convertir las ideas en resultados tangibles.

Como la tierra física, los signos de tierra ofrecen sustento, estabilidad y la capacidad de hacer crecer lo que se siembra. Son los más conectados con el mundo material y los ciclos naturales.

## Características Generales

- Practicidad y sentido común
- Estabilidad y confiabilidad
- Paciencia y perseverancia
- Conexión con el mundo material y la naturaleza
- Habilidades constructoras y organizativas
- Apreciación de los placeres sensoriales

## Los Tres Signos de Tierra

- **Tauro (Fijo):** La tierra fértil, el cultivador de la belleza
- **Virgo (Mutable):** La tierra que se prepara, el artesano y el sanador
- **Capricornio (Cardinal):** La montaña, el constructor de imperios

## Tierra en Equilibrio

En equilibrio, la energía de Tierra da solidez, sustento y la capacidad de materializar sueños. En desequilibrio, puede manifestarse como terquedad, materialismo excesivo, resistencia al cambio o excesiva rigidez.

## Tierra y los Otros Elementos

- **Tierra + Fuego:** Tensión entre practicidad y acción impulsiva
- **Tierra + Aire:** Tensión entre lo concreto y lo abstracto
- **Tierra + Agua:** El agua nutre la tierra — relación simbiótica y nutritiva

## Tierra en la Práctica Espiritual

Trabajo con la tierra: cristales, piedras, plantas, trabajo con el cuerpo. La tierra nos ancla y nos recuerda que somos seres encarnados. Prácticas de enraizamiento (grounding) son esenciales para los signos de tierra y para todo aquel que necesite estabilizarse.
`,
    metadata: {
      signs: ['taurus', 'virgo', 'capricorn'],
      quality: 'fría y seca',
      polarity: 'yin',
    },
    relatedTarotCards: null,
    sortOrder: 2,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // AIRE
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'elemento-aire',
    nameEs: 'Elemento Aire',
    nameEn: 'Air Element',
    category: ArticleCategory.ELEMENT,
    snippet:
      'El elemento Aire representa el pensamiento, la comunicación y las relaciones sociales. Los signos de aire (Géminis, Libra y Acuario) son intelectualmente brillantes, sociables y conectores natos. Su energía circula libremente llevando ideas, palabras y conexiones entre personas.',
    content: `# Elemento Aire

**Signos:** Géminis ♊, Libra ♎, Acuario ♒
**Cualidad:** Caliente y húmedo
**Polaridad:** Masculina / Yang
**Modalidades:** Mutable (Géminis), Cardinal (Libra), Fija (Acuario)

## Significado Astrológico

El elemento Aire es el principio del pensamiento, la comunicación y la relación. Los signos de aire viven en el mundo de las ideas, los conceptos y las conexiones entre personas. Son los intelectuales, comunicadores y diplomáticos del zodíaco.

Como el aire físico, están en constante movimiento, llevan información de un lugar a otro y son esenciales para la vida sin ser visibles. Su mayor fortaleza es la capacidad de ver múltiples perspectivas al mismo tiempo.

## Características Generales

- Inteligencia y agilidad mental
- Comunicación y sociabilidad
- Objetividad y perspectiva
- Versatilidad e ingenio
- Amor por las ideas y los conceptos
- Capacidad de conectar personas y conceptos

## Los Tres Signos de Aire

- **Géminis (Mutable):** El viento que recoge y dispersa información
- **Libra (Cardinal):** La brisa que equilibra y armoniza
- **Acuario (Fijo):** El viento eléctrico del cambio y la revolución

## Aire en Equilibrio

En equilibrio, la energía de Aire da brillantez intelectual, comunicación efectiva y capacidad de ver la realidad con objetividad. En desequilibrio, puede manifestarse como superficialidad, frialdad emocional, indecisión o exceso de intelectualización.

## Aire y los Otros Elementos

- **Aire + Fuego:** El aire aviva el fuego — relación muy compatible y estimulante
- **Aire + Tierra:** Tensión entre lo abstracto y lo concreto
- **Aire + Agua:** Tensión entre la razón y la emoción

## Aire en la Práctica Espiritual

Trabajo con el aire: respiración consciente (pranayama), incienso, meditación, música y sonido. El aire representa el prana o chi, la energía vital que respiramos. Las prácticas de respiración son herramientas poderosas de transformación para los signos de aire y para quienes necesitan aclarar la mente.
`,
    metadata: {
      signs: ['gemini', 'libra', 'aquarius'],
      quality: 'caliente y húmedo',
      polarity: 'yang',
    },
    relatedTarotCards: null,
    sortOrder: 3,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // AGUA
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'elemento-agua',
    nameEs: 'Elemento Agua',
    nameEn: 'Water Element',
    category: ArticleCategory.ELEMENT,
    snippet:
      'El elemento Agua representa las emociones, la intuición y el inconsciente. Los signos de agua (Cáncer, Escorpio y Piscis) son profundamente empáticos, intuitivos y sensibles. Su energía fluye por las profundidades del alma, conectando con lo invisible y lo misterioso.',
    content: `# Elemento Agua

**Signos:** Cáncer ♋, Escorpio ♏, Piscis ♓
**Cualidad:** Fría y húmeda
**Polaridad:** Femenina / Yin
**Modalidades:** Cardinal (Cáncer), Fija (Escorpio), Mutable (Piscis)

## Significado Astrológico

El elemento Agua es el principio de la emoción, la intuición y la conexión con el inconsciente. Los signos de agua son los más empáticos y psíquicos del zodíaco, capaces de captar las corrientes emocionales invisibles que fluyen bajo la superficie de la realidad.

Como el agua física, los signos de agua pueden ser suaves y nutritivos como una lluvia primaveral, profundos y misteriosos como el océano, o devastadores como un tsunami cuando sus emociones se desbordan.

## Características Generales

- Profundidad emocional e intuición
- Empatía y sensibilidad
- Conexión con el inconsciente y los sueños
- Compasión y amor profundo
- Capacidad de sanación
- Memoria emocional excepcional

## Los Tres Signos de Agua

- **Cáncer (Cardinal):** El río que nutre y protege, el amor materno
- **Escorpio (Fijo):** Las profundidades oceánicas, la transformación
- **Piscis (Mutable):** El océano sin límites, la unión con el Todo

## Agua en Equilibrio

En equilibrio, la energía de Agua da profundidad emocional, compasión y una poderosa intuición. En desequilibrio, puede manifestarse como hipersensibilidad, victimización, manipulación emocional o tendencia al escapismo.

## Agua y los Otros Elementos

- **Agua + Tierra:** El agua nutre la tierra — relación simbiótica y nutritiva
- **Agua + Fuego:** Tensión entre la emoción y la pasión, pueden apagarse mutuamente
- **Agua + Aire:** Tensión entre la razón y la emoción

## Agua en la Práctica Espiritual

Trabajo con el agua: baños rituales, olas del mar, llanto consciente, trabajo con los sueños. El agua purifica emocionalmente y disuelve lo que ya no sirve. Las ceremonias con agua son poderosas para la sanación emocional, la clarividencia y la conexión con el mundo espiritual.
`,
    metadata: {
      signs: ['cancer', 'scorpio', 'pisces'],
      quality: 'fría y húmeda',
      polarity: 'yin',
    },
    relatedTarotCards: null,
    sortOrder: 4,
  },
];

export const MODALITIES: ArticleSeedData[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // CARDINAL
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'modalidad-cardinal',
    nameEs: 'Modalidad Cardinal',
    nameEn: 'Cardinal Modality',
    category: ArticleCategory.MODALITY,
    snippet:
      'La modalidad Cardinal marca los inicios de las estaciones y representa la energía de la iniciación. Los signos cardinales (Aries, Cáncer, Libra y Capricornio) son líderes natos con la capacidad de comenzar proyectos e inaugurar nuevos ciclos con determinación y visión.',
    content: `# Modalidad Cardinal

**Signos:** Aries ♈, Cáncer ♋, Libra ♎, Capricornio ♑
**Estaciones:** Inicio de primavera, verano, otoño e invierno
**Cualidad:** Iniciadora, activa, pionera

## Significado Astrológico

Las modalidades (o cuadruplicidades) describen el estilo de acción y adaptación de los signos. La modalidad Cardinal corresponde a los cuatro signos que marcan el inicio de cada estación del año: Aries (primavera), Cáncer (verano), Libra (otoño) y Capricornio (invierno).

Los signos cardinales son los iniciadores del zodíaco. Su energía es dinámica, orientada hacia adelante y siempre lista para comenzar algo nuevo. Son los emprendedores, los innovadores y los que hacen que las cosas sucedan.

## Características de los Signos Cardinales

- Iniciativa y capacidad de liderazgo
- Energía orientada hacia nuevos comienzos
- Visión de futuro y anticipación
- Dificultad para mantenerse en proyectos a largo plazo
- Tendencia a la impaciencia
- Capacidad de motivar e inspirar a otros

## Los Cuatro Signos Cardinales

- **Aries (Fuego Cardinal):** Inicia con impulso y coraje
- **Cáncer (Agua Cardinal):** Inicia con cuidado e intuición emocional
- **Libra (Aire Cardinal):** Inicia con diplomacia y búsqueda de equilibrio
- **Capricornio (Tierra Cardinal):** Inicia con estrategia y ambición disciplinada

## La Cruz Cardinal

Los cuatro signos cardinales forman la Cruz Cardinal, uno de los patrones más importantes en astrología. Cuando varios planetas se concentran en signos cardinales, se crea una tensión creativa que impulsa cambios significativos.

## Cardinal vs. Fijo vs. Mutable

- **Cardinal:** Inicia el cambio — "¡Empecemos!"
- **Fijo:** Sostiene el cambio — "¡Mantengamos el rumbo!"
- **Mutable:** Adapta al cambio — "¡Ajustémonos según sea necesario!"
`,
    metadata: {
      signs: ['aries', 'cancer', 'libra', 'capricorn'],
      seasons: [
        'inicio de primavera',
        'inicio de verano',
        'inicio de otoño',
        'inicio de invierno',
      ],
    },
    relatedTarotCards: null,
    sortOrder: 1,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FIJA
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'modalidad-fija',
    nameEs: 'Modalidad Fija',
    nameEn: 'Fixed Modality',
    category: ArticleCategory.MODALITY,
    snippet:
      'La modalidad Fija representa la estabilidad, la determinación y la capacidad de sostener lo que se ha iniciado. Los signos fijos (Tauro, Leo, Escorpio y Acuario) poseen una voluntad inquebrantable, gran profundidad y la perseverancia para completar lo que comienzan.',
    content: `# Modalidad Fija

**Signos:** Tauro ♉, Leo ♌, Escorpio ♏, Acuario ♒
**Estaciones:** Medio de primavera, verano, otoño e invierno
**Cualidad:** Estabilizadora, persistente, concentrada

## Significado Astrológico

La modalidad Fija corresponde a los cuatro signos que se encuentran en el punto medio de cada estación: Tauro (mediados de primavera), Leo (mediados de verano), Escorpio (mediados de otoño) y Acuario (mediados de invierno).

Los signos fijos son los sostenedores del zodíaco. Su energía es profunda, concentrada y perseverante. Una vez que deciden algo, lo mantienen con una determinación excepcional. Son los más confiables para llevar proyectos a buen término, pero también los más difíciles de cambiar de opinión.

## Características de los Signos Fijos

- Determinación y voluntad inquebrantable
- Profundidad y concentración de energía
- Confiabilidad y consistencia
- Dificultad para adaptarse al cambio
- Tendencia a la terquedad
- Gran capacidad para completar proyectos a largo plazo

## Los Cuatro Signos Fijos

- **Tauro (Tierra Fija):** Sostiene con paciencia y amor por lo bello
- **Leo (Fuego Fijo):** Sostiene con pasión y lealtad al corazón
- **Escorpio (Agua Fija):** Sostiene con intensidad y profundidad emocional
- **Acuario (Aire Fijo):** Sostiene con convicción y visión del futuro

## La Cruz Fija

Los cuatro signos fijos forman la Cruz Fija, asociada con los cuatro evangelistas en la tradición cristiana y con los cuatro seres vivientes del Apocalipsis (el toro, el león, el águila/escorpión y el ángel/acuario). Cuando planetas se concentran en signos fijos, la energía es poderosa pero puede volverse resistente.

## El Desafío Fijo

El principal desafío de la modalidad fija es la resistencia al cambio necesario. El trabajo espiritual consiste en aprender a soltar con gracia lo que ya ha cumplido su propósito, sin perder la valiosa determinación que los caracteriza.
`,
    metadata: {
      signs: ['taurus', 'leo', 'scorpio', 'aquarius'],
      seasons: [
        'medio de primavera',
        'medio de verano',
        'medio de otoño',
        'medio de invierno',
      ],
    },
    relatedTarotCards: null,
    sortOrder: 2,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MUTABLE
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'modalidad-mutable',
    nameEs: 'Modalidad Mutable',
    nameEn: 'Mutable Modality',
    category: ArticleCategory.MODALITY,
    snippet:
      'La modalidad Mutable representa la adaptabilidad, la flexibilidad y la transición entre ciclos. Los signos mutables (Géminis, Virgo, Sagitario y Piscis) son los grandes integradores del zodíaco, capaces de fluir entre situaciones con versatilidad y apertura al cambio.',
    content: `# Modalidad Mutable

**Signos:** Géminis ♊, Virgo ♍, Sagitario ♐, Piscis ♓
**Estaciones:** Final de primavera, verano, otoño e invierno
**Cualidad:** Adaptable, versátil, transitoria

## Significado Astrológico

La modalidad Mutable corresponde a los cuatro signos que concluyen cada estación y preparan la transición hacia la siguiente: Géminis (fin de primavera), Virgo (fin de verano), Sagitario (fin de otoño) y Piscis (fin de invierno).

Los signos mutables son los adaptadores y facilitadores del zodíaco. Su energía es flexible, versátil y siempre dispuesta a integrar nuevas perspectivas. Son los puentes entre lo que fue y lo que será, con una capacidad extraordinaria para fluir entre situaciones y circunstancias cambiantes.

## Características de los Signos Mutables

- Adaptabilidad y flexibilidad excepcionales
- Versatilidad e ingenio
- Apertura a múltiples perspectivas
- Dificultad para comprometerse o decidirse
- Tendencia a la dispersión
- Capacidad de integrar y sintetizar experiencias

## Los Cuatro Signos Mutables

- **Géminis (Aire Mutable):** Adapta a través de la comunicación y el pensamiento
- **Virgo (Tierra Mutable):** Adapta a través del análisis y el perfeccionamiento
- **Sagitario (Fuego Mutable):** Adapta a través de la búsqueda de significado
- **Piscis (Agua Mutable):** Adapta a través de la compasión y la disolución de límites

## La Cruz Mutable

Los cuatro signos mutables forman la Cruz Mutable. Su energía es la más difícil de concentrar pero la más flexible y receptiva. Cuando planetas se concentran en signos mutables, hay una gran adaptabilidad pero también posible falta de dirección.

## El Don Mutable

El mayor don de la modalidad mutable es la capacidad de soltar, integrar y fluir. En un mundo en constante cambio, la flexibilidad mutable es un recurso valiosísimo. El trabajo espiritual consiste en desarrollar la capacidad de comprometerse sin perder la preciada adaptabilidad.
`,
    metadata: {
      signs: ['gemini', 'virgo', 'sagittarius', 'pisces'],
      seasons: [
        'final de primavera',
        'final de verano',
        'final de otoño',
        'final de invierno',
      ],
    },
    relatedTarotCards: null,
    sortOrder: 3,
  },
];
