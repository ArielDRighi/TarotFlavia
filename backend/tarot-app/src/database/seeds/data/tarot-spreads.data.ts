/**
 * Tarot Spreads Data
 *
 * Este archivo contiene los datos de los spreads (tipos de tiradas) predefinidos.
 * Los spreads definen la ESTRUCTURA de la lectura (cuántas cartas, qué significa cada posición).
 * La IA usará esta estructura + los significados de las cartas para generar interpretaciones.
 */

export interface SpreadPosition {
  position: number;
  name: string;
  description: string;
  interpretation_focus: string;
}

export interface TarotSpreadData {
  name: string;
  description: string;
  cardCount: number;
  positions: SpreadPosition[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  is_beginner_friendly: boolean;
  when_to_use: string;
  imageUrl?: string;
}

export const TAROT_SPREADS_DATA: TarotSpreadData[] = [
  // ========================================
  // 1. TIRADA DE 1 CARTA
  // ========================================
  {
    name: 'Tirada de 1 Carta',
    description:
      'La tirada más simple y directa del tarot. Perfecta para obtener una respuesta rápida, consejo del día o claridad sobre una situación específica. Esta carta captura la energía esencial del momento o pregunta.',
    cardCount: 1,
    positions: [
      {
        position: 1,
        name: 'Respuesta',
        description:
          'La carta revela la energía principal, el mensaje clave o el consejo más importante para tu situación actual. Representa el núcleo de lo que necesitas saber en este momento.',
        interpretation_focus: 'mensaje central y directo',
      },
    ],
    difficulty: 'beginner',
    is_beginner_friendly: true,
    when_to_use:
      'Respuestas rápidas, orientación diaria, consejo sobre una decisión simple, carta del día, cuando necesitas claridad inmediata.',
    imageUrl: 'https://example.com/spreads/one-card.jpg',
  },

  // ========================================
  // 2. TIRADA DE 3 CARTAS (PASADO-PRESENTE-FUTURO)
  // ========================================
  {
    name: 'Tirada de 3 Cartas',
    description:
      'Una de las tiradas más populares y versátiles del tarot. Ofrece una visión temporal completa que conecta el pasado con el presente y proyecta hacia el futuro. Perfecta para entender el flujo de una situación.',
    cardCount: 3,
    positions: [
      {
        position: 1,
        name: 'Pasado',
        description:
          'Eventos, experiencias o influencias pasadas que han llevado a la situación actual. Representa el contexto histórico y las raíces del asunto.',
        interpretation_focus: 'contexto histórico y causas',
      },
      {
        position: 2,
        name: 'Presente',
        description:
          'La situación o energía actual. Lo que está sucediendo ahora mismo, los desafíos o bendiciones del momento presente.',
        interpretation_focus: 'estado actual y circunstancias presentes',
      },
      {
        position: 3,
        name: 'Futuro',
        description:
          'La tendencia o dirección probable hacia donde se dirige la situación si continúa el curso actual. No es un destino fijo, sino una proyección basada en las energías presentes.',
        interpretation_focus: 'tendencia futura y resultado probable',
      },
    ],
    difficulty: 'beginner',
    is_beginner_friendly: true,
    when_to_use:
      'Panorama general de una situación, entender la evolución temporal de un asunto, preguntas sobre relaciones, trabajo o proyectos personales.',
    imageUrl: 'https://example.com/spreads/three-cards.jpg',
  },

  // ========================================
  // 3. TIRADA DE 5 CARTAS (ANÁLISIS PROFUNDO)
  // ========================================
  {
    name: 'Tirada de 5 Cartas',
    description:
      'Una tirada intermedia que proporciona un análisis más profundo y completo de una situación. Examina no solo el flujo temporal, sino también los obstáculos, recursos internos y el resultado probable.',
    cardCount: 5,
    positions: [
      {
        position: 1,
        name: 'Situación Actual',
        description:
          'El corazón del asunto. La energía central de tu pregunta o situación en este momento. Representa el núcleo de lo que estás experimentando.',
        interpretation_focus: 'esencia de la situación',
      },
      {
        position: 2,
        name: 'Obstáculos',
        description:
          'Los desafíos, bloqueos o dificultades que están interfiriendo con tu progreso. Puede representar miedos internos o circunstancias externas adversas.',
        interpretation_focus: 'desafíos y bloqueos',
      },
      {
        position: 3,
        name: 'Pasado Reciente',
        description:
          'Influencias del pasado cercano que todavía están afectando la situación presente. Eventos o decisiones recientes que tienen peso en el momento actual.',
        interpretation_focus: 'influencias pasadas recientes',
      },
      {
        position: 4,
        name: 'Futuro Próximo',
        description:
          'Lo que está por venir en el corto plazo. Energías y eventos que se están manifestando en tu camino inmediato.',
        interpretation_focus: 'eventos y energías próximas',
      },
      {
        position: 5,
        name: 'Resultado Final',
        description:
          'El desenlace probable de la situación si sigues el camino actual. Representa la culminación de todas las energías e influencias en juego.',
        interpretation_focus: 'resolución y culminación',
      },
    ],
    difficulty: 'intermediate',
    is_beginner_friendly: false,
    when_to_use:
      'Análisis profundo de una situación compleja, cuando necesitas entender obstáculos específicos, decisiones importantes, evaluación de proyectos o relaciones.',
    imageUrl: 'https://example.com/spreads/five-cards.jpg',
  },

  // ========================================
  // 4. CRUZ CÉLTICA (10 CARTAS)
  // ========================================
  {
    name: 'Cruz Céltica',
    description:
      'La tirada más completa y detallada del tarot tradicional. Ofrece una visión exhaustiva de cualquier situación, examinando múltiples dimensiones: lo consciente e inconsciente, el pasado y futuro, las influencias externas e internas, esperanzas y miedos. Ideal para lecturas profundas y transformadoras.',
    cardCount: 10,
    positions: [
      {
        position: 1,
        name: 'Situación Presente',
        description:
          'El estado actual de las cosas. La atmósfera general que rodea la pregunta o situación en este momento preciso.',
        interpretation_focus: 'atmósfera actual y energía dominante',
      },
      {
        position: 2,
        name: 'Desafío u Obstáculo',
        description:
          'Lo que se cruza en tu camino. El desafío principal o la energía que está en conflicto con la situación presente. Puede ser un obstáculo o una fuerza que debe integrarse.',
        interpretation_focus: 'desafío central y conflicto',
      },
      {
        position: 3,
        name: 'Raíz del Asunto',
        description:
          'La base o fundamento de la situación. Lo que está debajo de la superficie, las causas profundas o los orígenes del asunto.',
        interpretation_focus: 'causas profundas y fundamentos',
      },
      {
        position: 4,
        name: 'Pasado Reciente',
        description:
          'Eventos o influencias del pasado que están dejando atrás o que acaban de concluir, pero que aún tienen eco en el presente.',
        interpretation_focus: 'eventos pasados que se alejan',
      },
      {
        position: 5,
        name: 'Posible Futuro',
        description:
          'Lo que podría manifestarse en el futuro próximo. Una posibilidad que se está coronando o aproximando en tu vida.',
        interpretation_focus: 'posibilidad futura emergente',
      },
      {
        position: 6,
        name: 'Futuro Inmediato',
        description:
          'Lo que está por venir en el corto plazo. La siguiente fase o desarrollo que se aproxima en tu camino.',
        interpretation_focus: 'próximos eventos y desarrollos',
      },
      {
        position: 7,
        name: 'Tu Actitud',
        description:
          'Tu posición personal, tu enfoque actual hacia la situación. Cómo te percibes a ti mismo en relación con el asunto.',
        interpretation_focus: 'perspectiva personal y actitud',
      },
      {
        position: 8,
        name: 'Influencias Externas',
        description:
          'Las energías ambientales, otras personas, o circunstancias externas que están influyendo en la situación. Lo que está fuera de tu control directo.',
        interpretation_focus: 'factores externos e influencias ambientales',
      },
      {
        position: 9,
        name: 'Esperanzas y Miedos',
        description:
          'Tus expectativas internas, tanto positivas como negativas. Lo que esperas secretamente o lo que temes que pueda ocurrir. A menudo revela aspectos inconscientes.',
        interpretation_focus: 'expectativas internas y aspectos inconscientes',
      },
      {
        position: 10,
        name: 'Resultado Final',
        description:
          'La culminación de todas las energías e influencias. El desenlace más probable si continúa el curso actual, integrando todos los aspectos revelados en la lectura.',
        interpretation_focus: 'culminación y resultado definitivo',
      },
    ],
    difficulty: 'advanced',
    is_beginner_friendly: false,
    when_to_use:
      'Lecturas profundas y completas, situaciones complejas que requieren análisis exhaustivo, momentos de transición importantes, cuando necesitas máxima claridad sobre todos los aspectos de un asunto.',
    imageUrl: 'https://example.com/spreads/celtic-cross.jpg',
  },
];
