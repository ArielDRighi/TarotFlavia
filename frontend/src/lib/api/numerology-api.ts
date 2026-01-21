/**
 * Numerology API Functions
 *
 * Funciones para interactuar con los endpoints de numerología del backend
 */

import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import { AxiosError } from 'axios';
import type {
  NumerologyResponseDto,
  NumerologyInterpretationResponseDto,
  NumerologyMeaning,
  DayNumberResponse,
  CalculateNumerologyRequest,
} from '@/types/numerology.types';

/**
 * Calcula perfil numerológico (público)
 */
export async function calculateNumerology(
  data: CalculateNumerologyRequest
): Promise<NumerologyResponseDto> {
  const response = await apiClient.post<NumerologyResponseDto>(
    API_ENDPOINTS.NUMEROLOGY.CALCULATE,
    data
  );
  return response.data;
}

/**
 * Obtiene mi perfil numerológico (requiere auth)
 */
export async function getMyNumerologyProfile(): Promise<NumerologyResponseDto> {
  const response = await apiClient.get<NumerologyResponseDto>(API_ENDPOINTS.NUMEROLOGY.MY_PROFILE);
  return response.data;
}

/**
 * Obtiene interpretación IA del perfil numerológico del usuario (PREMIUM).
 *
 * El endpoint del backend puede devolver una interpretación existente o generar una nueva
 * según la lógica del servidor. En este wrapper, si la respuesta es 401 (no autenticado)
 * o 403 (usuario no premium), se retorna `null` en lugar de propagar el error.
 */
export async function getMyNumerologyInterpretation(): Promise<NumerologyInterpretationResponseDto | null> {
  try {
    const response = await apiClient.post<NumerologyInterpretationResponseDto>(
      API_ENDPOINTS.NUMEROLOGY.INTERPRET
    );
    return response.data;
  } catch (error) {
    // Si es 403 (no premium) o 401 (no autenticado), retornar null
    if (error instanceof AxiosError) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        return null;
      }
    }
    throw error;
  }
}

/**
 * Genera interpretación IA (PREMIUM)
 */
export async function generateNumerologyInterpretation(): Promise<NumerologyInterpretationResponseDto> {
  const response = await apiClient.post<NumerologyInterpretationResponseDto>(
    API_ENDPOINTS.NUMEROLOGY.INTERPRET
  );
  return response.data;
}

/**
 * Obtiene todos los significados
 */
export async function getAllNumerologyMeanings(): Promise<NumerologyMeaning[]> {
  const response = await apiClient.get<NumerologyMeaning[]>(API_ENDPOINTS.NUMEROLOGY.MEANINGS);
  return response.data;
}

/**
 * Obtiene significado de un número
 */
export async function getNumerologyMeaning(number: number): Promise<NumerologyMeaning> {
  const response = await apiClient.get<NumerologyMeaning>(
    API_ENDPOINTS.NUMEROLOGY.MEANING_BY_NUMBER(number)
  );
  return response.data;
}

/**
 * Obtiene número del día actual
 */
export async function getDayNumber(): Promise<DayNumberResponse> {
  const response = await apiClient.get<DayNumberResponse>(API_ENDPOINTS.NUMEROLOGY.DAY_NUMBER);
  return response.data;
}
