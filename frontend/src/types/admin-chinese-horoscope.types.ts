/**
 * Admin Chinese Horoscope Types
 *
 * Reflejan exactamente los DTOs del backend:
 * backend/tarot-app/src/modules/horoscope/application/dto/chinese-horoscope-response.dto.ts
 */

import type { ChineseZodiacAnimal, ChineseElementCode } from './chinese-horoscope.types';

/**
 * Una combinación animal/elemento faltante - coincide con MissingCombinationDto del backend
 */
export interface MissingCombination {
  animal: ChineseZodiacAnimal;
  element: ChineseElementCode;
}

/**
 * Estado de generación de un año - coincide con ChineseHoroscopeYearStatusDto del backend
 * GET /chinese-horoscope/admin/status/:year
 */
export interface ChineseHoroscopeYearStatus {
  year: number;
  total: number; // siempre 60
  generated: number;
  missing: MissingCombination[];
}

/**
 * Respuesta del endpoint de generación de faltantes
 * POST /chinese-horoscope/admin/generate-missing/:year
 */
export interface GenerateMissingResponse {
  message: string;
  details: string;
}
