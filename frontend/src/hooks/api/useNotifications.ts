'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '@/lib/api/notifications-api';
import type { NotificationFilters } from '@/types';

/**
 * Query keys for notification-related queries
 * Used for cache invalidation and refetching
 */
export const notificationKeys = {
  all: ['notifications'] as const,
  list: (filters?: NotificationFilters) => [...notificationKeys.all, 'list', filters] as const,
  count: () => [...notificationKeys.all, 'count'] as const,
};

/**
 * Hook para obtener lista de notificaciones con filtros opcionales
 * Auto-refetch cada 5 minutos para mantener notificaciones actualizadas
 *
 * @param filters - Filtros opcionales (unreadOnly, type, limit, offset)
 * @returns Query con lista de notificaciones
 *
 * @example
 * ```tsx
 * const { data: notifications } = useNotifications({ unreadOnly: true });
 * ```
 */
export function useNotifications(filters?: NotificationFilters) {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => getNotifications(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchInterval: 1000 * 60 * 5, // Refetch cada 5 minutos
  });
}

/**
 * Hook para obtener contador de notificaciones no leídas
 * Auto-refetch cada 5 minutos para badge en tiempo real
 *
 * @returns Query con contador
 *
 * @example
 * ```tsx
 * const { data: unreadCount } = useUnreadCount();
 * // unreadCount.count
 * ```
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.count(),
    queryFn: getUnreadCount,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchInterval: 1000 * 60 * 5, // Refetch cada 5 minutos
  });
}

/**
 * Hook para marcar una notificación como leída
 * Invalida automáticamente la lista de notificaciones y el contador
 *
 * @returns Mutation para marcar como leída
 *
 * @example
 * ```tsx
 * const markReadMutation = useMarkAsRead();
 *
 * const handleClick = () => {
 *   markReadMutation.mutate(notificationId);
 * };
 * ```
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => markAsRead(id),
    onSuccess: () => {
      // Invalidar lista de notificaciones y contador
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Hook para marcar todas las notificaciones como leídas
 * Invalida automáticamente la lista de notificaciones y el contador
 *
 * @returns Mutation para marcar todas como leídas
 *
 * @example
 * ```tsx
 * const markAllMutation = useMarkAllAsRead();
 *
 * const handleMarkAll = () => {
 *   markAllMutation.mutate();
 * };
 * ```
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: () => {
      // Invalidar lista de notificaciones y contador
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
