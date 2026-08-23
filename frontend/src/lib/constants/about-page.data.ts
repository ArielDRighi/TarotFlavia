/**
 * Contenido de `/sobre-nosotros`: las señales de autoría del sitio (T-SEO-011).
 *
 * ## Por qué existe esta página
 *
 * No había ninguna URL que dijera quién está detrás de Auguria: el footer
 * enlazaba términos, privacidad y contacto, y nada más. Para un sitio que da
 * consejo personal —tarot, astrología, rituales— eso es una señal negativa
 * directa en las guías de calidad de Google (E-E-A-T: *Experience, Expertise,
 * Authoritativeness, Trustworthiness*), y un motivo más para que un revisor
 * humano de AdSense lo marque como de poco valor.
 *
 * ## Por qué el texto vive acá y no en el JSX
 *
 * Mismo criterio que `listing-intros.data.ts` (T-SEO-003) y
 * `chinese-zodiac-profiles.data.ts` (T-SEO-002): con el contenido en datos
 * tipados, el guardarraíl de `about-page.data.test.ts` puede medir las palabras
 * y verificar la unicidad sin renderizar nada, y la página se limita a
 * maquetarlo.
 *
 * ## ⚠️ Al editar
 *
 * - **No se nombra a ninguna persona.** El sitio se presenta como equipo; el
 *   test lo verifica. Cualquier dato biográfico que se agregue tiene que ser
 *   verdadero: es una página de confianza, y una credencial inventada la vuelve
 *   contraproducente.
 * - **No usar la palabra "salud"** en texto visible: es territorio YMYL. Va
 *   "energía y bienestar" (regla transversal de terminología, T-SEO-013).
 * - **No bajar de `MIN_ABOUT_PAGE_WORDS`** ni repetir párrafos de otras rutas:
 *   dos URLs con el mismo texto son contenido duplicado.
 */

import { ROUTES } from './routes';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Una sección temática de la página (se renderiza como `h2` + párrafos). */
export interface AboutSection {
  /** Encabezado de la sección. */
  heading: string;
  /** Párrafos del cuerpo, en orden. */
  paragraphs: string[];
}

/** Un principio editorial: el compromiso destacado y su explicación. */
export interface AboutPrinciple {
  /** Nombre del principio (se muestra en negrita). */
  term: string;
  /** Qué significa en la práctica. */
  description: string;
}

/** Enlace interno al pie de la página. */
export interface AboutLink {
  /** Texto del enlace. */
  label: string;
  /** Ruta interna (siempre empieza con `/`). */
  href: string;
}

/** Contenido completo de `/sobre-nosotros`. */
export interface AboutPageData {
  /** Título de la página (se renderiza como el `h1`). */
  title: string;
  /** Bajada que abre la página. */
  lead: string;
  /** Secciones temáticas, en orden de lectura. */
  sections: AboutSection[];
  /** Compromisos editoriales, en una lista aparte. */
  principles: AboutPrinciple[];
  /** Párrafo de cierre. */
  closing: string;
  /** Enlaces internos, para que el crawler siga recorriendo. */
  links: AboutLink[];
}

// ─── Guardarraíl ──────────────────────────────────────────────────────────────

/**
 * Mínimo de palabras propias de la página.
 *
 * El criterio de aceptación de T-SEO-011 pide 600. Se declara ese piso y el
 * contenido se escribe con margen por encima, para que un ajuste editorial de
 * un párrafo no ponga la página al borde del umbral.
 */
export const MIN_ABOUT_PAGE_WORDS = 600;

/**
 * Palabras propias que aporta la página.
 *
 * Cuenta el cuerpo (bajada, párrafos, descripciones y cierre) y deja fuera los
 * encabezados: se renderizan, pero medirlos infla el número sin aportar texto
 * de lectura. Es la misma cuenta conservadora que hace `getListingIntroWordCount`.
 */
