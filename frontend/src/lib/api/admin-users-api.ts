/**
 * API functions for admin users management
 */

import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type {
  UserFilters,
  AdminUsersResponse,
  UserDetail,
  BanUserDto,
  UpdateUserPlanDto,
  AdminActionResponse,
} from '@/types/admin-users.types';

/**
 * Obtener lista de usuarios con filtros y paginación
 */
export async function fetchAdminUsers(filters: UserFilters = {}): Promise<AdminUsersResponse> {
  const response = await apiClient.get<AdminUsersResponse>(API_ENDPOINTS.ADMIN.USERS, {
    params: filters,
  });
  return response.data;
}

/**
 * Obtener detalle de un usuario con estadísticas
 */
export async function fetchUserDetail(userId: number): Promise<UserDetail> {
  const response = await apiClient.get<UserDetail>(API_ENDPOINTS.ADMIN.USER_BY_ID(userId));
  return response.data;
}

/**
 * Banear usuario
 */
export async function banUser(userId: number, data: BanUserDto): Promise<AdminActionResponse> {
  const response = await apiClient.post<AdminActionResponse>(
    API_ENDPOINTS.ADMIN.BAN_USER(userId),
    data
  );
  return response.data;
}

/**
 * Desbanear usuario
 */
export async function unbanUser(userId: number): Promise<AdminActionResponse> {
  const response = await apiClient.post<AdminActionResponse>(
    API_ENDPOINTS.ADMIN.UNBAN_USER(userId)
  );
  return response.data;
}

/**
 * Actualizar plan de usuario
 */
export async function updateUserPlan(
  userId: number,
  data: UpdateUserPlanDto
): Promise<AdminActionResponse> {
  const response = await apiClient.patch<AdminActionResponse>(
    API_ENDPOINTS.ADMIN.UPDATE_USER_PLAN(userId),
    data
  );
  return response.data;
}

/**
 * Agregar rol TAROTIST a usuario
 */
export async function addTarotistRole(userId: number): Promise<AdminActionResponse> {
  const response = await apiClient.post<AdminActionResponse>(
    API_ENDPOINTS.ADMIN.ADD_TAROTIST_ROLE(userId)
  );
  return response.data;
}

/**
 * Remover rol TAROTIST de usuario
 */
export async function removeTarotistRole(userId: number): Promise<AdminActionResponse> {
  const response = await apiClient.delete<AdminActionResponse>(
    API_ENDPOINTS.ADMIN.REMOVE_TAROTIST_ROLE(userId)
  );
  return response.data;
}

/**
 * Agregar rol ADMIN a usuario
 */
export async function addAdminRole(userId: number): Promise<AdminActionResponse> {
  const response = await apiClient.post<AdminActionResponse>(
    API_ENDPOINTS.ADMIN.ADD_ADMIN_ROLE(userId)
  );
  return response.data;
}

/**
 * Remover rol ADMIN de usuario
 */
export async function removeAdminRole(userId: number): Promise<AdminActionResponse> {
  const response = await apiClient.delete<AdminActionResponse>(
    API_ENDPOINTS.ADMIN.REMOVE_ADMIN_ROLE(userId)
  );
  return response.data;
}
