/**
 * Hooks for admin user actions (mutations)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  banUser,
  unbanUser,
  updateUserPlan,
  addTarotistRole,
  removeTarotistRole,
  addAdminRole,
  removeAdminRole,
} from '@/lib/api/admin-users-api';
import type { UpdateUserPlanDto } from '@/types/admin-users.types';

/**
 * Hook para banear usuario
 */
export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: number; reason: string }) =>
      banUser(userId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

/**
 * Hook para desbanear usuario
 */
export function useUnbanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => unbanUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

/**
 * Hook para actualizar plan de usuario
 */
export function useUpdateUserPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, plan }: { userId: number; plan: UpdateUserPlanDto['plan'] }) =>
      updateUserPlan(userId, { plan }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

/**
 * Hook para agregar rol TAROTIST
 */
export function useAddTarotistRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => addTarotistRole(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

/**
 * Hook para remover rol TAROTIST
 */
export function useRemoveTarotistRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => removeTarotistRole(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

/**
 * Hook para agregar rol ADMIN
 */
export function useAddAdminRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => addAdminRole(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

/**
 * Hook para remover rol ADMIN
 */
export function useRemoveAdminRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => removeAdminRole(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
