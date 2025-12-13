/**
 * Admin Tarotistas API Hooks
 *
 * React Query hooks para gestión de tarotistas desde admin panel
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios-config';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  AdminTarotistasFilters,
  AdminTarotistasResponse,
  ApplicationsFilters,
  ApplicationsResponse,
} from '@/types/admin-tarotistas.types';

/**
 * Hook para obtener lista de tarotistas (admin)
 */
export function useAdminTarotistas(filters?: AdminTarotistasFilters) {
  return useQuery<AdminTarotistasResponse>({
    queryKey: ['admin', 'tarotistas', filters],
    queryFn: async () => {
      const params = {
        page: filters?.page ?? 1,
        limit: filters?.limit ?? 10,
        ...(filters?.search && { search: filters.search }),
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
        ...(filters?.sortBy && { sortBy: filters.sortBy }),
        ...(filters?.sortOrder && { sortOrder: filters.sortOrder }),
      };

      const response = await apiClient.get<AdminTarotistasResponse>(
        API_ENDPOINTS.ADMIN.TAROTISTAS,
        { params }
      );
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
}

/**
 * Hook para obtener aplicaciones de tarotistas (admin)
 */
export function useTarotistaApplications(filters?: ApplicationsFilters) {
  return useQuery<ApplicationsResponse>({
    queryKey: ['admin', 'tarotista-applications', filters],
    queryFn: async () => {
      const params = {
        page: filters?.page ?? 1,
        limit: filters?.limit ?? 10,
        ...(filters?.status && { status: filters.status }),
      };

      const response = await apiClient.get<ApplicationsResponse>(
        API_ENDPOINTS.ADMIN.TAROTISTA_APPLICATIONS,
        { params }
      );
      return response.data;
    },
    staleTime: 30 * 1000, // 30 segundos (más frecuente para aplicaciones pendientes)
  });
}
