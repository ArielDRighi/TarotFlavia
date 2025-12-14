/**
 * Tests for SecurityManagementContent component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SecurityManagementContent } from './SecurityManagementContent';
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

describe('SecurityManagementContent', () => {
  it('should render tabs for Rate Limiting and Security Events', () => {
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

    render(<SecurityManagementContent />, { wrapper: createWrapper() });

    expect(screen.getByText('Rate Limiting')).toBeInTheDocument();
    expect(screen.getByText('Eventos de Seguridad')).toBeInTheDocument();
  });
});
