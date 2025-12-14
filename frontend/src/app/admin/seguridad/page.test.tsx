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
    vi.mocked(useAdminSecurity.useRateLimitViolations).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as never);

    vi.mocked(useAdminSecurity.useBlockedIPs).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as never);

    vi.mocked(useAdminSecurity.useUnblockIP).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    vi.mocked(useAdminSecurity.useBlockIP).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    render(<AdminSeguridadPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Rate Limiting y Seguridad')).toBeInTheDocument();
    expect(
      screen.getByText('Monitorea violaciones, IPs bloqueadas y eventos de seguridad')
    ).toBeInTheDocument();
  });
});
