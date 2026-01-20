/**
 * Numerology calculation utilities
 * Based on Pythagorean numerology system
 */

// Sistema Pitagórico: Mapeo de letras a números
const LETTER_VALUES: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  I: 9,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  O: 6,
  P: 7,
  Q: 8,
  R: 9,
  S: 1,
  T: 2,
  U: 3,
  V: 4,
  W: 5,
  X: 6,
  Y: 7,
  Z: 8,
};

const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const MASTER_NUMBERS = [11, 22, 33];

/**
 * Reduce un número a un solo dígito, preservando números maestros
 * @param num - Número a reducir
 * @param preserveMaster - Si preservar 11, 22, 33
 * @returns Número reducido o maestro
 */
export function reduceToSingleDigit(
  num: number,
  preserveMaster: boolean = true,
): number {
  if (preserveMaster && MASTER_NUMBERS.includes(num)) {
    return num;
  }

  while (num > 9) {
    num = String(num)
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit, 10), 0);

    if (preserveMaster && MASTER_NUMBERS.includes(num)) {
      return num;
    }
  }

  return num;
}

/**
 * Calcula el Número de Camino de Vida
 * Suma todos los dígitos de la fecha de nacimiento
 * @param birthDate - Fecha de nacimiento
 * @returns Número de Camino de Vida (1-9, 11, 22, 33)
 */
export function calculateLifePath(birthDate: Date): number {
  const year = birthDate.getUTCFullYear();
  const month = birthDate.getUTCMonth() + 1;
  const day = birthDate.getUTCDate();

  // Reducir cada componente por separado primero
  const yearReduced = reduceToSingleDigit(year, false);
  const monthReduced = reduceToSingleDigit(month, false);
  const dayReduced = reduceToSingleDigit(day, false);

  // Sumar y reducir preservando maestros
  const total = yearReduced + monthReduced + dayReduced;
  return reduceToSingleDigit(total, true);
}

/**
 * Calcula el Número del Día de Nacimiento
 * Solo usa el día del mes
 * @param birthDate - Fecha de nacimiento
 * @returns Número del día (1-9, 11, 22)
 */
export function calculateBirthdayNumber(birthDate: Date): number {
  const day = birthDate.getUTCDate();
  return reduceToSingleDigit(day, true);
}

/**
 * Calcula el Número de Expresión (Destino)
 * Suma todas las letras del nombre completo
 * @param fullName - Nombre completo
 * @returns Número de Expresión
 */
export function calculateExpressionNumber(fullName: string): number {
  const normalized = fullName
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^A-Z]/g, ''); // Solo letras

  const sum = normalized.split('').reduce((total, letter) => {
    return total + (LETTER_VALUES[letter] || 0);
  }, 0);

  return reduceToSingleDigit(sum, true);
}

/**
 * Calcula el Número del Alma (Deseo del Corazón)
 * Suma solo las vocales del nombre
 * @param fullName - Nombre completo
 * @returns Número del Alma
 */
export function calculateSoulUrge(fullName: string): number {
  const normalized = fullName
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const sum = normalized
    .split('')
    .filter((letter) => VOWELS.includes(letter))
    .reduce((total, letter) => {
      return total + (LETTER_VALUES[letter] || 0);
    }, 0);

  return reduceToSingleDigit(sum, true);
}

/**
 * Calcula el Número de Personalidad
 * Suma solo las consonantes del nombre
 * @param fullName - Nombre completo
 * @returns Número de Personalidad
 */
export function calculatePersonality(fullName: string): number {
  const normalized = fullName
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const sum = normalized
    .split('')
    .filter((letter) => LETTER_VALUES[letter] && !VOWELS.includes(letter))
    .reduce((total, letter) => {
      return total + (LETTER_VALUES[letter] || 0);
    }, 0);

  return reduceToSingleDigit(sum, true);
}

/**
 * Calcula el Año Personal
 * Suma día + mes de nacimiento + año actual
 * @param birthDate - Fecha de nacimiento
 * @param year - Año a calcular (default: actual)
 * @returns Año Personal (1-9)
 */
export function calculatePersonalYear(
  birthDate: Date,
  year: number = new Date().getFullYear(),
): number {
  const month = birthDate.getUTCMonth() + 1;
  const day = birthDate.getUTCDate();

  const sum =
    reduceToSingleDigit(day, false) +
    reduceToSingleDigit(month, false) +
    reduceToSingleDigit(year, false);

  return reduceToSingleDigit(sum, false); // No maestros en año personal
}

/**
 * Calcula el Mes Personal
 * Año Personal + mes actual
 * @param personalYear - Año personal calculado
 * @param month - Mes (1-12)
 * @returns Mes Personal (1-9)
 */
export function calculatePersonalMonth(
  personalYear: number,
  month: number = new Date().getMonth() + 1,
): number {
  const sum = personalYear + month;
  return reduceToSingleDigit(sum, false);
}

/**
 * Calcula el Número del Día Universal
 * Suma todos los dígitos de una fecha específica
 * @param date - Fecha a calcular (default: hoy)
 * @returns Número del día (1-9)
 */
export function calculateDayNumber(date: Date = new Date()): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  const sum =
    reduceToSingleDigit(year, false) +
    reduceToSingleDigit(month, false) +
    reduceToSingleDigit(day, false);

  return reduceToSingleDigit(sum, false); // No maestros en día universal
}

export interface NumerologyResult {
  lifePath: number;
  birthday: number;
  expression: number | null;
  soulUrge: number | null;
  personality: number | null;
  personalYear: number;
  personalMonth: number;
  isMasterNumber: boolean;
  birthDate: string;
  fullName: string | null;
}

/**
 * Calcula todos los números numerológicos
 */
export function calculateAllNumbers(
  birthDate: Date,
  fullName?: string,
): NumerologyResult {
  const lifePath = calculateLifePath(birthDate);
  const personalYear = calculatePersonalYear(birthDate);

  return {
    lifePath,
    birthday: calculateBirthdayNumber(birthDate),
    expression: fullName ? calculateExpressionNumber(fullName) : null,
    soulUrge: fullName ? calculateSoulUrge(fullName) : null,
    personality: fullName ? calculatePersonality(fullName) : null,
    personalYear,
    personalMonth: calculatePersonalMonth(personalYear),
    isMasterNumber: MASTER_NUMBERS.includes(lifePath),
    birthDate: birthDate.toISOString().split('T')[0],
    fullName: fullName || null,
  };
}
