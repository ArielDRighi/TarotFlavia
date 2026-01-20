/**
 * Chinese Horoscope API
 *
 * Funciones de API para el horóscopo chino (anual)
 */

import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type {
  ChineseHoroscope,
  ChineseZodiacAnimal,
  ChineseElementCode,
  CalculateAnimalResponse,
} from '@/types/chinese-horoscope.types';

/**
 * Calcula el animal del zodiaco chino basado en fecha de nacimiento
 * @param birthDate Fecha de nacimiento en formato YYYY-MM-DD
 */
export async function calculateAnimal(birthDate: string): Promise<CalculateAnimalResponse> {
  const response = await apiClient.get<CalculateAnimalResponse>(
    API_ENDPOINTS.CHINESE_HOROSCOPE.CALCULATE,
    {
      params: { birthDate },
    }
  );
  return response.data;
}

/**
 * Obtiene el horóscopo chino del usuario autenticado
 * @param year Año del horóscopo (opcional, default: año actual)
 */
export async function getMyAnimalHoroscope(year?: number): Promise<ChineseHoroscope> {
  const response = await apiClient.get<ChineseHoroscope>(
    API_ENDPOINTS.CHINESE_HOROSCOPE.MY_ANIMAL,
    {
      params: year ? { year } : undefined,
    }
  );
  return response.data;
}

/**
 * Obtiene todos los horóscopos chinos de un año
 * @param year Año del horóscopo
 */
export async function getChineseHoroscopesByYear(year: number): Promise<ChineseHoroscope[]> {
  const response = await apiClient.get<ChineseHoroscope[]>(
    API_ENDPOINTS.CHINESE_HOROSCOPE.BY_YEAR(year)
  );
  return response.data;
}

/**
 * Obtiene un horóscopo chino específico por año, animal y elemento
 * @param year Año del horóscopo
 * @param animal Animal del zodiaco chino
 * @param element Elemento Wu Xing (metal, water, wood, fire, earth)
 */
export async function getChineseHoroscopeByElement(
  year: number,
  animal: ChineseZodiacAnimal,
  element: ChineseElementCode
): Promise<ChineseHoroscope> {
  const response = await apiClient.get<ChineseHoroscope>(
    API_ENDPOINTS.CHINESE_HOROSCOPE.BY_YEAR_ANIMAL_ELEMENT(year, animal, element)
  );
  return response.data;
}
