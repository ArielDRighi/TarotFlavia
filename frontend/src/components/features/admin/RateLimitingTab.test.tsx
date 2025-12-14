/**
 * Tests for RateLimitingTab component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RateLimitingTab } from './RateLimitingTab';
import * as useAdminSecurity from '@/hooks/api/useAdminSecurity';

vi.mock('@/hooks/api/useAdminSecurity');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
};

describe('RateLimitingTab', () => {
  it('should render stats cards when data is loaded', () => {
    vi.mocked(useAdminSecurity.useRateLimitData).mockReturnValue({
      data: {
        violations: [
          {
            ipAddress: '192.168.1.1',
            count: 10,
            firstViolation: '2024-01-01T10:00:00Z',
            lastViolation: '2024-01-01T11:00:00Z',
          },
        ],
        blockedIPs: [
          {
            ipAddress: '10.0.0.1',
            reason: 'Excessive violations',
            blockedAt: '2024-01-01T12:00:00Z',
            expiresAt: '2024-01-08T12:00:00Z',
          },
        ],
        stats: {
          totalViolations: 10,
          totalBlockedIps: 1,
          activeViolationsCount: 1,
        },
      },
      isLoading: false,
      error: null,
    } as never);

    render(<RateLimitingTab />, { wrapper: createWrapper() });

    expect(screen.getByText('Total Violaciones')).toBeInTheDocument();
    expect(screen.getByText('IPs con Violaciones Activas')).toBeInTheDocument();
    const blockedTexts = screen.getAllByText('IPs Bloqueadas');
    expect(blockedTexts.length).toBeGreaterThan(0);
  });

  it('should show loading state', () => {
    vi.mocked(useAdminSecurity.useRateLimitData).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as never);

    render(<RateLimitingTab />, { wrapper: createWrapper() });

    // Verificar que hay skeletons (elemento de carga)
    const skeletons = screen.getAllByTestId(/skeleton/i);
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
