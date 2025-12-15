/**
 * Shared Reading API Service
 *
 * Public API functions for accessing shared readings (no authentication required)
 */
import axios, { type AxiosInstance } from 'axios';
import { API_ENDPOINTS } from './endpoints';
import type { ReadingDetail } from '@/types';

/**
 * Create a public Axios client for shared readings (no authentication)
 * Exported for testing purposes
 */
export const createPublicClient = (): AxiosInstance => {
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * Public Axios client for shared readings (no authentication)
 */
export const publicClient = createPublicClient();

/**
 * Get shared reading by token (public endpoint, no auth required)
 *
 * @param token - Unique share token for the reading
 * @returns Promise<ReadingDetail> The shared reading details
 * @throws Error with clear message on failure
 */
export async function getSharedReading(token: string): Promise<ReadingDetail> {
  try {
    const response = await publicClient.get<ReadingDetail>(API_ENDPOINTS.SHARED.BY_TOKEN(token));
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        throw new Error('Lectura compartida no encontrada o ya no está disponible');
      }
    }
    throw new Error('Error al obtener la lectura compartida');
  }
}
