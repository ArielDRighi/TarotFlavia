/**
 * Contenido de `/politica-editorial`: cómo se produce, revisa y corrige el
 * contenido del sitio (T-SEO-017).
 *
 * ## Por qué existe esta página
 *
 * El tercer rechazo de AdSense (sep-2026) llegó con el volumen resuelto: lo que
 * faltaba era **confianza**. En el nicho esotérico, Google mira antes que nada
 * si hay alguien responsable del contenido y si se explica cómo se produce.
 * `/sobre-nosotros` dice quiénes somos; esta página dice **cómo trabajamos**:
 * fuentes, proceso de revisión, criterio de corrección, frecuencia de
 * actualización, y qué papel tienen las herramientas de lenguaje en el
 * horóscopo diario.
 *
 * ## La fórmula de los horóscopos
 *
 * El backlog pide reencuadrar el proceso como "datos + borrador + revisión
 * editorial" **sin badge** de "generado por" en cada página. La frase vive acá
 * (`DAILY_HOROSCOPE_METHOD`) y se muestra en dos lugares con el mismo texto: en
 * esta política y al pie de cada horóscopo diario (`HoroscopeEditorialNote`).
 *
 * ## ⚠️ Al editar
 *
 * - **No se nombra a ninguna persona.** Decisión de negocio del 12-sep-2026: el
 *   sitio se sigue presentando como equipo, igual que `/sobre-nosotros`.
 * - **No usar "IA" ni "inteligencia artificial"** en texto visible (guardarraíl
 *   FBK-003): la mención va como "herramientas de lenguaje".
 * - **No usar la palabra "salud"**: va "energía y bienestar" (T-SEO-013).
 * - **No bajar de `MIN_EDITORIAL_POLICY_WORDS`** ni repetir párrafos de
 *   `/sobre-nosotros`: dos URLs con el mismo texto son contenido duplicado.
 * - Actualizar `lastReviewed` al editar.
 */

import { countWords } from '@/lib/utils/text';
import { ROUTES } from './routes';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Una sección de la política (se renderiza como `h2` + párrafos). */
export interface EditorialPolicySection {
  /** Encabezado de la sección. */
  heading: string;
  /** Párrafos del cuerpo, en orden. */
  paragraphs: string[];
}

/** Enlace interno al pie de la página. */
export interface EditorialPolicyLink {
  /** Texto del enlace. */
  label: string;
  /** Ruta interna (siempre empieza con `/`). */
  href: string;
}

/** Contenido completo de `/politica-editorial`. */
export interface EditorialPolicyData {
  /** Título de la página (se renderiza como el `h1`). */
  title: string;
  /** Bajada que abre la página. */
  lead: string;
  /** Secciones, en orden de lectura. */
  sections: EditorialPolicySection[];
  /** Párrafo de cierre. */
  closing: string;
  /** Enlaces internos, para que el crawler siga recorriendo. */
  links: EditorialPolicyLink[];
  /**
   * Fecha de la última revisión de esta política, en formato ISO (`YYYY-MM`).
   *
   * ⚠️ Actualizar al editar el contenido de esta página.
   */
  lastReviewed: string;
}

// ─── Fórmula de los horóscopos ────────────────────────────────────────────────

/**
 * Cómo se produce el horóscopo diario, en dos piezas invariantes.
 *
 * La política las usa dentro de una oración completa y `HoroscopeEditorialNote`
 * las arma alrededor de la fecha del día. Si se cambian acá, cambian en los dos
 * lugares a la vez, que es la idea.
 *
 * ⚠️ Tiene que describir lo que el backend hace de verdad. El prompt de
 * `horoscope.prompts.ts` redacta por signo a partir de su **elemento, cualidad
 * y planeta regente**; NO calcula posiciones planetarias del día (eso lo hace
 * la carta astral, con Swiss Ephemeris). Decir "a partir de las posiciones
 * planetarias del día" —como sugería el backlog— sería falso en una página de
 * confianza.
 */
export const DAILY_HOROSCOPE_BASIS =
  'a partir del elemento, la cualidad y el planeta regente de cada signo';

export const DAILY_HOROSCOPE_METHOD =
  'con asistencia de herramientas de lenguaje y revisión editorial del equipo de Auguria';

// ─── Guardarraíl ──────────────────────────────────────────────────────────────

