import { RitualCategory } from '../domain/enums/ritual-category.enum';

/**
 * Patrones emocionales detectables en el historial de lecturas
 */
export enum EmotionalPattern {
  HEARTBREAK = 'heartbreak', // Corazón roto / Conflicto emocional
  MATERIAL_BLOCK = 'material_block', // Bloqueo material / Estancamiento
  SUCCESS_EXPANSION = 'success', // Éxito y expansión
  OBSESSION = 'obsession', // Obsesión / Repetición
  SEEKING_CLARITY = 'clarity', // Búsqueda de claridad
  HEALING_NEEDED = 'healing', // Necesita sanación
  PROTECTION_NEEDED = 'protection', // Necesita protección
}

/**
 * Configuración de patrones: IDs de arcanos mayores
 */
export interface PatternCardConfig {
  majorArcana: number[]; // IDs de arcanos mayores asociados
}

/**
 * Mapeo de patrones a configuraciones de cartas
 * Los IDs de arcanos mayores van de 0 (El Loco) a 21 (El Mundo)
 */
export const PATTERN_CARDS: Record<EmotionalPattern, PatternCardConfig> = {
  [EmotionalPattern.HEARTBREAK]: {
    majorArcana: [16, 18], // La Torre (16), La Luna (18)
  },
  [EmotionalPattern.MATERIAL_BLOCK]: {
    majorArcana: [12], // El Colgado (12)
  },
  [EmotionalPattern.SUCCESS_EXPANSION]: {
    majorArcana: [19, 21, 10], // El Sol (19), El Mundo (21), La Rueda (10)
  },
  [EmotionalPattern.OBSESSION]: {
    majorArcana: [15, 8], // El Diablo (15), La Fuerza (8)
  },
  [EmotionalPattern.SEEKING_CLARITY]: {
    majorArcana: [2, 9], // La Sacerdotisa (2), El Ermitaño (9)
  },
  [EmotionalPattern.HEALING_NEEDED]: {
    majorArcana: [6, 14], // Los Enamorados (6), Templanza (14)
  },
  [EmotionalPattern.PROTECTION_NEEDED]: {
    majorArcana: [16, 5], // La Torre (16), El Hierofante (5)
  },
};

/**
 * Mensajes personalizados para cada patrón
 */
export const PATTERN_MESSAGES: Record<EmotionalPattern, string> = {
  [EmotionalPattern.HEARTBREAK]:
    'Las cartas han mostrado turbulencia emocional. Un baño de limpieza con romero podría ayudarte a restaurar tu equilibrio.',
  [EmotionalPattern.MATERIAL_BLOCK]:
    'Si sientes que tus proyectos están estancados, aprovecha la próxima Luna Creciente para un ritual de Abrecaminos.',
  [EmotionalPattern.SUCCESS_EXPANSION]:
    'Tu energía está vibrando alto. Es el momento perfecto para un ritual de Gratitud para multiplicar lo que llega.',
  [EmotionalPattern.OBSESSION]:
    'A veces la respuesta llega en el silencio. Te sugerimos un ritual de meditación para calmar la mente.',
  [EmotionalPattern.SEEKING_CLARITY]:
    'Cuando buscamos claridad, un ritual de conexión con La Sacerdotisa puede iluminar el camino.',
  [EmotionalPattern.HEALING_NEEDED]:
    'Tu energía pide sanación. Considera un ritual de limpieza y autocuidado.',
  [EmotionalPattern.PROTECTION_NEEDED]:
    'Las cartas sugieren que es momento de fortalecer tus defensas energéticas.',
};

/**
 * Mapeo de patrones a categorías de rituales recomendadas
 */
export const PATTERN_RITUAL_CATEGORIES: Record<
  EmotionalPattern,
  RitualCategory[]
> = {
  [EmotionalPattern.HEARTBREAK]: [
    RitualCategory.HEALING,
    RitualCategory.CLEANSING,
  ],
  [EmotionalPattern.MATERIAL_BLOCK]: [RitualCategory.ABUNDANCE],
  [EmotionalPattern.SUCCESS_EXPANSION]: [
    RitualCategory.ABUNDANCE,
    RitualCategory.MEDITATION,
  ],
  [EmotionalPattern.OBSESSION]: [
    RitualCategory.MEDITATION,
    RitualCategory.CLEANSING,
  ],
  [EmotionalPattern.SEEKING_CLARITY]: [
    RitualCategory.MEDITATION,
    RitualCategory.TAROT,
  ],
  [EmotionalPattern.HEALING_NEEDED]: [
    RitualCategory.HEALING,
    RitualCategory.CLEANSING,
  ],
  [EmotionalPattern.PROTECTION_NEEDED]: [
    RitualCategory.PROTECTION,
    RitualCategory.CLEANSING,
  ],
};
