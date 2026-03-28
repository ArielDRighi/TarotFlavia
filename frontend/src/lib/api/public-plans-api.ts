/**
 * API functions for public plan configuration (no authentication required)
 */

import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type { PlanConfig } from '@/types/admin.types';

/**
 * Obtener la configuración pública de todos los planes activos.
 * Este endpoint no requiere autenticación.
 *
 * Nota: TypeORM serializa columnas `decimal` de PostgreSQL como strings en tiempo de ejecución.
 * Normalizamos `price` a number aquí para garantizar que `.toFixed()` funcione correctamente.
 */
export async function fetchPublicPlans(): Promise<PlanConfig[]> {
  const response = await apiClient.get<PlanConfig[]>(API_ENDPOINTS.ADMIN.PLAN_CONFIG_PUBLIC);
  return response.data.map((plan) => ({
    ...plan,
    price: Number(plan.price),
  }));
}
