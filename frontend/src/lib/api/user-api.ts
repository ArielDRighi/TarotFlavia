/**
 * User API Service
 *
 * Functions for all user-related API calls.
 * These are pure API functions - use TanStack Query hooks in hooks/api/ for data fetching.
 */
import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type { UserProfile, UpdateProfileDto } from '@/types';

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
