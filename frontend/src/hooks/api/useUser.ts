/**
 * TanStack Query hooks for user API
 *
 * Custom hooks using TanStack Query for user data fetching and caching.
 * These hooks consume the user-api functions and provide reactive data management.
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/utils/useToast';
import { useAuthStore } from '@/stores/authStore';
import { getProfile, updateProfile, updatePassword, deleteAccount } from '@/lib/api/user-api';
import { numerologyQueryKeys } from '@/hooks/api/useNumerology';
import type { UpdateProfileDto, UpdatePasswordDto } from '@/types';

// ============================================================================
// Query Keys (for consistency and type safety)
// ============================================================================

export const userQueryKeys = {
  profile: ['profile'] as const,
} as const;

// ============================================================================
// User Profile Query
// ============================================================================

/**
 * Hook to fetch current user profile
 * Returns user profile with usage statistics
 */
export function useProfile() {
  return useQuery({
    queryKey: userQueryKeys.profile,
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// User Profile Mutations
// ============================================================================

/**
 * Hook to update current user profile
 * On success: invalidates profile query and numerology queries, shows toast
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileDto) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile });
      // Invalidar numerología ya que depende de birthDate y name del usuario
      queryClient.invalidateQueries({ queryKey: numerologyQueryKeys.myProfile() });
      queryClient.invalidateQueries({ queryKey: numerologyQueryKeys.myInterpretation() });
      toast.success('Perfil actualizado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar perfil');
    },
  });
}

/**
 * Hook to update user password
 * On success: shows success toast
 */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: UpdatePasswordDto) => updatePassword(data),
    onSuccess: () => {
      toast.success('Contraseña actualizada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar contraseña');
    },
  });
}

/**
 * Hook to delete user account
 * On success: logs out the user and shows toast
 */
export function useDeleteAccount() {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: (id: number) => deleteAccount(id),
    onSuccess: () => {
      logout();
      toast.success('Cuenta eliminada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar cuenta');
    },
  });
}
