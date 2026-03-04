import { ArticleCategory } from '../enums/article.enums';
import { ArticleSeedData } from './zodiac-signs.data';

/**
 * 12 Casas Astrológicas — datos seed para la Enciclopedia Mística
 *
 * Orden: Casa 1 → Casa 12
 * Categoría: ArticleCategory.ASTROLOGICAL_HOUSE
 */
export const ASTROLOGICAL_HOUSES: ArticleSeedData[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // CASA 1
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'casa-1',
    nameEs: 'Casa 1 — La Casa del Yo',
    nameEn: 'First House',
    category: ArticleCategory.ASTROLOGICAL_HOUSE,
    snippet:
      'La Casa 1 representa el yo, la apariencia física y la forma en que nos proyectamos al mundo. Es el Ascendente, la máscara social y el punto de partida de toda la carta natal. Define la primera impresión que damos y nuestra actitud ante la vida.',
    content: `# Casa 1 — La Casa del Yo

**Eje:** Casa 1 / Casa 7
**Signo natural:** Aries
**Planeta natural:** Marte
**Ángulo:** Ascendente (AC)

## Significado Astrológico

La Casa 1 es la más personal e importante de todas las casas. Está marcada por el Ascendente, el punto del zodíaco que se encontraba en el horizonte Este en el momento del nacimiento. Este ángulo define la "máscara" que mostramos al mundo, nuestra apariencia física general y nuestra actitud instintiva ante la vida.

El signo en el Ascendente (cusp de la Casa 1) y los planetas en esta casa moldean profundamente la personalidad visible y la forma en que interactuamos con el entorno desde el primer momento.

## Áreas de Vida

- Imagen personal y apariencia física
- Temperamento y actitud general
- Vitalidad y salud del cuerpo físico
- Primeras impresiones que generamos
- El ego y el sentido del yo
- Comienzos y nuevos comienzos

## Planetas en la Casa 1

- **Sol:** Personalidad radiante, autoconfianza, búsqueda de reconocimiento
- **Luna:** Sensibilidad visible, expresividad emocional, carácter cambiante
- **Marte:** Energía, asertividad, tendencia a la acción directa
- **Venus:** Atractivo natural, carisma, amor por la estética
- **Saturno:** Seriedad, reserva, desarrollo lento pero sólido del yo

## Temas de Desarrollo

El trabajo en la Casa 1 implica desarrollar una identidad auténtica, equilibrar la autoafirmación con la apertura a los demás (eje Casa 1-7) y aprender a mostrarnos tal como somos sin falsas máscaras.
`,
    metadata: {
      houseNumber: 1,
      naturalSign: 'aries',
      naturalPlanet: 'mars',
      angle: 'ascendente',
    },
    relatedTarotCards: null,
    sortOrder: 1,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CASA 2
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'casa-2',
    nameEs: 'Casa 2 — La Casa de los Recursos',
    nameEn: 'Second House',
    category: ArticleCategory.ASTROLOGICAL_HOUSE,
    snippet:
      'La Casa 2 rige los recursos personales, el dinero y los valores materiales. Representa lo que poseemos, lo que valoramos y la capacidad de generar ingresos. También abarca la autoestima y los talentos innatos que usamos para sustentarnos.',
    content: `# Casa 2 — La Casa de los Recursos

**Eje:** Casa 2 / Casa 8
**Signo natural:** Tauro
**Planeta natural:** Venus

## Significado Astrológico

La Casa 2 rige todo lo que consideramos "propio": los recursos materiales, el dinero, los bienes y los talentos personales. También representa los valores fundamentales: aquello que consideramos importante y por lo que estamos dispuestos a esforzarnos.

Más allá del dinero, la Casa 2 habla de la autoestima y de cómo nos valoramos a nosotros mismos. La seguridad material y la seguridad interna están profundamente vinculadas aquí.

## Áreas de Vida

- Dinero, ingresos y finanzas personales
- Bienes materiales y posesiones
- Valores y prioridades personales
- Autoestima y autovaloración
- Talentos innatos y recursos personales
- Capacidad de ganar y conservar recursos

## Planetas en la Casa 2

- **Venus:** Facilidad para atraer dinero, apreciación de lujos y belleza
- **Júpiter:** Abundancia financiera, generosidad, oportunidades de riqueza
- **Saturno:** Disciplina financiera, aprendizajes a través de la escasez
- **Plutón:** Transformaciones radicales en la economía personal
- **Marte:** Energía emprendedora, dinero ganado con esfuerzo activo

## Temas de Desarrollo

El eje Casa 2-8 representa la tensión entre los recursos propios y los compartidos. El trabajo de la Casa 2 implica desarrollar una sana autoestima, clarificar los propios valores y construir una base material sólida desde los propios talentos.
`,
    metadata: {
      houseNumber: 2,
      naturalSign: 'taurus',
      naturalPlanet: 'venus',
      angle: null,
    },
    relatedTarotCards: null,
    sortOrder: 2,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CASA 3
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'casa-3',
    nameEs: 'Casa 3 — La Casa de la Comunicación',
    nameEn: 'Third House',
    category: ArticleCategory.ASTROLOGICAL_HOUSE,
    snippet:
      'La Casa 3 rige la comunicación, el pensamiento cotidiano y el entorno inmediato. Abarca los hermanos, los viajes cortos, el aprendizaje básico y la escritura. Representa la mente que observa, clasifica e intercambia información con el mundo cercano.',
    content: `# Casa 3 — La Casa de la Comunicación

**Eje:** Casa 3 / Casa 9
**Signo natural:** Géminis
**Planeta natural:** Mercurio

## Significado Astrológico

La Casa 3 rige la mente consciente en su funcionamiento cotidiano: cómo pensamos, comunicamos, aprendemos y nos relacionamos con nuestro entorno inmediato. Cubre los viajes cortos, los hermanos, los vecinos, la educación primaria y los medios de comunicación.

Es la casa de la curiosidad y del intercambio de información. Donde la Casa 9 busca el gran significado filosófico, la Casa 3 recopila los datos concretos del día a día.

## Áreas de Vida

- Comunicación oral y escrita
- Pensamiento y procesos mentales
- Hermanos y parientes cercanos
- Viajes cortos y desplazamientos locales
- Educación primaria y aprendizaje básico
- Medios de comunicación y tecnología cotidiana

## Planetas en la Casa 3

- **Mercurio:** Mente brillante y ágil, facilidad para comunicarse
- **Júpiter:** Pensamiento expansivo, optimismo intelectual, hermanos mayores
- **Saturno:** Comunicación seria y estructurada, dificultades iniciales en el aprendizaje
- **Urano:** Ideas originales y disruptivas, pensamiento no convencional
- **Neptuno:** Comunicación intuitiva, tendencia a la imaginación y la fantasía

## Temas de Desarrollo

El eje Casa 3-9 representa la tensión entre el conocimiento local y cotidiano (Casa 3) y la búsqueda del significado universal (Casa 9). El trabajo en la Casa 3 implica desarrollar claridad de pensamiento y comunicación efectiva.
`,
    metadata: {
      houseNumber: 3,
      naturalSign: 'gemini',
      naturalPlanet: 'mercury',
      angle: null,
    },
    relatedTarotCards: null,
    sortOrder: 3,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CASA 4
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'casa-4',
    nameEs: 'Casa 4 — La Casa del Hogar',
    nameEn: 'Fourth House',
    category: ArticleCategory.ASTROLOGICAL_HOUSE,
    snippet:
      'La Casa 4 representa el hogar, la familia y las raíces más profundas. Es el Fondo del Cielo, el punto más íntimo de la carta natal. Rige la relación con los padres, el hogar de origen, el pasado emocional y la base psicológica sobre la que se construye la vida.',
    content: `# Casa 4 — La Casa del Hogar

**Eje:** Casa 4 / Casa 10
**Signo natural:** Cáncer
**Planeta natural:** Luna
**Ángulo:** Fondo del Cielo (IC)

## Significado Astrológico

La Casa 4 está marcada por el IC (Imum Coeli), el punto más bajo de la carta natal, opuesto al Medio Cielo. Representa las raíces más profundas: el hogar de origen, la familia, los ancestros y el fundamento psicológico inconsciente de la persona.

Es la casa más privada e íntima. Aquí reside lo que llevamos de la infancia y el hogar natal, los patrones heredados de la familia y el sentido de seguridad emocional.

## Áreas de Vida

- Hogar y vida doméstica
- Familia de origen y padres (especialmente la madre o figura nutricia)
- Raíces y herencia familiar y cultural
- La base psicológica e inconsciente
- El final de la vida y los asuntos de la vejez
- Bienes raíces y propiedad

## Planetas en la Casa 4

- **Luna:** Hogar como refugio emocional central, fuerte vínculo familiar
- **Sol:** El hogar como fuente de identidad, padre prominente
- **Saturno:** Hogar estructurado pero a veces frío, responsabilidades familiares
- **Júpiter:** Hogar expansivo y abundante, familia grande y generosa
- **Plutón:** Transformaciones profundas en la familia, secretos ancestrales

## Temas de Desarrollo

El eje Casa 4-10 es el eje del hogar y la carrera. El trabajo de la Casa 4 implica sanar las heridas del hogar de origen, construir raíces propias y desarrollar una base emocional sólida desde la que lanzarse al mundo.
`,
    metadata: {
      houseNumber: 4,
      naturalSign: 'cancer',
      naturalPlanet: 'moon',
      angle: 'fondo del cielo (IC)',
    },
    relatedTarotCards: null,
    sortOrder: 4,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CASA 5
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'casa-5',
    nameEs: 'Casa 5 — La Casa de la Creatividad',
    nameEn: 'Fifth House',
    category: ArticleCategory.ASTROLOGICAL_HOUSE,
    snippet:
      'La Casa 5 rige la creatividad, el placer y la autoexpresión. Abarca los romances, los hijos, los juegos y las artes. Es la casa del corazón en flor, donde la energía vital se expresa con alegría, espontaneidad y el deseo de crear algo que lleve nuestra firma.',
    content: `# Casa 5 — La Casa de la Creatividad

**Eje:** Casa 5 / Casa 11
**Signo natural:** Leo
**Planeta natural:** Sol

## Significado Astrológico

La Casa 5 es la casa del corazón, la creatividad y el placer de vivir. Rige todo lo que hacemos por pura alegría y autoexpresión: el arte, el juego, el romance, los hijos y las actividades recreativas.

Es la casa donde el ego creativo brilla sin restricciones. La energía del Sol fluye aquí con naturalidad, buscando crear, celebrar y dejar una huella personal en el mundo.

## Áreas de Vida

- Creatividad y expresión artística
- Romance y conquista amorosa (no la relación comprometida, que es la Casa 7)
- Hijos y relación con los niños
- Juegos, diversión y entretenimiento
- Especulación y apuestas
- Hobbies y talentos cultivados por placer

## Planetas en la Casa 5

- **Sol:** Creatividad solar desbordante, tendencia al protagonismo, amor por los hijos
- **Venus:** Romance y placer estético, artista natural, padres de hijos hermosos
- **Júpiter:** Creatividad expansiva, muchos amores o hijos, suerte en especulaciones
- **Saturno:** Creatividad disciplinada, pocos hijos o retraso, placer postergado por responsabilidad
- **Marte:** Pasión romántica intensa, creatividad impulsiva, amor por los deportes

## Temas de Desarrollo

El eje Casa 5-11 representa la tensión entre la autoexpresión individual y el servicio a la comunidad. El trabajo de la Casa 5 implica honrar el propio niño interior, desarrollar la creatividad auténtica y aprender a disfrutar la vida sin culpa.
`,
    metadata: {
      houseNumber: 5,
      naturalSign: 'leo',
      naturalPlanet: 'sun',
      angle: null,
    },
    relatedTarotCards: null,
    sortOrder: 5,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CASA 6
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'casa-6',
    nameEs: 'Casa 6 — La Casa del Servicio',
    nameEn: 'Sixth House',
    category: ArticleCategory.ASTROLOGICAL_HOUSE,
    snippet:
      'La Casa 6 rige el trabajo cotidiano, la salud y el servicio. Abarca las rutinas diarias, la relación con los compañeros de trabajo, los hábitos saludables y la capacidad de ser útil. Representa el vínculo entre el cuerpo físico y la mente a través de la disciplina diaria.',
    content: `# Casa 6 — La Casa del Servicio

**Eje:** Casa 6 / Casa 12
**Signo natural:** Virgo
**Planeta natural:** Mercurio

## Significado Astrológico

La Casa 6 rige el mundo del trabajo cotidiano, la salud y el servicio. Es la casa de las rutinas que sostienen la vida: los hábitos de salud, la organización del día a día, las tareas y el trabajo funcional.

A diferencia de la Casa 10 (carrera y ambición), la Casa 6 habla del trabajo en su aspecto más práctico: las tareas diarias, los empleados y empleadores, y cómo servimos a los demás.

## Áreas de Vida

- Trabajo cotidiano y rutinas laborales
- Salud, alimentación y hábitos físicos
- Servicio y utilidad
- Empleados y personas a nuestro cargo
- Mascotas y animales pequeños
- Métodos, técnicas y organización

## Planetas en la Casa 6

- **Sol:** Identidad centrada en el trabajo y la salud, gran dedicación laboral
- **Marte:** Trabajo activo y enérgico, posibles problemas inflamatorios de salud
- **Saturno:** Disciplina laboral excepcional, aprendizajes a través de la enfermedad
- **Júpiter:** Trabajo abundante y expansivo, buena recuperación de enfermedades
- **Neptuno:** Trabajo en campos de sanación, sensibilidad a sustancias, enfermedades difusas

## Temas de Desarrollo

El eje Casa 6-12 es el eje del servicio. En la Casa 6, el trabajo implica desarrollar hábitos saludables, encontrar satisfacción en el servicio cotidiano y cuidar el cuerpo como templo del espíritu.
`,
    metadata: {
      houseNumber: 6,
      naturalSign: 'virgo',
      naturalPlanet: 'mercury',
      angle: null,
    },
    relatedTarotCards: null,
    sortOrder: 6,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CASA 7
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'casa-7',
    nameEs: 'Casa 7 — La Casa de las Asociaciones',
    nameEn: 'Seventh House',
    category: ArticleCategory.ASTROLOGICAL_HOUSE,
    snippet:
      'La Casa 7 rige las relaciones comprometidas: la pareja, el matrimonio y las asociaciones de negocios. Es el Descendente, el punto opuesto al Ascendente. Refleja lo que buscamos en el otro y, a menudo, la sombra que proyectamos en nuestras relaciones más íntimas.',
    content: `# Casa 7 — La Casa de las Asociaciones

**Eje:** Casa 7 / Casa 1
**Signo natural:** Libra
**Planeta natural:** Venus
**Ángulo:** Descendente (DC)

## Significado Astrológico

La Casa 7 está marcada por el Descendente, exactamente opuesto al Ascendente (Casa 1). Si la Casa 1 representa el yo, la Casa 7 representa el "tú" significativo: la pareja, el cónyuge, los socios y los rivales declarados.

Esta casa revela el tipo de persona que atraemos en nuestras relaciones más significativas y qué proyectamos en los demás. Frecuentemente, las personas con planetas en Casa 7 buscan en los otros las cualidades que no han integrado en sí mismas.

## Áreas de Vida

- Matrimonio y pareja comprometida
- Asociaciones de negocios y socios
- Contratos y acuerdos formales
- Enemigos declarados (los que nos confrontan abiertamente)
- Negociaciones y diplomacia
- Lo que buscamos y proyectamos en el "otro"

## Planetas en la Casa 7

- **Venus:** Relaciones armoniosas, pareja artística o bella, facilidad para comprometerse
- **Saturno:** Relaciones con diferencia de edad, aprendizajes kármicos en la pareja
- **Marte:** Relaciones apasionadas pero conflictivas, socios asertivos o agresivos
- **Júpiter:** Pareja expansiva y optimista, matrimonio beneficioso y creciente
- **Plutón:** Relaciones intensamente transformadoras, poder y control en la pareja

## Temas de Desarrollo

El trabajo de la Casa 7 implica aprender a relacionarse desde la igualdad, integrar las cualidades que proyectamos en los demás, y construir asociaciones basadas en el respeto mutuo y el compromiso consciente.
`,
    metadata: {
      houseNumber: 7,
      naturalSign: 'libra',
      naturalPlanet: 'venus',
      angle: 'descendente (DC)',
    },
    relatedTarotCards: null,
    sortOrder: 7,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CASA 8
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'casa-8',
    nameEs: 'Casa 8 — La Casa de la Transformación',
    nameEn: 'Eighth House',
    category: ArticleCategory.ASTROLOGICAL_HOUSE,
    snippet:
      'La Casa 8 rige la transformación profunda, la muerte simbólica y los recursos compartidos. Abarca la sexualidad, las herencias, el dinero del otro y los misterios ocultos. Es la casa de la catarsis, el renacimiento y el poder que emerge de las profundidades.',
    content: `# Casa 8 — La Casa de la Transformación

**Eje:** Casa 8 / Casa 2
**Signo natural:** Escorpio
**Planetas naturales:** Plutón / Marte

## Significado Astrológico

La Casa 8 es una de las casas más intensas y profundas de la carta natal. Rige los grandes temas de la existencia: la muerte, la transformación, el sexo como unión sagrada, los recursos compartidos y lo oculto.

Es la casa de la muerte y el renacimiento simbólico: los procesos de catarsis que nos transforman radicalmente. Aquí también encontramos las herencias, las deudas, los impuestos y todo lo que pertenece a los demás pero compartimos.

## Áreas de Vida

- Transformación profunda y renacimiento
- Muerte y lo que hay más allá
- Sexualidad como unión transformadora
- Recursos compartidos: herencias, deudas, impuestos
- Lo oculto: espiritismo, magia, psicología profunda
- Crisis y procesos de catarsis

## Planetas en la Casa 8

- **Sol:** Identidad forjada en la transformación, vida con alta carga de cambios
- **Luna:** Emociones intensas, relación profunda con la muerte y el inconsciente
- **Plutón:** Poder extraordinario de transformación, vida de muertes y renacimientos
- **Saturno:** Transformaciones lentas y difíciles, aprendizajes a través de pérdidas
- **Júpiter:** Herencias favorables, crecimiento a través de las crisis, resiliencia excepcional

## Temas de Desarrollo

El trabajo de la Casa 8 implica soltar el control, abrirse a la transformación, confrontar los miedos más profundos y aprender a compartir recursos —materiales y emocionales— desde la confianza.
`,
    metadata: {
      houseNumber: 8,
      naturalSign: 'scorpio',
      naturalPlanet: 'pluto / mars',
      angle: null,
    },
    relatedTarotCards: null,
    sortOrder: 8,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CASA 9
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'casa-9',
    nameEs: 'Casa 9 — La Casa de la Filosofía',
    nameEn: 'Ninth House',
    category: ArticleCategory.ASTROLOGICAL_HOUSE,
    snippet:
      'La Casa 9 rige la búsqueda del significado, la filosofía y los viajes largos. Abarca la educación superior, las religiones, las culturas extranjeras y la expansión del horizonte mental y espiritual. Es la casa del sabio peregrino que busca la verdad universal.',
    content: `# Casa 9 — La Casa de la Filosofía

**Eje:** Casa 9 / Casa 3
**Signo natural:** Sagitario
**Planeta natural:** Júpiter

## Significado Astrológico

La Casa 9 rige la mente superior: la búsqueda del significado más allá de los datos cotidianos de la Casa 3. Aquí encontramos la filosofía, la religión, los estudios universitarios, los viajes largos a culturas lejanas y la exploración del espíritu.

Es la casa del peregrino interior que no se conforma con respuestas superficiales y busca constantemente verdades más amplias y universales.

## Áreas de Vida

- Filosofía, religión y espiritualidad
- Educación superior y estudios universitarios
- Viajes largos al extranjero
- Culturas, idiomas y perspectivas extranjeras
- Leyes, ética y moral
- Docencia y transmisión de sabiduría

## Planetas en la Casa 9

- **Júpiter:** Mentalidad filosófica natural, facilidad para estudios superiores y viajes
- **Sol:** Identidad centrada en la búsqueda de verdad, vocación de maestro o filósofo
- **Saturno:** Disciplina académica, aprendizajes filosóficos a través del tiempo y la prueba
- **Mercurio:** Mente brillante para los estudios superiores, políglotas naturales
- **Neptuno:** Espiritualidad mística, llamado religioso, viajes como experiencia sagrada

## Temas de Desarrollo

El eje Casa 3-9 es el eje del conocimiento. El trabajo de la Casa 9 implica expandir el horizonte más allá de lo conocido, cultivar una filosofía de vida propia y desarrollar la sabiduría que surge de la experiencia directa del mundo.
`,
    metadata: {
      houseNumber: 9,
      naturalSign: 'sagittarius',
      naturalPlanet: 'jupiter',
      angle: null,
    },
    relatedTarotCards: null,
    sortOrder: 9,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CASA 10
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'casa-10',
    nameEs: 'Casa 10 — La Casa de la Carrera',
    nameEn: 'Tenth House',
    category: ArticleCategory.ASTROLOGICAL_HOUSE,
    snippet:
      'La Casa 10 rige la carrera profesional, la reputación y el lugar en la sociedad. Es el Medio Cielo, el punto más alto de la carta natal. Representa la vocación, el legado público y la autoridad que ejercemos o que buscamos proyectar en el mundo.',
    content: `# Casa 10 — La Casa de la Carrera

**Eje:** Casa 10 / Casa 4
**Signo natural:** Capricornio
**Planeta natural:** Saturno
**Ángulo:** Medio Cielo (MC)

## Significado Astrológico

La Casa 10 está marcada por el MC (Medio Cielo), el punto más alto de la carta natal, visible desde cualquier lugar de la Tierra. Representa la vocación pública, la carrera profesional, la reputación y el lugar que ocupamos en la sociedad.

Donde la Casa 4 habla del hogar y lo privado, la Casa 10 habla de la vida pública, la ambición y el legado que dejaremos en el mundo.

## Áreas de Vida

- Carrera profesional y vocación
- Reputación y estatus social
- Figuras de autoridad y el padre como modelo de éxito
- Ambición y metas a largo plazo
- El legado y la huella pública
- Relación con la autoridad y las instituciones

## Planetas en la Casa 10

- **Sol:** Carrera como fuente de identidad, vocación de liderazgo y reconocimiento
- **Saturno:** Ascenso lento pero sólido, carrera en estructuras institucionales o tradicionales
- **Júpiter:** Éxito y reconocimiento amplios, carrera expansiva y beneficiosa
- **Plutón:** Transformaciones radicales en la carrera, poder y controversia pública
- **Luna:** Carrera vinculada al cuidado, la nutrición o el mundo de las emociones

## Temas de Desarrollo

El eje Casa 4-10 es el eje fundamental de la vida: el hogar y la carrera. El trabajo de la Casa 10 implica encontrar una vocación auténtica, construir una reputación coherente con los propios valores y aprender a manejar la autoridad con responsabilidad.
`,
    metadata: {
      houseNumber: 10,
      naturalSign: 'capricorn',
      naturalPlanet: 'saturn',
      angle: 'medio cielo (MC)',
    },
    relatedTarotCards: null,
    sortOrder: 10,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CASA 11
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'casa-11',
    nameEs: 'Casa 11 — La Casa de la Comunidad',
    nameEn: 'Eleventh House',
    category: ArticleCategory.ASTROLOGICAL_HOUSE,
    snippet:
      'La Casa 11 rige los amigos, los grupos y los sueños colectivos. Abarca las redes sociales, los ideales humanitarios y el tipo de comunidades que elegimos. Representa el poder de la unión con los semejantes para alcanzar metas que superan lo individual.',
    content: `# Casa 11 — La Casa de la Comunidad

**Eje:** Casa 11 / Casa 5
**Signo natural:** Acuario
**Planeta natural:** Urano / Saturno

## Significado Astrológico

La Casa 11 rige todo lo que va más allá del yo individual para conectarse con el colectivo: los amigos elegidos, los grupos, las organizaciones, las redes sociales y los sueños e ideales que compartimos con otros.

También representa las ganancias obtenidas a través de la carrera (los frutos del Medio Cielo que fluyen a la Casa 11) y el apoyo que recibimos de nuestra red social.

## Áreas de Vida

- Amigos y grupos de afinidad
- Organizaciones, asociaciones y colectivos
- Ideales, utopías y proyectos humanitarios
- Redes sociales y comunidades virtuales
- Sueños a largo plazo y esperanzas
- Ganancias y beneficios de la carrera

## Planetas en la Casa 11

- **Júpiter:** Amplia red social, amigos benefactores, ideales generosos y optimistas
- **Sol:** Identidad centrada en el grupo, liderazgo dentro de colectivos
- **Saturno:** Pocos amigos pero profundamente leales, responsabilidades grupales
- **Urano:** Círculo de amigos inusual e innovador, fuerte orientación humanitaria
- **Luna:** Amistades emocionalmente nutridas, grupos vinculados al cuidado o la familia

## Temas de Desarrollo

El eje Casa 5-11 es el eje de la creación: la expresión individual (Casa 5) versus la creación colectiva (Casa 11). El trabajo de la Casa 11 implica aprender a trabajar en equipo, desarrollar el sentido de comunidad y conectar los sueños personales con los ideales del bien común.
`,
    metadata: {
      houseNumber: 11,
      naturalSign: 'aquarius',
      naturalPlanet: 'uranus / saturn',
      angle: null,
    },
    relatedTarotCards: null,
    sortOrder: 11,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CASA 12
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'casa-12',
    nameEs: 'Casa 12 — La Casa del Inconsciente',
    nameEn: 'Twelfth House',
    category: ArticleCategory.ASTROLOGICAL_HOUSE,
    snippet:
      'La Casa 12 es la más misteriosa del zodíaco. Rige el inconsciente profundo, el retiro espiritual y lo que está oculto o confinado. Abarca los sueños, los miedos secretos, los hospitales, los monasterios y el karma acumulado de vidas pasadas.',
    content: `# Casa 12 — La Casa del Inconsciente

**Eje:** Casa 12 / Casa 6
**Signo natural:** Piscis
**Planeta natural:** Neptuno / Júpiter

## Significado Astrológico

La Casa 12 es la última y más enigmática de las doce casas. Representa todo lo que está más allá de la consciencia ordinaria: el inconsciente colectivo, los sueños, los miedos ocultos, el karma de vidas pasadas y la necesidad de retiro y contemplación.

También rige los lugares de confinamiento y retiro: hospitales, monasterios, prisiones y centros de retiro espiritual. Los planetas en Casa 12 pueden operar de forma subliminal, expresándose a través del sueño, la meditación o el arte.

## Áreas de Vida

- Inconsciente profundo y sueños
- Retiro espiritual y contemplación
- Karma y deudas de vidas pasadas
- Lugares de confinamiento (hospitales, prisiones, monasterios)
- Miedos ocultos y enemigos secretos
- Servicio anónimo y sacrificio

## Planetas en la Casa 12

- **Sol:** Necesidad de retiro para recargarse, creatividad que florece en soledad
- **Luna:** Mundo emocional muy rico e inconsciente, intuición profunda
- **Saturno:** Cargas kármicas, disciplina espiritual, aprendizajes a través del retiro
- **Neptuno:** Conexión mística profunda, dones espirituales, susceptibilidad a adicciones
- **Júpiter:** Gracia y protección invisible, abundancia a través del servicio espiritual

## Temas de Desarrollo

El eje Casa 6-12 es el eje del servicio: el servicio cotidiano y práctico (Casa 6) versus el servicio espiritual y anónimo (Casa 12). El trabajo de la Casa 12 implica integrar el inconsciente, sanar el karma, desarrollar la compasión y aprender el valor del silencio y el retiro.
`,
    metadata: {
      houseNumber: 12,
      naturalSign: 'pisces',
      naturalPlanet: 'neptune / jupiter',
      angle: null,
    },
    relatedTarotCards: null,
    sortOrder: 12,
  },
];
