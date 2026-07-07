import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './axios-config';
import { getIpWhitelist, addIpToWhitelist, removeIpFromWhitelist } from './admin-ip-whitelist-api';
import { API_ENDPOINTS } from './endpoints';
import type { WhitelistResponse, WhitelistActionResponse } from '@/types/admin-security.types';

vi.mock('./axios-config');

describe('admin-ip-whitelist-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getIpWhitelist', () => {
    it('should call GET /admin/ip-whitelist and return whitelist data', async () => {
      const mockResponse: WhitelistResponse = {
        ips: ['192.168.1.1', '10.0.0.1'],
        count: 2,
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      const result = await getIpWhitelist();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.IP_WHITELIST);
      expect(result).toEqual(mockResponse);
    });

    it('should return empty whitelist when no IPs are configured', async () => {
      const mockResponse: WhitelistResponse = { ips: [], count: 0 };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      const result = await getIpWhitelist();

      expect(result.ips).toHaveLength(0);
      expect(result.count).toBe(0);
    });

    it('should propagate errors from the API', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      await expect(getIpWhitelist()).rejects.toThrow('Network error');
    });
  });

  describe('addIpToWhitelist', () => {
    it('should call POST /admin/ip-whitelist with the IP dto', async () => {
      const mockResponse: WhitelistActionResponse = {
        message: 'IP 203.0.113.45 added to whitelist',
        ip: '203.0.113.45',
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      const result = await addIpToWhitelist({ ip: '203.0.113.45' });

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.IP_WHITELIST, {
        ip: '203.0.113.45',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors when adding IP fails', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Bad Request'));

      await expect(addIpToWhitelist({ ip: 'invalid-ip' })).rejects.toThrow('Bad Request');
    });
  });

  describe('removeIpFromWhitelist', () => {
    it('should call DELETE /admin/ip-whitelist with the IP in the body', async () => {
      const mockResponse: WhitelistActionResponse = {
        message: 'IP 203.0.113.45 removed from whitelist',
        ip: '203.0.113.45',
      };
      vi.mocked(apiClient.delete).mockResolvedValue({ data: mockResponse });

      const result = await removeIpFromWhitelist({ ip: '203.0.113.45' });

      expect(apiClient.delete).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.IP_WHITELIST, {
        data: { ip: '203.0.113.45' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors when removing IP fails', async () => {
      vi.mocked(apiClient.delete).mockRejectedValue(new Error('Not Found'));

      await expect(removeIpFromWhitelist({ ip: '1.2.3.4' })).rejects.toThrow('Not Found');
    });
  });
});
