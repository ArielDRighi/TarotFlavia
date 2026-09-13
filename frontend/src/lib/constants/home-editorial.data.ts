/**
 * Texto propio de la portada editorial (T-SEO-014).
 *
 * ## Por qué existe
 *
 * AdSense rechazó el sitio tres veces por "contenido de poco valor" y el análisis
 * del 11-sep-2026 ubicó la causa n.º 1 en la home: una landing de producto (hero
 * "Crear cuenta gratis", tabla de precios, "3 pasos") que hacía que el revisor
 * clasificara el sitio como app comercial en los primeros segundos. La portada
 * pasa a ser la de una publicación: qué es el sitio, el horóscopo de hoy, la
 * carta del día, las guías, la enciclopedia y quién está detrás.
 *
 * ## Por qué el texto vive acá y no en el JSX
 *
 * Mismo criterio que `listing-intros.data.ts` y `about-page.data.ts`: el grueso
 * de lo que muestra la portada llega de la API (12 extractos del horóscopo, la
 * carta, las guías). Este archivo es el **piso garantizado** que se sirve aunque
 * la API no responda, y el test `home-editorial.data.test.ts` lo mide sin
 * renderizar nada.
 *
 * ## ⚠️ Al editar
 *
 * - **Sin precios, sin planes, sin "cómo funciona en 3 pasos".** Lo gratis se
 *   demuestra (el horóscopo se lee, la carta se ve), no se anuncia. El upsell
 *   vive en `/premium` y en el dashboard del usuario logueado.
 * - **No usar la palabra "salud"** en texto visible (T-SEO-013).
 * - No repetir párrafos de `/sobre-nosotros` ni de los listados: dos URLs con
 *   el mismo texto son contenido duplicado.
 * - Nada de "generado por IA" como badge: la política editorial es de T-SEO-017.
 */

import { countWords } from '@/lib/utils/text';
import { ROUTES } from './routes';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Enlace interno. */
export interface HomeLink {
  label: string;
  href: string;
}

/** Cifra destacada de la enciclopedia, con su índice. */
export interface HomeFigure extends HomeLink {
  /** Qué es lo que se cuenta, para la lectura de la cifra (p. ej. "con ficha propia"). */
  detail: string;
  /** Ilustración de fondo, del catálogo de la enciclopedia (decorativa, T-SEO-022). */
  image: string;
}

/** Encabezado + bajada de una sección, y el enlace a la página completa. */
export interface HomeSectionCopy {
  heading: string;
  lead: string;
  href: string;
  /** Texto del enlace a la página completa. */
  linkLabel: string;
}

export interface HomeEditorialData {
  hero: {
    /** Píldora dorada sobre el `h1`: qué tipo de sitio es. */
    eyebrow: string;
    /** `h1` único de la portada. */
    title: string;
    /**
     * Remate del `title` que va en dorado con shimmer (T-SEO-022). Tiene que
     * ser el final exacto de `title`: el hero lo separa por longitud.
     */
    titleAccent: string;
    /** Bajada de dos líneas: qué es el sitio. */
    lead: string;
    /** Único CTA del hero: baja al horóscopo de hoy. Editorial, no de producto. */
    ctaLabel: string;
    /**
     * Tres chips bajo el CTA con lo que hay para leer. Nada de "Sin registro" o
     * "1 vez al día": eso es copy de producto.
     */
    highlights: [string, string, string];
  };
  horoscope: HomeSectionCopy & {
    /** `id` de la sección: ancla del único CTA del hero (T-SEO-022). */
    anchorId: string;
    /** Se muestra cuando no hay horóscopo disponible (API caída). */
    emptyState: string;
  };
  dailyCard: HomeSectionCopy & {
    /** Se muestra cuando no se pudo resolver la carta (API caída). */
    emptyState: string;
    /** Texto del enlace a la ficha de la carta en la enciclopedia. */
    encyclopediaLinkLabel: string;
  };
  /**
   * Sin `emptyState`: cuando la API no responde, la portada cae a las siete
   * guías de `guides-catalog.data.ts` (T-SEO-022). Un aviso de error en la
   * portada es lo primero que vería el revisor de AdSense si el ISR pega en un
   * mal momento.
   */
  guides: HomeSectionCopy;
  encyclopedia: HomeSectionCopy & {
    figures: HomeFigure[];
    /** Párrafo de cierre debajo de las cifras. */
    body: string;
  };
  about: HomeSectionCopy & {
    /** Tres líneas sobre quién está detrás del sitio. */
    body: string;
  };
  services: {
    /** Una línea. Sin tabla, sin lista de features. */
    text: string;
    links: HomeLink[];
  };
}

