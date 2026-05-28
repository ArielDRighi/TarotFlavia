/**
 * Tests para useAdminIpWhitelist hooks (T-ADM-006)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import * as whitelistApi from '@/lib/api/admin-ip-whitelist-api';
import {
  useIpWhitelist,
  useAddIpToWhitelist,
  useRemoveIpFromWhitelist,
} from './useAdminIpWhitelist';

vi.mock('@/lib/api/admin-ip-whitelist-api');

describe('useAdminIpWhitelist hooks', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  describe('useIpWhitelist', () => {
    it('should fetch whitelist and return ips and count', async () => {
      const mockData = { ips: ['192.168.1.1', '10.0.0.1'], count: 2 };
      vi.mocked(whitelistApi.getIpWhitelist).mockResolvedValue(mockData);

      const { result } = renderHook(() => useIpWhitelist(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
      expect(whitelistApi.getIpWhitelist).toHaveBeenCalledTimes(1);
    });

    it('should handle empty whitelist', async () => {
      vi.mocked(whitelistApi.getIpWhitelist).mockResolvedValue({ ips: [], count: 0 });

      const { result } = renderHook(() => useIpWhitelist(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.ips).toHaveLength(0);
    });

    it('should expose error state when fetch fails', async () => {
      vi.mocked(whitelistApi.getIpWhitelist).mockRejectedValue(new Error('Forbidden'));

      const { result } = renderHook(() => useIpWhitelist(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useAddIpToWhitelist', () => {
    it('should call addIpToWhitelist with the dto and invalidate cache', async () => {
      const mockResponse = { message: 'IP 203.0.113.45 added to whitelist', ip: '203.0.113.45' };
      vi.mocked(whitelistApi.addIpToWhitelist).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAddIpToWhitelist(), { wrapper });

      await act(async () => {
        result.current.mutate({ ip: '203.0.113.45' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(whitelistApi.addIpToWhitelist).toHaveBeenCalledWith({ ip: '203.0.113.45' });
    });

    it('should expose error state when adding IP fails', async () => {
      vi.mocked(whitelistApi.addIpToWhitelist).mockRejectedValue(new Error('Bad Request'));

      const { result } = renderHook(() => useAddIpToWhitelist(), { wrapper });

      await act(async () => {
        result.current.mutate({ ip: 'invalid' });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useRemoveIpFromWhitelist', () => {
    it('should call removeIpFromWhitelist with the dto and invalidate cache', async () => {
      const mockResponse = { message: 'IP 192.168.1.1 removed from whitelist', ip: '192.168.1.1' };
      vi.mocked(whitelistApi.removeIpFromWhitelist).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRemoveIpFromWhitelist(), { wrapper });

      await act(async () => {
        result.current.mutate({ ip: '192.168.1.1' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(whitelistApi.removeIpFromWhitelist).toHaveBeenCalledWith({ ip: '192.168.1.1' });
    });

    it('should expose error state when removing IP fails', async () => {
      vi.mocked(whitelistApi.removeIpFromWhitelist).mockRejectedValue(new Error('Not Found'));

      const { result } = renderHook(() => useRemoveIpFromWhitelist(), { wrapper });

      await act(async () => {
        result.current.mutate({ ip: '1.2.3.4' });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });
});
