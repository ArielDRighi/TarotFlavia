import { ArticleCategory } from '../enums/article.enums';
import { ArticleSeedData } from './articles-seed.types';

/**
 * 6 Guías de Actividades — datos seed para la Enciclopedia Mística
 *
 * Guías: Numerología, Péndulo, Carta Astral, Rituales, Horóscopo Occidental, Horóscopo Chino
 * Categorías: GUIDE_NUMEROLOGY, GUIDE_PENDULUM, GUIDE_BIRTH_CHART, GUIDE_RITUAL, GUIDE_HOROSCOPE, GUIDE_CHINESE
 */
export const ACTIVITY_GUIDES: ArticleSeedData[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // GUÍA DE NUMEROLOGÍA
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'guia-numerologia',
    nameEs: 'Guía de Numerología',
    nameEn: 'Numerology Guide',
    category: ArticleCategory.GUIDE_NUMEROLOGY,
    snippet:
      'La numerología es el estudio del significado esotérico de los números y su influencia en la vida humana. Esta guía te enseña a calcular e interpretar tu Número de Vida, Número de Destino y otros números clave para comprender tu propósito y camino de vida.',
    content: `# Guía de Numerología

## ¿Qué es la Numerología?

La numerología es el estudio del significado místico y simbólico de los números. Basada en la idea pitagórica de que el universo puede expresarse en términos matemáticos, la numerología utiliza los números presentes en la fecha de nacimiento y el nombre para revelar información sobre la personalidad, el propósito de vida y los ciclos temporales.

## Números Fundamentales

### Número de Vida (Número del Camino de Vida)

Es el número más importante en numerología. Se calcula sumando todos los dígitos de la fecha de nacimiento hasta obtener un número del 1 al 9 (o 11, 22 o 33, los números maestros).

**Ejemplo:** 15 de agosto de 1990
→ 1 + 5 + 0 + 8 + 1 + 9 + 9 + 0 = 33 → 3 + 3 = **6**

### Significado de los Números de Vida

- **1 — El Pionero:** Independencia, liderazgo, originalidad
- **2 — El Diplomático:** Cooperación, sensibilidad, armonía
- **3 — El Comunicador:** Creatividad, expresión, optimismo
- **4 — El Constructor:** Disciplina, trabajo, estabilidad
- **5 — El Aventurero:** Libertad, cambio, versatilidad
- **6 — El Cuidador:** Amor, responsabilidad, hogar y familia
- **7 — El Sabio:** Análisis, espiritualidad, búsqueda interior
- **8 — El Ejecutivo:** Poder, abundancia, logros materiales
- **9 — El Humanitario:** Compasión, universalidad, completud

### Números Maestros

- **11:** El Maestro Intuitivo — alta sensibilidad e inspiración espiritual
- **22:** El Maestro Constructor — capacidad de materializar grandes visiones
- **33:** El Maestro Maestro — servicio compasivo a la humanidad

## Número de Destino (Número de Expresión)

Se calcula asignando valores numéricos a las letras del nombre completo y sumándolos.

| A, J, S = 1 | B, K, T = 2 | C, L, U = 3 | D, M, V = 4 |
|---|---|---|---|
| E, N, W = 5 | F, O, X = 6 | G, P, Y = 7 | H, Q, Z = 8 |
| I, R = 9 |

## Año Personal

Se calcula sumando el mes y el día de nacimiento al año universal actual:
**Año Universal** = Suma de los dígitos del año en curso

Tu **Año Personal** determina los temas dominantes del ciclo de 12 meses actual.

## Cómo Usar la Numerología

1. Calcula tus números fundamentales
2. Estudia su significado en relación con tu experiencia de vida
3. Identifica los ciclos temporales (mes personal, año personal)
4. Usa los números como guía, no como determinismo absoluto
`,
    metadata: {
      type: 'guide',
      topic: 'numerology',
    },
    relatedTarotCards: null,
    sortOrder: 1,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // GUÍA DEL PÉNDULO
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'guia-pendulo',
    nameEs: 'Guía del Péndulo',
    nameEn: 'Pendulum Guide',
    category: ArticleCategory.GUIDE_PENDULUM,
    snippet:
      'El péndulo es una herramienta de radiestesia que amplifica las respuestas del inconsciente. Esta guía te enseña a elegir tu péndulo, calibrarlo, formular preguntas correctas y a interpretar sus respuestas para acceder a tu sabiduría interior de forma práctica y confiable.',
    content: `# Guía del Péndulo

## ¿Qué es el Péndulo?

El péndulo es una herramienta de radiestesia (detección de energías sutiles) compuesta por un objeto colgado de un hilo o cadena. Se utiliza para acceder a la sabiduría del inconsciente, las respuestas del cuerpo o la información del campo energético que nos rodea.

El movimiento del péndulo es causado por movimientos musculares involuntarios (efecto ideomotor) que responden a información que el consciente no puede acceder directamente. No es magia — es una forma de escuchar más profundamente.

## Tipos de Péndulos

- **Cuarzo transparente:** Amplificador universal, claridad
- **Amatista:** Conexión espiritual e intuición
- **Cuarzo rosa:** Cuestiones del corazón y emociones
- **Obsidiana:** Protección y respuestas directas
- **Cobre o latón:** Sensibilidad energética alta
- **Madera:** Conexión con la naturaleza y lo terrenal

## Cómo Calibrar tu Péndulo

### Paso 1: Establecer las Respuestas Base

Sostén el péndulo colgando libremente y di en voz alta o mentalmente:
- "Muéstrame el SÍ" → Observa el movimiento (circular, lineal, etc.)
- "Muéstrame el NO" → Observa el movimiento contrario
- "Muéstrame el SIN RESPUESTA / NO LO SÉ"

### Paso 2: Verificar la Calibración

Haz una pregunta cuya respuesta ya conozcas:
- "¿Me llamo [tu nombre]?" → Debe responder SÍ
- "¿Vivo en [ciudad incorrecta]?" → Debe responder NO

## Reglas para Formular Preguntas

✅ **Preguntas adecuadas:**
- Claras y específicas
- Con respuesta de SÍ o NO
- Sobre el presente o el futuro inmediato
- Sobre lo que puedes verificar o sobre lo que tienes libre albedrío

❌ **Preguntas inadecuadas:**
- Cargadas emocionalmente (el deseo interfiere)
- Sobre la muerte o el daño de personas
- Sobre el futuro lejano e inamovible
- Formuladas de forma ambigua

## Rituales de Uso

1. **Limpia** tu péndulo antes de cada uso (agua, sal, humo de salvia)
2. **Conecta** contigo mismo: respira profundo y centra tu mente
3. **Protege** tu espacio: puedes visualizar luz blanca a tu alrededor
4. **Formula** con claridad y honestidad
5. **Agradece** al finalizar

## Interpretación Avanzada

Con práctica puedes usar el péndulo sobre mapas, cartas numerológicas, listas de opciones o el propio cuerpo para detectar desequilibrios energéticos.
`,
    metadata: {
      type: 'guide',
      topic: 'pendulum',
    },
    relatedTarotCards: null,
    sortOrder: 1,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // GUÍA DE CARTA ASTRAL
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'guia-carta-astral',
    nameEs: 'Guía de Carta Astral',
    nameEn: 'Birth Chart Guide',
    category: ArticleCategory.GUIDE_BIRTH_CHART,
    snippet:
      'La carta astral o carta natal es el mapa del cielo en el momento exacto de tu nacimiento. Esta guía te explica cómo leer los elementos fundamentales de tu carta: los planetas, los signos, las casas y los aspectos, para descubrir tu propósito de vida y potencial único.',
    content: `# Guía de Carta Astral

## ¿Qué es la Carta Astral?

La carta astral (o carta natal) es una representación gráfica de la posición de los planetas en el momento exacto de tu nacimiento, vista desde el lugar donde naciste. Es literalmente un "mapa del cielo" que sirve como herramienta de autoconocimiento.

No determina el destino de forma absoluta — revela potenciales, tendencias y desafíos que tienes la libertad de expresar consciente o inconscientemente.

## Los Cuatro Pilares de la Carta Natal

### 1. Los Planetas (El QUÉ)

Cada planeta representa una función psicológica o área de vida:
- **Sol:** Identidad consciente y propósito
- **Luna:** Emociones e instintos
- **Mercurio:** Mente y comunicación
- **Venus:** Amor y valores
- **Marte:** Acción y deseo
- **Júpiter:** Expansión y filosofía
- **Saturno:** Disciplina y karma
- **Urano:** Revolución y originalidad
- **Neptuno:** Espiritualidad e intuición
- **Plutón:** Transformación y poder

### 2. Los Signos (El CÓMO)

El signo en que se encuentra cada planeta describe el estilo con que esa energía se expresa. Por ejemplo, Marte en Aries actúa impulsivamente; Marte en Tauro actúa con paciencia y perseverancia.

### 3. Las Casas (El DÓNDE)

Las 12 casas representan las 12 áreas de vida. La posición de los planetas por casa indica en qué área de vida se expresa esa energía con mayor intensidad.

### 4. Los Aspectos (El POR QUÉ)

Los aspectos son los ángulos geométricos entre planetas. Los más importantes:
- **Conjunción (0°):** Fusión de energías
- **Trígono (120°):** Armonía y facilidad
- **Sextil (60°):** Oportunidades y talentos
- **Cuadratura (90°):** Tensión y desafíos que fortalecen
- **Oposición (180°):** Polaridad y necesidad de integración

## Los Puntos Angulares

- **Ascendente (AC):** Cusp de Casa 1 — la máscara social y el primer acercamiento a la vida
- **Descendente (DC):** Cusp de Casa 7 — lo que buscamos en el otro
- **Medio Cielo (MC):** Cusp de Casa 10 — la vocación y la vida pública
- **Fondo del Cielo (IC):** Cusp de Casa 4 — las raíces y el mundo privado

## Cómo Empezar a Leer tu Carta

1. **El Sol, la Luna y el Ascendente** son el triángulo básico de la personalidad
2. **Los planetas con más aspectos** son los más activos en tu vida
3. **El planeta con más tensiones (cuadraturas)** señala tu mayor área de trabajo
4. **El planeta mejor aspectado** señala tus mayores talentos naturales
5. **Las casas con más planetas** son las áreas de vida más activas

## Herramientas Recomendadas

Para calcular tu carta natal necesitas: fecha de nacimiento, hora exacta y lugar de nacimiento. La hora es crítica — define el Ascendente y la posición de las casas.
`,
    metadata: {
      type: 'guide',
      topic: 'birth_chart',
    },
    relatedTarotCards: null,
    sortOrder: 1,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // GUÍA DE RITUALES
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'guia-rituales',
    nameEs: 'Guía de Rituales',
    nameEn: 'Rituals Guide',
    category: ArticleCategory.GUIDE_RITUAL,
    snippet:
      'Los rituales son prácticas sagradas que utilizan símbolos, intención y acción para conectar con las fuerzas del universo. Esta guía te enseña los fundamentos para crear rituales efectivos: los materiales, el momento adecuado, la intención y cómo trabajar con los ciclos lunares.',
    content: `# Guía de Rituales

## ¿Qué es un Ritual?

Un ritual es una práctica simbólica y consciente que utiliza la intención, los elementos sagrados y la repetición para conectar con las energías del universo, el inconsciente o la dimensión espiritual. Los rituales no requieren pertenecer a ninguna tradición específica — son herramientas universales de transformación.

La clave de un ritual efectivo no está en los objetos materiales, sino en la **intención consciente** y la **presencia plena** de quien lo realiza.

## Los Cuatro Elementos en los Rituales

### Fuego 🔥
- **Herramientas:** Velas, incienso, fogatas
- **Propósito:** Transformación, manifestación, purificación
- **Colores de velas:** Rojo (pasión/amor), blanco (purificación), verde (abundancia), azul (paz), negro (protección)

### Tierra 🌿
- **Herramientas:** Cristales, sal, tierra, plantas, flores
- **Propósito:** Enraizamiento, abundancia material, estabilidad

### Aire 💨
- **Herramientas:** Plumas, humo de salvia (smudging), campanas, sonidos
- **Propósito:** Claridad mental, comunicación, bendición del espacio

### Agua 💧
- **Herramientas:** Agua lunar, baños rituales, aceites esenciales
- **Propósito:** Purificación emocional, intuición, sanación

## Los Ciclos Lunares para Rituales

### Luna Nueva — Intención y Siembra
El momento ideal para comenzar proyectos y plantar semillas de intención. Escribe tus deseos y metas en papel.

### Cuarto Creciente — Acción y Momentum
Momento de acción, superar obstáculos y trabajar activamente hacia las intenciones plantadas.

### Luna Llena — Manifestación y Gratitud
El pico de energía del ciclo. Ideal para rituales de gratitud, manifestación y trabajo con lo que ya está floreciendo.

### Cuarto Menguante — Liberación y Limpieza
Momento de soltar, limpiar y liberar lo que ya no sirve. Rituales de desapego y purificación.

## Estructura de un Ritual Básico

1. **Preparación:** Limpia el espacio físico y energético (barrido, salvia, sonido)
2. **Apertura:** Define el espacio sagrado con una invocación, oración o intención
3. **El Trabajo:** Realiza la acción simbólica central del ritual
4. **Integración:** Siéntate en silencio con la energía generada
5. **Cierre:** Agradece y cierra el espacio conscientemente
6. **Acción en el mundo:** Toma una acción concreta que apoye tu intención

## Consejos para Rituales Efectivos

- La intención clara supera cualquier herramienta material
- La consistencia importa más que la perfección
- Adapta los rituales a tu propia tradición espiritual
- Documenta tus rituales en un diario mágico
- Respeta los resultados — a veces el universo responde diferente a lo esperado
`,
    metadata: {
      type: 'guide',
      topic: 'ritual',
    },
    relatedTarotCards: null,
    sortOrder: 1,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // GUÍA DE HORÓSCOPO OCCIDENTAL
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'guia-horoscopo-occidental',
    nameEs: 'Guía del Horóscopo Occidental',
    nameEn: 'Western Horoscope Guide',
    category: ArticleCategory.GUIDE_HOROSCOPE,
    snippet:
      'El horóscopo occidental es el sistema astrológico más conocido en Occidente, basado en los 12 signos del zodíaco tropical. Esta guía explica cómo leer un horóscopo más allá del signo solar, incorporando el ascendente y la luna para una lectura más completa y personalizada.',
    content: `# Guía del Horóscopo Occidental

## ¿Qué es el Horóscopo Occidental?

El horóscopo occidental es el sistema astrológico de tradición grecolatina, basado en el zodíaco tropical (dividido en 12 signos de 30° cada uno a partir del equinoccio de primavera). Es el sistema más ampliamente conocido en el mundo occidental.

A diferencia de la astrología popular (que solo considera el signo solar), la astrología occidental completa utiliza los 10 planetas principales, los 12 signos, las 12 casas y los aspectos entre planetas para crear un retrato profundo e individualizado.

## Los 12 Signos del Zodíaco Tropical

| Signo | Fechas | Elemento | Modalidad |
|-------|--------|----------|-----------|
| Aries | 21 Mar - 19 Abr | Fuego | Cardinal |
| Tauro | 20 Abr - 20 May | Tierra | Fija |
| Géminis | 21 May - 20 Jun | Aire | Mutable |
| Cáncer | 21 Jun - 22 Jul | Agua | Cardinal |
| Leo | 23 Jul - 22 Ago | Fuego | Fija |
| Virgo | 23 Ago - 22 Sep | Tierra | Mutable |
| Libra | 23 Sep - 22 Oct | Aire | Cardinal |
| Escorpio | 23 Oct - 21 Nov | Agua | Fija |
| Sagitario | 22 Nov - 21 Dic | Fuego | Mutable |
| Capricornio | 22 Dic - 19 Ene | Tierra | Cardinal |
| Acuario | 20 Ene - 18 Feb | Aire | Fija |
| Piscis | 19 Feb - 20 Mar | Agua | Mutable |

## El "Trío Personal"

Para una lectura más completa, debes conocer tres posiciones fundamentales:

### 1. Signo Solar (el Signo del Horóscopo)
La posición del Sol en tu fecha de nacimiento. Describe tu identidad consciente, propósito y la forma en que buscas brillar.

### 2. Signo Lunar
La posición de la Luna en tu fecha de nacimiento. Describe tus emociones, instintos y necesidades profundas. *Requiere conocer la hora de nacimiento.*

### 3. Ascendente (Signo Rising)
El signo que se encontraba en el horizonte Este en el momento de tu nacimiento. Describe tu apariencia, temperamento y la forma en que te proyectas al mundo. *Requiere hora exacta de nacimiento.*

## Cómo Leer un Horóscopo con Profundidad

1. Lee tu **horóscopo solar** para tendencias generales
2. Lee el horóscopo de tu **Ascendente** para temas que afectan tu vida cotidiana
3. Lee el horóscopo de tu **signo lunar** para el estado emocional del período
4. Considera los **tránsitos** de Júpiter y Saturno — son los más significativos

## Tránsitos Importantes

- **Júpiter:** Cada ~12 años retorna a su posición natal — ciclos de crecimiento
- **Saturno:** Cada ~29,5 años — ciclos de restructuración profunda
- **Eclipses:** Cada 6 meses — portales de cambio acelerado
- **Mercurio retrógrado:** 3-4 veces al año — revisión y comunicación

## Más Allá del Signo Solar

Recuerda: el signo solar es solo el 10% de tu carta natal. Para una comprensión verdadera, ninguna columna de horóscopo puede reemplazar el análisis personalizado de tu carta natal completa.
`,
    metadata: {
      type: 'guide',
      topic: 'western_horoscope',
    },
    relatedTarotCards: null,
    sortOrder: 1,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // GUÍA DE HORÓSCOPO CHINO
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'guia-horoscopo-chino',
    nameEs: 'Guía del Horóscopo Chino',
    nameEn: 'Chinese Horoscope Guide',
    category: ArticleCategory.GUIDE_CHINESE,
    snippet:
      'El horóscopo chino es un sistema astrológico milenario basado en ciclos de 12 años, cada uno representado por un animal. Esta guía explica los 12 signos del zodíaco chino, los cinco elementos, la dualidad Yin-Yang y cómo interpretar la compatibilidad entre los signos.',
    content: `# Guía del Horóscopo Chino

## ¿Qué es el Horóscopo Chino?

El horóscopo chino es un sistema astrológico milenario que forma parte de la filosofía china tradicional. A diferencia del zodíaco occidental (basado en el mes de nacimiento), el horóscopo chino se basa principalmente en el año de nacimiento y utiliza un ciclo de 12 años, cada uno asociado con un animal sagrado.

Este sistema se integra con los cinco elementos (Madera, Fuego, Tierra, Metal y Agua), la dualidad Yin-Yang, y considera también el mes, el día y la hora de nacimiento para lecturas más detalladas.

## Los 12 Animales del Zodíaco Chino

| Animal | Características | Años Recientes |
|--------|----------------|----------------|
| **Rata** | Inteligente, adaptable, carismática | 2008, 2020 |
| **Buey** | Trabajador, confiable, determinado | 2009, 2021 |
| **Tigre** | Valiente, competitivo, impredecible | 2010, 2022 |
| **Conejo** | Tranquilo, elegante, bondadoso | 2011, 2023 |
| **Dragón** | Enérgico, carismático, perfeccionista | 2012, 2024 |
| **Serpiente** | Sabia, intuitiva, refinada | 2013, 2025 |
| **Caballo** | Animado, activo, energético | 2014, 2026 |
| **Cabra** | Gentil, creativa, compasiva | 2015, 2027 |
| **Mono** | Ingenioso, curioso, versátil | 2016, 2028 |
| **Gallo** | Observador, trabajador, valiente | 2017, 2029 |
| **Perro** | Leal, honesto, amigable | 2018, 2030 |
| **Cerdo** | Generoso, diligente, optimista | 2019, 2031 |

## Los Cinco Elementos Chinos

Cada año dentro del ciclo de 12 lleva además la influencia de uno de los cinco elementos, creando un ciclo completo de 60 años:

- **Madera:** Crecimiento, flexibilidad, creatividad, generosidad
- **Fuego:** Pasión, dinamismo, liderazgo, transformación
- **Tierra:** Estabilidad, honestidad, practicidad, fiabilidad
- **Metal:** Determinación, ambición, fuerza, control
- **Agua:** Intuición, adaptabilidad, comunicación, sabiduría

## Compatibilidad entre Signos

Los 12 animales se agrupan en triángulos de alta compatibilidad:

- **Triángulo 1 (Acción):** Rata, Dragón, Mono
- **Triángulo 2 (Determinación):** Buey, Serpiente, Gallo
- **Triángulo 3 (Humanismo):** Tigre, Caballo, Perro
- **Triángulo 4 (Armonía):** Conejo, Cabra, Cerdo

Los signos opuestos (separados por 6 años) suelen tener tensión:
Rata ↔ Caballo | Buey ↔ Cabra | Tigre ↔ Mono | Conejo ↔ Gallo | Dragón ↔ Perro | Serpiente ↔ Cerdo

## El Año del Animal en Curso

Se dice que el año de tu propio signo animal es el más desafiante del ciclo de 12 años, pues estás "confrontando" a Tai Sui (el dios del año). Se recomienda llevar jade rojo o hacerse ofrendas al dios del año para protección.

## Más Allá del Animal del Año

Para una lectura completa del horóscopo chino también se considera:
- **Animal del mes** (rama terrestre del mes de nacimiento)
- **Animal del día** (rama terrestre del día de nacimiento)
- **Animal de la hora** (rama terrestre de la hora de nacimiento)

Juntos forman las "Cuatro Columnas" o BaZi, el sistema astrológico chino más completo.
`,
    metadata: {
      type: 'guide',
      topic: 'chinese_horoscope',
    },
    relatedTarotCards: null,
    sortOrder: 1,
  },
];
