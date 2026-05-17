/**
 * Admin Chinese Horoscope API Functions
 *
 * Clientes API para los endpoints de admin del horóscopo chino:
 * backend/tarot-app/src/modules/horoscope/infrastructure/controllers/chinese-horoscope.controller.ts
 */

import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type {
  ChineseHoroscopeYearStatus,
  GenerateMissingResponse,
} from '@/types/admin-chinese-horoscope.types';

/**
 * Obtener el estado de generación de un año (Admin only)
 * Backend: GET /chinese-horoscope/admin/status/:year
 */
export async function getChineseHoroscopeAdminStatus(
  year: number
): Promise<ChineseHoroscopeYearStatus> {
  const response = await apiClient.get<ChineseHoroscopeYearStatus>(
    API_ENDPOINTS.CHINESE_HOROSCOPE.ADMIN_STATUS(year)
  );
  return response.data;
}

/**
 * Generar los horóscopos chinos faltantes para un año (Admin only)
 * Backend: POST /chinese-horoscope/admin/generate-missing/:year
 * Fire-and-forget: retorna inmediatamente mientras la generación ocurre en background
 */
export async function generateMissingChineseHoroscopes(
  year: number
): Promise<GenerateMissingResponse> {
  const response = await apiClient.post<GenerateMissingResponse>(
    API_ENDPOINTS.CHINESE_HOROSCOPE.ADMIN_GENERATE_MISSING(year)
  );
  return response.data;
}
