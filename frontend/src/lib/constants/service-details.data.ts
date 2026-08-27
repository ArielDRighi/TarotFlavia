/**
 * Contenido editorial de las fichas de servicio holístico (T-SEO-012).
 *
 * ## Por qué existe
 *
 * La sección `/servicios` promediaba **210 palabras propias** en sus 4 URLs y
 * `/servicios/limpiezas-energeticas` servía 107, bajo el umbral del auditor. Son
 * las páginas **comerciales** del sitio: un revisor de AdSense que entra por ahí
 * ve una ficha de producto delgada. Lo que faltaba no eran caracteres sino
 * secciones — el mismo diagnóstico que en las fichas de tarot (T-SEO-008).
 *
 * ## Por qué en el repo y no en la entidad
 *
 * El alcance de la tarea pedía decidirlo explícitamente. La entidad
 * `HolisticService` ya guarda `longDescription` y se edita desde el panel de
 * admin; agregar ahí las secciones nuevas —al estilo de T-SEO-008— habría sido
 * lo simétrico. Se eligió el repo por tres motivos:
 *
 * 1. **Es contenido YMYL que tiene que pasar por revisión de código.** La ficha
 *    de limpiezas energéticas es la más expuesta a prometer un efecto
 *    terapéutico. Acá la cubre `service-details.data.test.ts`, el guardarraíl de
 *    `no-salud-user-facing.test.ts` y el diff de un PR; en una columna de la base
 *    editable desde admin no la cubre nada.
 * 2. **Lo que el panel edita es lo operativo** —precio, duración, WhatsApp, link
 *    de pago, orden, activo— más las dos descripciones que ya existen. Ninguna de
 *    esas es una redacción de 400 palabras con estructura fija.
 * 3. **No depende de que la API responda.** Mismo criterio y mismo lugar que
 *    `listing-intros.data.ts` (T-SEO-003) y `service-intros.data.ts`: es el piso
 *    garantizado de texto propio de la ruta.
 *
 * ⚠️ **La contracara, anotada:** un servicio nuevo creado desde el admin no
 * tiene entrada acá y su ficha nace con las palabras de su `longDescription` y
 * nada más. El test de arriba ata la cobertura a los tres slugs sembrados; si
 * mañana se agrega un cuarto servicio, hay que escribirle su bloque y sumarlo a
 * `SERVICE_DETAIL_SLUGS`. `npm run check:indexable` lo detecta en producción.
 *
 * ## ⚠️ Al editar
 *
 * - **Voseo.** La sección `/servicios` ya está en voseo: las descripciones
 *   sembradas ("dejás de cargar"), el CTA ("Elegí fecha y horario") y los estados
 *   de error ("el servicio que buscás"). El sitio tiene voseo y tuteo mezclados
 *   —deuda anotada en el backlog—, pero dentro de una misma URL la voz no cambia.
 * - **Nada de vocabulario clínico fuera del `disclaimer`.** El `disclaimer` es el
 *   único lugar donde nombrar la medicina está permitido, porque ahí la mención
 *   es negativa y es lo que protege.
 * - **No bajar `MIN_SERVICE_EDITORIAL_WORDS`** para hacer pasar un test: el piso
 *   es el criterio de aceptación de T-SEO-012.
 */

import { countWords } from '@/lib/utils/text';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Un bloque temático de la ficha (se renderiza como `h3` + párrafo). */
export interface ServiceDetailSection {
  /** Encabezado del bloque. */
  heading: string;
  /** Cuerpo del bloque. */
  body: string;
}

/** Una pregunta frecuente de la ficha. */
export interface ServiceDetailFaqItem {
  /** Pregunta, tal como la haría una persona (termina en signo de cierre). */
  question: string;
  /** Respuesta. */
  answer: string;
}

