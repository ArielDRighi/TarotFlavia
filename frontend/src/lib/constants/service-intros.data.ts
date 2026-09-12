import { ROUTES } from '@/lib/constants/routes';

/**
 * Un bullet de una sección informativa: un término destacado seguido de su descripción.
 */
export interface ServiceIntroSectionItem {
  /** Término destacado (se muestra en negrita, seguido de dos puntos). */
  term: string;
  /** Descripción explicativa del término. */
  description: string;
}

/**
 * Una sección de la tarjeta informativa (una columna con título y bullets).
 */
export interface ServiceIntroSection {
  /** Encabezado de la sección (puede incluir un emoji al inicio). */
  heading: string;
  /**
   * Color de acento de la sección. Si se omite, se alterna automáticamente
   * (índice par → púrpura, índice impar → índigo) para mantener la estética.
   */
  accent?: 'purple' | 'indigo';
  /** Lista de bullets explicativos. */
  items: ServiceIntroSectionItem[];
}

/**
 * Estructura de datos de una tarjeta informativa rica de servicio.
 */
export interface ServiceIntroData {
  /** data-testid del contenedor (opcional). */
  testId?: string;
  /** Título principal (heading h2). */
  title: string;
  /** Párrafo introductorio. */
  intro: string;
  /** Secciones con bullets (se muestran en grilla de 2 columnas). */
  sections: ServiceIntroSection[];
  /** Nota destacada opcional. */
  note?: string;
  /** URL destino del botón "Ver más en la Enciclopedia". */
  href: string;
}

/**
 * Claves de los servicios con tarjeta informativa rica.
 */
export type ServiceIntroKey = 'tarot' | 'western-horoscope' | 'chinese-horoscope';

/**
 * Contenido centralizado de las tarjetas informativas de cada servicio.
 *
 * Cada entrada combina introducción + secciones con bullets explicativos +
 * nota + enlace a la enciclopedia. El contenido es específico y veraz por
 * servicio.
 *
 * Desde T-SEO-015 quedan sólo tres: la tirada (`/tarot`, `/ritual`, que llevan
 * `noindex`), el horóscopo occidental (debajo de los 12 extractos del hub) y
 * el chino. Las páginas de herramientas (`/carta-del-dia`, `/pendulo`,
 * `/numerologia`, `/carta-astral`, `/rituales`) dejaron esta plantilla —era
 * la misma en todas y un revisor la lee como "sitio de herramientas"— por una
 * nota de uso propia por página, con estructura distinta entre sí.
 */