/**
 * Mínimo de palabras propias de la página.
 *
 * El criterio de aceptación de T-SEO-017 pide 600. Como la página está en el
 * footer, el guardarraíl de `check:indexable` le exige además 500 (umbral de
 * navegación, T-SEO-015): 600 cubre los dos.
 */
export const MIN_EDITORIAL_POLICY_WORDS = 600;

/**
 * Palabras propias que aporta la página: bajada, párrafos y cierre. Los
 * encabezados quedan fuera, igual que en `getAboutPageWordCount`.
 */
export function getEditorialPolicyWordCount(): number {
  return countWords([
    EDITORIAL_POLICY.lead,
    ...EDITORIAL_POLICY.sections.flatMap((section) => section.paragraphs),
    EDITORIAL_POLICY.closing,
  ]);
}

// ─── Contenido ────────────────────────────────────────────────────────────────

export const EDITORIAL_POLICY: EditorialPolicyData = {
  title: 'Política editorial',

  lead: 'Esta página explica cómo se produce lo que publica Auguria: de dónde salen los significados de las cartas y los perfiles astrológicos, quién los escribe y quién los revisa, con qué criterio se corrige un error y cada cuánto se vuelve a mirar una página que ya está publicada. También aclara qué papel tienen las herramientas de lenguaje en el horóscopo diario y qué cosas no vas a encontrar acá. No es un texto legal: es el compromiso con el que se trabaja, escrito para que puedas contrastarlo.',

  sections: [
    {
      heading: 'Quién escribe y quién revisa',
      paragraphs: [
        'El contenido de Auguria lo escribe y lo revisa el equipo editorial del sitio: un grupo pequeño con más de una década de práctica en tarot, astrología, numerología y trabajo con péndulo, que también acompaña las consultas personales que se ofrecen en la sección de servicios. No trabajamos con redactores externos por volumen ni con textos comprados; cada página tiene detrás a alguien que la escribió y a alguien distinto que la leyó antes de publicarla.',
        'Esa doble lectura es la regla, no la excepción. Quien redacta una ficha no la publica: la pasa a otra persona del equipo, que verifica que el significado coincida con la tradición de referencia, que no se hayan colado promesas ni lenguaje de certeza, y que el texto responda a lo que el título anuncia. Recién después de esa revisión la página sale al sitio, y la firma que se ve al pie de cada ficha, guía, ritual y servicio remite a este proceso.',
      ],
    },
    {
      heading: 'Las fuentes que usamos',
      paragraphs: [
        'Para el tarot, la referencia es la baraja Rider-Waite-Smith, que es la única que se usa en el sitio, y la bibliografía clásica que la acompaña: la clave pictórica de Arthur Edward Waite, las lecturas de Rachel Pollack sobre los setenta y ocho arcanos y, para la dimensión arquetípica, la psicología de Carl Gustav Jung. Cuando una carta admite más de una lectura tradicional, la ficha describe la más difundida y no la presenta como la única.',
        'Para la astrología, los perfiles de signos, planetas y casas siguen la simbología occidental establecida. Las cartas natales se calculan con efemérides astronómicas (Swiss Ephemeris): las posiciones planetarias que se usan son las reales para la fecha, la hora y el lugar que se indican, no aproximaciones. La numerología se apoya en el sistema pitagórico y el horóscopo chino en las tablas tradicionales del calendario lunar.',
        'Lo que no está en esas fuentes no se inventa. Si un tema queda fuera de lo que el equipo practica o de lo que la tradición documenta, la página no se escribe: preferimos una enciclopedia con huecos a una llena de generalidades.',
      ],
    },
    {
      heading: 'Cómo se produce una ficha',
      paragraphs: [
        'Cada ficha de la enciclopedia —las setenta y ocho cartas, los doce signos, los planetas, las casas, los doce animales del zodíaco chino— nace de un esquema fijo de preguntas: qué representa, cómo se lee en el amor, en el trabajo y en la energía y el bienestar, qué simbolismo carga y qué consejo práctico deja. Ese esquema es deliberado: un diccionario también tiene entradas con la misma estructura, y lo que las vuelve valiosas es que cada una diga algo propio.',
        'A partir de ese esquema se redacta un borrador, que se contrasta con las fuentes de referencia y con lo que la práctica de consulta muestra. Después pasa por la revisión de otra persona del equipo, se ajusta lo que quedó ambiguo o inexacto, y se publica. Las guías prácticas y las notas que acompañan cada herramienta siguen el mismo circuito, con la diferencia de que allí la estructura es libre.',
      ],
    },
    {
      heading: 'Horóscopos diarios y herramientas de lenguaje',
      paragraphs: [
        `Los horóscopos diarios son la única parte del sitio que se produce todos los días, para los doce signos, y el único lugar donde intervienen herramientas de lenguaje. El proceso es siempre el mismo: cada horóscopo se redacta ${DAILY_HOROSCOPE_BASIS} para el día que corresponde, ${DAILY_HOROSCOPE_METHOD}. No es un cálculo sobre el cielo de esa fecha —eso lo hace la carta astral— sino una lectura del clima del día para el signo, escrita con las reglas que fija el equipo.`,
        'Esa línea aparece al pie de cada horóscopo, con la fecha a la que corresponde, para que quede claro cómo se produjo lo que estás leyendo. El equipo escribe las instrucciones con las que se redacta —qué tono, qué áreas, qué no puede decir—, revisa de forma periódica lo que se publica y ajusta esas instrucciones cuando un texto no cumple con esta política. Hoy esas instrucciones prohíben diagnósticos y consejo médico de cualquier tipo, piden no anunciar hechos concretos que no puedan cumplirse y no crear falsas expectativas. Las fichas de la enciclopedia, las guías, los rituales y las notas de las herramientas no se producen así: son texto escrito por el equipo.',
      ],
    },
    {
      heading: 'Correcciones y actualizaciones',
      paragraphs: [
        'Un contenido publicado no está terminado. El equipo vuelve sobre las fichas de forma periódica: se corrige lo que un lector señaló como confuso, se amplía lo que se leía corto y se reescribe lo que la experiencia de consulta mostró que se entendía mal. Esta página y la de Sobre Nosotros llevan a la vista la fecha de su última revisión, y se actualiza cada vez que una corrección les cambia el sentido.',
        'Los avisos que llegan por el formulario de contacto se leen todos. Si señalás un error de hecho —una correspondencia equivocada, un significado invertido, un dato astronómico que no cierra— se verifica contra las fuentes y, si corresponde, se corrige en la página sin esperar al próximo ciclo de revisión. Si lo que señalás es una diferencia de interpretación, se evalúa si la ficha debería mencionar esa otra lectura.',
      ],
    },
    {
      heading: 'Lo que no publicamos',
      paragraphs: [
        'No se publican diagnósticos, indicaciones sobre tratamientos ni recomendaciones de medicación, y las consultas que rozan ese terreno se responden con una lectura simbólica y la recomendación de acudir a un profesional. No se publica consejo legal ni financiero accionable. No se venden resultados: ninguna página promete que alguien vuelva, que un negocio prospere o que una situación se resuelva en un plazo, y no hay trabajos pagos que comprometan un desenlace.',
        'Tampoco se publica contenido construido sobre el miedo. Las cartas difíciles se explican por lo que aportan, no como presagios de los que haya que salvarse pagando algo, y ninguna herramienta del sitio anuncia una desgracia para después ofrecer el remedio. Este criterio vale para las fichas, para las guías, para los rituales, para los horóscopos y para las lecturas personalizadas del plan premium.',
      ],
    },
    {
      heading: 'Publicidad e independencia editorial',
      paragraphs: [
        'Auguria se sostiene con el plan premium, con las sesiones que se contratan en la sección de servicios y con publicidad de terceros en las páginas de acceso libre. Los anuncios no intervienen en lo que se escribe: ningún anunciante revisa, encarga ni condiciona el contenido, y ninguna ficha se escribe para atraer una categoría de anuncios. Cuando una página recomienda algo —un mazo, un libro, una práctica— es porque el equipo lo usa, no porque alguien pague por la mención.',
      ],
    },
  ],

  closing:
    'Si encontrás una página que no cumple con lo que dice esta política, escribinos. La política existe para que se pueda reclamar contra ella, y cada reclamo que corresponde se traduce en una corrección visible.',

  lastReviewed: '2026-09',

  links: [
    { label: 'Sobre Nosotros', href: ROUTES.SOBRE_NOSOTROS },
    { label: 'Explorar la Enciclopedia', href: ROUTES.ENCICLOPEDIA },
    { label: 'Horóscopo de hoy', href: ROUTES.HOROSCOPO },
    { label: 'Escribirnos', href: ROUTES.CONTACTO },
  ],
};
