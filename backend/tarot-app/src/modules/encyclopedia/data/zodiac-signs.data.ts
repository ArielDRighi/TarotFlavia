import { ArticleCategory } from '../enums/article.enums';

/**
 * Interfaz de datos para el seed de artículos de la Enciclopedia Mística.
 * Utilizada por todos los archivos de datos de artículos.
 */
export interface ArticleSeedData {
  slug: string;
  nameEs: string;
  nameEn: string | null;
  category: ArticleCategory;
  /** Máx ~400 caracteres. Texto para el widget "Ver más" en páginas de módulos */
  snippet: string;
  /** Markdown completo para la página de detalle */
  content: string;
  metadata: Record<string, unknown> | null;
  /** IDs de cartas de tarot relacionadas (referencia a EncyclopediaTarotCard) */
  relatedTarotCards: number[] | null;
  sortOrder: number;
}

/**
 * 12 Signos Zodiacales — datos seed para la Enciclopedia Mística
 *
 * Orden: Aries (1) → Piscis (12)
 * Categoría: ArticleCategory.ZODIAC_SIGN
 */
export const ZODIAC_SIGNS: ArticleSeedData[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. ARIES
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'aries',
    nameEs: 'Aries',
    nameEn: 'Aries',
    category: ArticleCategory.ZODIAC_SIGN,
    snippet:
      'Aries es el primer signo del zodíaco, regido por Marte, con elemento Fuego y modalidad Cardinal. Simboliza el inicio, la energía pionera y el impulso irrefrenable de actuar y conquistar nuevos territorios.',
    content: `# Aries

**Fechas:** 21 de marzo — 19 de abril
**Elemento:** Fuego
**Modalidad:** Cardinal
**Planeta regente:** Marte
**Símbolo:** ♈ El Carnero

## Carácter y Personalidad

Aries es el primer signo del zodíaco y el arquetipo del pionero. Nace con Marte como regente, lo que le confiere una energía directa, valiente y apasionada. Las personas Aries son conocidas por su entusiasmo contagioso, su capacidad de liderazgo natural y su disposición a afrontar cualquier desafío de frente.

Su modalidad Cardinal les otorga la capacidad de iniciar proyectos con determinación, aunque pueden perder interés antes de completarlos. Necesitan metas claras y estímulos constantes para mantener la llama encendida.

## Fortalezas

- Valentía y determinación
- Liderazgo natural e iniciativa
- Entusiasmo y optimismo contagioso
- Honestidad y franqueza
- Capacidad de recuperación ante la adversidad

## Desafíos

- Impulsividad y precipitación
- Impaciencia ante obstáculos
- Tendencia a la confrontación
- Dificultad para terminar lo que empieza
- Ego inflado en momentos de presión

## Aries en el Amor

En las relaciones, Aries es apasionado, directo y conquistador. Le atrae la emoción y la novedad. Busca una pareja que iguale su energía y que no se intimide ante su intensidad. Es leal pero necesita espacio y libertad para no sentirse atrapado.

## Compatibilidades

- **Muy compatible:** Leo, Sagitario, Géminis, Acuario
- **Compatible:** Aries, Libra (opuesto complementario)
- **Desafiante:** Cáncer, Capricornio

## Aries y el Tarot

El arcano mayor asociado a Aries es **El Emperador (IV)**, símbolo de autoridad, estructura y poder. Comparten la determinación de Marte y la capacidad de liderar con firmeza.

## Datos Curiosos

- Primer signo de fuego y del zodíaco
- Su gema es el diamante y el rubí
- Su color representativo es el rojo
- Governa la cabeza y la cara en el cuerpo humano
`,
    metadata: {
      symbol: '♈',
      element: 'fire',
      modality: 'cardinal',
      rulingPlanet: 'mars',
      dateRange: '21 Mar - 19 Abr',
      compatibleSigns: ['leo', 'sagittarius', 'gemini', 'aquarius'],
      gem: 'diamante, rubí',
      color: 'rojo',
      bodyPart: 'cabeza y cara',
    },
    relatedTarotCards: [4], // El Emperador
    sortOrder: 1,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. TAURO
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'tauro',
    nameEs: 'Tauro',
    nameEn: 'Taurus',
    category: ArticleCategory.ZODIAC_SIGN,
    snippet:
      'Tauro es el segundo signo del zodíaco, regido por Venus, con elemento Tierra y modalidad Fija. Representa la estabilidad, la sensualidad y el profundo amor por la belleza, los placeres materiales y la seguridad duradera.',
    content: `# Tauro

**Fechas:** 20 de abril — 20 de mayo
**Elemento:** Tierra
**Modalidad:** Fija
**Planeta regente:** Venus
**Símbolo:** ♉ El Toro

## Carácter y Personalidad

Tauro es el segundo signo del zodíaco y el arquetipo del cultivador. Regido por Venus, encarna la belleza, el placer sensorial y el amor por todo lo que es duradero. Las personas Tauro son conocidas por su estabilidad emocional, su lealtad inquebrantable y su profunda apreciación de los placeres terrenales.

Su modalidad Fija les da una determinación excepcional: cuando Tauro decide algo, rara vez cambia de opinión. Esta firmeza es su mayor fortaleza, pero también puede convertirse en terquedad.

## Fortalezas

- Estabilidad y confiabilidad
- Paciencia y perseverancia
- Lealtad y fidelidad
- Sensibilidad artística y estética
- Practicidad y sentido común

## Desafíos

- Terquedad y resistencia al cambio
- Materialismo excesivo
- Posesividad en las relaciones
- Lentitud para tomar decisiones
- Tendencia al conformismo

## Tauro en el Amor

En el amor, Tauro es fiel, sensual y protector. Busca relaciones estables y duraderas. Le importa más la profundidad que la cantidad. Una vez comprometido, es uno de los signos más leales del zodíaco. Valora los gestos físicos de afecto: abrazos, caricias y la presencia física de su pareja.

## Compatibilidades

- **Muy compatible:** Virgo, Capricornio, Cáncer, Piscis
- **Compatible:** Tauro, Escorpio (opuesto complementario)
- **Desafiante:** Leo, Acuario

## Tauro y el Tarot

El arcano mayor asociado a Tauro es **La Emperatriz (III)**, símbolo de abundancia, fertilidad y amor incondicional. Ambos están regidos por Venus y comparten el aprecio por la belleza y los placeres de la vida.

## Datos Curiosos

- Su gema es la esmeralda
- Su color representativo es el verde y el rosa
- Governa el cuello y la garganta en el cuerpo humano
- Es el signo más relacionado con la música y el canto
`,
    metadata: {
      symbol: '♉',
      element: 'earth',
      modality: 'fixed',
      rulingPlanet: 'venus',
      dateRange: '20 Abr - 20 May',
      compatibleSigns: ['virgo', 'capricorn', 'cancer', 'pisces'],
      gem: 'esmeralda',
      color: 'verde, rosa',
      bodyPart: 'cuello y garganta',
    },
    relatedTarotCards: [3], // La Emperatriz
    sortOrder: 2,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. GÉMINIS
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'geminis',
    nameEs: 'Géminis',
    nameEn: 'Gemini',
    category: ArticleCategory.ZODIAC_SIGN,
    snippet:
      'Géminis es el tercer signo del zodíaco, regido por Mercurio, con elemento Aire y modalidad Mutable. Simboliza la dualidad, la comunicación brillante y la curiosidad insaciable por aprender y conectar con el mundo.',
    content: `# Géminis

**Fechas:** 21 de mayo — 20 de junio
**Elemento:** Aire
**Modalidad:** Mutable
**Planeta regente:** Mercurio
**Símbolo:** ♊ Los Gemelos

## Carácter y Personalidad

Géminis es el tercer signo del zodíaco y el arquetipo del comunicador. Regido por Mercurio, el mensajero de los dioses, encarna la versatilidad mental, la curiosidad y el don de la palabra. Las personas Géminis son brillantes conversadores, ágiles de pensamiento y eternamente curiosas.

Su dualidad es su característica más reconocible: pueden parecer dos personas distintas según el contexto. Esta flexibilidad les permite adaptarse a cualquier situación, pero también puede generar inconsistencia.

## Fortalezas

- Brillantez intelectual y agilidad mental
- Comunicación excepcional
- Adaptabilidad y versatilidad
- Humor e ingenio
- Capacidad de aprender rápidamente

## Desafíos

- Superficialidad e inconstancia
- Dificultad para comprometerse
- Ansiedad y nerviosismo
- Tendencia a dispersarse
- Manipulación cuando no está en su mejor momento

## Géminis en el Amor

En el amor, Géminis busca un compañero intelectual que pueda seguirle el ritmo mental. Necesita variedad, conversación estimulante y libertad. La rutina lo asfixia. Es cariñoso y juguetón, pero puede parecer frío si siente que pierde su independencia.

## Compatibilidades

- **Muy compatible:** Libra, Acuario, Aries, Leo
- **Compatible:** Géminis, Sagitario (opuesto complementario)
- **Desafiante:** Virgo, Piscis

## Géminis y el Tarot

El arcano mayor asociado a Géminis es **Los Enamorados (VI)**, que representa la dualidad, las elecciones y la comunicación entre opuestos. Ambos simbolizan la unión de contrarios y la importancia de tomar decisiones conscientes.

## Datos Curiosos

- Su gema es el ágata y la turquesa
- Su color es el amarillo y el plateado
- Governa los pulmones, los brazos y el sistema nervioso
- Es el signo más asociado con la escritura y la oratoria
`,
    metadata: {
      symbol: '♊',
      element: 'air',
      modality: 'mutable',
      rulingPlanet: 'mercury',
      dateRange: '21 May - 20 Jun',
      compatibleSigns: ['libra', 'aquarius', 'aries', 'leo'],
      gem: 'ágata, turquesa',
      color: 'amarillo, plateado',
      bodyPart: 'pulmones, brazos y sistema nervioso',
    },
    relatedTarotCards: [6], // Los Enamorados
    sortOrder: 3,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. CÁNCER
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'cancer',
    nameEs: 'Cáncer',
    nameEn: 'Cancer',
    category: ArticleCategory.ZODIAC_SIGN,
    snippet:
      'Cáncer es el cuarto signo del zodíaco, regido por la Luna, con elemento Agua y modalidad Cardinal. Encarna la intuición profunda, el amor incondicional por el hogar y la familia, y una sensibilidad emocional extraordinaria.',
    content: `# Cáncer

**Fechas:** 21 de junio — 22 de julio
**Elemento:** Agua
**Modalidad:** Cardinal
**Planeta regente:** La Luna
**Símbolo:** ♋ El Cangrejo

## Carácter y Personalidad

Cáncer es el cuarto signo del zodíaco y el arquetipo del cuidador. Regido por la Luna, es el signo más intuitivo e intrínsecamente conectado con las emociones y el inconsciente. Las personas Cáncer son profundamente empáticas, amorosas y protectoras de quienes aman.

Al igual que el cangrejo que lo simboliza, Cáncer tiene una coraza exterior que protege un interior extremadamente sensible. Necesitan sentirse seguros antes de abrirse al mundo.

## Fortalezas

- Empatía e intuición excepcionales
- Amor y cuidado incondicional
- Memoria emocional privilegiada
- Creatividad e imaginación
- Lealtad y protección hacia los suyos

## Desafíos

- Hipersensibilidad y susceptibilidad
- Tendencia al aislamiento cuando se hieren
- Apego excesivo al pasado
- Manipulación emocional inconsciente
- Cambios de humor frecuentes

## Cáncer en el Amor

En el amor, Cáncer es el más devoto y entregado del zodíaco. Busca una relación profunda y duradera donde pueda sentirse seguro. El hogar y la familia son sus prioridades. Es sumamente romántico y detallista, pero necesita que su pareja sea paciente con sus ciclos emocionales.

## Compatibilidades

- **Muy compatible:** Escorpio, Piscis, Tauro, Virgo
- **Compatible:** Cáncer, Capricornio (opuesto complementario)
- **Desafiante:** Aries, Libra

## Cáncer y el Tarot

El arcano mayor asociado a Cáncer es **El Carro (VII)**, que simboliza el control emocional, la determinación y el avance victorioso. Ambos reflejan la fuerza que nace de las profundidades emocionales.

## Datos Curiosos

- Su gema es la perla y la piedra lunar
- Su color es el plateado, blanco y turquesa
- Governa el pecho, el estómago y el sistema digestivo
- Es el signo más relacionado con la cocina y el hogar
`,
    metadata: {
      symbol: '♋',
      element: 'water',
      modality: 'cardinal',
      rulingPlanet: 'moon',
      dateRange: '21 Jun - 22 Jul',
      compatibleSigns: ['scorpio', 'pisces', 'taurus', 'virgo'],
      gem: 'perla, piedra lunar',
      color: 'plateado, blanco, turquesa',
      bodyPart: 'pecho y estómago',
    },
    relatedTarotCards: [7], // El Carro
    sortOrder: 4,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. LEO
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'leo',
    nameEs: 'Leo',
    nameEn: 'Leo',
    category: ArticleCategory.ZODIAC_SIGN,
    snippet:
      'Leo es el quinto signo del zodíaco, regido por el Sol, con elemento Fuego y modalidad Fija. Irradia carisma, generosidad y una creatividad desbordante. Es el rey o la reina natural del zodíaco, nacido para brillar y liderar con el corazón.',
    content: `# Leo

**Fechas:** 23 de julio — 22 de agosto
**Elemento:** Fuego
**Modalidad:** Fija
**Planeta regente:** El Sol
**Símbolo:** ♌ El León

## Carácter y Personalidad

Leo es el quinto signo del zodíaco y el arquetipo del rey. Regido por el Sol, fuente de toda vida y luz, Leo irradia una energía cálida, generosa y magnética. Las personas Leo son naturalmente carismáticas, creativas y tienen una presencia que no pasa desapercibida.

Su naturaleza Fija les da una determinación y constancia admirables. Una vez que Leo se compromete con algo —sea una causa, una relación o una visión— lo defiende con todo su corazón.

## Fortalezas

- Carisma y magnetismo personal
- Generosidad y lealtad
- Creatividad y expresión artística
- Liderazgo natural con calidez
- Optimismo y vitalidad

## Desafíos

- Arrogancia y necesidad de reconocimiento
- Dramatismo excesivo
- Dificultad para aceptar críticas
- Centralismo (todo gira a su alrededor)
- Vanidad en exceso

## Leo en el Amor

En el amor, Leo es apasionado, romántico y extraordinariamente generoso. Quiere ser adorado y admirado, pero también da todo lo que tiene. Es fiel y protector. Necesita una pareja que lo valore y celebre quien es, no que lo opaque.

## Compatibilidades

- **Muy compatible:** Aries, Sagitario, Géminis, Libra
- **Compatible:** Leo, Acuario (opuesto complementario)
- **Desafiante:** Tauro, Escorpio

## Leo y el Tarot

El arcano mayor asociado a Leo es **La Fuerza (VIII/XI)**, símbolo de valor interior, dominio propio y poder que surge del amor. Ambos representan la grandeza que nace no de la fuerza bruta, sino del corazón.

## Datos Curiosos

- Su gema es el topacio y el rubí
- Su color es el dorado y el naranja
- Governa el corazón y la columna vertebral
- Es el signo más asociado con el teatro y la actuación
`,
    metadata: {
      symbol: '♌',
      element: 'fire',
      modality: 'fixed',
      rulingPlanet: 'sun',
      dateRange: '23 Jul - 22 Ago',
      compatibleSigns: ['aries', 'sagittarius', 'gemini', 'libra'],
      gem: 'topacio, rubí',
      color: 'dorado, naranja',
      bodyPart: 'corazón y columna vertebral',
    },
    relatedTarotCards: [8], // La Fuerza
    sortOrder: 5,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. VIRGO
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'virgo',
    nameEs: 'Virgo',
    nameEn: 'Virgo',
    category: ArticleCategory.ZODIAC_SIGN,
    snippet:
      'Virgo es el sexto signo del zodíaco, regido por Mercurio, con elemento Tierra y modalidad Mutable. Encarna el análisis minucioso, el servicio desinteresado y la búsqueda incesante de perfección y orden en todos los aspectos de la vida.',
    content: `# Virgo

**Fechas:** 23 de agosto — 22 de septiembre
**Elemento:** Tierra
**Modalidad:** Mutable
**Planeta regente:** Mercurio
**Símbolo:** ♍ La Virgen

## Carácter y Personalidad

Virgo es el sexto signo del zodíaco y el arquetipo del artesano y el sanador. Regido por Mercurio, aplica la inteligencia y la comunicación con una precisión meticulosa. Las personas Virgo son analíticas, trabajadoras y tienen una capacidad innata para detectar detalles que otros pasan por alto.

A diferencia de Géminis (también regido por Mercurio), Virgo aplica esa energía mercurial en el plano material y práctico, perfeccionando procesos y sirviendo a los demás.

## Fortalezas

- Inteligencia analítica y precisión
- Habilidad de organización excepcional
- Dedicación y ética de trabajo
- Humildad y servicio genuino
- Habilidades sanadoras y de cuidado

## Desafíos

- Perfeccionismo paralizante
- Autocrítica excesiva
- Ansiedad y preocupación crónica
- Hipercriticismo hacia otros
- Dificultad para relajarse y disfrutar

## Virgo en el Amor

En el amor, Virgo es servicial, fiel y atento a los detalles. No es el más expresivo verbalmente, pero lo demuestra con actos concretos. Busca una pareja confiable e inteligente. Puede parecer frío al principio, pero una vez que confía, es sumamente dedicado.

## Compatibilidades

- **Muy compatible:** Tauro, Capricornio, Cáncer, Escorpio
- **Compatible:** Virgo, Piscis (opuesto complementario)
- **Desafiante:** Sagitario, Géminis

## Virgo y el Tarot

El arcano mayor asociado a Virgo es **El Ermitaño (IX)**, símbolo de la búsqueda interior, la sabiduría acumulada y el servicio silencioso. Ambos representan la luz que guía a otros desde la discreción y el conocimiento profundo.

## Datos Curiosos

- Su gema es el zafiro y la cornalina
- Su color es el verde y el café terroso
- Governa el intestino delgado y el sistema digestivo
- Es el signo más relacionado con la medicina y la nutrición
`,
    metadata: {
      symbol: '♍',
      element: 'earth',
      modality: 'mutable',
      rulingPlanet: 'mercury',
      dateRange: '23 Ago - 22 Sep',
      compatibleSigns: ['taurus', 'capricorn', 'cancer', 'scorpio'],
      gem: 'zafiro, cornalina',
      color: 'verde, café terroso',
      bodyPart: 'intestino delgado y sistema digestivo',
    },
    relatedTarotCards: [9], // El Ermitaño
    sortOrder: 6,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 7. LIBRA
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'libra',
    nameEs: 'Libra',
    nameEn: 'Libra',
    category: ArticleCategory.ZODIAC_SIGN,
    snippet:
      'Libra es el séptimo signo del zodíaco, regido por Venus, con elemento Aire y modalidad Cardinal. Es el signo del equilibrio, la justicia y la belleza armoniosa. Posee un don natural para la diplomacia y para ver todos los lados de cualquier situación.',
    content: `# Libra

**Fechas:** 23 de septiembre — 22 de octubre
**Elemento:** Aire
**Modalidad:** Cardinal
**Planeta regente:** Venus
**Símbolo:** ♎ La Balanza

## Carácter y Personalidad

Libra es el séptimo signo del zodíaco y el arquetipo del diplomático y el juez. Regido por Venus, al igual que Tauro, pero expresando su energía en el plano de las ideas y las relaciones sociales. Las personas Libra tienen un sentido innato de la justicia y la estética.

Su modalidad Cardinal, combinada con el elemento Aire, hace de Libra un iniciador de relaciones y un creador de armonía. Sin embargo, esta búsqueda constante de equilibrio puede llevarlos a la indecisión crónica.

## Fortalezas

- Diplomacia y habilidad mediadora
- Sentido de la justicia y la equidad
- Encanto natural y magnetismo social
- Apreciación estética refinada
- Capacidad para ver todos los puntos de vista

## Desafíos

- Indecisión y dependencia de la opinión ajena
- Evitación del conflicto a toda costa
- Superficialidad en aras de la armonía
- Codependencia en relaciones
- Dificultad para establecer límites propios

## Libra en el Amor

En el amor, Libra es el signo del romanticismo por excelencia. Busca la pareja ideal y se dedica por completo a la relación. Valora la comunicación, el respeto mutuo y la estética compartida. Puede ser indeciso al principio, pero una vez comprometido, pone todo su esfuerzo en la relación.

## Compatibilidades

- **Muy compatible:** Géminis, Acuario, Leo, Sagitario
- **Compatible:** Libra, Aries (opuesto complementario)
- **Desafiante:** Cáncer, Capricornio

## Libra y el Tarot

El arcano mayor asociado a Libra es **La Justicia (VIII/XI)**, símbolo del equilibrio perfecto, la ley kármica y la toma de decisiones imparciales. Ambos representan la búsqueda de la verdad y la equidad en todas las situaciones.

## Datos Curiosos

- Su gema es el ópalo y el cuarzo rosa
- Su color es el rosa, el azul claro y el verde menta
- Governa los riñones y la zona lumbar
- Es el signo más asociado con el derecho y la mediación
`,
    metadata: {
      symbol: '♎',
      element: 'air',
      modality: 'cardinal',
      rulingPlanet: 'venus',
      dateRange: '23 Sep - 22 Oct',
      compatibleSigns: ['gemini', 'aquarius', 'leo', 'sagittarius'],
      gem: 'ópalo, cuarzo rosa',
      color: 'rosa, azul claro, verde menta',
      bodyPart: 'riñones y zona lumbar',
    },
    relatedTarotCards: [11], // La Justicia
    sortOrder: 7,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 8. ESCORPIO
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'escorpio',
    nameEs: 'Escorpio',
    nameEn: 'Scorpio',
    category: ArticleCategory.ZODIAC_SIGN,
    snippet:
      'Escorpio es el octavo signo del zodíaco, regido por Plutón y Marte, con elemento Agua y modalidad Fija. Encarna la transformación profunda, el poder de la muerte y el renacimiento, y una intensidad emocional que no conoce medias tintas.',
    content: `# Escorpio

**Fechas:** 23 de octubre — 21 de noviembre
**Elemento:** Agua
**Modalidad:** Fija
**Planeta regente:** Plutón / Marte
**Símbolo:** ♏ El Escorpión

## Carácter y Personalidad

Escorpio es el octavo signo del zodíaco y el arquetipo del alquimista y el detective. Regido por Plutón (transformación, muerte y renacimiento) y co-regido por Marte (acción e intensidad), Escorpio es el signo más profundo, intenso y transformador del zodíaco.

Las personas Escorpio tienen una percepción extraordinaria que les permite ver debajo de la superficie. Son magnéticos, apasionados y poseen una voluntad de hierro. Su lema podría ser: "morir para renacer".

## Fortalezas

- Profundidad emocional y psicológica
- Determinación y voluntad inquebrantable
- Percepción y intuición excepcionales
- Capacidad de transformación y resiliencia
- Lealtad absoluta a quienes ama

## Desafíos

- Celos y posesividad intensa
- Tendencia a guardar rencor
- Desconfianza y secretismo
- Comportamiento manipulador en momentos de inseguridad
- Extremismo: todo o nada

## Escorpio en el Amor

En el amor, Escorpio es el más apasionado e intenso del zodíaco. Busca una fusión total con su pareja. La intimidad emocional es tan importante como la física. No acepta superficialidades ni traiciones. Puede ser extremadamente celoso, pero también profundamente fiel.

## Compatibilidades

- **Muy compatible:** Cáncer, Piscis, Virgo, Capricornio
- **Compatible:** Escorpio, Tauro (opuesto complementario)
- **Desafiante:** Leo, Acuario

## Escorpio y el Tarot

Los arcanos mayores asociados a Escorpio son **La Muerte (XIII)** y **El Juicio (XX)**, que simbolizan la transformación inevitable, el fin de un ciclo y el renacimiento hacia una nueva vida más auténtica.

## Datos Curiosos

- Su gema es el granate y la obsidiana
- Su color es el negro, el rojo oscuro y el granate
- Governa los órganos reproductores y el sistema excretor
- Es el signo más asociado con la psicología y lo oculto
`,
    metadata: {
      symbol: '♏',
      element: 'water',
      modality: 'fixed',
      rulingPlanet: 'pluto / mars',
      dateRange: '23 Oct - 21 Nov',
      compatibleSigns: ['cancer', 'pisces', 'virgo', 'capricorn'],
      gem: 'granate, obsidiana',
      color: 'negro, rojo oscuro, granate',
      bodyPart: 'órganos reproductores',
    },
    relatedTarotCards: [13, 20], // La Muerte, El Juicio
    sortOrder: 8,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 9. SAGITARIO
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'sagitario',
    nameEs: 'Sagitario',
    nameEn: 'Sagittarius',
    category: ArticleCategory.ZODIAC_SIGN,
    snippet:
      'Sagitario es el noveno signo del zodíaco, regido por Júpiter, con elemento Fuego y modalidad Mutable. Simboliza la búsqueda filosófica de la verdad, la aventura expansiva y el optimismo desbordante que impulsa a explorar horizontes siempre más amplios.',
    content: `# Sagitario

**Fechas:** 22 de noviembre — 21 de diciembre
**Elemento:** Fuego
**Modalidad:** Mutable
**Planeta regente:** Júpiter
**Símbolo:** ♐ El Arquero / El Centauro

## Carácter y Personalidad

Sagitario es el noveno signo del zodíaco y el arquetipo del filósofo y el explorador. Regido por Júpiter, el planeta de la expansión y la fortuna, Sagitario vive en constante búsqueda del significado, la verdad y la aventura. Las personas Sagitario son optimistas, directas y amantes de la libertad.

Su modalidad Mutable les da una flexibilidad y adaptabilidad que les permite encontrarse cómodos en casi cualquier cultura, país o situación. Son los viajeros del zodíaco, tanto en el sentido físico como espiritual.

## Fortalezas

- Optimismo y visión expansiva
- Amor por la libertad y la aventura
- Sabiduría filosófica y búsqueda de verdad
- Honestidad y franqueza (a veces brutal)
- Generosidad y entusiasmo contagioso

## Desafíos

- Falta de tacto e imprudencia verbal
- Miedo al compromiso y a ser "encasillado"
- Superficialidad al no profundizar
- Promesas que no siempre cumple
- Impaciencia con los detalles

## Sagitario en el Amor

En el amor, Sagitario busca una pareja que sea también su compañera de aventuras. Valora la libertad, el crecimiento mutuo y la diversión. No le gustan las relaciones sofocantes. Puede tardar en comprometerse, pero cuando lo hace, aporta alegría, honestidad y una visión inspiradora.

## Compatibilidades

- **Muy compatible:** Aries, Leo, Libra, Acuario
- **Compatible:** Sagitario, Géminis (opuesto complementario)
- **Desafiante:** Virgo, Piscis

## Sagitario y el Tarot

El arcano mayor asociado a Sagitario es **La Templanza (XIV)**, símbolo del equilibrio entre mundos, la alquimia espiritual y la búsqueda del propósito superior. Ambos representan la integración de lo humano y lo divino en el camino hacia la sabiduría.

## Datos Curiosos

- Su gema es el lapislázuli y la turquesa
- Su color es el azul índigo y el violeta
- Governa los muslos, la cadera y el sistema nervioso central
- Es el signo más asociado con la filosofía y las religiones comparadas
`,
    metadata: {
      symbol: '♐',
      element: 'fire',
      modality: 'mutable',
      rulingPlanet: 'jupiter',
      dateRange: '22 Nov - 21 Dic',
      compatibleSigns: ['aries', 'leo', 'libra', 'aquarius'],
      gem: 'lapislázuli, turquesa',
      color: 'azul índigo, violeta',
      bodyPart: 'muslos, cadera y sistema nervioso',
    },
    relatedTarotCards: [14], // La Templanza
    sortOrder: 9,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 10. CAPRICORNIO
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'capricornio',
    nameEs: 'Capricornio',
    nameEn: 'Capricorn',
    category: ArticleCategory.ZODIAC_SIGN,
    snippet:
      'Capricornio es el décimo signo del zodíaco, regido por Saturno, con elemento Tierra y modalidad Cardinal. Es el signo de la ambición disciplinada, la responsabilidad y la paciencia estratégica para alcanzar las metas más elevadas con esfuerzo sostenido.',
    content: `# Capricornio

**Fechas:** 22 de diciembre — 19 de enero
**Elemento:** Tierra
**Modalidad:** Cardinal
**Planeta regente:** Saturno
**Símbolo:** ♑ El Cabra-Pez / La Cabra Montesa

## Carácter y Personalidad

Capricornio es el décimo signo del zodíaco y el arquetipo del estratega y el maestro del éxito material. Regido por Saturno, el planeta de la disciplina y las limitaciones, Capricornio encarna la paciencia, la responsabilidad y la ambición a largo plazo.

Las personas Capricornio entienden que el éxito no se improvisa: se construye ladrillo a ladrillo, con esfuerzo constante y planificación estratégica. Son los escaladores del zodíaco: paso a paso, pero siempre hacia arriba.

## Fortalezas

- Disciplina y constancia excepcionales
- Responsabilidad y fiabilidad
- Ambición estratégica y visión a largo plazo
- Practicidad y sentido de la realidad
- Capacidad de liderazgo en estructuras establecidas

## Desafíos

- Rigidez y exceso de control
- Pesimismo y miedo al fracaso
- Trabajo excesivo y descuido de lo emocional
- Materialismo y frialdad aparente
- Dificultad para soltar el control

## Capricornio en el Amor

En el amor, Capricornio puede parecer reservado al principio, pero es profundamente leal y comprometido. Valora la estabilidad, el respeto mutuo y la construcción de algo duradero. Necesita tiempo para abrirse emocionalmente, pero una vez que lo hace, es un compañero de vida extraordinario.

## Compatibilidades

- **Muy compatible:** Tauro, Virgo, Escorpio, Piscis
- **Compatible:** Capricornio, Cáncer (opuesto complementario)
- **Desafiante:** Aries, Libra

## Capricornio y el Tarot

El arcano mayor asociado a Capricornio es **El Diablo (XV)**, que simboliza las cadenas materiales, las ilusiones que nos limitan y el poder de la materia sobre el espíritu. Paradójicamente, es el signo que mejor puede trascender estas limitaciones mediante el autoconocimiento y la disciplina.

## Datos Curiosos

- Su gema es el granate y el ónice negro
- Su color es el negro, el gris y el marrón oscuro
- Governa los huesos, las articulaciones y la piel
- Es el signo más asociado con los negocios y las estructuras institucionales
`,
    metadata: {
      symbol: '♑',
      element: 'earth',
      modality: 'cardinal',
      rulingPlanet: 'saturn',
      dateRange: '22 Dic - 19 Ene',
      compatibleSigns: ['taurus', 'virgo', 'scorpio', 'pisces'],
      gem: 'granate, ónice negro',
      color: 'negro, gris, marrón oscuro',
      bodyPart: 'huesos, articulaciones y piel',
    },
    relatedTarotCards: [15], // El Diablo
    sortOrder: 10,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 11. ACUARIO
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'acuario',
    nameEs: 'Acuario',
    nameEn: 'Aquarius',
    category: ArticleCategory.ZODIAC_SIGN,
    snippet:
      'Acuario es el undécimo signo del zodíaco, regido por Urano y Saturno, con elemento Aire y modalidad Fija. Encarna la visión innovadora, el pensamiento revolucionario y el compromiso apasionado con el bienestar colectivo y la libertad universal.',
    content: `# Acuario

**Fechas:** 20 de enero — 18 de febrero
**Elemento:** Aire
**Modalidad:** Fija
**Planeta regente:** Urano / Saturno
**Símbolo:** ♒ El Aguador

## Carácter y Personalidad

Acuario es el undécimo signo del zodíaco y el arquetipo del visionario y el revolucionario. Regido por Urano (el planeta de la revolución, la innovación y los cambios repentinos) y co-regido por Saturno, Acuario vive entre dos mundos: la estructura del pasado y la visión del futuro.

Las personas Acuario son originales, independientes y profundamente comprometidas con los ideales de libertad, igualdad y progreso social. Pueden parecer distantes emocionalmente, pero su amor por la humanidad es genuino y profundo.

## Fortalezas

- Pensamiento innovador y original
- Visión futurista y humanitaria
- Independencia y autenticidad
- Brillantez intelectual
- Capacidad de trabajo en comunidad por causas nobles

## Desafíos

- Distancia emocional y frialdad aparente
- Exceso de intelectualización
- Terquedad en sus ideas (modalidad Fija)
- Tendencia al aislamiento cuando se siente incomprendido
- Rebelión sin causa a veces

## Acuario en el Amor

En el amor, Acuario busca ante todo una amistad profunda. Necesita una pareja que respete su independencia y que comparta sus ideales. No es el más expresivo emocionalmente, pero es fiel a su manera. Las relaciones convencionales pueden no satisfacerle; prefiere dinámicas únicas y libres.

## Compatibilidades

- **Muy compatible:** Géminis, Libra, Aries, Sagitario
- **Compatible:** Acuario, Leo (opuesto complementario)
- **Desafiante:** Tauro, Escorpio

## Acuario y el Tarot

El arcano mayor asociado a Acuario es **La Estrella (XVII)**, símbolo de esperanza, inspiración y guía luminosa hacia el futuro. Ambos representan la visión que trasciende las limitaciones del presente para vislumbrar un mundo mejor.

## Datos Curiosos

- Su gema es el amatista y el zafiro
- Su color es el azul eléctrico y el plateado
- Governa los tobillos, las pantorrillas y el sistema circulatorio
- Es el signo más asociado con la tecnología y los movimientos sociales
`,
    metadata: {
      symbol: '♒',
      element: 'air',
      modality: 'fixed',
      rulingPlanet: 'uranus / saturn',
      dateRange: '20 Ene - 18 Feb',
      compatibleSigns: ['gemini', 'libra', 'aries', 'sagittarius'],
      gem: 'amatista, zafiro',
      color: 'azul eléctrico, plateado',
      bodyPart: 'tobillos y sistema circulatorio',
    },
    relatedTarotCards: [17], // La Estrella
    sortOrder: 11,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 12. PISCIS
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'piscis',
    nameEs: 'Piscis',
    nameEn: 'Pisces',
    category: ArticleCategory.ZODIAC_SIGN,
    snippet:
      'Piscis es el doceavo y último signo del zodíaco, regido por Neptuno y Júpiter, con elemento Agua y modalidad Mutable. Es el signo de la compasión universal, la imaginación creativa sin límites y la profunda conexión espiritual con todo lo que existe.',
    content: `# Piscis

**Fechas:** 19 de febrero — 20 de marzo
**Elemento:** Agua
**Modalidad:** Mutable
**Planeta regente:** Neptuno / Júpiter
**Símbolo:** ♓ Los Peces

## Carácter y Personalidad

Piscis es el doceavo y último signo del zodíaco, síntesis y culminación de todos los signos anteriores. Regido por Neptuno (el planeta de los sueños, la espiritualidad y la ilusión), Piscis vive entre la realidad y el mundo invisible. Es el signo más empático, intuitivo y espiritual del zodíaco.

Las personas Piscis poseen una sensibilidad artística y espiritual sin igual. Absorben las emociones del entorno como esponjas, lo que puede ser su mayor don o su mayor desafío.

## Fortalezas

- Empatía e intuición extraordinarias
- Creatividad artística y espiritual
- Compasión y amor incondicional
- Conexión con el plano espiritual e inconsciente
- Adaptabilidad y fluidez

## Desafíos

- Tendencia a la evasión y el escapismo
- Idealismo que choca con la realidad
- Hipersensibilidad que lleva al agotamiento
- Dificultad para establecer límites
- Susceptibilidad a adicciones o dependencias emocionales

## Piscis en el Amor

En el amor, Piscis es el romántico más soñador del zodíaco. Se entrega completamente y con frecuencia idealiza a su pareja. Busca una conexión alma con alma, más allá de lo físico. Necesita una pareja que proteja su sensibilidad sin aprovecharla.

## Compatibilidades

- **Muy compatible:** Cáncer, Escorpio, Tauro, Capricornio
- **Compatible:** Piscis, Virgo (opuesto complementario)
- **Desafiante:** Géminis, Sagitario

## Piscis y el Tarot

El arcano mayor asociado a Piscis es **La Luna (XVIII)**, símbolo del inconsciente profundo, los sueños, la ilusión y el mundo entre mundos. Ambos representan la navegación en las aguas de lo intangible y lo misterioso.

## Datos Curiosos

- Su gema es la amatista y la aguamarina
- Su color es el azul marino, el violeta y el verde mar
- Governa los pies y el sistema linfático
- Es el signo más asociado con la música, la poesía y la espiritualidad
`,
    metadata: {
      symbol: '♓',
      element: 'water',
      modality: 'mutable',
      rulingPlanet: 'neptune / jupiter',
      dateRange: '19 Feb - 20 Mar',
      compatibleSigns: ['cancer', 'scorpio', 'taurus', 'capricorn'],
      gem: 'amatista, aguamarina',
      color: 'azul marino, violeta, verde mar',
      bodyPart: 'pies y sistema linfático',
    },
    relatedTarotCards: [18], // La Luna
    sortOrder: 12,
  },
];
