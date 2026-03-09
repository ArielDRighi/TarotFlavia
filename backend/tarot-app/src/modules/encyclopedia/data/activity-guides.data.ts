import { ArticleCategory } from '../enums/article.enums';
import { ArticleSeedData } from './articles-seed.types';

/**
 * 6 Guías de Actividades — datos seed para la Enciclopedia Mística
 *
 * Guías: Tarot, Numerología, Péndulo, Carta Astral, Rituales, Horóscopo Occidental, Horóscopo Chino
 * Categorías: GUIDE_TAROT, GUIDE_NUMEROLOGY, GUIDE_PENDULUM, GUIDE_BIRTH_CHART, GUIDE_RITUAL, GUIDE_HOROSCOPE, GUIDE_CHINESE
 */
export const ACTIVITY_GUIDES: ArticleSeedData[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // GUÍA DEL TAROT
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'guia-tarot',
    nameEs: 'Guía del Tarot',
    nameEn: 'Tarot Guide',
    category: ArticleCategory.GUIDE_TAROT,
    snippet:
      'Descubre el antiguo arte adivinatorio del Tarot. Conoce los 78 arcanos, los significados de los Arcanos Mayores y Menores, y aprende cómo una tirada de cartas puede revelar mensajes sobre tu camino de vida.',
    content: `
# Guía del Tarot: El Espejo del Alma

El Tarot es un sistema simbólico de 78 cartas que se ha utilizado durante siglos como herramienta de autoconocimiento, meditación y orientación. Sus orígenes se remontan al siglo XV en Europa, aunque muchos estudiosos creen que sus raíces simbólicas son mucho más antiguas, vinculadas a tradiciones herméticas, cabalísticas y alquímicas.

## 1. ¿Qué es el Tarot?

El Tarot es mucho más que un mazo de cartas: es un mapa simbólico del viaje humano. Cada carta contiene arquetipos universales que resuenan con las experiencias, emociones y desafíos que todos enfrentamos a lo largo de la vida. No predice el futuro de forma determinista, sino que ilumina patrones, tendencias y posibilidades.

## 2. Los 78 Arcanos

El Tarot se divide en dos grandes grupos:

### Arcanos Mayores (22 cartas)

Los Arcanos Mayores representan arquetipos universales y grandes lecciones de vida. Desde **El Loco** (0), que simboliza el inicio de un viaje sin ataduras, hasta **El Mundo** (XXI), que representa la culminación y la integración, cada carta narra una etapa del camino del alma conocido como *El Viaje del Héroe*.

Estas 22 cartas abordan temas profundos: la voluntad (El Mago), la intuición (La Sacerdotisa), el amor (Los Enamorados), la transformación (La Muerte), la revelación (La Torre) y la renovación (El Juicio), entre otros.

### Arcanos Menores (56 cartas)

Los Arcanos Menores reflejan situaciones cotidianas y se organizan en cuatro palos:

- **Bastos (Fuego):** Creatividad, pasión, acción e inspiración.
- **Copas (Agua):** Emociones, relaciones, intuición y mundo interior.
- **Espadas (Aire):** Pensamiento, comunicación, conflictos y verdad.
- **Pentáculos (Tierra):** Materia, trabajo, finanzas y bienestar físico.

Cada palo contiene cartas numeradas del As al 10 y cuatro cartas de la corte (Sota, Caballero, Reina y Rey), que representan personas o aspectos de la personalidad.

## 3. ¿Cómo funciona una lectura?

Una lectura de Tarot utiliza el simbolismo de las cartas para iluminar patrones y posibilidades en la vida del consultante.

### Tipos de tiradas

- **Carta del Día:** Una sola carta que ofrece un mensaje o reflexión para la jornada.
- **Tirada de tres cartas:** Pasado, presente y futuro, o situación, acción y resultado.
- **Cruz Celta:** Una tirada de 10 cartas que ofrece un análisis profundo de una situación.

### Cartas al derecho e invertidas

Cada carta puede aparecer al derecho o invertida, lo que modifica o matiza su significado. Una carta invertida no es necesariamente negativa; puede indicar energía bloqueada, un aspecto interno del tema, o una lección pendiente.

## 4. El Tarot como herramienta de autoconocimiento

Más allá de la adivinación, el Tarot moderno se utiliza ampliamente como herramienta terapéutica y de desarrollo personal. Los arquetipos de los Arcanos Mayores conectan con el inconsciente colectivo descrito por Carl Jung, facilitando la introspección y el crecimiento personal.

## 5. Historia breve del Tarot

Los primeros mazos documentados aparecieron en la Italia del siglo XV como juegos de cartas aristocráticos (*carte da trionfi*). Con el tiempo, ocultistas como Antoine Court de Gébelin, Éliphas Lévi y Arthur Edward Waite transformaron el Tarot en una herramienta esotérica. El mazo **Rider-Waite-Smith** (1909), ilustrado por Pamela Colman Smith, se convirtió en el estándar moderno y sigue siendo el más utilizado en el mundo.
    `.trim(),
    sortOrder: 0,
    metadata: {
      relatedTools: ['carta-del-dia', 'tirada-de-tarot'],
      tradition: 'Hermética / Europea',
      cardCount: 78,
    },
    relatedTarotCards: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  // ─────────────────────────────────────────────────────────────────────────
  // GUÍA DE NUMEROLOGÍA
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'guia-numerologia',
    nameEs: 'Guía de Numerología',
    nameEn: 'Numerology Guide',
    category: ArticleCategory.GUIDE_NUMEROLOGY,
    snippet:
      'Descubre el lenguaje oculto de los números. Aprende a calcular tu Camino de Vida, tu Número del Alma y comprende cómo la numerología pitagórica revela el propósito de tu destino y tus ciclos personales.',
    content: `
# Guía Completa de Numerología: El Lenguaje Secreto del Universo

La numerología es una de las ciencias metafísicas más antiguas y precisas que existen. Se basa en la premisa fundamental de que el universo entero es un sistema y, una vez desglosado, nos quedamos con los elementos básicos: los números. En esta guía, exploraremos cómo estos números te afectan directamente y cómo puedes utilizarlos para descifrar tu propósito de vida.

## 1. ¿Qué es la Numerología y cuál es su origen?

La numerología es el estudio de la relación mística entre los números, las letras y los patrones. Al igual que la astrología utiliza los planetas, la numerología utiliza los números para describir quiénes somos y qué destino nos aguarda.

### La herencia de Pitágoras

Aunque existen varios sistemas numerológicos (como el Caldeo y el Cabalístico), el sistema más utilizado en el mundo occidental es el **Sistema Pitagórico**. Pitágoras, el filósofo y matemático griego (nacido alrededor del 569 a.C.), no inventó la numerología, pero sus teorías sobre la interconexión matemática del universo sentaron las bases. Él creía que el mundo estaba construido sobre el poder de los números y que todo, desde los ciclos celestes hasta el comportamiento humano, podía ser reducido a una vibración numérica del 1 al 9.

## 2. Los Números Base: Del 1 al 9

En la numerología de un solo dígito, cada número tiene una personalidad, una vibra y un conjunto de características únicas, tanto luminosas como sombrías.

- **Número 1: El Líder Independiente.** Es la energía primigenia de la creación. Representa la innovación, la independencia y la capacidad de iniciar. **Sombra:** Puede volverse terco, egoísta o dominante.
- **Número 2: El Pacificador.** Representa la dualidad, la asociación y la diplomacia. Es profundamente empático y busca la armonía por encima de todo. **Sombra:** Tendencia a la codependencia, la hipersensibilidad y evitar el conflicto a costa de sí mismo.
- **Número 3: El Comunicador Creativo.** Es el número de la autoexpresión, el arte, la alegría y la sociabilidad. Su energía es expansiva y magnética. **Sombra:** Dispersión, superficialidad, o usar las palabras para herir.
- **Número 4: El Constructor Práctico.** Simboliza la estructura, el trabajo duro, la lógica y la estabilidad. Es la base sólida sobre la que se construye el éxito. **Sombra:** Rigidez mental, exceso de trabajo, falta de imaginación.
- **Número 5: El Buscador de Libertad.** Dinámico, aventurero e impredecible. El 5 anhela el cambio, los viajes y la experimentación a través de los cinco sentidos. **Sombra:** Inconsistencia, impulsividad, indulgencia excesiva.
- **Número 6: El Cuidador.** El número del hogar, la familia, el amor y la responsabilidad. Tiene un profundo sentido del deber hacia los demás. **Sombra:** Intromisión, martirio, asfixiar a los demás con sus cuidados.
- **Número 7: El Filósofo Espiritual.** Analítico, místico y profundamente intelectual. Busca la verdad oculta detrás de las apariencias y requiere mucha soledad. **Sombra:** Cinismo, aislamiento social, frialdad emocional.
- **Número 8: El Ejecutivo del Poder.** Es la vibración de la abundancia material, el éxito corporativo, la autoridad y el karma (causa y efecto). **Sombra:** Materialismo excesivo, abuso de poder, dictadura.
- **Número 9: El Humanitario Humanista.** El final del ciclo. Representa la compasión global, el desapego, la sabiduría espiritual y el servicio a la humanidad. **Sombra:** Drama emocional, resentimiento por el pasado, idealismo poco realista.

## 3. Los Números Maestros: 11, 22 y 33

Cuando en un cálculo numerológico obtienes un 11, 22 o 33, **no los reduces a un solo dígito**. Estos son Números Maestros y conllevan una carga vibracional superior, exigiendo un alto nivel de responsabilidad espiritual a quien los posee.

- **Maestro 11 (El Iluminado):** Intuición a nivel psíquico. Es un canal directo entre el subconsciente y el mundo material. Su reto es no abrumarse por su extrema sensibilidad.
- **Maestro 22 (El Constructor Maestro):** Tiene la capacidad de convertir los sueños más ambiciosos en realidades tangibles (es un 4 potenciado). Organiza grandes proyectos a escala global.
- **Maestro 33 (El Maestro Sanador):** Enfocado en la sanación y elevación de la conciencia humana (un 6 potenciado). Es el arquetipo del amor incondicional.

## 4. Cómo Calcular tu Perfil Numerológico

Tu perfil se compone de varios números fundamentales. Aquí te explicamos cómo calcular los tres principales.

### El Camino de Vida (Destino)

Es el número más importante. Revela el propósito principal de tu encarnación, las lecciones que viniste a aprender y tus talentos innatos.
**Cálculo:** Suma los dígitos de tu fecha de nacimiento (Día + Mes + Año) y redúcelos a un solo dígito (salvo que sea 11, 22 o 33).
_Ejemplo: Si naciste el 15 de Octubre de 1990 (15/10/1990)._

- Día: 1 + 5 = 6
- Mes: 1 + 0 = 1
- Año: 1 + 9 + 9 + 0 = 19 -> 1 + 9 = 10 -> 1 + 0 = 1
- Suma total: 6 + 1 + 1 = **8**. (Tu Camino de Vida es 8).

### Tabla Alfanumérica Pitagórica

Para calcular el Número de Expresión y del Alma, necesitamos convertir tu nombre completo (exactamente como aparece en tu certificado de nacimiento) a números utilizando esta tabla:

| 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A   | B   | C   | D   | E   | F   | G   | H   | I   |
| J   | K   | L   | M   | N   | O   | P   | Q   | R   |
| S   | T   | U   | V   | W   | X   | Y   | Z   |     |

_(Nota: La letra 'Ñ' se considera un 5, equivalente a la 'N')._

### Número de Expresión (Personalidad Pública)

Revela tus talentos naturales y cómo te expresas en el mundo. Es tu potencial profesional.
**Cálculo:** Suma absolutamente **todas las letras** (vocales y consonantes) de tu nombre completo y reduce a un solo dígito.

### Número del Alma (Deseo Interno)

Representa lo que tu corazón realmente anhela en secreto, tus motivaciones más profundas y lo que necesitas para sentirte pleno.
**Cálculo:** Suma **solo las vocales** de tu nombre completo y reduce a un dígito.

## 5. Los Ciclos Numerológicos

La numerología también funciona como un reloj cósmico que te ayuda a navegar por el tiempo.

### Tu Año Personal

Te indica la energía predominante del año en curso para ti, desde el 1 de enero hasta el 31 de diciembre (aunque algunos numerólogos calculan de cumpleaños a cumpleaños).
**Cálculo:** Suma tu Día de Nacimiento + Tu Mes de Nacimiento + El Año Universal en curso.
_Ejemplo: Para alguien nacido el 15 de Octubre, en el año 2026 (2+0+2+6 = 10 -> 1)._

- 15 (Día) -> 1+5 = 6
- 10 (Mes) -> 1+0 = 1
- Año 2026 -> 1
- 6 + 1 + 1 = **8**. Está en un Año Personal 8 (Año de empoderamiento material y karma).

### Mes Personal

Dentro de tu Año Personal, cada mes tiene un tono. Se calcula sumando el número de tu Año Personal al número del mes calendario actual (ej. Marzo = 3). Un mes personal 1 es ideal para iniciar, mientras que un 9 es para soltar.

La numerología no dicta un destino fatalista; más bien, te entrega el mapa topográfico de tu psique para que puedas caminar por tu vida con total maestría.
`,
    metadata: {
      difficulty: 'Beginner',
      estimatedReadingTimeMin: 15,
      tags: ['numerologia', 'pitagoras', 'camino de vida', 'autoconocimiento'],
    },
    relatedTarotCards: [1, 2, 11],
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
      'Aprende el antiguo arte de la radiestesia. Descubre cómo elegir, programar y limpiar tu péndulo para obtener respuestas claras de tu subconsciente y guías espirituales.',
    content: `
# Guía Práctica del Péndulo: Conectando con tu Verdad Interior

El péndulo es una de las herramientas de adivinación (radiestesia) más simples pero poderosas que existen. Actúa como una extensión de tu propio sistema nervioso y subconsciente, amplificando los micro-movimientos musculares ideomotores para darte respuestas claras a nivel consciente.

## 1. Historia Breve de la Radiestesia

La palabra _radiestesia_ proviene del latín _radius_ (radiación) y del griego _aisthesis_ (sensibilidad). Su uso se remonta a miles de años; se han encontrado péndulos en tumbas de faraones egipcios y existen registros de su uso en la antigua China para encontrar fuentes de agua subterráneas, minerales e incluso objetos perdidos.

## 2. Tipos de Péndulos y Cómo Elegir el Tuyo

No necesitas una herramienta costosa. Cualquier objeto de peso suspendido de una cadena o cuerda puede funcionar (incluso un anillo atado a un hilo). Sin embargo, los materiales tienen propiedades únicas:

- **Cristal y Piedras (Cuarzo, Amatista, Obsidiana):** Excelentes para la sanación espiritual. El cristal de cuarzo transparente es el más versátil. Requieren limpieza frecuente ya que absorben energía.
- **Metal (Cobre, Latón, Oro, Plata):** Son conductores puros. Los péndulos de metal son muy precisos, no absorben tanta energía residual y son ideales para principiantes.
- **Madera:** Tienen una vibración muy neutral y terrenal. Son excelentes para usar sobre gráficos de radiestesia o mapas.

**¿Cómo elegirlo?** Deja que el péndulo te elija a ti. Sostén varios y siente su peso. El correcto se sentirá equilibrado y casi "vivo" en tu mano.

## 3. Limpieza y Consagración

Antes de usarlo, debes limpiarlo energéticamente:

1.  **Limpieza física/energética:** Pásalo por humo de palo santo, incienso, o déjalo bajo la luz de la luna llena.
2.  **Consagración:** Sostén el péndulo en tus manos sobre el centro de tu pecho y decreta: _"Programa este péndulo para que funcione únicamente en la luz, diciendo la verdad más elevada para mi mayor bien."_

## 4. Cómo Programar tu Péndulo

Tu péndulo y tú deben hablar el mismo idioma. Para ello, necesitas establecer los movimientos para "Sí", "No" y "Quizás / No estoy seguro".

1.  Siéntate cómodamente, apoya el codo en una mesa y sostén la cadena con el pulgar y el índice.
2.  Detén el péndulo con tu otra mano para que esté completamente quieto.
3.  Di en voz alta: _"Péndulo, muéstrame un SÍ"_. Observa el movimiento (puede ser un círculo a la derecha, de arriba abajo, etc.).
4.  Repite el proceso para: _"Muéstrame un NO"_ y _"Muéstrame un QUIZÁS"_.

## 5. El Arte de Hacer Preguntas

La precisión de la respuesta depende totalmente de cómo formules la pregunta.

- **Malas preguntas:** Abiertas, ambiguas o condicionadas. (Ej: _"¿Debería renunciar a mi trabajo o hablar con mi jefe?"_ - El péndulo no puede responder a una elección múltiple con un sí/no).
- **Preguntas efectivas:** Precisas, directas y limitadas. (Ej: _"¿Es para mi mayor bien espiritual renunciar a mi empleo actual este mes?"_).

Mantén tu mente neutral mientras preguntas. Si deseas desesperadamente que la respuesta sea "Sí", tus micro-movimientos musculares forzarán al péndulo a darte esa respuesta, anulando el propósito de la herramienta. Respira, céntrate y permite que la verdad fluya.
`,
    metadata: {
      difficulty: 'Beginner',
      estimatedReadingTimeMin: 10,
      tags: ['radiestesia', 'pendulo', 'adivinacion', 'subconsciente'],
    },
    relatedTarotCards: [3, 9],
    sortOrder: 2,
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
      'Entiende el mapa del cielo en el momento exacto de tu nacimiento. Domina la interpretación del Sol, la Luna, el Ascendente, las casas astrológicas y los planetas para revelar tu diseño cósmico.',
    content: `
# Guía de Carta Astral: Leyendo el Mapa de tu Alma

La Carta Astral (o Carta Natal) es una captura de pantalla del cielo astronómico en el minuto exacto y desde el lugar geográfico preciso en el que tomaste tu primera respiración. No es una sentencia determinista, sino un mapa de semillas: muestra tu potencial, tus desafíos kármicos y las energías que tienes a tu disposición.

## 1. Lo Esencial para Generar tu Carta

A diferencia del horóscopo general, la carta natal requiere precisión absoluta. Necesitas tres datos innegociables:

- **Fecha de nacimiento** (Día, Mes, Año).
- **Lugar de nacimiento** (Ciudad y País).
- **Hora exacta de nacimiento** (La diferencia de 4 minutos cambia el grado del Ascendente).

## 2. "Los Tres Grandes" (The Big 3)

Son los pilares fundamentales de tu personalidad astrológica.

1.  **El Sol (Tu Esencia):** Es el signo que conoces popularmente. Representa tu ego, tu identidad central, lo que te hace sentir vivo y tu propósito fundamental de encarnación. Es el motor del barco.
2.  **La Luna (Tu Mundo Emocional):** Representa tu subconsciente, tus necesidades emocionales ocultas, cómo procesas el dolor, tu relación con la figura materna y tu intuición. Es cómo reaccionas cuando estás a solas.
3.  **El Ascendente (Tu Máscara/Destino):** Es el signo que se elevaba en el horizonte este al momento de nacer. Determina cómo te perciben los demás a primera vista, tu apariencia física y la forma en que inicias nuevos proyectos. Es la puerta de entrada a tu carta.

## 3. Planetas Personales, Sociales y Transpersonales

- **Personales (Rápidos):** Afectan tu día a día. _Mercurio_ (cómo piensas y te comunicas), _Venus_ (cómo amas, tus valores y lo que te atrae), y _Marte_ (tu impulso, sexualidad, cómo peleas y actúas).
- **Sociales:** _Júpiter_ (dónde encuentras suerte, expansión y tu filosofía de vida) y _Saturno_ (tus miedos, restricciones, disciplina y karma).
- **Transpersonales (Generacionales):** Se mueven muy lento y marcan a generaciones enteras. _Urano_ (rebeldía e innovación), _Neptuno_ (espiritualidad, ilusiones y sueños), y _Plutón_ (transformación profunda, muerte y renacimiento).

## 4. Las 12 Casas Astrológicas

El círculo se divide en 12 áreas de la vida. Dependiendo de tu hora de nacimiento, los signos y planetas caen en casas específicas:

- **Casa 1:** El yo, apariencia física, inicios (Regida por Aries/Marte).
- **Casa 2:** Dinero, valores, autoestima, posesiones (Regida por Tauro/Venus).
- **Casa 3:** Comunicación, hermanos, viajes cortos, aprendizaje (Geminis/Mercurio).
- **Casa 4:** Hogar, raíces, infancia, los padres (Cancer/Luna).
- **Casa 5:** Creatividad, romance, hijos, placer y diversión (Leo/Sol).
- **Casa 6:** Rutina diaria, trabajo, salud física, mascotas (Virgo/Mercurio).
- **Casa 7:** Matrimonio, socios, enemigos declarados (Libra/Venus).
- **Casa 8:** Muerte, transformación, dinero compartido, sexualidad profunda (Escorpio/Plutón).
- **Casa 9:** Filosofía, religión, viajes largos, educación superior (Sagitario/Júpiter).
- **Casa 10 (Medio Cielo):** Carrera profesional, estatus público, metas a largo plazo (Capricornio/Saturno).
- **Casa 11:** Amistades, grupos, redes sociales, ideales humanitarios (Acuario/Urano).
- **Casa 12:** El subconsciente, karma, aislamiento, espiritualidad profunda, lo oculto (Piscis/Neptuno).

## 5. Aspectos Planetarios (La Geometría Sagrada)

Los planetas "hablan" entre sí mediante ángulos.

- **Conjunción (0°):** Dos planetas fusionan su energía. Muy poderoso.
- **Oposición (180°):** Tensión entre dos áreas de vida que exige equilibrio.
- **Trígono (120°):** Flujo de energía armónico y talentos naturales (cuidado con la pereza).
- **Cuadratura (90°):** Fricción severa y conflicto. Es la energía que produce mayor crecimiento a través del desafío.
- **Sextil (60°):** Oportunidades latentes que requieren esfuerzo para ser activadas.

Leer la carta astral requiere sintetizar todas estas capas. No eres solo tu Sol; eres una sinfonía cósmica irrepetible.
`,
    metadata: {
      difficulty: 'Intermediate',
      estimatedReadingTimeMin: 20,
      tags: ['astrologia', 'carta astral', 'zodiaco', 'ascendente', 'casas'],
    },
    relatedTarotCards: [18, 10, 22],
    sortOrder: 3,
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
      'Una introducción práctica a la magia natural. Descubre cómo usar las fases lunares, la limpieza energética y la intención focalizada para manifestar cambios reales en tu vida.',
    content: `
# Guía de Rituales: El Arte de la Manifestación Consciente

Un ritual no es más que una intención empaquetada en un acto simbólico. La "magia" no ocurre en la vela o en el incienso; ocurre en la alteración de tu estado de conciencia. Las herramientas físicas simplemente sirven como anclas para enfocar tu poder mental y emocional hacia un objetivo específico.

## 1. Preparación del Espacio Sagrado

Antes de cualquier acto mágico, debes preparar tanto el entorno como tu mente.

- **Limpieza Física:** Un espacio desordenado dispersa la energía. Limpia tu altar o mesa.
- **Limpieza Energética:** Utiliza humo (palo santo, salvia, incienso de romero), sonido (campanas, cuencos tibetanos) o rocía agua florida para purificar las vibraciones estancadas del lugar.
- **Centramiento:** Medita 5 minutos. Imagina raíces creciendo desde tus pies hacia el centro de la tierra. Si tu mente está ansiosa, el ritual carecerá de poder.

## 2. Trabajando con las Fases Lunares

La Luna rige las aguas de la Tierra y, por correspondencia esotérica, nuestro campo emocional y el flujo de la magia.

- **Luna Nueva:** El cielo está oscuro. Es el momento ideal para sembrar semillas, poner intenciones, iniciar proyectos y hacer rituales de atracción.
- **Cuarto Creciente:** La luz aumenta. Tiempo de tomar acción, acelerar asuntos estancados, hechizos de prosperidad y fuerza.
- **Luna Llena:** El clímax del poder. La energía está al máximo. Excelente para rituales de gratitud, carga de cristales, adivinación con Tarot y celebrar logros.
- **Cuarto Menguante:** La luz disminuye. El momento perfecto para soltar, desterrar malos hábitos, hacer cortes energéticos y limpiezas profundas.

## 3. Herramientas Mágicas Básicas

- **Velas (Elemento Fuego):** El color es vital. Blanco (purificación, comodín), Rojo (pasión, acción), Verde (dinero, fertilidad), Negro (protección, absorción de negatividad), Rosa (amor propio).
- **Cristales (Elemento Tierra):** Cuarzo rosa (amor), Citrino (abundancia), Turmalina negra o Amatista (protección psíquica).
- **Hierbas e Incienso (Elemento Aire):** Llevan tu intención al universo. Romero (protección), Canela (éxito rápido), Lavanda (paz y sanación).
- **Agua (Elemento Agua):** El agua de luna, aceites esenciales o pociones rituales.

## 4. Estructura de un Ritual Efectivo

1.  **Apertura:** Enciende una vela blanca, pide protección a tus guías o al Universo.
2.  **Declaración de Intención:** Di en voz alta y en tiempo presente lo que deseas manifestar. (Ej: _"Agradezco la llegada de un trabajo próspero que se alinea con mis valores"_).
3.  **El Acto Simbólico:** Quema una petición escrita, entierra una moneda en una maceta, o unge una vela con aceites.
4.  **Agradecimiento y Cierre:** Da las gracias asumiendo que el pedido ya fue escuchado. Apaga la vela (preferiblemente sin soplar, usando un apagavelas o tus dedos húmedos para no dispersar la energía).

Recuerda: El ritual más elaborado no funcionará si, al terminarlo, tomas acciones en el mundo material que contradigan tu petición mágica.
`,
    metadata: {
      difficulty: 'Beginner',
      estimatedReadingTimeMin: 12,
      tags: ['rituales', 'magia', 'fases lunares', 'manifestacion', 'velas'],
    },
    relatedTarotCards: [2, 3, 14],
    sortOrder: 4,
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
      'Comprende los 12 signos zodiacales tropicales. Explora cómo los elementos y modalidades conforman las personalidades y descubre cómo los tránsitos diarios afectan tu energía.',
    content: `
# Guía del Horóscopo Occidental: Los Arquetipos Zodiacales

La Astrología Occidental se basa en el zodíaco Tropical, el cual no está vinculado a las constelaciones exactas de hoy en día, sino a las estaciones de la Tierra. Comienza con el equinoccio de primavera en el hemisferio norte (el grado 0 de Aries) y divide la eclíptica en 12 secciones iguales de 30 grados cada una.

## 1. Elementos y Modalidades

El esqueleto de la astrología se construye combinando dos factores: de qué está hecho el signo (Elemento) y cómo actúa (Modalidad).

**Los Cuatro Elementos:**

- **Fuego (Aries, Leo, Sagitario):** Acción, entusiasmo, intuición, pasión, impaciencia.
- **Tierra (Tauro, Virgo, Capricornio):** Materialización, estabilidad, pragmatismo, sensualidad.
- **Aire (Géminis, Libra, Acuario):** Intelecto, comunicación, socialización, desapego.
- **Agua (Cáncer, Escorpio, Piscis):** Emoción, empatía, misterio, subconsciente.

**Las Tres Modalidades:**

- **Cardinales (Aries, Cáncer, Libra, Capricornio):** Inician las estaciones. Son líderes, impulsivos, toman la iniciativa.
- **Fijos (Tauro, Leo, Escorpio, Acuario):** Mantienen la estación. Son estables, determinados, tercos y sostenedores.
- **Mutables (Géminis, Virgo, Sagitario, Piscis):** Finalizan la estación. Son adaptables, flexibles, dispersos y orientados al cambio.

## 2. Los 12 Signos Zodiacales

1.  **Aries (21 Mar - 19 Abr) | Fuego Cardinal | Regente: Marte.** El guerrero valiente, pionero, impaciente y competitivo.
2.  **Tauro (20 Abr - 20 May) | Tierra Fija | Regente: Venus.** El constructor paciente, amante de la belleza, terco y sensual.
3.  **Géminis (21 May - 20 Jun) | Aire Mutable | Regente: Mercurio.** El comunicador curioso, adaptable, ingenioso y, a veces, inconstante.
4.  **Cáncer (21 Jun - 22 Jul) | Agua Cardinal | Regente: La Luna.** El protector nutricio, profundo, familiar y altamente sensible.
5.  **Leo (23 Jul - 22 Ago) | Fuego Fijo | Regente: El Sol.** El rey carismático, generoso, dramático y centrado en el corazón.
6.  **Virgo (23 Ago - 22 Sep) | Tierra Mutable | Regente: Mercurio.** El sanador analítico, perfeccionista, servicial y detallista.
7.  **Libra (23 Sep - 22 Oct) | Aire Cardinal | Regente: Venus.** El diplomático armónico, justiciero, romántico e indeciso.
8.  **Escorpio (23 Oct - 21 Nov) | Agua Fija | Regente: Plutón/Marte.** El transformador intenso, magnético, investigador y rencoroso.
9.  **Sagitario (22 Nov - 21 Dic) | Fuego Mutable | Regente: Júpiter.** El explorador filosófico, optimista, sincero al extremo y amante de la libertad.
10. **Capricornio (22 Dic - 19 Ene) | Tierra Cardinal | Regente: Saturno.** El CEO disciplinado, ambicioso, estoico y responsable.
11. **Acuario (20 Ene - 18 Feb) | Aire Fijo | Regente: Urano/Saturno.** El visionario rebelde, excéntrico, humanitario y desapegado.
12. **Piscis (19 Feb - 20 Mar) | Agua Mutable | Regente: Neptuno/Júpiter.** El místico soñador, empático universal, artístico y evasivo.

## 3. Compatibilidad Astrológica (Sinastría Básica)

Como regla general, los signos del mismo elemento fluyen perfectamente. Fuego se lleva maravillosamente con Aire (el aire alimenta al fuego). Tierra se complementa profundamente con Agua (el agua nutre la tierra fértil).
Los mayores roces (y también la mayor atracción sexual para el crecimiento) suelen ocurrir en signos que forman "cuadraturas" (ej. Aries con Cáncer, o Tauro con Acuario).

Entender tu horóscopo no es encasillarte, es obtener el manual de instrucciones de tu propio arquetipo.
`,
    metadata: {
      difficulty: 'Beginner',
      estimatedReadingTimeMin: 15,
      tags: ['horoscopo', 'zodiaco occidental', 'signos', 'astrologia'],
    },
    relatedTarotCards: [11, 22],
    sortOrder: 5,
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
      'Adéntrate en el sistema astrológico oriental. Conoce tu animal regente y descubre cómo interactúan los Cinco Elementos (Wu Xing) en ciclos de 60 años para moldear tu destino.',
    content: `
# Guía del Horóscopo Chino: El Ciclo de los Animales y los Elementos

A diferencia del zodíaco occidental que se basa en el movimiento del sol a través de las estaciones (mensual), la astrología china se basa en un ciclo lunar tradicional, donde cada signo rige un año completo.

## 1. El Origen Mítico

Cuenta la leyenda que el Emperador de Jade (o en algunas versiones, Buda) convocó a todos los animales del mundo a una carrera para cruzar un gran río. Solo doce se presentaron. El orden en el que cruzaron la línea de meta determinó su lugar permanente en el ciclo zodiacal de 12 años. La astuta Rata llegó primera al viajar en la espalda del diligente Búfalo y saltar justo al final.

## 2. Los 12 Animales del Zodíaco

El animal de tu año de nacimiento representa tu forma de ser frente al mundo, tu suerte y tus relaciones. _(Nota: El año nuevo chino suele caer entre finales de enero y mediados de febrero. Si naciste en enero, probablemente pertenezcas al animal del año anterior)._

1.  **Rata (Rana):** Inteligente, adaptable, rápida, encantadora y muy persuasiva.
2.  **Búfalo (Buey):** Confiable, fuerte, determinado, metódico y conservador.
3.  **Tigre:** Valiente, apasionado, impredecible, líder nato y rebelde.
4.  **Conejo (Liebre):** Elegante, pacífico, compasivo, diplomático y prudente.
5.  **Dragón:** Poderoso, afortunado, carismático, idealista y dominante. (El único animal mítico).
6.  **Serpiente:** Sabia, enigmática, intuitiva, seductora y pensadora profunda.
7.  **Caballo:** Espíritu libre, enérgico, independiente, impaciente y viajero.
8.  **Cabra (Oveja):** Artística, pacífica, dulce, dependiente y empática.
9.  **Mono:** Ingenioso, travieso, versátil, curioso y solucionador de problemas.
10. **Gallo:** Observador, trabajador, seguro de sí mismo, directo y extravagante.
11. **Perro:** Leal, honesto, justiciero, protector y a veces ansioso.
12. **Cerdo (Jabalí):** Generoso, indulgente, sincero, amante de los placeres y pacífico.

## 3. Los Cinco Elementos (Wu Xing)

La astrología china se vuelve verdaderamente compleja y precisa gracias a los Cinco Elementos. Cada año está regido por un animal Y por un elemento, creando un ciclo maestro de 60 años. El elemento de tu año moldea profundamente la naturaleza de tu animal.

- **Madera:** Crecimiento, expansión, idealismo, compasión.
- **Fuego:** Pasión, dinamismo, agresividad, alegría.
- **Tierra:** Estabilidad, paciencia, realismo, madurez.
- **Metal:** Determinación, ambición, rigidez, fuerza de voluntad.
- **Agua:** Flexibilidad, intuición, diplomacia, sensibilidad.

## 4. Dinámicas de Compatibilidad

En la astrología china, los animales forman diferentes geometrías.

- **Trígonos de Afinidad:** Los grupos de a tres separados por cuatro años se llevan excepcionalmente bien. Por ejemplo, la Rata, el Dragón y el Mono son el "Triángulo de los Hacedores".
- **Choques (Oposiciones):** Los animales que están directamente opuestos en la rueda suelen tener fricciones severas (ej. Caballo y Rata, o Tigre y Mono).

Comprender el pilar de tu año (tu animal y elemento) te brinda una profunda visión estratégica sobre tus ciclos de prosperidad y desafío según el antiguo pensamiento oriental.
`,
    metadata: {
      difficulty: 'Beginner',
      estimatedReadingTimeMin: 12,
      tags: [
        'horoscopo chino',
        'astrologia oriental',
        'wu xing',
        'signos chinos',
      ],
    },
    relatedTarotCards: [10],
    sortOrder: 6,
  },
];
