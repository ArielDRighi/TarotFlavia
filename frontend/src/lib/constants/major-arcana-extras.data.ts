/**
 * Contenido extra de los 22 Arcanos Mayores (T-SEO-020): romper la plantilla.
 *
 * ## Por qué existe
 *
 * Las 78 fichas de `/enciclopedia/tarot/[slug]` servían los mismos diez `h2`
 * en el mismo orden. Con 780+ palabras propias cada una no es un problema de
 * volumen: es que un revisor —o un clasificador— las lee como una plantilla
 * rellenada. Este archivo le da a cada Arcano Mayor, que son los que traen
 * tráfico, tres cosas que ninguna ficha del web hispano tiene:
 *
 * 1. Una sección **"Invertida"** propia, con encabezado distinto por carta.
 * 2. Un **mini-caso de tirada**: en qué consulta salió, en qué posición y cómo
 *    se leyó. No es una predicción sino un ejemplo de lectura.
 * 3. Una **nota iconográfica** de la lámina Rider-Waite-Smith (Pamela Colman
 *    Smith, 1909; dominio público) con los símbolos señalados sobre la imagen
 *    por `CardSymbolDiagram`: la media original más barata y más fuerte.
 *
 * Y un **orden de secciones propio por carta** (`sectionOrder`), que además
 * puede omitir "¿Sí o no?" en las cartas cuya respuesta es por naturaleza
 * indecidible. Que 22 fichas compartan los `h2` base y difieran en el orden y
 * en tres encabezados propios no dispara la alarma; que 78 tengan los mismos
 * diez en el mismo orden, sí.
 *
 * ## Por qué vive en el frontend y no en el backend
 *
 * El contenido extendido de T-SEO-009 vive en un seeder, y eso acopla el
 * deploy: si el frontend se construye antes de que corra el seeder, las fichas
 * salen vacías durante un día (ver el runbook en `app/enciclopedia/tarot/[slug]/page.tsx`).
 * Esto es contenido estático de 22 cartas que no cambian: sigue el patrón de
 * `zodiac-sign-profiles.data.ts` y llega al HTML sin pasar por la API. La ruta
 * lo resuelve en el servidor con `getMajorArcanaExtras(slug)` y lo pasa por
 * props, así el módulo no viaja en el bundle del cliente.
 *
 * ## ⚠️ Al editar
 *
 * - **Los 56 Arcanos Menores quedan como están.** No agregar entradas fuera de
 *   `MAJOR_ARCANA_SLUGS`: `getMajorArcanaExtras` devuelve `undefined` y la ficha
 *   sale con el orden base.
 * - El texto de cada carta es **único** y los encabezados también:
 *   `major-arcana-extras.data.test.ts` lo verifica, junto con el mínimo de
 *   palabras y la variedad de órdenes.
 * - Nada de "salud", promesas de resultado ni lenguaje de miedo/urgencia
 *   (T-SEO-013 / T-SEO-018): `no-salud-user-facing.test.ts` barre este archivo.
 * - Las coordenadas `x`/`y` de los símbolos son porcentajes del ancho y alto de
 *   la lámina (300×527). Se midieron sobre las imágenes de `public/images/tarot/`.
 */

import type { CardSectionKey } from '@/lib/constants/card-content-sections.data';
import { countWords } from '@/lib/utils/text';

/**
 * Las claves de sección y el orden base viven en `card-content-sections.data.ts`
 * y se re-exportan acá por comodidad. `CardDetailView` las importa de allá y de
 * este módulo solo toma tipos: así el contenido de las 22 fichas no puede
 * entrar al bundle del cliente por construcción, sin depender del tree-shaking.
 */
export {
  DEFAULT_CARD_SECTION_ORDER,
  MAJOR_ARCANA_EXTRA_SECTION_KEYS,
} from '@/lib/constants/card-content-sections.data';
export type {
  CardSectionKey,
  MajorArcanaExtraSectionKey,
} from '@/lib/constants/card-content-sections.data';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Un símbolo concreto de la lámina, ubicado sobre la imagen. */
export interface CardSymbolMarker {
  /** Nombre corto del símbolo (etiqueta de la leyenda). */
  label: string;
  /** Qué significa en esta lámina en particular. */
  meaning: string;
  /** Posición horizontal, en porcentaje del ancho de la lámina (0–100). */
  x: number;
  /** Posición vertical, en porcentaje del alto de la lámina (0–100). */
  y: number;
}

/** Sección "Invertida" propia de la carta. */
export interface MajorArcanaReversed {
  /** Encabezado visible (`h2`), distinto por carta. */
  heading: string;
  /** Dos párrafos: cómo se manifiesta invertida y qué pide. */
  paragraphs: [string, string];
}

/** Mini-caso de tirada: en qué consulta salió la carta y cómo se leyó. */
export interface MajorArcanaReadingCase {
  /** Encabezado visible (`h2`), distinto por carta. */
  heading: string;
  /** La pregunta con la que llegó la consulta, en sus palabras. */
  question: string;
  /** Tirada usada (tres cartas, Cruz Celta, decisión, etc.). */
  spread: string;
  /** Posición en la que salió la carta. */
  position: string;
  /** Si salió derecha o invertida. */
  orientation: 'upright' | 'reversed';
  /** Dos párrafos: cómo se leyó con las cartas vecinas y qué se llevó la persona. */
  reading: [string, string];
}

/** Nota iconográfica de la lámina RWS con los símbolos a señalar. */
export interface MajorArcanaIconography {
  /** Encabezado visible (`h2`), distinto por carta. */
  heading: string;
  /** Qué tiene de particular esta lámina de Pamela Colman Smith. */
  intro: string;
  /** Entre 3 y 5 símbolos, en el orden en que se numeran sobre la imagen. */
  symbols: CardSymbolMarker[];
}

