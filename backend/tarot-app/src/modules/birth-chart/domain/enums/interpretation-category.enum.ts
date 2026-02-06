/**
 * Enum de categorías de interpretación astrológica
 * Define los diferentes tipos de interpretaciones disponibles en una carta natal
 */
export enum InterpretationCategory {
  PLANET_INTRO = 'planet_intro',
  PLANET_IN_SIGN = 'planet_in_sign',
  PLANET_IN_HOUSE = 'planet_in_house',
  ASPECT = 'aspect',
  ASCENDANT = 'ascendant',
}

/**
 * Metadata para cada categoría de interpretación
 * Incluye nombre en español y descripción del tipo de interpretación
 */
export const InterpretationCategoryMetadata: Record<
  InterpretationCategory,
  {
    name: string;
    description: string;
  }
> = {
  [InterpretationCategory.PLANET_INTRO]: {
    name: 'Introducción al Planeta',
    description:
      'Descripción general del planeta y su significado en la carta natal',
  },
  [InterpretationCategory.PLANET_IN_SIGN]: {
    name: 'Planeta en Signo',
    description:
      'Interpretación de cómo se expresa un planeta en un signo zodiacal específico',
  },
  [InterpretationCategory.PLANET_IN_HOUSE]: {
    name: 'Planeta en Casa',
    description:
      'Interpretación de cómo se manifiesta un planeta en una casa astrológica específica',
  },
  [InterpretationCategory.ASPECT]: {
    name: 'Aspecto',
    description:
      'Interpretación de la relación angular entre dos planetas (conjunción, oposición, etc.)',
  },
  [InterpretationCategory.ASCENDANT]: {
    name: 'Ascendente',
    description:
      'Interpretación del signo zodiacal que se encuentra en el Ascendente (Casa I)',
  },
};