// ─── Guardarraíl ──────────────────────────────────────────────────────────────

/**
 * Piso de palabras del texto propio. Es deliberadamente menor que el objetivo de
 * la portada (900–1.200): el resto lo aportan los datos del día. Con esto la
 * home nunca vuelve a servir un cascarón si la API está caída durante el ISR.
 */
export const MIN_HOME_EDITORIAL_WORDS = 380;

/**
 * Cuenta el cuerpo de lectura (bajadas, párrafos y estados vacíos que también
 * se renderizan) y deja fuera encabezados, cifras y etiquetas de enlace.
 */
export function getHomeEditorialWordCount(): number {
  const { hero, horoscope, dailyCard, guides, encyclopedia, about, services } = HOME_EDITORIAL;

  return countWords([
    hero.lead,
    horoscope.lead,
    dailyCard.lead,
    guides.lead,
    encyclopedia.lead,
    encyclopedia.body,
    ...encyclopedia.figures.map((figure) => figure.detail),
    about.body,
    services.text,
  ]);
}

// ─── Contenido ────────────────────────────────────────────────────────────────

export const HOME_EDITORIAL: HomeEditorialData = {
  hero: {
    eyebrow: 'Publicación de tarot y astrología',
    title: 'Tarot y astrología en español: enciclopedia, horóscopos y guías',
    titleAccent: 'enciclopedia, horóscopos y guías',
    ctaLabel: 'Leer el horóscopo de hoy',
    highlights: ['Horóscopo diario', '78 cartas', 'Guías'],
    lead: 'Auguria es una publicación sobre tarot, astrología, numerología y práctica ritual, escrita en español rioplatense por gente que lleva años en esto. Cada día publicamos el horóscopo de los doce signos y una carta para leer con calma; el resto del sitio es material de referencia para volver cuando haga falta.',
  },

  horoscope: {
    heading: 'Horóscopo de hoy',
    anchorId: 'horoscopo-de-hoy',
    lead: 'Los doce signos, con la energía general de la jornada en dos o tres líneas. Cada extracto abre la predicción completa del signo: amor, trabajo, energía y bienestar, más el número, el color y la hora que acompañan el día. Se renueva todas las madrugadas, hora de Argentina.',
    href: ROUTES.HOROSCOPO,
    linkLabel: 'Ver el horóscopo completo',
    emptyState:
      'El horóscopo de hoy todavía no está disponible. Mientras se prepara, podés leer el perfil de cada signo en la página del horóscopo.',
  },

  dailyCard: {
    heading: 'La carta del día',
    lead: 'Una carta del mazo Rider-Waite para acompañar la jornada, con su significado al derecho y un consejo concreto. No es una tirada personal: es una lectura abierta, la misma para todos los que entran hoy, pensada para pensar el día con una imagen en la cabeza. Si preferís sacar la tuya, la herramienta de la carta del día te da una distinta, sin registro.',
    href: ROUTES.CARTA_DEL_DIA,
    linkLabel: 'Sacar mi propia carta',
    encyclopediaLinkLabel: 'Leer la ficha completa de la carta',
    emptyState:
      'La carta de hoy no se pudo cargar. Podés sacar la tuya en la herramienta de la carta del día o recorrer las 78 fichas en la enciclopedia.',
  },

  guides: {
    heading: 'Guías para consultar mejor',
    lead: 'Las guías explican cómo se hace cada consulta: cómo formular una pregunta al tarot, qué mira una carta natal, cómo se calcula el número de vida, cómo se pregunta con un péndulo y qué necesita un ritual para tener sentido. Están escritas para leerse enteras, no para saltar entre bullets.',
    href: ROUTES.ENCICLOPEDIA_GUIAS,
    linkLabel: 'Todas las guías',
  },

  encyclopedia: {
    heading: 'Explorá la enciclopedia',
    lead: 'La enciclopedia es la parte más grande del sitio y la que más tiempo nos lleva mantener. Cada entrada tiene ficha propia, con su significado, su simbolismo y sus cruces con otras entradas, sin texto copiado ni traducciones automáticas.',
    href: ROUTES.ENCICLOPEDIA,
    linkLabel: 'Entrar a la enciclopedia',
    figures: [
      {
        label: '78 cartas',
        detail:
          'Los 22 arcanos mayores y los 56 menores, carta por carta, con significado al derecho e invertido.',
        href: ROUTES.ENCICLOPEDIA_TAROT,
        image: '/images/enciclopedia/hub-tarot.webp',
      },
      {
        label: '12 signos',
        detail:
          'Perfil de cada signo del zodíaco: elemento, modalidad, regente y cómo se lleva con los demás.',
        href: ROUTES.ENCICLOPEDIA_ASTROLOGIA_SIGNOS,
        image: '/images/enciclopedia/astro-signos.webp',
      },
      {
        label: '12 casas',
        detail:
          'Qué área de la vida gobierna cada casa astrológica y cómo leerla en una carta natal.',
        href: ROUTES.ENCICLOPEDIA_ASTROLOGIA_CASAS,
        image: '/images/enciclopedia/astro-casas.webp',
      },
      {
        label: '10 planetas',
        detail:
          'Del Sol a Plutón: qué representa cada planeta y qué cambia según el signo en que cae.',
        href: ROUTES.ENCICLOPEDIA_ASTROLOGIA_PLANETAS,
        image: '/images/enciclopedia/astro-planetas.webp',
      },
      {
        label: '12 signos chinos',
        detail:
          'Los doce animales del calendario chino, con su carácter, sus años y su horóscopo anual.',
        href: ROUTES.HOROSCOPO_CHINO,
        image: '/images/enciclopedia/horoscopo-chino-animales.webp',
      },
    ],
    body: 'Si llegaste buscando una carta puntual, un signo o un planeta, lo más rápido es entrar directo por la cifra que corresponda. Si venís a leer sin rumbo, la portada de la enciclopedia ordena todo por disciplina y las fichas se enlazan entre sí: de una carta a sus combinaciones, de un signo a su regente, de un planeta a las casas donde pesa más.',
  },

  about: {
    heading: 'Quiénes somos',
    lead: 'Un equipo chico, con más de una década de práctica.',
    body: 'Auguria la hacemos un grupo de personas que llegó al tarot y a la astrología por interés propio y que escribe, revisa y corrige el contenido entre varias. Trabajamos sobre la baraja Rider-Waite, la astrología natal y la numerología pitagórica, y preferimos no publicar un tema antes que llenarlo de generalidades. Lo que pensamos sobre predicción, certeza y responsabilidad está explicado, sin vueltas, en la página sobre nosotros.',
    href: ROUTES.SOBRE_NOSOTROS,
    linkLabel: 'Conocer al equipo',
  },

  services: {
    text: 'También ofrecemos lecturas personalizadas con tarotistas y el cálculo de tu carta astral, si querés ir más allá de la lectura del día.',
    links: [
      { label: 'Lecturas personalizadas', href: ROUTES.SERVICIOS },
      { label: 'Carta astral', href: ROUTES.CARTA_ASTRAL },
    ],
  },
};
