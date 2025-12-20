/**
 * User API Service
 *
 * Functions for all user-related API calls.
 * These are pure API functions - use TanStack Query hooks in hooks/api/ for data fetching.
 */
import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import { AxiosError } from 'axios';
import type { UserProfile, UpdateProfileDto, UpdatePasswordDto } from '@/types';

// ============================================================================
// User Profile
// ============================================================================

/**
 * Fetch current user profile
 * @returns Promise<UserProfile> User profile with usage stats
 * @throws Error with clear message on failure
 */
export async function getProfile(): Promise<UserProfile> {
  try {
    const response = await apiClient.get<UserProfile>(API_ENDPOINTS.USERS.PROFILE);
    return response.data;
  } catch {
    throw new Error('Error al obtener perfil de usuario');
  }
}

/**
 * Update current user profile
 * @param data - UpdateProfileDto with fields to update
 * @returns Promise<UserProfile> Updated user profile
 * @throws Error with clear message on failure
 */
export async function updateProfile(data: UpdateProfileDto): Promise<UserProfile> {
  try {
    const response = await apiClient.patch<UserProfile>(API_ENDPOINTS.USERS.PROFILE, data);
    return response.data;
  } catch {
    throw new Error('Error al actualizar perfil');
  }
}

/**
 * Update user password
 * @param data - UpdatePasswordDto with current and new password
 * @returns Promise<void>
 * @throws Error with clear message on failure
 */
export async function updatePassword(data: UpdatePasswordDto): Promise<void> {
  try {
    await apiClient.patch(API_ENDPOINTS.USERS.PASSWORD, data);
  } catch (error: unknown) {
    // Manejar diferentes tipos de errores del backend
    if (error instanceof AxiosError) {
      if (error.response?.status === 400) {
        throw new Error('La contraseña actual es incorrecta');
      }
    }
    throw new Error('Error al actualizar contraseña');
  }
}

/**
 * Delete user account
 * @param id - User ID to delete
 * @returns Promise<void>
 * @throws Error with clear message on failure
 */
export async function deleteAccount(id: number): Promise<void> {
  try {
    await apiClient.delete(API_ENDPOINTS.USERS.BY_ID(id));
  } catch {
    throw new Error('Error al eliminar cuenta');
  }
}
