/**
 * Hooks para la gestión de IP Whitelist desde el panel admin (T-ADM-006)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getIpWhitelist,
  addIpToWhitelist,
  removeIpFromWhitelist,
} from '@/lib/api/admin-ip-whitelist-api';
import type { WhitelistIPDto } from '@/types/admin-security.types';

const WHITELIST_QUERY_KEY = ['admin', 'security', 'ip-whitelist'] as const;

/**
 * Hook para obtener la lista de IPs en la whitelist
 */
export function useIpWhitelist() {
  return useQuery({
    queryKey: WHITELIST_QUERY_KEY,
    queryFn: getIpWhitelist,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook para agregar una IP a la whitelist
 * Invalida el cache al completarse
 */
export function useAddIpToWhitelist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: WhitelistIPDto) => addIpToWhitelist(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WHITELIST_QUERY_KEY });
    },
  });
}

/**
 * Hook para eliminar una IP de la whitelist
 * Invalida el cache al completarse
 */
export function useRemoveIpFromWhitelist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: WhitelistIPDto) => removeIpFromWhitelist(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WHITELIST_QUERY_KEY });
    },
  });
}
