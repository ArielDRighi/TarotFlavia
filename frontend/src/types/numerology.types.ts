/**
 * Numerology Types
 *
 * Tipos TypeScript para el módulo de Numerología
 * Alineados con los DTOs del backend
 */

/**
 * Coincide con NumberDetailDto del backend
 */
export interface NumberDetailDto {
  value: number;
  name: string;
  keywords: string[];
  description: string;
  isMaster: boolean;
}

/**
 * Coincide con NumerologyResponseDto del backend
 */
export interface NumerologyResponseDto {
  lifePath: NumberDetailDto;
  birthday: NumberDetailDto;
  expression: NumberDetailDto | null;
  soulUrge: NumberDetailDto | null;
  personality: NumberDetailDto | null;
  personalYear: number;
  personalMonth: number;
  birthDate: string;
  fullName: string | null;
}

/**
 * Respuesta de interpretación IA (PREMIUM)
 * Coincide con NumerologyInterpretationResponseDto del backend
 */
export interface NumerologyInterpretationResponseDto {
  id: number;
  userId: number;
  interpretation: string;
  lifePath: number;
  expression: number | null;
  soulUrge: number | null;
  personality: number | null;
  birthday: number;
  generatedAt: string;
  aiProvider: string;
  aiModel: string;
}

/**
 * Significado de un número
 */
export interface NumerologyMeaning {
  number: number;
  name: string;
  keywords: string[];
  description: string;
  strengths: string[];
  challenges: string[];
  careers: string[];
  lifePurpose?: string;
  lessonsToLearn?: string[];
  isMaster: boolean;
}

export interface DayNumberResponse {
  date: string;
  dayNumber: number;
  meaning: NumerologyMeaning | null;
}

export interface CalculateNumerologyRequest {
  birthDate: string;
  fullName?: string;
}

/**
 * Compatibilidad entre números
 */
export type CompatibilityLevel = 'high' | 'medium' | 'low';

export interface Compatibility {
  numbers: [number, number];
  level: CompatibilityLevel;
  description: string;
  strengths: string[];
  challenges: string[];
}
