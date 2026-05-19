/**
 * usePrimaryTarotista Hook
 *
 * Resuelve el tarotista "primario" de la plataforma consultando el
 * endpoint admin de tarotistas con isActive=true y limit=1.
 *
 * Reemplaza la constante hardcodeada `FLAVIA_TAROTISTA_ID = 1` en
 * AgendaManagementContent — T-BUG-007-B (ex T-BUG-013).
 */

import { useAdminTarotistas } from './useAdminTarotistas';
import type { AdminTarotista } from '@/types/admin-tarotistas.types';

export interface UsePrimaryTarotistaResult {
  primaryTarotista: AdminTarotista | undefined;
  primaryTarotistaId: number | undefined;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

/**
 * Hook para obtener el tarotista principal de la plataforma.
 * Usa el primer tarotista activo devuelto por el endpoint admin.
 *
 * @returns Objeto con primaryTarotista, primaryTarotistaId y estados de la query
 */
export function usePrimaryTarotista(): UsePrimaryTarotistaResult {
  const { data, isLoading, isError, isSuccess } = useAdminTarotistas({
    isActive: true,
    limit: 1,
    page: 1,
  });

  const primaryTarotista = data?.data[0];
  const primaryTarotistaId = primaryTarotista?.id;

  return {
    primaryTarotista,
    primaryTarotistaId,
    isLoading,
    isError,
    isSuccess,
  };
}
