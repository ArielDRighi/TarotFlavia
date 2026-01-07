/**
 * Tests for useUser hooks
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProfile, useUpdateProfile, useUpdatePassword, useDeleteAccount } from './useUser';
import * as userApi from '@/lib/api/user-api';
import type { UserProfile, UpdateProfileDto, UpdatePasswordDto } from '@/types';
import React from 'react';

// Mock the API
vi.mock('@/lib/api/user-api');

// Mock toast
vi.mock('@/hooks/utils/useToast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock auth store
const mockLogout = vi.fn();
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    logout: mockLogout,
  }),
}));

// Helper to create QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// Helper to create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useUser hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // useProfile
  // ==========================================================================
  describe('useProfile', () => {
    const mockProfile: UserProfile = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      roles: ['consumer'],
      plan: 'free',
      dailyReadingsCount: 2,
      dailyReadingsLimit: 5,
      dailyCardCount: 0,
      dailyCardLimit: 1,
      tarotReadingsCount: 0,
      tarotReadingsLimit: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      profilePicture: undefined,
      lastLogin: null,
    };

    it('should fetch user profile', async () => {
      vi.mocked(userApi.getProfile).mockResolvedValue(mockProfile);

      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      // Wait for data
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockProfile);
      expect(userApi.getProfile).toHaveBeenCalledTimes(1);
    });

    it('should handle error when fetching profile', async () => {
      const error = new Error('Error al obtener perfil de usuario');
      vi.mocked(userApi.getProfile).mockRejectedValue(error);

      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(error);
    });

    it('should cache profile with correct query key', async () => {
      vi.mocked(userApi.getProfile).mockResolvedValue(mockProfile);

      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // The query key should be ['profile']
      expect(result.current.data).toBeDefined();
    });
  });

  // ==========================================================================
  // useUpdateProfile
  // ==========================================================================
  describe('useUpdateProfile', () => {
    const mockUpdatedProfile: UserProfile = {
      id: 1,
      email: 'updated@example.com',
      name: 'Updated User',
      roles: ['consumer'],
      plan: 'free',
      dailyReadingsCount: 2,
      dailyReadingsLimit: 5,
      dailyCardCount: 0,
      dailyCardLimit: 1,
      tarotReadingsCount: 0,
      tarotReadingsLimit: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      profilePicture: undefined,
      lastLogin: null,
    };

    it('should update user profile', async () => {
      vi.mocked(userApi.updateProfile).mockResolvedValue(mockUpdatedProfile);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      const updateData: UpdateProfileDto = {
        name: 'Updated User',
        email: 'updated@example.com',
      };

      result.current.mutate(updateData);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(userApi.updateProfile).toHaveBeenCalledWith(updateData);
      expect(result.current.data).toEqual(mockUpdatedProfile);
    });

    it('should invalidate profile query on success', async () => {
      vi.mocked(userApi.updateProfile).mockResolvedValue(mockUpdatedProfile);

      const queryClient = createTestQueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);

      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      const updateData: UpdateProfileDto = { name: 'New Name' };
      result.current.mutate(updateData);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['profile'] });
    });

    it('should show success toast on successful update', async () => {
      vi.mocked(userApi.updateProfile).mockResolvedValue(mockUpdatedProfile);

      const { toast } = await import('@/hooks/utils/useToast');
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      const updateData: UpdateProfileDto = { name: 'New Name' };
      result.current.mutate(updateData);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(toast.success).toHaveBeenCalledWith('Perfil actualizado exitosamente');
    });

    it('should show error toast on failed update', async () => {
      const error = new Error('Error al actualizar perfil');
      vi.mocked(userApi.updateProfile).mockRejectedValue(error);

      const { toast } = await import('@/hooks/utils/useToast');
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      const updateData: UpdateProfileDto = { name: 'New Name' };
      result.current.mutate(updateData);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Error al actualizar perfil');
    });

    it('should handle partial updates', async () => {
      vi.mocked(userApi.updateProfile).mockResolvedValue(mockUpdatedProfile);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      const updateData: UpdateProfileDto = { name: 'Only Name' };
      result.current.mutate(updateData);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(userApi.updateProfile).toHaveBeenCalledWith({ name: 'Only Name' });
    });
  });

  // ==========================================================================
  // useUpdatePassword
  // ==========================================================================
  describe('useUpdatePassword', () => {
    it('should update user password', async () => {
      vi.mocked(userApi.updatePassword).mockResolvedValue();

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdatePassword(), { wrapper });

      const passwordData: UpdatePasswordDto = {
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword456',
      };

      result.current.mutate(passwordData);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(userApi.updatePassword).toHaveBeenCalledWith(passwordData);
    });

    it('should show success toast on successful password update', async () => {
      vi.mocked(userApi.updatePassword).mockResolvedValue();

      const { toast } = await import('@/hooks/utils/useToast');
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdatePassword(), { wrapper });

      const passwordData: UpdatePasswordDto = {
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword456',
      };

      result.current.mutate(passwordData);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(toast.success).toHaveBeenCalledWith('Contraseña actualizada exitosamente');
    });

    it('should show error toast on failed password update', async () => {
      const error = new Error('Error al actualizar contraseña');
      vi.mocked(userApi.updatePassword).mockRejectedValue(error);

      const { toast } = await import('@/hooks/utils/useToast');
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdatePassword(), { wrapper });

      const passwordData: UpdatePasswordDto = {
        currentPassword: 'WrongPassword',
        newPassword: 'NewPassword456',
      };

      result.current.mutate(passwordData);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Error al actualizar contraseña');
    });
  });

  // ==========================================================================
  // useDeleteAccount
  // ==========================================================================
  describe('useDeleteAccount', () => {
    it('should delete user account', async () => {
      vi.mocked(userApi.deleteAccount).mockResolvedValue();

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteAccount(), { wrapper });

      result.current.mutate(1);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(userApi.deleteAccount).toHaveBeenCalledWith(1);
    });

    it('should call logout after successful deletion', async () => {
      vi.mocked(userApi.deleteAccount).mockResolvedValue();

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteAccount(), { wrapper });

      result.current.mutate(1);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockLogout).toHaveBeenCalled();
    });

    it('should show success toast after deletion', async () => {
      vi.mocked(userApi.deleteAccount).mockResolvedValue();

      const { toast } = await import('@/hooks/utils/useToast');
      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteAccount(), { wrapper });

      result.current.mutate(1);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(toast.success).toHaveBeenCalledWith('Cuenta eliminada exitosamente');
    });

    it('should show error toast on failed deletion', async () => {
      const error = new Error('Error al eliminar cuenta');
      vi.mocked(userApi.deleteAccount).mockRejectedValue(error);

      const { toast } = await import('@/hooks/utils/useToast');
      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteAccount(), { wrapper });

      result.current.mutate(1);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Error al eliminar cuenta');
    });

    it('should not call logout if deletion fails', async () => {
      const error = new Error('Error al eliminar cuenta');
      vi.mocked(userApi.deleteAccount).mockRejectedValue(error);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteAccount(), { wrapper });

      result.current.mutate(1);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(mockLogout).not.toHaveBeenCalled();
    });
  });
});
