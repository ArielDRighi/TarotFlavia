/**
 * Tests for SecurityManagementContent component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SecurityManagementContent } from './SecurityManagementContent';
import * as useAdminSecurity from '@/hooks/api/useAdminSecurity';
import * as useAdminIpWhitelist from '@/hooks/api/useAdminIpWhitelist';

vi.mock('@/hooks/api/useAdminSecurity');
vi.mock('@/hooks/api/useAdminIpWhitelist');

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

describe('SecurityManagementContent', () => {
  beforeEach(() => {
    vi.mocked(useAdminSecurity.useRateLimitData).mockReturnValue({
      data: {
        violations: [],
        blockedIps: [],
        stats: {
          totalViolations: 0,
          totalBlockedIps: 0,
          activeViolationsCount: 0,
        },
      },
      isLoading: false,
      error: null,
    } as never);

    vi.mocked(useAdminSecurity.useUnblockIP).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    vi.mocked(useAdminSecurity.useSecurityEvents).mockReturnValue({
      data: { data: [], meta: { page: 1, limit: 10, totalItems: 0, totalPages: 0 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as never);

    vi.mocked(useAdminIpWhitelist.useIpWhitelist).mockReturnValue({
      data: { ips: [], count: 0 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      isSuccess: true,
    } as never);

    vi.mocked(useAdminIpWhitelist.useAddIpToWhitelist).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    vi.mocked(useAdminIpWhitelist.useRemoveIpFromWhitelist).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);
  });

  it('should render tabs for Rate Limiting, Security Events and IP Whitelist', () => {
    render(<SecurityManagementContent />, { wrapper: createWrapper() });

    expect(screen.getByText('Rate Limiting')).toBeInTheDocument();
    expect(screen.getByText('Eventos de Seguridad')).toBeInTheDocument();
    expect(screen.getByText('IP Whitelist')).toBeInTheDocument();
  });

  it('should show IP Whitelist tab content when selected', async () => {
    render(<SecurityManagementContent />, { wrapper: createWrapper() });

    const tab = screen.getByRole('tab', { name: 'IP Whitelist' });
    await userEvent.click(tab);

    expect(screen.getByTestId('ip-whitelist-tab')).toBeInTheDocument();
  });
});
