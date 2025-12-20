/**
 * API functions for admin plan configuration management
 */

import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type { PlanConfig, PlanType, UpdatePlanConfigDto } from '@/types/admin.types';

/**
 * Obtener todas las configuraciones de planes
 */
export async function fetchAllPlans(): Promise<PlanConfig[]> {
  const response = await apiClient.get<PlanConfig[]>(API_ENDPOINTS.ADMIN.PLAN_CONFIG);
  return response.data;
}

/**
 * Obtener configuración de un plan específico
 */
export async function fetchPlanByType(planType: PlanType): Promise<PlanConfig> {
  const response = await apiClient.get<PlanConfig>(
    API_ENDPOINTS.ADMIN.PLAN_CONFIG_BY_TYPE(planType)
  );
  return response.data;
}

/**
 * Actualizar configuración de un plan
 */
export async function updatePlanConfig(
  planType: PlanType,
  data: UpdatePlanConfigDto
): Promise<PlanConfig> {
  const response = await apiClient.put<PlanConfig>(
    API_ENDPOINTS.ADMIN.PLAN_CONFIG_BY_TYPE(planType),
    data
  );
  return response.data;
}