/** Contenido editorial de una ficha de servicio. */
export interface ServiceDetailContent {
  /** Título del bloque (`h2`; el `h1` es el nombre del servicio). */
  title: string;
  /** Párrafo de entrada. */
  lead: string;
  /**
   * Bloques temáticos. Los cinco que pide T-SEO-012, en orden: en qué consiste,
   * cómo se prepara la persona, qué pasa durante, qué pasa después, y para quién
   * es y para quién no.
   */
  sections: ServiceDetailSection[];
  /** Preguntas frecuentes, al menos tres. */
  faq: ServiceDetailFaqItem[];
  /**
   * Frontera YMYL de la práctica. Es el único campo donde se puede nombrar la
   * medicina o la psicología, y tiene que hacerlo en negativo: qué NO reemplaza.
   */
  disclaimer: string;
}

/** Slugs del catálogo sembrado que tienen ficha editorial. */
export const SERVICE_DETAIL_SLUGS = [
  'arbol-genealogico',
  'pendulo-hebreo',
  'limpiezas-energeticas',
] as const;

export type ServiceDetailSlug = (typeof SERVICE_DETAIL_SLUGS)[number];

// ─── Guardarraíl ──────────────────────────────────────────────────────────────

/**
 * Mínimo de palabras propias que aporta el bloque editorial de una ficha.
 *
 * El criterio de aceptación de T-SEO-012 son **400 palabras propias por URL**.
 * El piso se pide sobre el bloque solo —y no sobre la página— porque el resto de
 * la ficha sale de la base: `limpiezas-energeticas` tiene una `longDescription`
 * de 26 palabras, así que apoyarse en ella sería apoyarse en el dato más flaco
 * del catálogo. Con 400 acá, la URL supera el umbral aunque la descripción
 * sembrada se acorte desde el panel de admin.
 */
export const MIN_SERVICE_EDITORIAL_WORDS = 400;

/**
 * Los párrafos de prosa de una ficha: lead, cuerpo de las secciones y respuestas
 * de las preguntas frecuentes.
 *
 * Deja afuera los encabezados y las preguntas —que sí llegan al DOM y sí cuentan
 * para el crawler— a propósito: el guardarraíl mide de menos, nunca de más.
 * También deja afuera el `disclaimer`, que se mide aparte porque es el único
 * texto al que se le permite vocabulario clínico.
 */
export function getServiceEditorialParagraphs(content: ServiceDetailContent): string[] {
  return [
    content.lead,
    ...content.sections.map((section) => section.body),
    ...content.faq.map((item) => item.answer),
  ];
}

/** Palabras propias que aporta el bloque editorial de una ficha. */
export function getServiceEditorialWordCount(content: ServiceDetailContent): number {
  return countWords([...getServiceEditorialParagraphs(content), content.disclaimer]);
}

/**
 * Busca el bloque editorial de un slug cualquiera.
 *
 * El slug llega de la URL, así que no se puede tipar como `ServiceDetailSlug`:
 * un servicio creado desde el panel de admin es una ruta válida sin entrada acá.
 * Devolver `undefined` es lo que deja que la ficha degrade a lo que trae la API
 * en vez de romperse, y evita que la ruta tenga que hacer el casteo.
 */
export function getServiceEditorialContent(slug: string): ServiceDetailContent | undefined {
  return Object.prototype.hasOwnProperty.call(SERVICE_DETAILS, slug)
    ? SERVICE_DETAILS[slug as ServiceDetailSlug]
    : undefined;
}

// ─── Contenido ────────────────────────────────────────────────────────────────

