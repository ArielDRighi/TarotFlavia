/**
 * Admin Plans React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllPlans, fetchPlanByType, updatePlanConfig } from '@/lib/api/admin-plans-api';
import type { PlanType, UpdatePlanConfigDto } from '@/types/admin.types';

/**
 * Hook para obtener todas las configuraciones de planes
 * @returns Query con todas las configuraciones de planes
 */
export function usePlans() {
  return useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: fetchAllPlans,
    staleTime: 5 * 60 * 1000, // 5 minutos - estos datos no cambian frecuentemente
  });
}

/**
 * Hook para obtener la configuración de un plan específico
 * @param planType - Tipo de plan
 * @returns Query con la configuración del plan
 */
export function usePlan(planType: PlanType) {
  return useQuery({
    queryKey: ['admin', 'plans', planType],
    queryFn: () => fetchPlanByType(planType),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para actualizar la configuración de un plan
 * @returns Mutation para actualizar un plan
 */
export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planType, data }: { planType: PlanType; data: UpdatePlanConfigDto }) =>
      updatePlanConfig(planType, data),
    onSuccess: (data, variables) => {
      // Invalidar lista completa de planes
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
      // Invalidar plan específico
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans', variables.planType] });
    },
  });
}
