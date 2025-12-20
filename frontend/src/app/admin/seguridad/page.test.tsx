/**
 * Tests for Admin Seguridad Page
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminSeguridadPage from './page';
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

describe('AdminSeguridadPage', () => {
  it('should render page title and description', () => {
    vi.mocked(useAdminSecurity.useRateLimitData).mockReturnValue({
      data: {
        violations: [],
        blockedIPs: [],
        stats: {
          totalViolations: 0,
          totalBlockedIps: 0,
          activeViolationsCount: 0,
        },
      },
      isLoading: false,
      error: null,
    } as never);

    render(<AdminSeguridadPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Rate Limiting y Seguridad')).toBeInTheDocument();
    expect(
      screen.getByText('Monitorea violaciones, IPs bloqueadas y eventos de seguridad')
    ).toBeInTheDocument();
  });
});