/** Todo lo que un Arcano Mayor agrega a la ficha base. */
export interface MajorArcanaExtras {
  reversed: MajorArcanaReversed;
  readingCase: MajorArcanaReadingCase;
  iconography: MajorArcanaIconography;
  /**
   * Orden en que se renderizan las secciones del cuerpo de la ficha, base y
   * nuevas mezcladas. Una clave base que no figure acá **no se renderiza**
   * aunque la API traiga el texto: así se omite "¿Sí o no?" donde no aplica.
   */
  sectionOrder: CardSectionKey[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Los 22 Arcanos Mayores, en el orden del mazo (slugs de la API). */
export const MAJOR_ARCANA_SLUGS = [
  'the-fool',
  'the-magician',
  'the-high-priestess',
  'the-empress',
  'the-emperor',
  'the-hierophant',
  'the-lovers',
  'the-chariot',
  'strength',
  'the-hermit',
  'wheel-of-fortune',
  'justice',
  'the-hanged-man',
  'death',
  'temperance',
  'the-devil',
  'the-tower',
  'the-star',
  'the-moon',
  'the-sun',
  'judgement',
  'the-world',
] as const;

export type MajorArcanaSlug = (typeof MAJOR_ARCANA_SLUGS)[number];

/**
 * Mínimo de palabras propias que cada carta tiene que sumar con las tres
 * secciones nuevas. Es el criterio de "romper la plantilla": si el extra fuera
 * un párrafo por sección, la ficha seguiría leyéndose como plantilla.
 */
export const MIN_MAJOR_ARCANA_EXTRAS_WORDS = 300;

/**
 * Mínimo de órdenes de secciones distintos entre las 22 cartas. El test lo
 * mira porque es el punto de la tarea: 22 cartas con el mismo orden nuevo
 * serían la misma plantilla con tres secciones más.
 */
export const MIN_DISTINCT_SECTION_ORDERS = 18;

// ─── Contenido ────────────────────────────────────────────────────────────────

export const MAJOR_ARCANA_EXTRAS: Record<MajorArcanaSlug, MajorArcanaExtras> = {
  'the-fool': {
    reversed: {
      heading: 'El Loco invertido',
      paragraphs: [
        'Invertido, el salto se vuelve huida. El impulso sigue ahí, pero sin la cara vuelta al cielo: la persona no arranca hacia algo sino que escapa de algo, y lo disfraza de aventura. Suele aparecer cuando se renuncia sin tener nada pensado, se cambia de ciudad para no resolver una conversación o se empieza un proyecto nuevo cada mes sin terminar ninguno.',
        'Lo que pide es una pregunta incómoda antes de moverse: ¿esto es deseo de empezar o miedo de quedarme? La respuesta cambia todo lo demás. Si es deseo, la carta invertida solo dice que falta mirar el borde; si es miedo, ningún salto va a alcanzar, porque el precipicio viaja con uno.',
      ],
    },
    readingCase: {
      heading: 'El Loco en una consulta sobre cambiar de trabajo',
      question:
        'Me ofrecieron un puesto en otra ciudad, con menos sueldo y en un rubro que no conozco. ¿Me conviene aceptar?',
      spread: 'Tirada de tres cartas (pasado, presente, futuro)',
      position: 'Futuro',
      orientation: 'upright',
      reading: [
        'El Loco salió en la tercera posición, después del Ocho de Oros en el pasado y el Dos de Bastos en el presente. La secuencia se leyó de corrido: años de oficio bien aprendido, un presente de mirar el mapa desde la ventana y, adelante, la carta que no mira el mapa. El Loco derecho en el futuro no dice que el puesto salga bien: dice que la energía disponible es la del comienzo con el equipaje justo.',
        'Se le señaló el perro de la lámina, que ladra pero no frena. La sensatez mínima que tenía que atender no era el sueldo —eso ya lo había calculado— sino qué parte del oficio del Ocho de Oros se llevaba consigo. Con eso claro, la consultante se fue con una pregunta menos abstracta que "¿me conviene?": qué necesitaba tener resuelto para saltar liviana.',
      ],
    },
    iconography: {
      heading: 'La lámina del Loco: qué mirar',
      intro:
        'Pamela Colman Smith dibujó al Loco de espaldas al sol y con la cara vuelta al cielo: no ve el borde y tampoco ve la luz que lo alumbra. Es la única lámina de los mayores donde la figura está a punto de perder el apoyo. Casi todos los detalles que siguen se repiten más adelante en el mazo.',
      symbols: [
        {
          label: 'La pluma roja',
          meaning:
            'La misma pluma aparece en la Muerte y en el Sol: es la vida que atraviesa el mazo entero, del que sale al que llega.',
          x: 63,
          y: 12,
        },
        {
          label: 'El hatillo con cabeza de águila',
          meaning:
            'La bolsa que cuelga de la vara lleva un águila grabada: lo que trae es poco, pero es lo que le permite ver desde arriba.',
          x: 73,
          y: 19,
        },
        {
          label: 'La rosa blanca',
          meaning:
            'La sostiene sin apretarla, con dos dedos. Es el deseo antes de la experiencia, en contraste con la rosa roja del Mago.',
          x: 90,
          y: 26,
        },
        {
          label: 'El perro blanco',
          meaning:
            'Salta a la altura de la rodilla, del lado del precipicio. Avisa, acompaña, y no está mordiendo: nadie lo va a detener.',
          x: 80,
          y: 75,
        },
        {
          label: 'El borde del precipicio',
          meaning:
            'La bota amarilla ya está en el aire. Smith dejó la roca cortada a pico y sin fondo visible: el paso siguiente no se ve.',
          x: 38,
          y: 79,
        },
      ],
    },
    sectionOrder: [
      'reversed',
      'meaningLove',
      'meaningWork',
      'readingCase',
      'symbolism',
      'iconography',
      'meaningWellbeing',
      'advice',
      'yesNo',
    ],
  },

  'the-magician': {
    reversed: {
      heading: 'Cuando el Mago sale invertido',
      paragraphs: [
        'El Mago invertido conserva el talento y pierde la dirección. Los cuatro palos siguen sobre la mesa, pero la mano que apuntaba al cielo ahora apunta a cualquier lado: aparece como el que sabe hacer de todo y no termina nada, o como el que usa la labia para conseguir lo que no se ganó. También describe la sensación de tener las herramientas y no encontrar el modo de empezar.',
        'Pide bajar el brazo y elegir un solo canal. Invertida, esta carta no habla de falta de capacidad sino de dispersión, y a veces de manipulación: conviene revisar si lo que se está diciendo es lo que se está haciendo. El antídoto es concreto: un recurso, un objetivo, una semana.',
      ],
    },
    readingCase: {
      heading: 'El Mago en una tirada de decisión',
      question:
        'Tengo dos caminos: seguir como empleado en una agencia o abrir mi propio estudio de diseño. ¿Cuál me favorece más?',
      spread: 'Tirada de decisión (camino A, camino B, consejo)',
      position: 'Camino B: el estudio propio',
      orientation: 'upright',
      reading: [
        'El camino A trajo el Diez de Oros y el B, el Mago derecho. La lectura no fue "elegí el B": el Diez de Oros es una carta excelente y describe algo real, la seguridad de una estructura armada. Lo que hizo el Mago fue mostrar el tipo de energía que pedía el estudio propio: no dinero ni contactos, sino la capacidad de poner en marcha con lo que ya estaba sobre la mesa.',
        'La carta de consejo, el Ocho de Bastos, apuró la lectura: si iba a hacerlo, era ahora y no dentro de dos años. Se le señaló que en la lámina el Mago no tiene nada que no haya traído; se le preguntó qué cuatro recursos concretos tenía hoy. Los nombró sin dudar, y esa fue la respuesta que se llevó.',
      ],
    },
    iconography: {
      heading: 'Símbolos de la lámina del Mago',
      intro:
        'Es la lámina más ordenada del mazo: un eje vertical que va de la vara al dedo que señala el suelo, y todo lo demás dispuesto alrededor. Smith pintó el fondo amarillo pleno, sin paisaje, para que nada compita con el gesto. Los detalles pequeños son los que más dicen.',
      symbols: [
        {
          label: 'La vara de doble punta',
          meaning:
            'Blanca, con las dos puntas iguales: recibe y transmite por el mismo canal. No es un cetro de mando sino un conductor.',
          x: 18,
          y: 9,
        },
        {
          label: 'La lemniscata',
          meaning:
            'Flota sobre la cabeza sin tocarla. Es el mismo signo que corona a la Fuerza: la energía que no se agota mientras circula.',
          x: 47,
          y: 17,
        },
        {
          label: 'El cinturón-serpiente',
          meaning:
            'Una serpiente que se muerde la cola ciñe la túnica: el ciclo cerrado sobre sí mismo. Sostiene el manto rojo del deseo.',
          x: 52,
          y: 52,
        },
        {
          label: 'Los cuatro palos sobre la mesa',
          meaning:
            'Copa, basto, espada y oro, a la altura de la mano que señala el suelo: los recursos están abajo, no arriba.',
          x: 25,
          y: 60,
        },
        {
          label: 'Rosas y lirios',
          meaning:
            'Las rosas cuelgan de arriba y los lirios brotan de abajo: deseo que baja e intención que sube, y el Mago en el medio.',
          x: 65,
          y: 86,
        },
      ],
    },
    sectionOrder: [
      'symbolism',
      'iconography',
      'meaningWork',
      'meaningLove',
      'reversed',
      'readingCase',
      'meaningWellbeing',
      'yesNo',
      'advice',
    ],
  },

  'the-high-priestess': {
    reversed: {
      heading: 'La Suma Sacerdotisa invertida',
      paragraphs: [
        'Invertida, el velo se corre por el lado equivocado. La intuición que la carta derecha protege se convierte en secreto que pesa: lo que se sabe y no se dice, lo que se sospecha y no se pregunta, la corazonada que se descarta por no tener pruebas. También describe a quien vive tan hacia adentro que deja de escuchar lo que le dicen en voz alta.',
        'Pide poner en palabras aunque sea una parte. La Sacerdotisa invertida no quiere que se exhiba todo; quiere que el conocimiento deje de ser rehén del silencio. En la práctica suele bastar con una pregunta directa a la persona indicada, o con escribir lo que se intuye para ver si sigue en pie a la mañana siguiente.',
      ],
    },
    readingCase: {
      heading: 'La Suma Sacerdotisa cruzando una Cruz Celta',
      question:
        'Siento que en mi grupo de amigas hay algo que no me están contando. ¿Debería preguntar directamente?',
      spread: 'Cruz Celta',
      position: 'Lo que cruza',
      orientation: 'upright',
      reading: [
        'La carta central fue el Tres de Copas, el grupo mismo, y la que la cruzaba, la Suma Sacerdotisa derecha. No se leyó como obstáculo en el sentido de "algo malo": lo que cruzaba la celebración era un silencio, algo que se sabía a medias. El rollo que la figura sostiene medio tapado por el manto describía exactamente la situación de la consultante: tenía parte de la información y la otra parte estaba cubierta.',
        'El Fundamento trajo el Cinco de Oros invertido, que ubicó el silencio en una dificultad que una de las amigas estaba atravesando y no había querido compartir. Con eso, la pregunta cambió: ya no era "¿me ocultan algo?" sino "¿cómo hago espacio para que me lo cuenten?". La Sacerdotisa, en ese lugar, aconsejaba esperar con la puerta abierta en vez de forzar el velo.',
      ],
    },
    iconography: {
      heading: 'Leer la lámina de la Suma Sacerdotisa',
      intro:
        'Es la lámina más quieta del mazo y la más cargada de texto: dos letras, una palabra, una tiara que es un calendario. Smith compuso todo en simetría estricta, con la figura exactamente en el centro y el agua asomando apenas por debajo del velo. Lo que importa está en lo que apenas se ve.',
      symbols: [
        {
          label: 'La tiara de tres fases',
          meaning:
            'Creciente, llena y menguante en un solo tocado: la carta gobierna el tiempo cíclico, no el lineal del Emperador.',
          x: 50,
          y: 24,
        },
        {
          label: 'El velo de granadas',
          meaning:
            'Las granadas están dispuestas como el Árbol de la Vida cabalístico. Detrás, el agua: lo inconsciente, contenido pero visible.',
          x: 72,
          y: 20,
        },
        {
          label: 'Las columnas B y J',
          meaning:
            'Boaz negra a la izquierda y Jachin blanca a la derecha: la carta se sienta exactamente entre las dos polaridades.',
          x: 9,
          y: 44,
        },
        {
          label: 'El rollo TORA',
          meaning:
            'Solo se leen cuatro letras y la última queda bajo el manto. La ley está ahí, pero no completa para quien mira desde afuera.',
          x: 55,
          y: 58,
        },
        {
          label: 'La luna a los pies',
          meaning:
            'Una luna creciente apoyada en el borde del manto, que cae como agua. Lo que la figura pisa es lo que la sostiene.',
          x: 42,
          y: 88,
        },
      ],
    },
    sectionOrder: [
      'iconography',
      'symbolism',
      'reversed',
      'meaningLove',
      'meaningWellbeing',
      'meaningWork',
      'readingCase',
      'advice',
      'yesNo',
    ],
  },

  'the-empress': {
    reversed: {
      heading: 'La Emperatriz invertida',
      paragraphs: [
        'Invertida, la abundancia se vuelve exceso o sequía, según la persona. En un extremo aparece como sobreprotección: cuidar tanto que la otra persona no puede crecer, dar sin que nadie haya pedido, llenar la casa de cosas para no sentir el vacío. En el otro, como bloqueo creativo, cansancio de cuidar a todos y a nadie, o un proyecto que no arranca porque no se le dio tiempo de madurar.',
        'Pide volver al ritmo del trigo, que no se apura. La Emperatriz invertida no reclama hacer más sino nutrir mejor, y eso incluye nutrirse: la persona que sostiene a todos suele ser la última en sentarse a la mesa. Una señal concreta de que la carta se endereza es que vuelve el placer en las cosas simples, sin culpa.',
      ],
    },
    readingCase: {
      heading: 'La Emperatriz en la carta del día',
      question:
        'Hoy tengo que presentar mi proyecto de huerta comunitaria en la asamblea del barrio. ¿Con qué actitud me conviene ir?',
      spread: 'Carta del día',
      position: 'Única carta',
      orientation: 'upright',
      reading: [
        'La carta del día no responde con un sí o un no; describe el clima y el tono. La Emperatriz derecha en una presentación sobre una huerta parecía casi literal, y la primera tentación fue quedarse ahí: tierra, cultivo, comunidad. Se fue un poco más lejos. La figura de la lámina no está trabajando el campo: está sentada, recostada, y el trigo crece solo. La actitud era esa, mostrar lo que ya está maduro en vez de defender lo que falta.',
        'Se le sugirió llevar algo concreto y comestible a la asamblea, cosecha de la huerta piloto, y hablar menos del plan y más del resultado. El consultante volvió a la semana con un dato que no estaba en la tirada: lo que había convencido a los vecinos no fue el proyecto sino los tomates.',
      ],
    },
    iconography: {
      heading: 'Detalles de la lámina de la Emperatriz',
      intro:
        'Smith llenó esta lámina hasta el borde: trigo, granadas, cipreses, agua, almohadones. Es la única de los mayores donde no queda un centímetro de fondo vacío, y esa saturación es el mensaje. Los símbolos que siguen están casi escondidos entre la abundancia.',
      symbols: [
        {
          label: 'La corona de doce estrellas',
          meaning:
            'Doce estrellas de seis puntas sobre una diadema de laurel: el año completo, todos los signos, ningún ciclo pendiente.',
          x: 48,
          y: 15,
        },
        {
          label: 'La cascada entre los cipreses',
          meaning:
            'El agua cae justo detrás del trono y desaparece en el trigo: lo que alimenta el campo no se ve desde el frente.',
          x: 85,
          y: 40,
        },
        {
          label: 'Las granadas del vestido',
          meaning:
            'El mismo fruto del velo de la Sacerdotisa, pero acá impreso en la tela: lo que allá estaba detrás, acá está puesto.',
          x: 60,
          y: 60,
        },
        {
          label: 'El escudo de Venus',
          meaning:
            'Un corazón apoyado contra el trono con el signo del planeta. Está en el suelo, no en la mano: el amor no se sostiene, se apoya.',
          x: 22,
          y: 72,
        },
        {
          label: 'El campo de trigo maduro',
          meaning:
            'Ocupa la franja inferior entera y ya está dorado. Nadie lo cosecha en la lámina: el momento es justo antes de recoger.',
          x: 50,
          y: 92,
        },
      ],
    },
    sectionOrder: [
      'meaningLove',
      'meaningWellbeing',
      'readingCase',
      'meaningWork',
      'reversed',
      'symbolism',
      'iconography',
      'yesNo',
      'advice',
    ],
  },

  'the-emperor': {
    reversed: {
      heading: 'El Emperador con la corona hacia abajo',
      paragraphs: [
        'Invertido, el orden se vuelve rigidez o se disuelve del todo. La versión más común es el control que ya no protege a nadie: reglas por las reglas, el jefe que necesita aprobar hasta el color de las carpetas, el padre que confunde autoridad con tener razón. La otra versión es el trono vacío: nadie decide, todo se posterga y la estructura se cae por falta de alguien que la sostenga.',
        'Pide revisar para qué sirve cada regla. El Emperador invertido no propone abolir el orden sino devolverle sentido: una norma que ya no cuida nada es peso muerto. En lo personal suele señalar una relación con la figura paterna —propia o heredada— que todavía gobierna decisiones que ya no le corresponden.',
      ],
    },
    readingCase: {
      heading: 'El Emperador en una tirada de relación',
      question:
        'Con mi socio discutimos por todo desde que crecimos. ¿Qué está pasando entre nosotros?',
      spread: 'Tirada de relación (yo, la otra persona, el vínculo)',
      position: 'La otra persona',
      orientation: 'reversed',
      reading: [
        'El consultante sacó el Siete de Bastos en su posición, el socio salió como Emperador invertido y el vínculo, como Cinco de Bastos. La lectura armó sola la escena: uno defendiendo su terreno desde arriba de la colina, el otro tratando de gobernar una empresa que ya no era la del principio con las mismas reglas de cuando eran dos, y en el medio una pelea de bastos donde nadie se lastima pero nadie construye.',
        'Lo útil fue distinguir al socio de la carta: el Emperador invertido no describía a una mala persona sino a alguien que había perdido el trono de piedra —la estructura clara— y estaba supliéndolo con control. Se le propuso que la conversación pendiente no fuera sobre quién manda sino sobre qué reglas nuevas necesitaba la empresa de ahora. Volvió el orden por el lado de la carta derecha, no por el de la pelea.',
      ],
    },
    iconography: {
      heading: 'Los símbolos del trono del Emperador',
      intro:
        'Es la lámina más dura del mazo: piedra, armadura, montañas sin árboles y un cielo naranja que no promete lluvia. Smith puso al Emperador de frente, con las rodillas abiertas y los pies plantados, la única postura de los mayores que no se puede mover sin decisión. Cuatro detalles lo explican.',
      symbols: [
        {
          label: 'El cetro anj',
          meaning:
            'La cruz egipcia de la vida, en la mano derecha. El poder de esta carta se justifica por lo que mantiene vivo, no por lo que somete.',
          x: 12,
          y: 32,
        },
        {
          label: 'Las montañas áridas',
          meaning:
            'Sin vegetación, sin nieve, sin camino. Lo que el Emperador gobierna no es fértil por sí mismo: lo ordena para que produzca.',
          x: 85,
          y: 30,
        },
        {
          label: 'El orbe',
          meaning:
            'Una esfera en la mano izquierda, apoyada sobre la rodilla. El mundo entero cabe en una mano, y esa mano no lo aprieta.',
          x: 78,
          y: 50,
        },
        {
          label: 'Las cabezas de carnero',
          meaning:
            'Cuatro, en los brazos y el respaldo del trono. Es Aries, el primer impulso, convertido en el material del asiento.',
          x: 22,
          y: 60,
        },
        {
          label: 'La armadura bajo el manto',
          meaning:
            'Las grebas asoman por debajo del rojo. La figura sigue vestida para pelear aunque esté sentada: la paz que gobierna se defendió antes.',
          x: 68,
          y: 80,
        },
      ],
    },
    sectionOrder: [
      'meaningWork',
      'reversed',
      'meaningLove',
      'symbolism',
      'iconography',
      'readingCase',
      'meaningWellbeing',
      'advice',
      'yesNo',
    ],
  },

  'the-hierophant': {
    reversed: {
      heading: 'El Hierofante invertido',
      paragraphs: [
        'Invertido, la tradición pierde la bendición y conserva la forma. Aparece como el dogma que ya nadie cree pero todos repiten, la institución que exige lealtad y no la devuelve, el maestro que enseña lo que le enseñaron sin haberlo probado. También es, en positivo, el momento en que una persona se sale del guion: deja la carrera que la familia eligió, cuestiona la fe heredada o arma su propio ritual.',
        'Pide distinguir entre la enseñanza y la obediencia. El Hierofante invertido no invita a tirar todo lo aprendido sino a averiguar qué parte era conocimiento y qué parte era costumbre. Suele salir cuando la persona ya sabe la respuesta y busca permiso para no pedirla.',
      ],
    },
    readingCase: {
      heading: 'El Hierofante en una consulta sobre volver a estudiar',
      question:
        'Quiero retomar la carrera que dejé hace diez años, pero me da vergüenza volver a un aula. ¿Es una buena idea?',
      spread: 'Tirada de la herradura (siete cartas)',
      position: 'Lo que conviene hacer',
      orientation: 'upright',
      reading: [
        'El Hierofante derecho en la posición del consejo se leyó, primero, como un sí a la institución: la carta describe exactamente el aula, el programa, el saber que se transmite de alguien que lo tiene a alguien que lo pide. Pero las posiciones vecinas matizaron: el Obstáculo fue el Nueve de Espadas —la vergüenza en la cama, a la noche— y el Entorno, el Seis de Copas, los compañeros más jóvenes que la consultante imaginaba como un problema.',
        'Se le señaló que en la lámina los dos discípulos están arrodillados y llevan tonsura: son iguales entre sí ante el que enseña, sin importar la edad. La lectura no discutió si volver era una buena idea —la carta ya lo decía— sino cómo entrar: como alguien que viene a recibir, no a demostrar. Con eso, la vergüenza del Nueve de Espadas dejó de ser el eje.',
      ],
    },
    iconography: {
      heading: 'La lámina del Hierofante, símbolo por símbolo',
      intro:
        'Smith compuso al Hierofante como espejo de la Sacerdotisa: mismas columnas, mismo trono central, misma frontalidad. Pero acá todo es gris y rojo, sin velo ni agua, y hay dos figuras más que reciben lo que la Sacerdotisa guardaba para sí. La diferencia entre las dos láminas es la diferencia entre saber y enseñar.',
      symbols: [
        {
          label: 'La triple corona',
          meaning:
            'Tres coronas superpuestas, con clavos de oro: el poder sobre los tres mundos, o las tres cosas que la doctrina ordena.',
          x: 50,
          y: 18,
        },
        {
          label: 'La mano en bendición',
          meaning:
            'Dos dedos hacia arriba y dos plegados: lo que se muestra y lo que se guarda. Es el gesto del Mago, institucionalizado.',
          x: 18,
          y: 25,
        },
        {
          label: 'El cetro de triple cruz',
          meaning:
            'Sostenido en la mano izquierda, el lado que recibe. La cruz papal de tres travesaños repite la triple corona hacia abajo.',
          x: 78,
          y: 25,
        },
        {
          label: 'Los dos discípulos',
          meaning:
            'De espaldas, con tonsura, uno con rosas y otro con lirios: el deseo y la pureza vienen a recibir la misma enseñanza.',
          x: 20,
          y: 80,
        },
        {
          label: 'Las llaves cruzadas',
          meaning:
            'Dos llaves doradas, cruzadas en el suelo entre los discípulos. El acceso está ahí, a la vista, pero hay que agacharse.',
          x: 50,
          y: 90,
        },
      ],
    },
    sectionOrder: [
      'readingCase',
      'meaningLove',
      'meaningWork',
      'reversed',
      'symbolism',
      'iconography',
      'meaningWellbeing',
      'yesNo',
      'advice',
    ],
  },

  'the-lovers': {
    reversed: {
      heading: 'Los Enamorados invertidos',
      paragraphs: [
        'Invertida, la elección se hace por descarte o no se hace. Aparece como la pareja que sigue por costumbre, el trabajo que se acepta porque el otro tampoco convencía, o la persona que quiere las dos opciones y por eso no elige ninguna. En lo afectivo señala desencuentro: los dos están, pero ya no se miran como en la lámina, y el ángel bendice a nadie.',
        'Pide volver a la pregunta de fondo: ¿qué valoro más? Los Enamorados invertidos no hablan de ruptura inevitable sino de una elección que se dejó de renovar. A veces la respuesta es volver a elegir lo mismo, con conciencia; otras, admitir que la elección de hace cinco años ya no es la de hoy.',
      ],
    },
    readingCase: {
      heading: 'Los Enamorados en una consulta sobre decir lo que se siente',
      question:
        'Hace meses que siento algo por un amigo cercano. ¿Le digo, con el riesgo de perder la amistad?',
      spread: 'Tirada de tres cartas (situación, obstáculo, consejo)',
      position: 'Situación',
      orientation: 'upright',
      reading: [
        'Los Enamorados derechos en la situación describían con bastante literalidad lo que había: dos personas, una mirada que va hacia la otra y un vínculo con el cielo despejado. El obstáculo fue el Ocho de Espadas, la venda y las espadas alrededor, y el consejo, el Paje de Copas: la carta de decir algo con el corazón en la mano y sin saber cómo cae.',
        'Lo que se trabajó fue el ángulo de las miradas en la lámina: ella mira al ángel, él la mira a ella, y ninguno mira de frente. Se leyó que la consultante llevaba meses mirando "arriba" —la idea de la relación— en vez de mirar a la persona. El Paje sugería decirlo en chico, sin discurso, y aceptar que la respuesta era del otro. No se prometió nada sobre el resultado; sí que la venda del Ocho de Espadas se sacaba hablando.',
      ],
    },
    iconography: {
      heading: 'Qué mirar en la lámina de los Enamorados',
      intro:
        'Es la lámina que más cambió respecto de los mazos anteriores: Waite reemplazó la escena del hombre entre dos mujeres por el Edén, y Smith lo dibujó como una elección abierta, sin serpiente tentando todavía. El ángel ocupa la mitad superior; los humanos, la inferior. Nada en la carta ha pasado aún.',
      symbols: [
        {
          label: 'El sol detrás del ángel',
          meaning:
            'Un sol enorme, de rayos rectos, que no tiene rostro como el del arcano XIX. Alumbra sin mirar: la bendición es impersonal.',
          x: 50,
          y: 8,
        },
        {
          label: 'El ángel Rafael',
          meaning:
            'Alas rojas, pelo de fuego y túnica violeta, con las manos abiertas sobre los dos. Es el ángel del aire, el elemento de la carta.',
          x: 50,
          y: 22,
        },
        {
          label: 'La serpiente en el árbol',
          meaning:
            'Enroscada en el árbol del conocimiento, detrás de la mujer. Todavía no habló: la tentación existe, pero no la elección.',
          x: 12,
          y: 55,
        },
        {
          label: 'El árbol de doce llamas',
          meaning:
            'Detrás del hombre, un árbol con doce fuegos en vez de frutos: los signos del zodíaco, el deseo que arde con el tiempo.',
          x: 88,
          y: 48,
        },
        {
          label: 'La montaña entre ambos',
          meaning:
            'Un pico rojizo justo en el centro, a lo lejos. Lo que hay que atravesar juntos está a la vista y todavía muy lejos.',
          x: 50,
          y: 75,
        },
      ],
    },
    sectionOrder: [
      'meaningLove',
      'readingCase',
      'reversed',
      'meaningWork',
      'meaningWellbeing',
      'iconography',
      'symbolism',
      'advice',
      'yesNo',
    ],
  },

  'the-chariot': {
    reversed: {
      heading: 'El Carro invertido',
      paragraphs: [
        'Invertido, las esfinges tiran cada una para su lado y el carro no avanza. Aparece como el proyecto que arranca con toda la fuerza y se estanca al primer obstáculo, la persona que se exige tanto que se paraliza, o la agresividad de quien confunde avanzar con atropellar. Es también la mudanza que se posterga por sexta vez y el viaje que se cancela sobre la fecha.',
        'Pide revisar la dirección antes de volver a acelerar. El Carro invertido no dice que falte fuerza —suele sobrar— sino que las dos fuerzas no están alineadas, y a veces que el que conduce no sabe adónde va. Una pregunta concreta ayuda: si esto sale bien, ¿adónde llego?',
      ],
    },
    readingCase: {
      heading: 'El Carro en una consulta sobre mudarse al exterior',
      question:
        'Tengo todo listo para mudarme a otro país el mes que viene y de golpe no me animo. ¿Qué me está frenando?',
      spread: 'Cruz Celta',
      position: 'Corona: lo que se piensa',
      orientation: 'reversed',
      reading: [
        'El Carro invertido en la Corona describía la cabeza del consultante: la idea de la mudanza como conquista, con la armadura puesta, y las dos esfinges tirando en direcciones opuestas. Abajo, en el Fundamento, el Cuatro de Bastos —la casa, la fiesta, lo que se deja— explicó de dónde venía una de las esfinges. El Pasado reciente trajo el Tres de Bastos: los barcos ya estaban mandados.',
        'Se le señaló que en la lámina el auriga no tiene riendas: el control es mental, y lo que se le había desalineado era eso, no el plan. El Resultado, la Estrella, no se leyó como promesa sino como el clima que aparecía cuando se dejaba de pelear con las esfinges. La conclusión que se llevó fue que el freno no era una señal de error sino la esfinge negra pidiendo ser nombrada: lo que perdía con la mudanza también contaba.',
      ],
    },
    iconography: {
      heading: 'Símbolos del Carro, lámina VII',
      intro:
        'La lámina está armada en tres franjas: la ciudad atrás, el guerrero al centro, las esfinges adelante, y dos de las tres son de piedra: lo único vivo es el que no tiene riendas. Smith dibujó al auriga sin riendas y sin asiento visible, de pie dentro de un cubo. Lo que se mueve en esta carta es lo que menos parece capaz de moverse.',
      symbols: [
        {
          label: 'La estrella de la corona',
          meaning:
            'Una estrella de ocho puntas sobre el yelmo, la misma que en la lámina XVII: la guía está arriba, no en las manos.',
          x: 50,
          y: 11,
        },
        {
          label: 'Las lunas de los hombros',
          meaning:
            'Dos medias lunas con rostro, una sonriente y otra seria, en las hombreras. Lleva puestos los dos estados de ánimo.',
          x: 30,
          y: 26,
        },
        {
          label: 'La ciudad amurallada',
          meaning:
            'Detrás, a la derecha, con torres y un río. Es lo conquistado o lo dejado atrás: el Carro siempre viene de algún lado.',
          x: 88,
          y: 44,
        },
        {
          label: 'El trompo alado',
          meaning:
            'Un disco rojo con alas en el frente del carro, sobre el lingam y el yoni: el impulso que junta lo opuesto y lo pone en marcha.',
          x: 49,
          y: 62,
        },
        {
          label: 'Las dos esfinges',
          meaning:
            'Una blanca y una negra, echadas, mirando hacia lados distintos. No están enganchadas al carro: lo que las une es la voluntad del auriga.',
          x: 50,
          y: 80,
        },
      ],
    },
    sectionOrder: [
      'meaningWork',
      'meaningLove',
      'reversed',
      'readingCase',
      'meaningWellbeing',
      'symbolism',
      'iconography',
      'yesNo',
      'advice',
    ],
  },

  strength: {
    reversed: {
      heading: 'La Fuerza invertida',
      paragraphs: [
        'Invertida, la mano que cerraba el hocico ahora tiembla o aprieta demasiado. Aparece como la duda sobre la propia capacidad —"no voy a poder con esto"—, como el impulso que se desborda en un mal momento o como la fuerza usada para dominar en vez de acompañar. También describe el cansancio de quien lleva años siendo el fuerte de la familia y no encuentra dónde apoyarse.',
        'Pide bajar la exigencia y volver a mirar al león. La Fuerza invertida no dice que la fuerza se perdió sino que se desconectó del cuerpo: se está apretando con la cabeza. Suele ayudar algo físico y repetido, y una conversación en la que se admite, por una vez, que algo pesa.',
      ],
    },
    readingCase: {
      heading: 'La Fuerza en una consulta sobre una conversación familiar',
      question:
        'Tengo que hablar con mi hermano sobre el cuidado de nuestra madre y cada vez que lo intento terminamos gritando. ¿Cómo lo encaro?',
      spread: 'Tirada de tres cartas (situación, obstáculo, consejo)',
      position: 'Consejo',
      orientation: 'upright',
      reading: [
        'La situación salió con el Cinco de Bastos y el obstáculo con el Rey de Espadas invertido: una pelea que no termina y una autoridad que corta con la palabra, probablemente la del consultante mismo. La Fuerza derecha como consejo se leyó primero como paciencia, que es la lectura de manual, y después con más precisión: en la lámina la mujer no está frenando al león, le está cerrando la boca con las manos abiertas, y el león se deja.',
        'Se tradujo a lo concreto: la conversación no se ganaba con argumentos —el Rey de Espadas era el problema, no la solución— sino sosteniendo la calma el tiempo suficiente para que el otro dejara de defenderse. El consultante propuso hablar caminando, sin mesa de por medio, y no responder en el primer minuto de cualquier ataque. Eso era la guirnalda de la lámina: la fuerza como lazo, no como jaula.',
      ],
    },
    iconography: {
      heading: 'La lámina de la Fuerza en detalle',
      intro:
        'Waite cambió el orden de la tradición y puso a la Fuerza en el VIII, antes de la Justicia, para que coincidiera con Leo. Smith la dibujó sin ningún elemento de combate: ni armas, ni armadura, ni tensión en los brazos. El fondo amarillo es el mismo del Mago y del Loco, la familia de las cartas que actúan sin esfuerzo visible.',
      symbols: [
        {
          label: 'La lemniscata',
          meaning:
            'Flota sobre la cabeza como en el Mago, pero acá inclinada y más cerca del cuerpo: la energía infinita, aplicada a una sola tarea.',
          x: 20,
          y: 18,
        },
        {
          label: 'La guirnalda de flores',
          meaning:
            'Rodea la cintura de la mujer y baja hasta el cuello del león. Es un solo lazo para los dos: la fuerza se comparte, no se impone.',
          x: 58,
          y: 45,
        },
        {
          label: 'Las fauces del león',
          meaning:
            'Las manos están apoyadas, no apretando; el león saca la lengua. Es un gesto de confianza mutua, no de sometimiento.',
          x: 36,
          y: 53,
        },
        {
          label: 'La montaña azul',
          meaning:
            'A la izquierda, lejos, un pico azul y pequeño. Lo que queda por escalar está ahí, pero no es lo que se está haciendo ahora.',
          x: 12,
          y: 68,
        },
      ],
    },
    sectionOrder: [
      'meaningWellbeing',
      'reversed',
      'meaningLove',
      'meaningWork',
      'iconography',
      'symbolism',
      'readingCase',
      'advice',
      'yesNo',
    ],
  },

  'the-hermit': {
    reversed: {
      heading: 'El Ermitaño con el farol apagado',
      paragraphs: [
        'Invertido, la soledad deja de ser elegida. Aparece como aislamiento: la persona que dejó de contestar mensajes hace meses y ya no sabe cómo volver, el que se encerró a pensar y solo da vueltas, o el que rechaza toda ayuda porque pedirla sería admitir que no pudo solo. También, en sentido contrario, el que no soporta un minuto de silencio y llena la agenda para no escucharse.',
        'Pide una cosa u otra según el caso: bajar de la montaña o subirla de una vez. El Ermitaño invertido no discute el valor del retiro sino su momento; hay retiros que ya cumplieron su función y hay ruidos que están tapando una pregunta. La señal de que se enderezó es que el farol vuelve a alumbrar a alguien más.',
      ],
    },
    readingCase: {
      heading: 'El Ermitaño en una consulta sobre irse a vivir al campo',
      question:
        'Quiero dejar la ciudad y pasar un año solo en el campo, escribiendo. Mi familia piensa que estoy escapando. ¿Tienen razón?',
      spread: 'Tirada de decisión (camino A, camino B, consejo)',
      position: 'Camino A: el año en el campo',
      orientation: 'upright',
      reading: [
        'El camino del campo trajo al Ermitaño derecho; el de quedarse, el Diez de Bastos; el consejo, el Seis de Espadas. La pregunta del consultante era si escapaba, y la tirada le contestó por el lado de las cartas vecinas: lo que dejaba era una carga (el Diez de Bastos, los leños hasta la cara) y el viaje del Seis de Espadas se hace sentado, con las espadas a bordo. No era huida; era traslado con lo que pesaba.',
        'Sobre el Ermitaño en sí se le señaló el detalle de la lámina: el farol no ilumina la montaña sino el paso siguiente, y el anciano mira hacia abajo, hacia quien viene detrás. Se leyó que el año solo tenía sentido si producía algo que volviera a los demás —el libro, o lo que fuera—, y que la familia tenía derecho a preguntar por eso. La distinción que se llevó fue entre aislarse y retirarse: el Ermitaño hace lo segundo.',
      ],
    },
    iconography: {
      heading: 'Los tres objetos del Ermitaño',
      intro:
        'Es la lámina más despojada de los mayores: una figura, un farol, un bastón y nieve. Smith no puso cielo con estrellas ni camino dibujado; el gris ocupa todo. Cada uno de los pocos objetos está pensado, y el más importante es el que se ve menos: los ojos.',
      symbols: [
        {
          label: 'El farol con la estrella',
          meaning:
            'Dentro brilla una estrella de seis puntas, el sello de Salomón: la luz que lleva no es suya, es un conocimiento que porta.',
          x: 12,
          y: 22,
        },
        {
          label: 'Los ojos entrecerrados',
          meaning:
            'Bajo la capucha, la mirada apunta hacia abajo y hacia la izquierda: alumbra el camino de quien sube detrás, no el propio.',
          x: 47,
          y: 17,
        },
        {
          label: 'El bastón dorado',
          meaning:
            'Amarillo, liso, más alto que la figura. No es un arma ni un cetro: es el apoyo, y es de oro porque sostener también vale.',
          x: 35,
          y: 55,
        },
        {
          label: 'La cima nevada',
          meaning:
            'Los pies apenas se apoyan en un pico blanco. Ya llegó arriba; lo que hace ahora es quedarse a alumbrar, no seguir subiendo.',
          x: 50,
          y: 91,
        },
      ],
    },
    sectionOrder: [
      'reversed',
      'readingCase',
      'meaningWellbeing',
      'meaningLove',
      'meaningWork',
      'symbolism',
      'iconography',
      'advice',
      'yesNo',
    ],
  },

  'wheel-of-fortune': {
    reversed: {
      heading: 'La Rueda de la Fortuna girando al revés',
      paragraphs: [
        'Invertida, la rueda sigue girando pero la persona se resiste al giro. Aparece como la mala racha que se explica con "siempre me pasa lo mismo", como el ciclo que se repite porque nadie aprendió la lección de la vuelta anterior, o como la sensación de que todo cambia menos uno. También describe la suerte que llegó y no se aprovechó porque se estaba mirando para otro lado.',
        'Pide dejar de discutir con la rueda y mirar en qué punto del giro se está. La Rueda invertida no anuncia desgracia: dice que el momento es de bajada y que las bajadas también terminan, pero que aferrarse al borde solo marea. Lo que sí está en las manos es qué se hace mientras tanto.',
      ],
    },
    readingCase: {
      heading: 'La Rueda de la Fortuna en un cambio de rumbo laboral',
      question:
        'Cerraron la empresa donde trabajé quince años y no sé si buscar lo mismo o aprovechar para cambiar de rubro. ¿Qué me muestra la tirada?',
      spread: 'Tirada de tres cartas (pasado, presente, futuro)',
      position: 'Presente',
      orientation: 'upright',
      reading: [
        'La Rueda derecha en el presente, entre el Diez de Oros invertido y el Paje de Bastos, contó una historia clara: una estructura que se desarmó, un giro que ya está ocurriendo y, adelante, alguien joven con un basto que brota. La lectura no decidió por el consultante si repetir o cambiar; lo que hizo fue ubicarlo en la rueda: no estaba abajo, estaba en el punto exacto en que el giro ya empezó y todavía no se ve adónde lleva.',
        'Se le señalaron las cuatro figuras de las esquinas, que leen libros mientras la rueda gira: lo estable en medio del cambio es lo que se sabe. Se le preguntó qué de los quince años no dependía del rubro, y armó una lista de cosas que se llevaba a cualquier lado. La Rueda derecha pedía moverse con el giro, no elegir el destino desde el vértigo; el Paje sugería que el destino apareciera haciendo, no planeando.',
      ],
    },
    iconography: {
      heading: 'Descifrar la lámina de la Rueda de la Fortuna',
      intro:
        'Es la lámina más escrita del mazo: letras hebreas, letras latinas, símbolos alquímicos, cuatro criaturas con libros. Smith la compuso en el cielo, sin suelo ni horizonte, para que la rueda flote. Nada la sostiene y nada la empuja; lo único que se mueve son las tres criaturas sobre ella.',
      symbols: [
        {
          label: 'Los cuatro seres con libros',
          meaning:
            'Ángel, águila, león y toro en las esquinas, cada uno leyendo: los signos fijos estudian el cambio en vez de resistirlo.',
          x: 14,
          y: 12,
        },
        {
          label: 'La esfinge con la espada',
          meaning:
            'Sentada arriba de la rueda, azul, con la espada al hombro. Es lo único que no gira: el enigma que se mantiene en cada vuelta.',
          x: 50,
          y: 20,
        },
        {
          label: 'Las letras de la rueda',
          meaning:
            'T-A-R-O alternadas con las cuatro letras hebreas del nombre divino. Leídas en círculo dicen TARO, ROTA, TORA y ORAT: la rueda se lee como se quiera.',
          x: 50,
          y: 34,
        },
        {
          label: 'La serpiente que baja',
          meaning:
            'Amarilla, por el lado izquierdo, cabeza abajo: es Tifón, la fuerza que desciende. Toda rueda tiene un lado que baja.',
          x: 12,
          y: 65,
        },
        {
          label: 'Hermanubis que sube',
          meaning:
            'La figura roja con cabeza de chacal trepa por la derecha. Lo que baja de un lado sube del otro, y en la lámina ocurre a la vez.',
          x: 85,
          y: 58,
        },
      ],
    },
    sectionOrder: [
      'symbolism',
      'iconography',
      'readingCase',
      'meaningWork',
      'meaningLove',
      'meaningWellbeing',
      'reversed',
      'advice',
    ],
  },

  justice: {
    reversed: {
      heading: 'La Justicia invertida',
      paragraphs: [
        'Invertida, la balanza se inclina antes de pesar. Aparece como la decisión tomada con la mitad de los datos, la injusticia que se sufre o la que se comete sin registrarla, y sobre todo como la falta de honestidad con uno mismo: la persona que sabe qué parte le toca en el problema y cuenta la historia de otro modo. También señala cuentas pendientes que se vienen postergando y que la postergación agranda.',
        'Pide poner las dos cosas en los platillos, incluso la que no conviene. La Justicia invertida no es castigo sino desequilibrio, y se endereza con un acto concreto de reconocimiento: admitir, pagar, pedir disculpas o cobrar lo que corresponde. El zapato que asoma bajo el manto de la lámina recuerda que quien juzga también tiene que caminar.',
      ],
    },
    readingCase: {
      heading: 'La Justicia en una consulta sobre una sociedad que termina',
      question:
        'Mi socia y yo decidimos separar el negocio y no nos ponemos de acuerdo en cómo repartir. ¿Cómo lo resuelvo sin pelearnos?',
      spread: 'Cruz Celta',
      position: 'Resultado',
      orientation: 'upright',
      reading: [
        'La Justicia derecha en la posición del Resultado se leyó con cuidado, porque la tentación es prometer que "se hace justicia". No es lo que dice la carta: describe un cierre en el que las dos partes se pesan con la misma balanza, y ese cierre depende de que las dos se sienten a pesar. El presente era el Dos de Oros —malabares para sostener dos cosas— y lo que cruzaba, el Cinco de Copas: las tres copas volcadas del duelo por la sociedad que fue.',
        'Se le señaló la simetría de la lámina: espada arriba en una mano, balanza en la otra, y ninguna inclinada. La consultante estaba llegando a la negociación con la espada sola. Lo que se trabajó fue armar la balanza: una lista de lo que cada una había puesto, incluida la parte que no era dinero. No se prometió un reparto favorable; se propuso una forma de llegar a la mesa que hiciera posible el Resultado que la carta describía.',
      ],
    },
    iconography: {
      heading: 'Los objetos de la Justicia, lámina XI',
      intro:
        'Smith la compuso como la tercera figura entronizada entre columnas, después de la Sacerdotisa y el Hierofante, pero con un cambio: la Justicia mira de frente, con los ojos abiertos y sin venda. En este mazo la justicia ve. Lo que sostiene en cada mano y lo que asoma bajo el manto explican el resto.',
      symbols: [
        {
          label: 'La corona con el cuadrado',
          meaning:
            'Una corona dorada con un cuadrado pequeño en el centro: el pensamiento ordenado, sin adornos. Es la única corona geométrica del mazo.',
          x: 50,
          y: 22,
        },
        {
          label: 'La espada erguida',
          meaning:
            'En la mano derecha, de doble filo, apuntando al cielo. No está cortando: está lista, y corta para los dos lados por igual.',
          x: 12,
          y: 30,
        },
        {
          label: 'La balanza',
          meaning:
            'Dorada, en la mano izquierda, con los dos platillos a la misma altura. Nada se pesó todavía: la carta es el momento previo al veredicto.',
          x: 85,
          y: 55,
        },
        {
          label: 'El zapato bajo el manto',
          meaning:
            'Un pie blanco asoma bajo el rojo, abajo a la izquierda. Es el detalle humano: la que juzga también pisa el mismo suelo.',
          x: 37,
          y: 88,
        },
      ],
    },
    sectionOrder: [
      'readingCase',
      'meaningWork',
      'reversed',
      'meaningLove',
      'symbolism',
      'iconography',
      'meaningWellbeing',
      'advice',
    ],
  },

  'the-hanged-man': {
    reversed: {
      heading: 'El Colgado dado vuelta',
      paragraphs: [
        'Invertido, el Colgado queda de pie y se pierde lo que se veía desde abajo. Aparece como la resistencia a una pausa necesaria —la persona que no puede esperar y arruina lo que estaba por madurar—, como el sacrificio inútil que se repite por costumbre, o como el mártir que se cuelga para que lo vean. También, en positivo, señala el fin de una espera: la cuerda se suelta y hay que volver a caminar.',
        'Pide preguntarse qué se está esperando y si tiene fecha. El Colgado invertido no cuestiona el valor de la entrega sino su sentido: hay suspensiones que producen iluminación y hay otras que solo producen entumecimiento. La diferencia se nota en la cara: la de la lámina está serena; la de la espera inútil, no.',
      ],
    },
    readingCase: {
      heading: 'El Colgado en una consulta sobre un proyecto detenido',
      question:
        'Hace ocho meses que mi novela está en manos de una editorial y no contestan. ¿Sigo esperando o la publico yo?',
      spread: 'Tirada de tres cartas (situación, obstáculo, consejo)',
      position: 'Situación',
      orientation: 'upright',
      reading: [
        'El Colgado derecho en la situación describía la espera con exactitud y sin juicio: colgado de un solo pie, atado por decisión propia, con la cabeza rodeada de luz. La lectura empezó por ahí: la consultante había elegido esa suspensión y no era una víctima de la editorial. El obstáculo, el Cuatro de Oros, mostró lo que la espera protegía —no soltar el control sobre el libro— y el consejo, el Ocho de Bastos, dijo que el movimiento venía rápido cuando viniera.',
        'Se leyó la posición del Colgado como un tiempo con sentido, no como un castigo, pero se le señaló la viga: es madera viva, con hojas, y sigue creciendo mientras él cuelga. Se le preguntó qué había crecido en esos ocho meses. Había escrito otra cosa. Esa era la iluminación de la carta; la respuesta sobre la editorial se resolvía sola en cuanto dejaba de ser la única rama.',
      ],
    },
    iconography: {
      heading: 'Mirar la lámina del Colgado al derecho',
      intro:
        'Es la única lámina de los mayores pensada para verse en dos sentidos, y Smith la resolvió con un truco: si se da vuelta la carta, la figura está bailando. El fondo es gris y liso, sin paisaje ni horizonte, para que nada indique dónde está arriba. Los detalles del cuerpo son la clave.',
      symbols: [
        {
          label: 'La viga viva',
          meaning:
            'La T de madera tiene brotes y hojas verdes en los extremos: no es un patíbulo sino un árbol que sigue creciendo.',
          x: 50,
          y: 10,
        },
        {
          label: 'La pierna cruzada',
          meaning:
            'Una pierna atada por el tobillo y la otra doblada detrás, formando un cuatro: la postura de quien está quieto por elección.',
          x: 57,
          y: 35,
        },
        {
          label: 'Los brazos ocultos',
          meaning:
            'Detrás de la espalda, dibujando un triángulo con la punta hacia abajo. Nada agarra, nada sostiene: la entrega es completa.',
          x: 45,
          y: 60,
        },
        {
          label: 'La aureola',
          meaning:
            'Rayos dorados alrededor de la cabeza, que queda abajo. La luz aparece en la posición incómoda, no a pesar de ella.',
          x: 50,
          y: 79,
        },
      ],
    },
    sectionOrder: [
      'reversed',
      'meaningWellbeing',
      'symbolism',
      'iconography',
      'meaningLove',
      'meaningWork',
      'readingCase',
      'advice',
    ],
  },

  death: {
    reversed: {
      heading: 'La Muerte invertida',
      paragraphs: [
        'Invertida, el cortejo se detiene y el rey caído no termina de caer. Aparece como el final que se sabe y no se ejecuta: la relación que sigue por inercia, el trabajo que ya no tiene sentido pero da miedo dejar, la mudanza a medio hacer. Es la carta del duelo postergado, y también de la resistencia a un cambio que ya empezó por su cuenta, sin pedir permiso.',
        'Pide terminar de cerrar. La Muerte invertida no es más suave que la derecha; es la misma transformación, pero arrastrada. Lo que se interrumpe no es el final sino el amanecer que viene después, el que en la lámina asoma entre las dos torres. Suele ayudar nombrar en voz alta lo que ya terminó.',
      ],
    },
    readingCase: {
      heading: 'La Muerte en una consulta sobre dejar la casa familiar',
      question:
        'Mis padres venden la casa donde crecí y me toca vaciar mi habitación. ¿Por qué me cuesta tanto si ya no vivo ahí?',
      spread: 'Tirada de tres cartas (pasado, presente, futuro)',
      position: 'Presente',
      orientation: 'upright',
      reading: [
        'La Muerte derecha en el presente, entre el Diez de Copas y el Seis de Copas, armó una lectura sin sorpresas y por eso mismo útil. Atrás, la familia completa bajo el arcoíris; adelante, la nostalgia de la infancia; en el medio, el caballo blanco pasando por encima de lo que fue. El consultante venía a preguntar por qué le costaba, y la carta le dijo que lo que estaba cerrando no era una habitación sino la versión de la familia que vivía en ella.',
        'Se le señaló la rosa blanca del estandarte, y las cuatro figuras que reciben al caballo de maneras distintas: el rey que cae, el obispo que reza, la mujer que gira la cara, el niño que ofrece flores. Se le preguntó cuál era él en el vaciado de la habitación. Dijo que la mujer. La tirada no le ahorró el duelo; le dio permiso de hacerlo como el niño, con algo en la mano para dar.',
      ],
    },
    iconography: {
      heading: 'Lo que hay en la lámina de la Muerte',
      intro:
        'Waite quiso una Muerte sin guadaña y Smith la dibujó como un jinete con estandarte, en medio de una procesión. Es la única lámina de los mayores con cuatro figuras humanas además de la principal, y con dos escenas a la vez: el cortejo adelante y el amanecer atrás. Casi nadie mira el fondo.',
      symbols: [
        {
          label: 'La rosa del estandarte',
          meaning:
            'Blanca, de cinco pétalos, sobre fondo negro: la vida que sigue después del corte. Es la rosa del Loco, madurada.',
          x: 60,
          y: 15,
        },
        {
          label: 'El sol entre las torres',
          meaning:
            'Al fondo, a la derecha, un sol sale —o se pone— entre dos torres: las mismas que en la Luna. El otro lado existe.',
          x: 85,
          y: 42,
        },
        {
          label: 'El caballo blanco',
          meaning:
            'Avanza al paso, con un ojo rojo y las riendas flojas. Es la única figura de la carta que no reacciona: solo pasa.',
          x: 52,
          y: 55,
        },
        {
          label: 'El obispo de pie',
          meaning:
            'La única figura que no cae ni se aparta: le habla de frente al jinete. La fe negocia; el resto reacciona.',
          x: 80,
          y: 60,
        },
        {
          label: 'El niño con flores',
          meaning:
            'Arrodillado, con un ramo, mirando al caballo sin miedo. Es la manera más limpia de recibir un final: con algo para dar.',
          x: 72,
          y: 88,
        },
      ],
    },
    sectionOrder: [
      'readingCase',
      'reversed',
      'meaningLove',
      'meaningWork',
      'meaningWellbeing',
      'iconography',
      'symbolism',
      'advice',
      'yesNo',
    ],
  },

  temperance: {
    reversed: {
      heading: 'La Templanza invertida',
      paragraphs: [
        'Invertida, el chorro se corta y el agua se derrama. Aparece como desequilibrio en cualquier dirección: excesos que se justifican con "me lo merezco", rutinas tan estrictas que no dejan lugar a nada, mezclas que no ligan —dos personas, dos trabajos, dos ciudades— porque se intenta juntarlas de golpe. También señala impaciencia con un proceso que necesita su tiempo, como pretender que una herida se cierre a fuerza de voluntad.',
        'Pide bajar la velocidad de la mezcla. La Templanza invertida no dice que la combinación sea imposible sino que se está vertiendo de más alto de lo que el chorro aguanta. Suele bastar con revisar proporciones: qué parte de la semana va a cada cosa, y si el pie que está en el agua todavía toca el fondo.',
      ],
    },
    readingCase: {
      heading: 'La Templanza en una consulta sobre volver a empezar después de una separación',
      question:
        'Me separé hace seis meses y quiero volver a salir con gente, pero cada cita me deja agotada. ¿Estoy yendo demasiado rápido?',
      spread: 'Tirada de la relación conmigo misma (cuerpo, ánimo, deseo)',
      position: 'Ánimo',
      orientation: 'reversed',
      reading: [
        'La Templanza invertida en la posición del ánimo, entre el Nueve de Bastos en el cuerpo y el As de Copas en el deseo, describió la situación mejor que la consultante: el cuerpo todavía vendado y en guardia, el deseo nuevo y lleno, y en el medio un ángel que intentaba pasar agua de una copa a la otra demasiado rápido y la derramaba. No estaba yendo "demasiado rápido" en abstracto; estaba mezclando dos cosas que no tenían todavía la misma temperatura.',
        'Se le señaló que en la lámina el ángel tiene un pie en el agua y otro en la tierra, y que ese detalle es la carta entera: la mezcla se hace con un pie en cada lado, no con los dos en el agua. Se propuso una proporción concreta —una cita cada tanto, y el resto del tiempo para el Nueve de Bastos— en vez de una pausa total o un empuje mayor. Lo que se llevó no fue un sí ni un no sino una medida.',
      ],
    },
    iconography: {
      heading: 'Símbolos de la Templanza, lámina XIV',
      intro:
        'Smith dibujó un ángel con los pies en dos elementos y las manos en dos copas, y todo lo demás en la lámina repite ese "entre": el sendero entre el estanque y las montañas, los lirios entre el agua y la tierra, el sol saliendo entre dos picos. Es la carta del intermedio, y cada símbolo lo dice de una manera.',
      symbols: [
        {
          label: 'El triángulo en el cuadrado',
          meaning:
            'Sobre el pecho, un triángulo naranja dentro de un cuadrado blanco: el espíritu contenido por la forma, o el fuego dentro de la materia.',
          x: 50,
          y: 30,
        },
        {
          label: 'El chorro entre las copas',
          meaning:
            'El agua pasa en diagonal de la copa alta a la baja, sin caer. Es el momento de la mezcla, dibujado como si el tiempo no corriera.',
          x: 50,
          y: 42,
        },
        {
          label: 'El sendero hacia la corona',
          meaning:
            'A la izquierda, un camino sube desde el estanque hasta unas montañas donde brilla una corona: la meta existe, pero está lejos y arriba.',
          x: 12,
          y: 57,
        },
        {
          label: 'Los lirios amarillos',
          meaning:
            'Crecen a la derecha, en el borde exacto del agua. Son el iris, la flor del mensajero: lo que florece cuando dos elementos se tocan.',
          x: 85,
          y: 60,
        },
        {
          label: 'Un pie en el agua, otro en la tierra',
          meaning:
            'El pie derecho dentro del estanque y el izquierdo sobre la roca. Toda la carta se resume en ese apoyo repartido.',
          x: 48,
          y: 80,
        },
      ],
    },
    sectionOrder: [
      'meaningWellbeing',
      'meaningLove',
      'readingCase',
      'reversed',
      'symbolism',
      'iconography',
      'meaningWork',
      'yesNo',
      'advice',
    ],
  },

  'the-devil': {
    reversed: {
      heading: 'El Diablo invertido: las cadenas flojas',
      paragraphs: [
        'Invertido, el Diablo es la mejor noticia de la carta: las cadenas se notan. Aparece como el momento en que la persona ve lo que la tenía atada —una relación que no suelta, un hábito que gobierna la agenda, una deuda que se renueva sola— y descubre que el aro del cuello le entra por la cabeza. No es libertad todavía; es la conciencia de que la puerta estuvo abierta todo el tiempo.',
        'Pide dar el paso que la conciencia ya sugirió. El Diablo invertido es frágil: la cadena se afloja y la persona puede volver a ponérsela por costumbre, que es la única fuerza real que tiene esta carta. Suele señalar el principio de una salida, y la salida se confirma haciendo algo distinto la próxima vez que el impulso aparece.',
      ],
    },
    readingCase: {
      heading: 'El Diablo en una consulta sobre un trabajo que no se puede dejar',
      question:
        'Odio mi trabajo, paga bien y hace tres años que digo que renuncio. ¿Qué me tiene atado?',
      spread: 'Tirada de tres cartas (situación, obstáculo, consejo)',
      position: 'Obstáculo',
      orientation: 'upright',
      reading: [
        'La situación salió con el Ocho de Oros —el oficio que se hace bien, repetido— y el obstáculo con el Diablo derecho. La primera lectura era obvia y se descartó rápido: el dinero como cadena. Las cadenas de la lámina cuelgan flojas, y cuando se le preguntó al consultante cuánto necesitaba para vivir, la cifra era la mitad de lo que ganaba. El Diablo no era el sueldo; era la identidad que el sueldo le daba en su familia.',
        'El consejo trajo la Estrella, y se leyó por contraste con el Diablo: donde uno tiene fondo negro y figuras encadenadas, la otra tiene cielo abierto y una figura desnuda que vierte agua sin miedo. La Estrella pedía la desnudez: contarle a la familia que iba a ganar menos. El consultante no renunció esa semana ni la siguiente; lo que se llevó fue que el aro se sacaba por la cabeza, no rompiendo la cadena.',
      ],
    },
    iconography: {
      heading: 'La lámina del Diablo como espejo de los Enamorados',
      intro:
        'Smith calcó la composición de la lámina VI para dibujar la XV: una figura alada arriba, un hombre y una mujer desnudos abajo, en los mismos lugares. Lo que cambió es todo lo demás: el fondo negro en vez del cielo, el pedestal en vez de la nube, las cadenas en vez de la bendición. Se lee mejor con las dos cartas al lado.',
      symbols: [
        {
          label: 'El pentagrama invertido',
          meaning:
            'Sobre la frente, una estrella de cinco puntas con la punta hacia abajo: el espíritu sometido a la materia, el orden de los Enamorados dado vuelta.',
          x: 50,
          y: 8,
        },
        {
          label: 'La mano alzada',
          meaning:
            'La derecha, abierta, con un signo en la palma. Es la bendición del Hierofante, imitada: promete, y no da.',
          x: 15,
          y: 18,
        },
        {
          label: 'Las cadenas flojas',
          meaning:
            'Aros anchos alrededor del cuello, unidos al pedestal por eslabones que cuelgan. Con levantar los brazos se sacan: nadie lo intenta.',
          x: 50,
          y: 78,
        },
        {
          label: 'La cola de uvas',
          meaning:
            'La mujer tiene una cola que termina en un racimo: el placer que se volvió apéndice, lo que se disfrutaba y ahora se arrastra.',
          x: 12,
          y: 80,
        },
        {
          label: 'La antorcha hacia abajo',
          meaning:
            'La figura sostiene el fuego con la punta al suelo y enciende la cola del hombre. La luz que debería alumbrar, quema.',
          x: 86,
          y: 72,
        },
      ],
    },
    sectionOrder: [
      'reversed',
      'meaningLove',
      'readingCase',
      'meaningWork',
      'symbolism',
      'iconography',
      'meaningWellbeing',
      'advice',
      'yesNo',
    ],
  },

  'the-tower': {
    reversed: {
      heading: 'La Torre invertida',
      paragraphs: [
        'Invertida, el rayo cayó y la torre sigue en pie, a medias. Aparece como la crisis que se evita a último momento y deja todo igual de frágil, como el derrumbe lento —la relación o el trabajo que se desmoronan de a pedazos en vez de caer—, o como el miedo a una catástrofe que no llega y que ocupa más lugar que si llegara. También describe a quien ya pasó la Torre y sigue viviendo entre los escombros porque no se anima a construir de nuevo.',
        'Pide terminar de demoler lo que ya no se sostiene, con la propia mano en vez de esperar el rayo. La Torre invertida no es una Torre más suave: es una Torre a la que se le está negando su función, que es despejar. Suele salir cuando la persona sabe qué se tiene que caer y está apuntalándolo.',
      ],
    },
    readingCase: {
      heading: 'La Torre en una consulta sobre volver a la ciudad natal',
      question:
        'Después de diez años afuera vuelvo a mi ciudad y todo lo que dejé armado —amistades, familia, mi lugar— ya no está como lo dejé. ¿Qué me espera?',
      spread: 'Cruz Celta',
      position: 'Pasado reciente',
      orientation: 'upright',
      reading: [
        'La Torre derecha en el pasado reciente fue lo primero que se explicó, porque la consultante la leyó como amenaza y estaba en la posición equivocada para serlo: lo que la Torre describía ya había pasado. La estructura que dejó armada hace diez años —la corona en lo alto de la torre— la había volado el tiempo, no ella, y las dos figuras cayendo eran las versiones de sí misma y de su ciudad que ya no existían.',
        'El presente trajo el Cuatro de Bastos invertido y el Fundamento, el Diez de Oros: había una casa y una familia, pero la fiesta no estaba armada. Lo que se leyó fue que no volvía a un lugar sino a un terreno despejado, y que la Torre ya había hecho el trabajo de sacarle las expectativas de encima. La conclusión no fue "qué me espera" sino qué quería construir sobre la roca que la lámina muestra al pie, sin cimientos viejos.',
      ],
    },
    iconography: {
      heading: 'Los detalles de la lámina de la Torre',
      intro:
        'Es la única lámina de los mayores donde todo está en el aire: la corona, las llamas, las dos figuras, las gotas de fuego. Smith dibujó el instante exacto del rayo, con el cielo negro y ningún suelo visible más que la roca. No hay un antes ni un después en la carta; hay que mirar cada cosa que cae.',
      symbols: [
        {
          label: 'La corona que vuela',
          meaning:
            'Dorada, en lo alto, ya despegada de la torre. Era lo que la coronaba, y es lo primero que se pierde: la idea que se tenía de uno mismo.',
          x: 35,
          y: 8,
        },
        {
          label: 'El rayo',
          meaning:
            'Entra desde la derecha, en zigzag, y golpea justo en la corona. Viene de afuera y de arriba: nadie en la carta lo provocó.',
          x: 72,
          y: 10,
        },
        {
          label: 'Las veintidós llamas',
          meaning:
            'Gotas de fuego en forma de yod flotan a los dos lados: son los arcanos mayores, el conocimiento que cae junto con la torre.',
          x: 18,
          y: 45,
        },
        {
          label: 'Las dos figuras cayendo',
          meaning:
            'Una con corona y otra sin ella, cabeza abajo, a los dos lados de la torre. La caída no distingue rangos ni las separa: caen juntas.',
          x: 78,
          y: 65,
        },
        {
          label: 'La roca sin cimientos',
          meaning:
            'La torre se levanta directamente sobre un peñasco gris, sin base ni escalera. Estaba construida donde no se podía construir.',
          x: 50,
          y: 88,
        },
      ],
    },
    sectionOrder: [
      'readingCase',
      'symbolism',
      'iconography',
      'meaningWork',
      'meaningLove',
      'meaningWellbeing',
      'reversed',
      'yesNo',
      'advice',
    ],
  },

  'the-star': {
    reversed: {
      heading: 'La Estrella invertida',
      paragraphs: [
        'Invertida, la Estrella pierde la desnudez: aparece como la esperanza que se declara y no se siente, la calma fingida después de una crisis, el "ya estoy bien" que se dice con los cántaros vacíos. También es el desaliento silencioso de quien atravesó la Torre y no encuentra el estanque, o la persona que vierte todo lo que tiene en los demás y a la tierra propia no le llega nada.',
        'Pide recuperar la proporción de la lámina: un cántaro al estanque, otro a la tierra. La Estrella invertida no niega la esperanza sino que señala que se la está gastando en el lugar equivocado, o que todavía no se llegó al lugar donde se la puede sentir. La fe vuelve por el cuerpo antes que por la cabeza.',
      ],
    },
    readingCase: {
      heading: 'La Estrella como consejo después de una crisis',
      question:
        'Este año perdí el trabajo y una relación de siete años. Ya pasó lo peor. ¿Cómo sigo?',
      spread: 'Tirada de tres cartas (situación, obstáculo, consejo)',
      position: 'Consejo',
      orientation: 'upright',
      reading: [
        'La situación salió con la Torre —sin sorpresa para nadie— y el obstáculo con el Nueve de Bastos, la guardia levantada de quien ya recibió golpes. La Estrella derecha como consejo se leyó, sobre todo, contra el Nueve de Bastos: la figura de la lámina está desnuda y arrodillada junto al agua, sin ninguna defensa, y no le pasa nada. El consejo no era "tener esperanza" sino bajar la guardia lo suficiente como para poder arrodillarse.',
        'Se le señalaron los dos cántaros y los cinco arroyos que salen del que se vierte en la tierra: lo que se da vuelve por más caminos de los que se ve. Se le preguntó qué había estado sosteniendo con la guardia alta y qué podía verter. Habló de una amistad que había descuidado durante la crisis. La Estrella no prometía el trabajo ni la relación siguientes; proponía un gesto pequeño, con las manos, que devolviera el agua a su lugar.',
      ],
    },
    iconography: {
      heading: 'Símbolos de la lámina de la Estrella',
      intro:
        'Después del fondo negro de la Torre, Smith pintó el cielo más claro del mazo y la única figura completamente desnuda que no está encadenada ni bailando: está trabajando, con el agua. Todo en la lámina es proporción y número: ocho puntas, siete estrellas, dos cántaros, cinco arroyos.',
      symbols: [
        {
          label: 'La estrella de ocho puntas',
          meaning:
            'Grande, amarilla, en el centro del cielo, rodeada por siete blancas. Es la misma estrella del Carro, ahora sin yelmo debajo.',
          x: 50,
          y: 17,
        },
        {
          label: 'El ibis en el árbol',
          meaning:
            'Arriba a la derecha, un pájaro posado en un árbol: el ave de Thot, el que escribe. Alguien observa y registra lo que pasa.',
          x: 85,
          y: 30,
        },
        {
          label: 'El cántaro sobre la tierra',
          meaning:
            'El de la mano izquierda se vierte en el suelo y el agua se abre en cinco hilos: lo que se da a la tierra se multiplica.',
          x: 88,
          y: 53,
        },
        {
          label: 'El cántaro sobre el estanque',
          meaning:
            'El de la derecha devuelve el agua al estanque y hace ondas: lo que se devuelve a la fuente también mueve algo.',
          x: 17,
          y: 63,
        },
        {
          label: 'La rodilla en tierra y el pie en el agua',
          meaning:
            'Apoya la rodilla izquierda sobre la hierba y el pie derecho sobre el agua, sin hundirse. La calma sostiene.',
          x: 48,
          y: 77,
        },
      ],
    },
    sectionOrder: [
      'meaningWellbeing',
      'iconography',
      'symbolism',
      'meaningLove',
      'meaningWork',
      'readingCase',
      'reversed',
      'advice',
      'yesNo',
    ],
  },

  'the-moon': {
    reversed: {
      heading: 'La Luna invertida',
      paragraphs: [
        'Invertida, la Luna tiene dos lecturas opuestas y hay que elegir con las cartas vecinas. La primera es la niebla que se levanta: lo que no se entendía empieza a entenderse, un engaño sale a la luz, un miedo nocturno se vuelve manejable de día. La segunda es la niebla que se niega: la persona que no quiere ver lo que intuye, que descarta el sueño, que llama "paranoia" a una percepción correcta.',
        'Pide, en los dos casos, no decidir nada importante hasta que aclare. La Luna invertida no da certezas; da un plazo. Lo que sí conviene hacer mientras tanto es registrar —escribir los sueños, anotar lo que se sintió en cada conversación— para tener con qué comparar cuando vuelva el sol de la carta siguiente.',
      ],
    },
    readingCase: {
      heading: 'La Luna en una consulta sobre una intuición',
      question:
        'Tengo la sensación de que mi pareja me oculta algo, sin ninguna prueba concreta. ¿Me estoy inventando un problema?',
      spread: 'Tirada de la relación (yo, la otra persona, el vínculo)',
      position: 'El vínculo',
      orientation: 'upright',
      reading: [
        'La consultante salió como Reina de Copas, la pareja como Siete de Espadas invertido y el vínculo como Luna derecha. La lectura no confirmó ni descartó el ocultamiento —una tirada no puede hacer eso—, pero sí describió el clima: una persona muy receptiva, otra que está por soltar algo que venía cargando a escondidas, y entre las dos un paisaje de noche donde el perro y el lobo aúllan por lo mismo.',
        'Lo que se trabajó fue la posición: la Luna no estaba en "la otra persona" sino en el vínculo. Se le señaló el sendero de la lámina, que pasa entre dos torres y se pierde en las montañas: hay un camino, pero no se lo ve completo. Se propuso recorrerlo de a un tramo, con una pregunta concreta en vez de una acusación general. Lo que se llevó no fue una respuesta sino la distinción entre intuir y saber, y una forma de pasar de una a la otra.',
      ],
    },
    iconography: {
      heading: 'La lámina de la Luna, elemento por elemento',
      intro:
        'Es la única lámina de los mayores sin ninguna figura humana, ni ángel, ni rey. Smith la pobló de animales y de arquitectura vacía, con un rostro dibujado en el astro para que alguien mire. El paisaje repite el de la Muerte —las dos torres, el agua— pero ahora se lo recorre de noche.',
      symbols: [
        {
          label: 'El rostro de perfil',
          meaning:
            'La luna tiene cara y mira hacia la izquierda, con los ojos cerrados. Alumbra sin ver; el que mira la carta ve más que ella.',
          x: 48,
          y: 18,
        },
        {
          label: 'Los quince yods',
          meaning:
            'Gotas amarillas caen del cielo, como en la Torre pero sin fuego. Es el rocío lunar: lo que baja de noche y alimenta sin que se note.',
          x: 45,
          y: 42,
        },
        {
          label: 'El sendero entre las torres',
          meaning:
            'Amarillo, serpentea desde el estanque hasta las montañas, pasando entre dos torres iguales. Existe, pero no se ve adónde llega.',
          x: 50,
          y: 55,
        },
        {
          label: 'El perro y el lobo',
          meaning:
            'Uno domesticado a la izquierda, uno salvaje a la derecha, los dos aullando a lo mismo. Lo civilizado y lo instintivo reaccionan igual ante la noche.',
          x: 70,
          y: 60,
        },
        {
          label: 'El cangrejo del estanque',
          meaning:
            'Abajo, saliendo del agua hacia el sendero. Es lo que sube desde lo profundo: la intuición que todavía no llegó a tierra firme.',
          x: 40,
          y: 86,
        },
      ],
    },
    sectionOrder: [
      'iconography',
      'symbolism',
      'reversed',
      'meaningLove',
      'readingCase',
      'meaningWork',
      'meaningWellbeing',
      'advice',
    ],
  },

  'the-sun': {
    reversed: {
      heading: 'El Sol invertido',
      paragraphs: [
        'Invertido, el Sol sigue brillando, pero la persona está de espaldas. Aparece como la alegría que se posterga ("cuando termine esto voy a estar bien"), como el éxito que no se disfruta porque ya se está mirando el siguiente, o como el exceso de exposición: el que necesita que lo vean tanto que se quema. En niños y proyectos señala algo que crece bien pero que alguien está apurando.',
        'Pide darse vuelta hacia la luz que ya está. El Sol invertido no dice que falte claridad —es la carta más clara del mazo— sino que no se la está usando. Suele resolverse con una cosa pequeña y concreta que dé placer sin fin ulterior: el niño de la lámina no va a ningún lado, solo monta.',
      ],
    },
    readingCase: {
      heading: 'El Sol en una consulta sobre mostrar un trabajo propio',
      question:
        'Hace años que pinto y nunca mostré nada. Me ofrecen exponer en un bar del barrio. ¿Me animo?',
      spread: 'Tirada de sí o no, de una sola carta',
      position: 'Única carta',
      orientation: 'upright',
      reading: [
        'La tirada de sí o no es la más simple y la que más cuidado pide, porque la persona llega buscando permiso. El Sol derecho es de las pocas cartas que lo dan sin rodeos, y se dijo así: sí. Lo que se agregó fue el cómo, que estaba en la lámina. El niño monta un caballo blanco sin montura ni riendas y lleva los brazos abiertos; no está controlando nada y no le hace falta. El consultante venía preguntando por la exposición como si fuera un examen.',
        'Se le señaló el muro de piedra detrás del niño, con los cuatro girasoles que miran hacia él y no hacia el sol: el jardín tiene límites y aun así sobra lugar. La exposición en el bar era ese muro, un marco chico, y eso no le restaba nada. Se fue con un sí y con la imagen del estandarte naranja: lo que se muestra se muestra entero, no a medias.',
      ],
    },
    iconography: {
      heading: 'Qué mirar en la lámina del Sol',
      intro:
        'Smith se apartó de los mazos anteriores, donde dos niños jugaban bajo el sol, y dibujó uno solo, desnudo, a caballo. El astro tiene rostro y ocupa un tercio de la lámina; abajo, un muro de piedra corta el paisaje. Es la carta más simple del mazo y la que más detalles pequeños esconde.',
      symbols: [
        {
          label: 'El estandarte naranja',
          meaning:
            'Enorme, ondeando a la derecha, sostenido por el niño con la mano izquierda. Es la única bandera del mazo sin emblema: no representa nada más que alegría.',
          x: 84,
          y: 35,
        },
        {
          label: 'La pluma roja',
          meaning:
            'En la corona de flores del niño, la misma pluma del Loco y de la Muerte. Lo que salió en el 0 y atravesó el XIII llega acá intacto.',
          x: 36,
          y: 43,
        },
        {
          label: 'Los girasoles del muro',
          meaning:
            'Cuatro, sobre el muro, vueltos hacia el niño y no hacia el sol. Lo que crece mira a quien juega, no a quien alumbra.',
          x: 16,
          y: 45,
        },
        {
          label: 'El caballo sin riendas',
          meaning:
            'Blanco, como el de la Muerte, pero acá montado a pelo por un niño con los brazos abiertos: la misma fuerza, sin nada que controlar.',
          x: 55,
          y: 76,
        },
        {
          label: 'El muro de piedra',
          meaning:
            'Gris, bajo, corta la lámina detrás del caballo. Es el límite del jardín: el Sol no es infinito, es suficiente.',
          x: 25,
          y: 66,
        },
      ],
    },
    sectionOrder: [
      'meaningLove',
      'meaningWork',
      'meaningWellbeing',
      'readingCase',
      'iconography',
      'symbolism',
      'reversed',
      'yesNo',
      'advice',
    ],
  },

  judgement: {
    reversed: {
      heading: 'El Juicio invertido',
      paragraphs: [
        'Invertido, la trompeta suena y nadie se levanta. Aparece como el llamado que se escucha y se posterga —la vocación que se sabe desde hace años, la conversación que "algún día" se va a tener—, como la autocrítica que juzga sin absolver, o como la resistencia a cerrar un ciclo porque cerrarlo implica evaluarlo. También señala la dificultad de perdonarse algo que los demás ya perdonaron.',
        'Pide responder al llamado aunque sea con un gesto mínimo. El Juicio invertido no discute si el llamado es real; en general lo es y la persona lo sabe. Lo que traba es la sensación de que levantarse del sarcófago exige estar listo, y en la lámina nadie lo está: todos están grises y desnudos, y se levantan igual.',
      ],
    },
    readingCase: {
      heading: 'El Juicio en una consulta sobre retomar una vocación',
      question:
        'Estudié música, la dejé por un trabajo estable y ahora, a los cuarenta y cinco, me llamaron para tocar en una banda. ¿Es tarde?',
      spread: 'Tirada de la herradura (siete cartas)',
      position: 'Futuro próximo',
      orientation: 'upright',
      reading: [
        'El Juicio derecho en el futuro próximo se leyó casi al pie de la letra: alguien toca una trompeta desde arriba y la gente que estaba enterrada se levanta con los brazos abiertos. El consultante había usado la palabra "llamaron" sin darse cuenta, y la carta la tomó en serio. Atrás, el Pasado trajo el Cuatro de Oros, la estabilidad como lo que se aferra, y el Presente, el Seis de Copas: la música como cosa de la infancia, guardada.',
        'La pregunta era "¿es tarde?" y la tirada la corrió de lugar: en la lámina del Juicio nadie tiene edad, todos están grises, y el que se levanta no es el que fue sino el que es ahora. Se le señaló que la figura central de la carta es un niño entre dos adultos: lo que resucita no es la carrera que dejó sino la razón por la que la había empezado. La conclusión fue que la banda era la trompeta, y que la trompeta no pregunta la edad.',
      ],
    },
    iconography: {
      heading: 'La lámina del Juicio en detalle',
      intro:
        'Es la lámina con más figuras humanas del mazo y Smith las dibujó todas iguales: grises, desnudas, con los brazos abiertos. El ángel ocupa la mitad superior, con las alas del mismo rojo que las de los Enamorados y la Templanza. La escena pasa sobre el agua, y el agua está quieta.',
      symbols: [
        {
          label: 'La cruz roja del estandarte',
          meaning:
            'Una cruz de brazos iguales sobre fondo blanco, colgando de la trompeta: la de San Jorge, la del equilibrio de los cuatro elementos.',
          x: 35,
          y: 45,
        },
        {
          label: 'La trompeta',
          meaning:
            'Dorada, apuntando hacia abajo y con siete líneas saliendo del pabellón: el sonido tiene siete notas, y baja hacia la gente.',
          x: 60,
          y: 40,
        },
        {
          label: 'Las montañas nevadas',
          meaning:
            'Al fondo, azules y blancas, cierran el horizonte. Es el mismo paisaje que el Ermitaño ve desde arriba: acá se lo ve desde el agua.',
          x: 15,
          y: 58,
        },
        {
          label: 'Las figuras grises',
          meaning:
            'Sin color de piel, sin ropa, sin edad. Lo que se levanta no es la persona anterior: es lo que queda cuando se saca todo lo demás.',
          x: 85,
          y: 70,
        },
        {
          label: 'Los sarcófagos sobre el agua',
          meaning:
            'Cajas abiertas que flotan en vez de hundirse. Lo que se daba por enterrado estaba a flote, esperando el sonido.',
          x: 50,
          y: 90,
        },
      ],
    },
    sectionOrder: [
      'readingCase',
      'reversed',
      'meaningWork',
      'meaningLove',
      'iconography',
      'symbolism',
      'meaningWellbeing',
      'advice',
    ],
  },

  'the-world': {
    reversed: {
      heading: 'El Mundo invertido',
      paragraphs: [
        'Invertido, la guirnalda no termina de cerrarse. Aparece como el ciclo que está casi completo y se estira —el título que falta rendir una materia, la mudanza con tres cajas sin abrir desde hace un año, la relación que terminó y todavía tiene cosas en la casa del otro—, o como el éxito alcanzado que no se siente porque falta el reconocimiento de alguien. También describe a quien completó algo grande y no sabe qué viene después.',
        'Pide hacer el último gesto, el que cierra. El Mundo invertido rara vez habla de fracaso; habla de un final que se está dejando abierto por miedo al vacío que sigue. La lámina responde a ese miedo: en las esquinas están las mismas criaturas que en la Rueda, y la Rueda vuelve a girar después del XXI.',
      ],
    },
    readingCase: {
      heading: 'El Mundo en una consulta sobre qué hacer después de terminar',
      question:
        'Terminé el doctorado después de siete años y en vez de alegría siento un vacío enorme. ¿Qué me está pasando?',
      spread: 'Cruz Celta',
      position: 'Fundamento',
      orientation: 'upright',
      reading: [
        'El Mundo derecho en el Fundamento —lo que sostiene la situación— fue lo primero que se leyó, porque explicaba el vacío mejor que cualquier otra carta: la figura de la lámina baila dentro de una corona de laurel cerrada, y el consultante estaba parado en el borde de un ciclo terminado, sin ciclo nuevo todavía. La carta central era el Cuatro de Copas, la mano que ofrece una copa que no se ve, y lo que cruzaba, el Diez de Bastos: los siete años de carga que aún no se soltaron.',
        'Se le señaló que la figura del Mundo lleva dos varas, una en cada mano, como el Mago llevaba una: al terminar, lo que se tiene es el doble de lo que se tenía al empezar, y todavía no se sabe para qué. La Corona trajo al Loco y se leyó como lo que el consultante pensaba sin decir: que iba a tener que volver a empezar de cero. La tirada corrigió eso: el Loco viene después del Mundo con las dos varas en la bolsa, no con la bolsa vacía.',
      ],
    },
    iconography: {
      heading: 'Símbolos del Mundo, lámina XXI',
      intro:
        'Smith cerró el mazo con una lámina que cita a otras dos: las cuatro criaturas de la Rueda y el gesto del Mago, duplicado. La figura central baila sobre el vacío, dentro de un óvalo de laurel, y no toca ningún suelo: es la única carta de los mayores sin tierra, agua ni montaña. Todo lo que hay es la corona y lo que la ata.',
      symbols: [
        {
          label: 'Las cuatro criaturas sin libros',
          meaning:
            'Ángel, águila, león y toro en las esquinas, como en la Rueda, pero acá ya no leen: solo miran. Lo que se estudiaba se aprendió.',
          x: 10,
          y: 8,
        },
        {
          label: 'La cinta roja superior',
          meaning:
            'La guirnalda está atada arriba con una cinta en forma de infinito: es la lemniscata del Mago, convertida en nudo que cierra.',
          x: 50,
          y: 8,
        },
        {
          label: 'Las dos varas',
          meaning:
            'Una en cada mano, blancas, iguales a la del Mago. Lo que en el I era un canal, en el XXI son dos: se recibe y se da a la vez.',
          x: 20,
          y: 52,
        },
        {
          label: 'El pañuelo violeta',
          meaning:
            'Una tela larga envuelve a la figura en espiral y flota hacia atrás. Es lo único que la viste: el color del espíritu, en movimiento.',
          x: 60,
          y: 62,
        },
        {
          label: 'La corona de laurel',
          meaning:
            'Un óvalo cerrado de hojas verdes, atado arriba y abajo. Es el ciclo completo y también el huevo: lo que termina y lo que está por nacer.',
          x: 15,
          y: 40,
        },
      ],
    },
    sectionOrder: [
      'meaningWork',
      'meaningLove',
      'meaningWellbeing',
      'symbolism',
      'iconography',
      'reversed',
      'readingCase',
      'advice',
      'yesNo',
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isMajorArcanaSlug(slug: string): slug is MajorArcanaSlug {
  return (MAJOR_ARCANA_SLUGS as readonly string[]).includes(slug);
}

/**
 * Contenido extra de una carta, o `undefined` si no es un Arcano Mayor.
 *
 * Es la única puerta de entrada: la ruta la llama en el servidor y pasa el
 * resultado por props, así los 56 menores siguen con el orden base sin
 * tocar una línea del render.
 */
export function getMajorArcanaExtras(slug: string): MajorArcanaExtras | undefined {
  return isMajorArcanaSlug(slug) ? MAJOR_ARCANA_EXTRAS[slug] : undefined;
}

/** Palabras propias que aportan las tres secciones nuevas de una carta. */
export function getMajorArcanaExtrasWordCount(slug: MajorArcanaSlug): number {
  const extras = MAJOR_ARCANA_EXTRAS[slug];

  return countWords([
    ...extras.reversed.paragraphs,
    extras.readingCase.question,
    ...extras.readingCase.reading,
    extras.iconography.intro,
    ...extras.iconography.symbols.map((symbol) => `${symbol.label} ${symbol.meaning}`),
  ]);
}