export const SERVICE_INTROS: Record<ServiceIntroKey, ServiceIntroData> = {
  tarot: {
    testId: 'tarot-intro',
    title: '¿Qué es la Tirada de Tarot?',
    intro:
      'El tarot es un sistema simbólico de 78 cartas que actúa como un espejo de tu mundo interior. Cada tirada combina las cartas, sus posiciones y tu pregunta para ofrecerte una guía reflexiva sobre tu presente y tus posibilidades.',
    sections: [
      {
        heading: '🃏 Los Arcanos Mayores',
        accent: 'purple',
        items: [
          {
            term: '22 Cartas Maestras',
            description:
              'Desde El Loco hasta El Mundo, representan las grandes etapas y lecciones de la vida. Su aparición señala temas profundos y momentos de transformación importantes.',
          },
          {
            term: 'Arquetipos Universales',
            description:
              'Cada arcano encarna una energía esencial —el amor, la justicia, el cambio, la sabiduría— que resuena con situaciones clave de tu camino.',
          },
          {
            term: 'Mensajes de Fondo',
            description:
              'Cuando dominan una tirada, invitan a mirar el panorama general más allá de los detalles cotidianos.',
          },
        ],
      },
      {
        heading: '🗂️ Los Arcanos Menores',
        accent: 'indigo',
        items: [
          {
            term: 'Cuatro Palos',
            description:
              'Copas (emociones), Oros (lo material), Espadas (la mente) y Bastos (la acción) describen las áreas concretas de tu vida diaria.',
          },
          {
            term: 'Cartas Numeradas',
            description:
              'Del As al Diez, narran el desarrollo de una situación, sus altibajos y su evolución en el tiempo.',
          },
          {
            term: 'Las Figuras',
            description:
              'Sota, Caballo, Reina y Rey representan personas, actitudes o energías que intervienen en tu consulta.',
          },
        ],
      },
    ],
    note: 'La posición de cada carta y su orientación (derecha o invertida) matizan su significado: el tarot orienta, no determina; las decisiones siempre son tuyas.',
    href: ROUTES.ENCICLOPEDIA_GUIA('guia-tarot'),
  },

  'western-horoscope': {
    testId: 'western-horoscope-intro',
    title: '¿Qué es el Horóscopo Occidental?',
    intro:
      'El horóscopo occidental interpreta la posición del Sol en el zodíaco para describir tendencias, energías y oportunidades. Tu signo solar es la base de tu carácter astrológico y de las predicciones diarias.',
    sections: [
      {
        heading: '♈ Los 12 Signos',
        accent: 'purple',
        items: [
          {
            term: 'Signo Solar',
            description:
              'Determinado por la fecha de nacimiento, refleja tu esencia, tu voluntad y la forma en que brillas en el mundo.',
          },
          {
            term: 'Rueda Zodiacal',
            description:
              'De Aries a Piscis, cada signo cubre un tramo del año y aporta cualidades propias: iniciativa, estabilidad, comunicación, sensibilidad y más.',
          },
          {
            term: 'Regente Planetario',
            description:
              'Cada signo está regido por un planeta que tiñe su manera de sentir, pensar y actuar.',
          },
        ],
      },
      {
        heading: '🌗 Elementos y Modalidades',
        accent: 'indigo',
        items: [
          {
            term: 'Los Cuatro Elementos',
            description:
              'Fuego (acción), Tierra (materia), Aire (mente) y Agua (emoción) agrupan a los signos según su temperamento básico.',
          },
          {
            term: 'Las Tres Modalidades',
            description:
              'Cardinal (inicia), Fija (sostiene) y Mutable (adapta) describen cómo cada signo despliega su energía.',
          },
          {
            term: 'Predicción Diaria',
            description:
              'A partir de los tránsitos del día, el horóscopo sugiere oportunidades, cuidados y enfoques para tu signo.',
          },
        ],
      },
    ],
    note: 'El horóscopo describe tendencias y energías generales: es una guía de inspiración, no un destino inevitable.',
    href: ROUTES.ENCICLOPEDIA_GUIA('guia-horoscopo-occidental'),
  },

  'chinese-horoscope': {
    testId: 'chinese-horoscope-intro',
    title: '¿Qué es el Horóscopo Chino?',
    intro:
      'El horóscopo chino es una tradición milenaria que asocia cada año a un animal y a un elemento. Tu animal del zodíaco describe tu temperamento, tus fortalezas y la energía que te acompaña a lo largo de la vida.',
    sections: [
      {
        heading: '🐉 Los 12 Animales',
        accent: 'purple',
        items: [
          {
            term: 'Tu Animal',
            description:
              'Rata, Buey, Tigre, Conejo, Dragón, Serpiente, Caballo, Cabra, Mono, Gallo, Perro o Cerdo: definido por tu año de nacimiento, marca tu carácter esencial.',
          },
          {
            term: 'Ciclo de 12 Años',
            description:
              'Los animales se suceden año tras año, y cada uno trae un clima energético distinto para todos.',
          },
          {
            term: 'Compatibilidades',
            description:
              'Algunos animales se armonizan y otros se desafían, lo que ilumina tus vínculos personales y profesionales.',
          },
        ],
      },
      {
        heading: '🌳 Los Cinco Elementos',
        accent: 'indigo',
        items: [
          {
            term: 'Madera, Fuego, Tierra, Metal y Agua',
            description:
              'Cada elemento modula la personalidad del animal, aportando matices de crecimiento, pasión, estabilidad, rigor o sensibilidad.',
          },
          {
            term: 'Yin y Yang',
            description:
              'La polaridad de cada año equilibra las energías activas y receptivas que influyen en el clima del período.',
          },
          {
            term: 'Ciclo de 60 Años',
            description:
              'La combinación de animales y elementos forma un gran ciclo que no se repite hasta pasadas seis décadas.',
          },
        ],
      },
    ],
    note: 'El horóscopo chino ofrece una lectura de tu energía anual y de tu carácter: úsalo como brújula, no como sentencia.',
    href: ROUTES.ENCICLOPEDIA_GUIA('guia-horoscopo-chino'),
  },
};
