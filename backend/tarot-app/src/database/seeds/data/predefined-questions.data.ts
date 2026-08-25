/**
 * Predefined Questions Data
 *
 * Curated set of common tarot questions organized by category.
 * Each question is designed to be open-ended and suitable for tarot readings.
 *
 * Categories:
 * - Amor y Relaciones (Love & Relationships)
 * - Trabajo y Carrera (Work & Career)
 * - Dinero y Finanzas (Money & Finances)
 * - Energía y Bienestar (Health & Wellbeing)
 * - Espiritual y Crecimiento (Spiritual & Growth)
 * - General (General)
 */

export interface PredefinedQuestionData {
  categorySlug: string;
  questionText: string;
  order: number;
}

export const ALL_PREDEFINED_QUESTIONS: PredefinedQuestionData[] = [
  // ❤️ AMOR Y RELACIONES (8 questions)
  {
    categorySlug: 'amor-relaciones',
    questionText: '¿Qué debo saber sobre mi vida amorosa en este momento?',
    order: 1,
  },
  {
    categorySlug: 'amor-relaciones',
    questionText: '¿Cómo puedo mejorar mi relación de pareja actual?',
    order: 2,
  },
  {
    categorySlug: 'amor-relaciones',
    questionText: '¿Qué energías rodean mi búsqueda del amor?',
    order: 3,
  },
  {
    categorySlug: 'amor-relaciones',
    questionText: '¿Esta persona es adecuada para mí en este momento?',
    order: 4,
  },
  {
    categorySlug: 'amor-relaciones',
    questionText: '¿Cómo puedo superar una ruptura o desencuentro amoroso?',
    order: 5,
  },
  {
    categorySlug: 'amor-relaciones',
    questionText: '¿Qué aspectos debo trabajar en mí para atraer el amor?',
    order: 6,
  },
  {
    categorySlug: 'amor-relaciones',
    questionText: '¿Cuál es el mayor desafío en mi relación actual?',
    order: 7,
  },
  {
    categorySlug: 'amor-relaciones',
    questionText: '¿Qué lección debo aprender de mis experiencias amorosas?',
    order: 8,
  },

  // 💼 TRABAJO Y CARRERA (8 questions)
  {
    categorySlug: 'carrera-trabajo',
    questionText: '¿Qué oportunidades laborales se presentan para mí?',
    order: 1,
  },
  {
    categorySlug: 'carrera-trabajo',
    questionText: '¿Es este el momento adecuado para cambiar de trabajo?',
    order: 2,
  },
  {
    categorySlug: 'carrera-trabajo',
    questionText: '¿Cómo puedo desarrollar mi carrera profesional?',
    order: 3,
  },
  {
    categorySlug: 'carrera-trabajo',
    questionText: '¿Qué energías rodean mi situación laboral actual?',
    order: 4,
  },
  {
    categorySlug: 'carrera-trabajo',
    questionText: '¿Debo emprender un nuevo proyecto o negocio?',
    order: 5,
  },
  {
    categorySlug: 'carrera-trabajo',
    questionText:
      '¿Qué habilidades debo desarrollar para crecer profesionalmente?',
    order: 6,
  },
  {
    categorySlug: 'carrera-trabajo',
    questionText: '¿Cómo mejorar mi relación con compañeros y superiores?',
    order: 7,
  },
  {
    categorySlug: 'carrera-trabajo',
    questionText: '¿Cuál es mi verdadera vocación o propósito profesional?',
    order: 8,
  },

  // 💰 DINERO Y FINANZAS (7 questions)
  {
    categorySlug: 'dinero-finanzas',
    questionText: '¿Qué puedo hacer para mejorar mi situación financiera?',
    order: 1,
  },
  {
    categorySlug: 'dinero-finanzas',
    questionText: '¿Es buen momento para realizar esta inversión?',
    order: 2,
  },
  {
    categorySlug: 'dinero-finanzas',
    questionText: '¿Qué obstáculos bloquean mi prosperidad económica?',
    order: 3,
  },
  {
    categorySlug: 'dinero-finanzas',
    questionText: '¿Cómo atraer más abundancia a mi vida?',
    order: 4,
  },
  {
    categorySlug: 'dinero-finanzas',
    questionText: '¿Qué debo saber sobre mis finanzas en los próximos meses?',
    order: 5,
  },
  {
    categorySlug: 'dinero-finanzas',
    questionText: '¿Cómo puedo gestionar mejor mis recursos económicos?',
    order: 6,
  },
  {
    categorySlug: 'dinero-finanzas',
    questionText: '¿Qué actitud debo tomar frente al dinero y la prosperidad?',
    order: 7,
  },

  // 🌿 ENERGÍA Y BIENESTAR (6 questions)
  {
    categorySlug: 'salud-bienestar',
    questionText:
      '¿Qué aspectos de mi bienestar requieren atención en este momento?',
    order: 1,
  },
  {
    categorySlug: 'salud-bienestar',
    questionText: '¿Cómo puedo mejorar mi bienestar físico y emocional?',
    order: 2,
  },
  {
    categorySlug: 'salud-bienestar',
    questionText: '¿Qué cambios de hábitos me beneficiarían más?',
    order: 3,
  },
  {
    categorySlug: 'salud-bienestar',
    questionText: '¿Cómo encontrar equilibrio entre trabajo y descanso?',
    order: 4,
  },
  {
    categorySlug: 'salud-bienestar',
    questionText: '¿Qué emociones están afectando mi energía física?',
    order: 5,
  },
  {
    categorySlug: 'salud-bienestar',
    questionText: '¿Qué prácticas de autocuidado debo incorporar?',
    order: 6,
  },

  // ✨ ESPIRITUAL Y CRECIMIENTO (7 questions)
  {
    categorySlug: 'crecimiento-espiritual',
    questionText: '¿Cuál es mi propósito de vida en este momento?',
    order: 1,
  },
  {
    categorySlug: 'crecimiento-espiritual',
    questionText: '¿Qué lección espiritual debo aprender ahora?',
    order: 2,
  },
  {
    categorySlug: 'crecimiento-espiritual',
    questionText: '¿Cómo puedo conectar más profundamente con mi ser interior?',
    order: 3,
  },
  {
    categorySlug: 'crecimiento-espiritual',
    questionText: '¿Qué bloqueos espirituales debo liberar?',
    order: 4,
  },
  {
    categorySlug: 'crecimiento-espiritual',
    questionText: '¿Cómo puedo desarrollar mi intuición y percepción?',
    order: 5,
  },
  {
    categorySlug: 'crecimiento-espiritual',
    questionText: '¿Qué mensaje tienen mis guías espirituales para mí?',
    order: 6,
  },
  {
    categorySlug: 'crecimiento-espiritual',
    questionText: '¿Cómo puedo vivir más alineado con mi verdadera esencia?',
    order: 7,
  },

  // 🔮 GENERAL (6 questions)
  {
    categorySlug: 'consulta-general',
    questionText: '¿Qué debo saber sobre mi situación actual?',
    order: 1,
  },
  {
    categorySlug: 'consulta-general',
    questionText: '¿Qué energías me rodean en este momento?',
    order: 2,
  },
  {
    categorySlug: 'consulta-general',
    questionText: '¿Cuál es el mensaje más importante para mí hoy?',
    order: 3,
  },
  {
    categorySlug: 'consulta-general',
    questionText: '¿Qué oportunidades y desafíos vienen en mi camino?',
    order: 4,
  },
  {
    categorySlug: 'consulta-general',
    questionText: '¿En qué área de mi vida debo enfocar mi atención?',
    order: 5,
  },
  {
    categorySlug: 'consulta-general',
    questionText: '¿Qué consejo tienen las cartas para mi situación actual?',
    order: 6,
  },
];

// Total count validation
export const TOTAL_QUESTIONS = ALL_PREDEFINED_QUESTIONS.length;
export const EXPECTED_MINIMUM = 30;

if (TOTAL_QUESTIONS < EXPECTED_MINIMUM) {
  throw new Error(
    `Invalid question count: expected at least ${EXPECTED_MINIMUM}, got ${TOTAL_QUESTIONS}`,
  );
}
