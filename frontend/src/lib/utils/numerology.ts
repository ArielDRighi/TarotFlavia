/**
 * Numerology Utilities
 *
 * Utilidades para cálculos numerológicos en el cliente
 */

/**
 * Reduce un número a un solo dígito (1-9)
 * Preserva números maestros (11, 22, 33)
 */
export function reduceToSingleDigit(num: number, preserveMasterNumbers: boolean = true): number {
  if (preserveMasterNumbers && [11, 22, 33].includes(num)) {
    return num;
  }

  while (num > 9) {
    num = String(num)
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit), 0);

    if (preserveMasterNumbers && [11, 22, 33].includes(num)) {
      return num;
    }
  }

  return num;
}

/**
 * Calcula número de vida (para preview rápido)
 */
export function calculateLifePathNumber(birthDate: Date): number {
  const year = birthDate.getUTCFullYear();
  const month = birthDate.getUTCMonth() + 1;
  const day = birthDate.getUTCDate();

  const yearReduced = reduceToSingleDigit(year, false);
  const monthReduced = reduceToSingleDigit(month, false);
  const dayReduced = reduceToSingleDigit(day, false);

  const total = yearReduced + monthReduced + dayReduced;
  return reduceToSingleDigit(total, true);
}

/**
 * Info básica de números para UI
 */
export const NUMEROLOGY_NUMBERS_INFO: Record<
  number,
  {
    name: string;
    emoji: string;
    color: string;
  }
> = {
  1: { name: 'El Líder', emoji: '👑', color: 'text-red-500' },
  2: { name: 'El Diplomático', emoji: '🤝', color: 'text-blue-500' },
  3: { name: 'El Creativo', emoji: '🎨', color: 'text-yellow-500' },
  4: { name: 'El Constructor', emoji: '🏗️', color: 'text-green-500' },
  5: { name: 'El Aventurero', emoji: '🌍', color: 'text-orange-500' },
  6: { name: 'El Protector', emoji: '💖', color: 'text-pink-500' },
  7: { name: 'El Buscador', emoji: '🔮', color: 'text-purple-500' },
  8: { name: 'El Exitoso', emoji: '💎', color: 'text-amber-500' },
  9: { name: 'El Humanitario', emoji: '🕊️', color: 'text-teal-500' },
  11: { name: 'El Visionario', emoji: '✨', color: 'text-indigo-500' },
  22: { name: 'El Constructor Maestro', emoji: '🌟', color: 'text-cyan-500' },
  33: { name: 'El Maestro Sanador', emoji: '💫', color: 'text-rose-500' },
};

/**
 * Descripciones de Años Personales (ciclo de 9 años)
 * Cada año trae energías y oportunidades diferentes
 */
export const PERSONAL_YEAR_MEANINGS: Record<
  number,
  {
    name: string;
    theme: string;
    description: string;
  }
> = {
  1: {
    name: 'Nuevos Comienzos',
    theme: 'Inicios y Liderazgo',
    description:
      'Año de nuevos comienzos, independencia y tomar la iniciativa. Ideal para emprender proyectos, tomar decisiones importantes y sembrar las semillas del futuro.',
  },
  2: {
    name: 'Cooperación',
    theme: 'Relaciones y Paciencia',
    description:
      'Año de colaboración, diplomacia y relaciones. Momento para cultivar paciencia, trabajar en equipo y prestar atención a los detalles. Las asociaciones se fortalecen.',
  },
  3: {
    name: 'Expresión Creativa',
    theme: 'Creatividad y Comunicación',
    description:
      'Año de expresión personal, creatividad y socialización. Favorable para proyectos artísticos, comunicación y expansión de tu círculo social.',
  },
  4: {
    name: 'Construcción',
    theme: 'Trabajo y Estructura',
    description:
      'Año de trabajo duro, disciplina y construcción de bases sólidas. Momento para organizar, planificar y establecer estructuras duraderas en tu vida.',
  },
  5: {
    name: 'Cambios',
    theme: 'Libertad y Transformación',
    description:
      'Año de cambios, libertad y aventura. Espera lo inesperado: viajes, mudanzas o nuevas oportunidades. Es tiempo de adaptarse y explorar.',
  },
  6: {
    name: 'Responsabilidad',
    theme: 'Hogar y Familia',
    description:
      'Año centrado en el hogar, la familia y las responsabilidades. Momento para nutrir relaciones, crear armonía y posiblemente compromisos importantes.',
  },
  7: {
    name: 'Introspección',
    theme: 'Reflexión y Espiritualidad',
    description:
      'Año de reflexión interior, estudio y crecimiento espiritual. Ideal para el aprendizaje, la meditación y profundizar en tu conocimiento personal.',
  },
  8: {
    name: 'Abundancia',
    theme: 'Poder y Logros Materiales',
    description:
      'Año de manifestación material, poder y reconocimiento. Las acciones pasadas dan frutos. Favorable para negocios, finanzas y logros profesionales.',
  },
  9: {
    name: 'Culminación',
    theme: 'Cierre y Humanitarismo',
    description:
      'Año de culminación, soltar lo viejo y prepararse para un nuevo ciclo. Momento de servicio a otros, generosidad y reflexión sobre el ciclo completado.',
  },
};

/**
 * Obtiene la descripción del año personal
 */
export function getPersonalYearMeaning(year: number) {
  return PERSONAL_YEAR_MEANINGS[year] || PERSONAL_YEAR_MEANINGS[reduceToSingleDigit(year, false)];
}