export function getAboutPageWordCount(): number {
  return [
    ABOUT_PAGE.lead,
    ...ABOUT_PAGE.sections.flatMap((section) => section.paragraphs),
    ...ABOUT_PAGE.principles.map((principle) => principle.description),
    ABOUT_PAGE.closing,
  ]
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

// ─── Contenido ────────────────────────────────────────────────────────────────

export const ABOUT_PAGE: AboutPageData = {
  title: 'Sobre Nosotros',

  lead: 'Auguria es el proyecto de un equipo pequeño que lleva más de una década practicando tarot, astrología, numerología y trabajo con péndulo, y que decidió llevar esa práctica a un sitio donde cualquiera pudiera consultarla sin turno, sin costo de entrada y sin tener que creer nada de antemano. Esta página cuenta quiénes somos, con qué criterio escribimos y qué podés esperar —y qué no— de lo que vas a encontrar acá.',

  sections: [
    {
      heading: 'Quiénes somos',
      paragraphs: [
        'No somos una empresa de tecnología que descubrió que el esoterismo convoca tráfico. Somos un grupo de personas que llegó al tarot y a la astrología por interés propio, mucho antes de que existiera este sitio, y que fue sumando años de lectura, de estudio y de consulta con otros practicantes. Entre quienes escriben el contenido y quienes acompañan las sesiones hay más de una década de práctica acumulada.',
        'Las disciplinas que cubrimos son las que efectivamente trabajamos: lectura de tarot con las barajas Rider-Waite y Marsella, astrología natal, numerología pitagórica, radiestesia con péndulo, horóscopo chino y práctica ritual. Cuando un tema queda fuera de ese círculo, no lo improvisamos: preferimos no publicarlo antes que llenar una página con generalidades.',
        'Elegimos presentarnos como equipo y no como una figura única. El contenido de Auguria se escribe, se revisa y se corrige entre varias personas, y atribuirlo a un solo nombre daría una idea equivocada de cómo se produce. Si necesitás hablar con alguien en concreto, el formulario de contacto llega directo a nosotros y las respuestas las firma quien las escribe.',
      ],
    },
    {
      heading: 'Cómo entendemos el tarot y la astrología',
      paragraphs: [
        'Trabajamos el tarot como una herramienta de reflexión, no como un mecanismo de predicción. Una tirada no informa un futuro fijo: ordena una situación, la mira desde ángulos que a uno solo no se le habían ocurrido y devuelve preguntas más precisas que las que uno traía. Ese es el valor real de la práctica, y es también su límite honesto.',
        'Con la astrología pasa algo parecido. Una carta natal describe tendencias, tensiones y recursos; no dicta una biografía. Cuando leemos una casa o un aspecto, hablamos de disposiciones y de contextos, nunca de hechos garantizados. Por eso vas a notar que en todo el sitio evitamos el lenguaje de la certeza absoluta: no es prudencia legal, es lo que creemos que la práctica puede sostener.',
        'La misma vara se aplica a los rituales y al péndulo. Un ritual organiza una intención y le da un tiempo y un gesto; un péndulo ayuda a escuchar una respuesta que ya estaba dando vueltas. Nada de eso funciona como un botón que produce un resultado, y presentarlo así sería faltarle el respeto a quien consulta.',
      ],
    },
    {
      heading: 'Cómo se produce el contenido de la enciclopedia',
      paragraphs: [
        'La enciclopedia es la parte más extensa del sitio: las 78 cartas del tarot, los doce signos, los planetas, las doce casas astrológicas, los animales del zodíaco chino y las guías prácticas de cada disciplina. Todo ese material está escrito por nosotros, específicamente para Auguria. No hay texto copiado de otros sitios ni traducciones automáticas de manuales en inglés.',
        'Cada ficha parte de las fuentes clásicas de su disciplina —los significados tradicionales de la baraja, la simbología astrológica establecida, las tablas de la tradición china— y se contrasta con lo que la práctica de consulta muestra realmente. Cuando una fuente discrepa de otra, lo decimos en el texto en lugar de elegir una en silencio: la tradición no es un cuerpo homogéneo y fingir que lo es sería inexacto.',
        'El contenido se revisa periódicamente. Corregimos lo que quedó ambiguo, ampliamos lo que se leía corto y ajustamos lo que la experiencia de consulta mostró que se entendía mal. Si encontrás un error o algo que no cierra, escribinos: las correcciones que llegan por el formulario se leen todas y las que corresponden se aplican.',
      ],
    },
    {
      heading: 'Por qué existe Auguria',
      paragraphs: [
        'La consulta esotérica suele ser cara, opaca y difícil de auditar: no se sabe quién atiende, con qué formación, ni qué se va a recibir hasta que ya se pagó. Auguria nació de la incomodidad con eso. La idea fue armar un lugar donde el material de referencia estuviera abierto y completo, donde las herramientas básicas se pudieran usar sin pagar, y donde el precio y el alcance de cada servicio estuvieran a la vista antes de decidir nada.',
        'Por eso la enciclopedia entera es de acceso libre, el horóscopo diario, la carta del día, la numerología y el péndulo funcionan sin suscripción, y las sesiones con guías tienen su precio publicado en la ficha. El plan premium existe para sostener el proyecto y para quien quiera lecturas más extensas, pero el sitio tiene que servir aunque nunca pagues nada.',
      ],
    },
    {
      heading: 'Lo que no hacemos',
      paragraphs: [
        'Auguria ofrece orientación personal y entretenimiento, y eso no sustituye el asesoramiento de un profesional. No damos diagnósticos ni indicaciones sobre enfermedades, tratamientos o medicación; no damos consejo legal ni financiero. Si una consulta toca uno de esos terrenos, el sitio lo señala y sugiere acudir a quien corresponda: es una decisión editorial deliberada, no una limitación técnica.',
        'Tampoco prometemos resultados. No vas a encontrar acá lecturas que garanticen que alguien vuelva, que un negocio prospere o que una situación se resuelva en un plazo determinado. Ese tipo de promesa es la marca registrada de lo que Auguria vino a no ser, y ninguna función del sitio la habilita.',
        'Y no trabajamos con miedo. No hay lecturas que anuncien desgracias para después ofrecer el remedio, ni servicios que se vendan sobre una amenaza. Las cartas difíciles del tarot se explican por lo que aportan —un límite, un duelo, un cambio que ya está pasando— y no como un presagio del que haya que salvarse pagando algo.',
      ],
    },
  ],

  principles: [
    {
      term: 'Texto propio',
      description:
        'Todo lo que se publica lo escribimos nosotros para este sitio. Nada de contenido reciclado, generado en masa ni traducido automáticamente de otra fuente.',
    },
    {
      term: 'Tradición citada, no inventada',
      description:
        'Los significados, las correspondencias y las tablas provienen de las fuentes clásicas de cada disciplina. Cuando hay más de una versión, se aclara en lugar de elegir una en silencio.',
    },
    {
      term: 'Sin promesas de resultados',
      description:
        'Ninguna lectura garantiza un desenlace, un plazo ni la conducta de otra persona. Lo que ofrecemos es una lectura de la situación, y así se presenta en todo el sitio.',
    },
    {
      term: 'Límites explícitos',
      description:
        'Los temas médicos, legales y financieros quedan fuera y el sitio lo dice donde corresponde, en lugar de responderlos igual con un lenguaje ambiguo.',
    },
    {
      term: 'Correcciones a la vista',
      description:
        'Cuando un contenido tiene un error, se corrige y se actualiza la ficha. Los avisos que llegan por el formulario de contacto se leen todos.',
    },
  ],

  closing:
    'Si algo de lo que leíste acá no coincide con lo que encontraste usando el sitio, queremos saberlo. Esta página no es una declaración de intenciones para la galería: es el criterio con el que revisamos lo que publicamos, y la vara con la que nos podés reclamar.',

  links: [
    { label: 'Explorar la Enciclopedia', href: ROUTES.ENCICLOPEDIA },
    { label: 'Guías prácticas', href: ROUTES.ENCICLOPEDIA_GUIAS },
    { label: 'Servicios y sesiones', href: ROUTES.SERVICIOS },
    { label: 'Escribirnos', href: ROUTES.CONTACTO },
    { label: 'Términos y condiciones', href: ROUTES.TERMINOS },
  ],
};