export const SERVICE_DETAILS: Record<ServiceDetailSlug, ServiceDetailContent> = {
  'arbol-genealogico': {
    title: 'Cómo es una sesión de árbol genealógico',
    lead: 'La sesión de árbol genealógico es un encuentro por WhatsApp en el que reconstruimos juntos el mapa de tu familia y miramos qué historias se repiten en él. No es una investigación de apellidos ni una búsqueda de documentos: lo que se trabaja son las lealtades invisibles, los silencios y los lugares vacíos que tu sistema familiar te dejó para ocupar.',
    sections: [
      {
        heading: 'Qué armamos durante el encuentro',
        body: 'Empezamos por el genograma: tres generaciones dibujadas —abuelos, padres, hermanos— con las fechas, los oficios, las mudanzas y las ausencias que puedas recordar. Sobre ese dibujo aparecen los patrones: separaciones que caen siempre a la misma edad, hijos que llevan el nombre de alguien que murió joven, oficios que nadie eligió del todo. El genograma no interpreta nada por sí solo; es el mapa sobre el que después leemos.',
      },
      {
        heading: 'Cómo te preparás antes',
        body: 'Conviene llegar con datos, no con conclusiones. Anotá los nombres completos, las fechas de nacimiento y de fallecimiento que sepas, y los pueblos o países de donde vino cada rama. Preguntale a la persona mayor que tengas más a mano: media hora de charla suele rendir más que un árbol armado en internet. Si hay temas de los que en tu casa no se habla, anotalos igual, porque el hueco también es información.',
      },
      {
        heading: 'Qué pasa durante la hora',
        body: 'La primera parte es relato tuyo y preguntas mías; la segunda, lectura del mapa. Vamos nombrando lo que aparece —una emigración forzada, una herencia repartida mal, un duelo que nunca se hizo— y buscando dónde ese hilo toca tu vida hoy. No hay ejercicios corporales ni trance: es conversación dirigida, con el genograma a la vista, y podés frenar en cualquier momento.',
      },
      {
        heading: 'Qué te llevás después',
        body: 'Antes de cerrar repasamos los tres o cuatro patrones que más peso tuvieron, para que te los lleves anotados junto con el genograma tal como quedó dibujado. Se propone además una práctica simbólica sencilla, para quien quiera hacerla: una carta que no se envía, un objeto que vuelve a su lugar, una frase dicha en voz alta. La integración lleva semanas, no minutos, y conviene saberlo antes de empezar.',
      },
      {
        heading: 'Para quién es y para quién no',
        body: 'Le sirve a quien nota que algo se repite y no encuentra el origen, a quien está por formar familia y quiere entender de dónde viene, y a quien acaba de perder a alguien y quedó con preguntas abiertas. No es para quien busca un veredicto sobre un familiar vivo, ni para quien atraviesa una crisis que pide acompañamiento profesional sostenido: ahí la sesión puede sumar, pero nunca ocupa ese lugar.',
      },
    ],
    faq: [
      {
        question: '¿Necesito conocer a toda mi familia?',
        answer:
          'No. Se trabaja con lo que tengas: muchos árboles arrancan con un abuelo sin apellido y una fecha aproximada. Los faltantes se marcan como faltantes y forman parte de la lectura, porque un dato que nadie supo transmitir dice tanto como uno conocido.',
      },
      {
        question: '¿Se puede hacer si soy adoptado?',
        answer:
          'Sí, y es uno de los casos donde el trabajo rinde más. Se miran las dos líneas: la biológica, con lo poco o mucho que se sepa, y la adoptiva, que también transmite historia, oficio y lugar dentro del sistema.',
      },
      {
        question: '¿Cuánto dura y cómo se hace?',
        answer:
          'Por WhatsApp, en el turno que elijas en el calendario de la ficha y con la duración que figura arriba. Si el relato se extiende, se acuerda una segunda sesión en lugar de apurar el cierre: cortar a mitad de un hilo deja peor que no haberlo abierto.',
      },
      {
        question: '¿Tengo que contarle a mi familia que hice la sesión?',
        answer:
          'No hace falta, y no se recomienda como primer paso. El trabajo es tuyo; qué compartís, con quién y cuándo es una decisión posterior y sin apuro.',
      },
    ],
    disclaimer:
      'La sesión es un espacio de reflexión sobre la historia familiar. No es una terapia, no reemplaza el acompañamiento psicológico ni la consulta con un profesional de la medicina, y no emite juicio clínico sobre vos ni sobre nadie de tu familia.',
  },

  'pendulo-hebreo': {
    title: 'Cómo es una sesión de Péndulo Hebreo',
    lead: 'El Péndulo Hebreo es un método de armonización energética que usa las letras del alfabeto hebreo como referencia. La sesión se coordina por WhatsApp, en el calendario de esta ficha, y funciona igual a distancia: el trabajo se apoya en la palabra y en el símbolo, no en el contacto físico.',
    sections: [
      {
        heading: 'En qué consiste el método',
        body: 'Cada letra hebrea funciona como una clave: un nombre, un sonido y una intención asociada. El péndulo recorre una plantilla con esas letras y marca dónde la energía se percibe estancada o revuelta. Sobre lo que aparece se trabaja después con la letra correspondiente, repitiendo su nombre y sosteniendo la intención el tiempo que el caso pida. No hay dos recorridos iguales, porque la plantilla se lee entera cada vez.',
      },
      {
        heading: 'Cómo te preparás antes',
        body: 'Llegá con un tema concreto escrito en una línea: un vínculo, una mudanza, una etapa que no termina de cerrar. Buscá un lugar donde nadie te interrumpa mientras dure el encuentro, con el teléfono en silencio y agua a mano. No hace falta ayuno, ropa especial ni saber una palabra de hebreo: las letras las nombro yo y te explico qué significa cada una cuando aparece.',
      },
      {
        heading: 'Qué pasa durante la sesión',
        body: 'Los primeros minutos son de charla: qué te trae, qué venís notando, desde cuándo. Después viene el recorrido con el péndulo y la lectura de lo que va surgiendo, que te cuento en voz alta a medida que sucede, sin guardarme nada para el final. La parte de cierre es la armonización propiamente dicha, en silencio o con las letras pronunciadas, según lo que haya aparecido.',
      },
      {
        heading: 'Qué pasa los días siguientes',
        body: 'Es habitual sentir cansancio o sueño las primeras horas y bastante claridad al día siguiente. También es habitual no sentir nada particular, y eso no significa que la sesión no haya servido. Antes de cerrar te digo qué letras se trabajaron, para que las anotes, y repasamos una pauta breve: descansar, tomar agua y prestarle atención a lo que aparezca en los sueños durante la primera semana.',
      },
      {
        heading: 'Para quién es y para quién no',
        body: 'Le sirve a quien arrastra una sensación de estancamiento difusa, a quien atraviesa un cambio grande y quiere ordenarse por dentro, y a quien ya trabaja con otras prácticas simbólicas y quiere sumar una herramienta. No es para quien espera que un solo encuentro resuelva por sí mismo un problema concreto en un plazo fijo, ni para quien necesita atención profesional sostenida: ahí la sesión acompaña, no sustituye.',
      },
    ],
    faq: [
      {
        question: '¿Se puede hacer a distancia?',
        answer:
          'Sí. El método trabaja con el nombre y la intención, así que estar en la misma habitación no cambia el resultado. Toda la coordinación pasa por WhatsApp y lo único que hace falta de tu parte es el tema que traés y un rato sin interrupciones.',
      },
      {
        question: '¿Tengo que creer para que funcione?',
        answer:
          'No hace falta creer, pero sí estar dispuesto a mirar lo que aparece. La curiosidad honesta alcanza de sobra; la actitud de examen desde afuera, en general, no deja lugar para el trabajo.',
      },
      {
        question: '¿Cuántas sesiones se necesitan?',
        answer:
          'Cuando el tema es acotado, un solo encuentro suele alcanzar. Cuando es de arrastre, se propone una segunda sesión a las tres o cuatro semanas, nunca antes: el intervalo forma parte del método y acelerar no mejora nada.',
      },
      {
        question: '¿Necesito un péndulo o saber hebreo?',
        answer:
          'Ninguna de las dos cosas. El péndulo lo uso yo y las letras se nombran durante la sesión. Si después querés incorporar la práctica por tu cuenta, te indico por dónde empezar y qué leer.',
      },
    ],
    disclaimer:
      'El Péndulo Hebreo es una práctica simbólica de armonización energética. No es un tratamiento médico ni psicológico, no reemplaza la consulta con un profesional de la medicina y no interrumpe ninguna indicación que estés siguiendo.',
  },

  'limpiezas-energeticas': {
    title: 'Cómo es una limpieza energética',
    lead: 'Una limpieza energética es una intervención sobre el clima de un lugar o de una etapa: una casa que quedó pesada después de una mudanza o una separación, un local que no arranca, una persona que siente que carga algo que no es suyo. La sesión se coordina por WhatsApp, en el calendario de esta ficha.',
    sections: [
      {
        heading: 'Qué se limpia y qué no',
        body: 'Se trabaja sobre espacios —casas, oficinas, locales, terrenos— y sobre personas que atraviesan un momento denso. Lo que la limpieza mueve es el clima: la sensación de aire cargado, las discusiones que se repiten siempre en la misma habitación, el negocio que se llena de gente que mira y no compra. Lo que la limpieza no mueve son los hechos. Una cuenta impaga sigue impaga y una decisión difícil sigue siendo tuya.',
      },
      {
        heading: 'Cómo preparás el lugar',
        body: 'Antes del turno conviene ordenar y ventilar: sacar lo que está roto, lo que no se usa hace años y lo que quedó de alguien que ya no está. Abrí las ventanas veinte minutos aunque haga frío. Si es un espacio compartido, avisale a quienes viven o trabajan ahí; hacerlo a escondidas de la casa es empezar torcido. Para una limpieza personal alcanza con estar tranquilo y sin apuro.',
      },
      {
        heading: 'Qué pasa durante la sesión',
        body: 'Empezamos recorriendo el lugar ambiente por ambiente —vos vas mostrando y describiendo, y yo voy preguntando— o repasando la etapa que estés atravesando si el trabajo es personal. Se usan sahumado, sal, agua y palabra, y te voy diciendo qué se hace en cada rincón y por qué. Nada de lo que se enciende queda prendido al terminar: todo se apaga y se descarta en el cierre.',
      },
      {
        heading: 'Los días siguientes',
        body: 'Es frecuente que durante las primeras cuarenta y ocho horas el lugar se sienta raro antes de sentirse liviano, y que aparezcan conversaciones pendientes. Antes de cerrar repasamos una pauta breve: ventilar todas las mañanas durante una semana y dejar un vaso con agua y sal gruesa en el ambiente más cargado, cambiándolo a los siete días. Si el espacio se vuelve a cargar en un mes, lo que conviene mirar es qué lo carga.',
      },
      {
        heading: 'Para quién es y para quién no',
        body: 'Le sirve a quien se muda o entrega una propiedad, a quien abre o reflota un emprendimiento, y a quien viene de una pérdida y necesita que la casa vuelva a ser suya. No es para quien busca que la limpieza decida en su lugar, ni para quien espera que un espacio armonizado ordene un conflicto que nadie está hablando. Tampoco es un recurso para atravesar un momento que pide acompañamiento profesional.',
      },
    ],
    faq: [
      {
        question: '¿Cómo se hace una limpieza a distancia?',
        answer:
          'Se trabaja sobre el lugar a partir de lo que vos mostrás y contás: el recorrido lo hacés vos, ambiente por ambiente, y la intervención se sostiene desde acá. Por eso importa que quien vive o trabaja ahí esté presente durante el encuentro.',
      },
      {
        question: '¿Tengo que estar en la casa?',
        answer:
          'Sí, vos o alguien que viva ahí. Una limpieza en un lugar vacío alcanza para entregar una propiedad, pero cuando hay gente habitándolo, la conversación con quienes lo habitan es la mitad del trabajo.',
      },
      {
        question: '¿Cada cuánto conviene repetirla?',
        answer:
          'Una vez al año alcanza en la mayoría de las casas. Se adelanta cuando hubo una mudanza, una separación, una convivencia que terminó mal o una obra: son los momentos en que un espacio junta más de lo habitual.',
      },
      {
        question: '¿Qué pasa si no siento nada?',
        answer:
          'Pasa, y no invalida el trabajo. La referencia útil no es lo que sentís ese día sino cómo se usa el lugar dos semanas después: si volvés a sentarte en un ambiente que venías evitando, algo se movió.',
      },
    ],
    disclaimer:
      'La limpieza energética es una práctica simbólica de armonización de espacios y personas. No cura nada, no es un tratamiento médico ni psicológico y no reemplaza la consulta con un profesional de la medicina.',
  },
};
