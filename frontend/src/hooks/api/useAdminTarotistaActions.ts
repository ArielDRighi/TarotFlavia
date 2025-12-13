/**
 * Admin Tarotista Actions Hooks
 *
 * React Query mutations para acciones sobre tarotistas y aplicaciones
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios-config';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { adminTarotistasQueryKeys, tarotistaApplicationsQueryKeys } from './useAdminTarotistas';
import type { TarotistaApplication } from '@/types/admin-tarotistas.types';

/**
 * Hook para desactivar tarotista
 */
export function useDeactivateTarotista() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, number>({
    mutationFn: async (tarotistaId: number) => {
      const response = await apiClient.put<{ message: string }>(
        API_ENDPOINTS.ADMIN.DEACTIVATE_TAROTISTA(tarotistaId)
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tarotistas'] });
    },
  });
}

/**
 * Hook para reactivar tarotista
 */
export function useReactivateTarotista() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, number>({
    mutationFn: async (tarotistaId: number) => {
      const response = await apiClient.put<{ message: string }>(
        API_ENDPOINTS.ADMIN.REACTIVATE_TAROTISTA(tarotistaId)
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tarotistas'] });
    },
  });
}

/**
 * Hook para aprobar aplicación de tarotista
 */
export function useApproveApplication() {
  const queryClient = useQueryClient();

  return useMutation<TarotistaApplication, Error, { id: number; adminNotes?: string }>({
    mutationFn: async ({ id, adminNotes }) => {
      const response = await apiClient.post<TarotistaApplication>(
        API_ENDPOINTS.ADMIN.APPROVE_APPLICATION(id),
        adminNotes ? { adminNotes } : {}
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tarotistaApplicationsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: adminTarotistasQueryKeys.all });
    },
  });
}

/**
 * Hook para rechazar aplicación de tarotista
 */
export function useRejectApplication() {
  const queryClient = useQueryClient();

  return useMutation<TarotistaApplication, Error, { id: number; adminNotes: string }>({
    mutationFn: async ({ id, adminNotes }) => {
      const response = await apiClient.post<TarotistaApplication>(
        API_ENDPOINTS.ADMIN.REJECT_APPLICATION(id),
        { adminNotes }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tarotistaApplicationsQueryKeys.all });
    },
  });
}
