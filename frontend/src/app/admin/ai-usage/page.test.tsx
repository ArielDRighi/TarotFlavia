/**
 * Tests for AI Usage Page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AIUsagePage from './page';
import * as useAdminAIUsage from '@/hooks/queries/useAdminAIUsage';
import type { AIUsageStats } from '@/types/admin.types';

vi.mock('@/hooks/queries/useAdminAIUsage');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
};

describe('AIUsagePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    vi.spyOn(useAdminAIUsage, 'useAIUsageStats').mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as never);

    render(<AIUsagePage />, { wrapper: createWrapper() });

    expect(screen.getByText('Uso de Inteligencia Artificial')).toBeInTheDocument();
  });

  it('should render error state', () => {
    vi.spyOn(useAdminAIUsage, 'useAIUsageStats').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('API Error'),
    } as never);

    render(<AIUsagePage />, { wrapper: createWrapper() });

    expect(screen.getByText(/Error al cargar las estadísticas de IA/i)).toBeInTheDocument();
  });

  it('should render AI usage stats when data is loaded', () => {
    const mockStats: AIUsageStats = {
      statistics: [
        {
          provider: 'GROQ',
          totalCalls: 1000,
          successfulCalls: 950,
          failedCalls: 50,
          errorRate: 5.0,
          totalTokens: 100000,
          inputTokens: 60000,
          outputTokens: 40000,
          averageLatency: 250,
          totalCost: 0.1234,
        },
      ],
      groqCallsToday: 100,
      groqRateLimitAlert: false,
      highErrorRateAlert: false,
      highFallbackRateAlert: false,
      highDailyCostAlert: false,
    };

    vi.mocked(useAdminAIUsage.useAIUsageStats).mockReturnValue({
      data: mockStats,
      isLoading: false,
      error: null,
    } as never);

    render(<AIUsagePage />, { wrapper: createWrapper() });

    expect(screen.getByText('Uso de Inteligencia Artificial')).toBeInTheDocument();
    expect(screen.getByText('Total Requests')).toBeInTheDocument();
    expect(screen.getByText('Tokens Consumidos')).toBeInTheDocument();
    expect(screen.getByText('Costo Total')).toBeInTheDocument();
    expect(screen.getByText('Tasa de Éxito')).toBeInTheDocument();
    expect(screen.getByText('Estadísticas por Proveedor')).toBeInTheDocument();
  });

  it('should show alerts when they are active', () => {
    const mockStats: AIUsageStats = {
      statistics: [],
      groqCallsToday: 100,
      groqRateLimitAlert: true,
      highErrorRateAlert: true,
      highFallbackRateAlert: false,
      highDailyCostAlert: false,
    };

    vi.spyOn(useAdminAIUsage, 'useAIUsageStats').mockReturnValue({
      data: mockStats,
      isLoading: false,
      error: null,
    } as never);

    render(<AIUsagePage />, { wrapper: createWrapper() });

    expect(screen.getByText(/Límite de Groq cercano/i)).toBeInTheDocument();
    expect(screen.getByText(/Tasa de errores alta/i)).toBeInTheDocument();
  });

  it('should not show alerts section when no alerts are active', () => {
    const mockStats: AIUsageStats = {
      statistics: [],
      groqCallsToday: 100,
      groqRateLimitAlert: false,
      highErrorRateAlert: false,
      highFallbackRateAlert: false,
      highDailyCostAlert: false,
    };

    vi.spyOn(useAdminAIUsage, 'useAIUsageStats').mockReturnValue({
      data: mockStats,
      isLoading: false,
      error: null,
    } as never);

    render(<AIUsagePage />, { wrapper: createWrapper() });

    // Alerts component should not render
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
