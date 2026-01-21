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
