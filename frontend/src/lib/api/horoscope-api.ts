/**
 * Horoscope API Functions
 *
 * Funciones para interactuar con los endpoints de horóscopos del backend
 */

import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type { DailyHoroscope, ZodiacSign } from '@/types/horoscope.types';

/**
 * Obtener todos los horóscopos del día de hoy
 */
export async function getTodayAllHoroscopes(): Promise<DailyHoroscope[]> {
  const response = await apiClient.get<DailyHoroscope[]>(API_ENDPOINTS.HOROSCOPE.TODAY_ALL);
  return response.data;
}

/**
 * Obtener el horóscopo de un signo específico para hoy
 * @param sign - Signo zodiacal
 */
export async function getTodayHoroscope(sign: ZodiacSign): Promise<DailyHoroscope> {
  const response = await apiClient.get<DailyHoroscope>(API_ENDPOINTS.HOROSCOPE.TODAY_SIGN(sign));
  return response.data;
}

/**
 * Obtener el horóscopo del signo del usuario autenticado
 * Requiere que el usuario tenga configurada su fecha de nacimiento
 */
export async function getMySignHoroscope(): Promise<DailyHoroscope> {
  const response = await apiClient.get<DailyHoroscope>(API_ENDPOINTS.HOROSCOPE.MY_SIGN);
  return response.data;
}

/**
 * Obtener todos los horóscopos de una fecha específica
 * @param date - Fecha en formato YYYY-MM-DD
 */
export async function getHoroscopeByDate(date: string): Promise<DailyHoroscope[]> {
  const response = await apiClient.get<DailyHoroscope[]>(API_ENDPOINTS.HOROSCOPE.BY_DATE(date));
  return response.data;
}

/**
 * Obtener el horóscopo de un signo específico en una fecha específica
 * @param date - Fecha en formato YYYY-MM-DD
 * @param sign - Signo zodiacal
 */
export async function getHoroscopeByDateAndSign(
  date: string,
  sign: ZodiacSign
): Promise<DailyHoroscope> {
  const response = await apiClient.get<DailyHoroscope>(
    API_ENDPOINTS.HOROSCOPE.BY_DATE_SIGN(date, sign)
  );
  return response.data;
}
