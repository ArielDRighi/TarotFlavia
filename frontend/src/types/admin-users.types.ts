/**
 * Admin Users Types
 *
 * Tipos para la gestión de usuarios desde el panel admin
 * Refleja el contrato del backend en /admin/users
 */

import type { UserRole, UserPlan, User } from './user.types';

/**
 * Filtros para búsqueda de usuarios (query params)
 * Backend: UserQueryDto
 */
export interface UserFilters {
  search?: string;
  role?: UserRole;
  plan?: UserPlan;
  banned?: boolean;
  sortBy?: 'createdAt' | 'lastLogin' | 'email' | 'name';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

/**
 * Usuario con información adicional para admin
 */
export interface AdminUser extends User {
  bannedAt: string | null;
  banReason: string | null;
}

/**
 * Respuesta paginada de usuarios
 * Backend: Usa el formato estándar de paginación
 */
export interface AdminUsersResponse {
  data: AdminUser[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * Detalle de usuario con estadísticas
 * Backend: getUserDetail()
 */
export interface UserDetail extends AdminUser {
  stats: {
    totalReadings: number;
    readingsLast7Days: number;
    readingsLast30Days: number;
  };
}

/**
 * DTO para banear usuario
 */
export interface BanUserDto {
  reason: string;
}

/**
 * DTO para actualizar plan
 */
export interface UpdateUserPlanDto {
  plan: UserPlan;
}

/**
 * Respuesta de acciones admin (ban, unban, update plan, etc)
 */
export interface AdminActionResponse {
  message: string;
  user: AdminUser;
}
