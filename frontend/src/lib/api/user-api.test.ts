/**
 * User API Service Tests
 *
 * Tests para el servicio de API de usuarios
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import { getProfile, updateProfile, deleteAccount } from './user-api';
import type { UserProfile, UpdateProfileDto } from '@/types';

// Mock apiClient
vi.mock('./axios-config', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('user-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // getProfile
  // ==========================================================================
  describe('getProfile', () => {
    const mockProfile: UserProfile = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      roles: ['consumer'],
      plan: 'free',
      dailyReadingsCount: 2,
      dailyReadingsLimit: 5,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      profilePicture: undefined,
      lastLogin: null,
    };

    it('should fetch user profile from API', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockProfile });

      const result = await getProfile();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.USERS.PROFILE);
      expect(result).toEqual(mockProfile);
    });

    it('should throw error with clear message on failure', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(getProfile()).rejects.toThrow('Error al obtener perfil de usuario');
    });

    it('should return profile with usage stats', async () => {
      const profileWithStats = {
        ...mockProfile,
        dailyReadingsCount: 3,
        dailyReadingsLimit: 10,
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: profileWithStats });

      const result = await getProfile();

      expect(result.dailyReadingsCount).toBe(3);
      expect(result.dailyReadingsLimit).toBe(10);
    });
  });

  // ==========================================================================
  // updateProfile
  // ==========================================================================
  describe('updateProfile', () => {
    const mockUpdatedProfile: UserProfile = {
      id: 1,
      email: 'updated@example.com',
      name: 'Updated User',
      roles: ['consumer'],
      plan: 'free',
      dailyReadingsCount: 2,
      dailyReadingsLimit: 5,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      profilePicture: undefined,
      lastLogin: null,
    };

    it('should update user profile with provided data', async () => {
      const updateData: UpdateProfileDto = {
        name: 'Updated User',
        email: 'updated@example.com',
      };

      vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: mockUpdatedProfile });

      const result = await updateProfile(updateData);

      expect(apiClient.patch).toHaveBeenCalledWith(API_ENDPOINTS.USERS.ME, updateData);
      expect(result).toEqual(mockUpdatedProfile);
    });

    it('should update only name when only name is provided', async () => {
      const updateData: UpdateProfileDto = { name: 'New Name' };

      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { ...mockUpdatedProfile, name: 'New Name' },
      });

      const result = await updateProfile(updateData);

      expect(apiClient.patch).toHaveBeenCalledWith(API_ENDPOINTS.USERS.ME, updateData);
      expect(result.name).toBe('New Name');
    });

    it('should update only email when only email is provided', async () => {
      const updateData: UpdateProfileDto = { email: 'newemail@example.com' };

      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { ...mockUpdatedProfile, email: 'newemail@example.com' },
      });

      const result = await updateProfile(updateData);

      expect(apiClient.patch).toHaveBeenCalledWith(API_ENDPOINTS.USERS.ME, updateData);
      expect(result.email).toBe('newemail@example.com');
    });

    it('should update password when password is provided', async () => {
      const updateData: UpdateProfileDto = { password: 'newPassword123' };

      vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: mockUpdatedProfile });

      const result = await updateProfile(updateData);

      expect(apiClient.patch).toHaveBeenCalledWith(API_ENDPOINTS.USERS.ME, updateData);
      expect(result).toEqual(mockUpdatedProfile);
    });

    it('should update profile picture when provided', async () => {
      const updateData: UpdateProfileDto = {
        profilePicture: 'https://example.com/avatar.jpg',
      };

      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { ...mockUpdatedProfile, profilePicture: 'https://example.com/avatar.jpg' },
      });

      const result = await updateProfile(updateData);

      expect(apiClient.patch).toHaveBeenCalledWith(API_ENDPOINTS.USERS.ME, updateData);
      expect(result.profilePicture).toBe('https://example.com/avatar.jpg');
    });

    it('should throw error with clear message on failure', async () => {
      const updateData: UpdateProfileDto = { name: 'Test' };
      vi.mocked(apiClient.patch).mockRejectedValueOnce(new Error('Network error'));

      await expect(updateProfile(updateData)).rejects.toThrow('Error al actualizar perfil');
    });
  });

  // ==========================================================================
  // deleteAccount
  // ==========================================================================
  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({
        data: { message: 'Usuario eliminado exitosamente' },
      });

      await deleteAccount(1);

      expect(apiClient.delete).toHaveBeenCalledWith(API_ENDPOINTS.USERS.BY_ID(1));
    });

    it('should throw error with clear message on failure', async () => {
      vi.mocked(apiClient.delete).mockRejectedValueOnce(new Error('Network error'));

      await expect(deleteAccount(1)).rejects.toThrow('Error al eliminar cuenta');
    });

    it('should handle 404 error when user not found', async () => {
      vi.mocked(apiClient.delete).mockRejectedValueOnce({
        response: { status: 404, data: { message: 'Usuario no encontrado' } },
      });

      await expect(deleteAccount(999)).rejects.toThrow('Error al eliminar cuenta');
    });

    it('should handle 403 error when user lacks permissions', async () => {
      vi.mocked(apiClient.delete).mockRejectedValueOnce({
        response: { status: 403, data: { message: 'Acceso denegado' } },
      });

      await expect(deleteAccount(1)).rejects.toThrow('Error al eliminar cuenta');
    });
  });
});
