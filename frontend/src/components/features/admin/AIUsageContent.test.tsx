/**
 * Tests for AIUsageContent Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AIUsageContent } from './AIUsageContent';
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

describe('AIUsageContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockStats: AIUsageStats = {
    statistics: [
      {
        provider: 'groq',
        totalCalls: 100,
        successCalls: 95,
        errorCalls: 3,
        cachedCalls: 2,
        totalTokens: 50000,
        totalCost: 0.0025,
        avgDuration: 1200,
        errorRate: 3.0,
        cacheHitRate: 2.0,
        fallbackRate: 0.5,
      },
    ],
    groqCallsToday: 5000,
    groqDailyLimit: 12000,
    groqRateLimitAlert: false,
    highErrorRateAlert: false,
    highFallbackRateAlert: false,
    highDailyCostAlert: false,
    freeProviders: ['groq', 'gemini'],
  };

  describe('Loading State', () => {
    it('should render skeleton loaders when loading', () => {
      vi.spyOn(useAdminAIUsage, 'useAIUsageStats').mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as never);

      render(<AIUsageContent />, { wrapper: createWrapper() });

      // Check for skeleton elements
      const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Error State', () => {
    it('should render error message when error occurs', () => {
      vi.spyOn(useAdminAIUsage, 'useAIUsageStats').mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('API Error'),
      } as never);

      render(<AIUsageContent />, { wrapper: createWrapper() });

      expect(screen.getByText(/Error al cargar las estadísticas de IA/i)).toBeInTheDocument();
    });

    it('should render destructive alert variant on error', () => {
      vi.spyOn(useAdminAIUsage, 'useAIUsageStats').mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('API Error'),
      } as never);

      const { container } = render(<AIUsageContent />, { wrapper: createWrapper() });

      const alert = container.querySelector('[role="alert"]');
      expect(alert).toHaveClass('text-destructive');
    });
  });

  describe('No Data State', () => {
    it('should render no data message when stats is null', () => {
      vi.spyOn(useAdminAIUsage, 'useAIUsageStats').mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      } as never);

      render(<AIUsageContent />, { wrapper: createWrapper() });

      expect(screen.getByText(/No hay datos disponibles/i)).toBeInTheDocument();
    });
  });

  describe('Data Loaded State', () => {
    it('should render metrics cards when data is loaded', () => {
      vi.spyOn(useAdminAIUsage, 'useAIUsageStats').mockReturnValue({
        data: mockStats,
        isLoading: false,
        error: null,
      } as never);

      render(<AIUsageContent />, { wrapper: createWrapper() });

      expect(screen.getByText('Total Requests')).toBeInTheDocument();
      expect(screen.getByText('Tokens Consumidos')).toBeInTheDocument();
    });

    it('should render providers table when data is loaded', () => {
      vi.spyOn(useAdminAIUsage, 'useAIUsageStats').mockReturnValue({
        data: mockStats,
        isLoading: false,
        error: null,
      } as never);

      render(<AIUsageContent />, { wrapper: createWrapper() });

      expect(screen.getByText('Estadísticas por Proveedor')).toBeInTheDocument();
      // provider label should be human-readable
      expect(screen.getByText('Groq')).toBeInTheDocument();
    });
  });

  describe('Date Range Preset Filter', () => {
    it('should render the date preset selector', () => {
      vi.spyOn(useAdminAIUsage, 'useAIUsageStats').mockReturnValue({
        data: mockStats,
        isLoading: false,
        error: null,
      } as never);

      render(<AIUsageContent />, { wrapper: createWrapper() });

      expect(screen.getByTestId('date-preset-select')).toBeInTheDocument();
      expect(screen.getByText('Período:')).toBeInTheDocument();
    });

    it('should call useAIUsageStats without dates when preset is "all"', () => {
      const mockUseStats = vi.spyOn(useAdminAIUsage, 'useAIUsageStats').mockReturnValue({
        data: mockStats,
        isLoading: false,
        error: null,
      } as never);

      render(<AIUsageContent />, { wrapper: createWrapper() });

      // Default preset is 'all' → no date params
      expect(mockUseStats).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should render preset options in the select', () => {
      // Note: Radix UI Select interaction (click to open, click option) requires pointer
      // events not available in jsdom. We verify the select is present and initial state
      // calls the hook with undefined dates (all-time preset).
      const mockUseStats = vi.spyOn(useAdminAIUsage, 'useAIUsageStats').mockReturnValue({
        data: mockStats,
        isLoading: false,
        error: null,
      } as never);

      render(<AIUsageContent />, { wrapper: createWrapper() });

      // Select trigger is rendered and accessible
      const trigger = screen.getByTestId('date-preset-select');
      expect(trigger).toBeInTheDocument();

      // Default (all-time) calls hook with undefined dates
      expect(mockUseStats).toHaveBeenCalledWith(undefined, undefined);
    });
  });

  describe('Alerts Rendering', () => {
    it('should NOT render alerts when no alerts are active', () => {
      vi.spyOn(useAdminAIUsage, 'useAIUsageStats').mockReturnValue({
        data: mockStats,
        isLoading: false,
        error: null,
      } as never);

      render(<AIUsageContent />, { wrapper: createWrapper() });

      expect(screen.queryByText(/Límite de Groq cercano/i)).not.toBeInTheDocument();
    });

    it('should render alerts when groqRateLimitAlert is active', () => {
      const statsWithAlert: AIUsageStats = {
        ...mockStats,
        groqRateLimitAlert: true,
      };

      vi.spyOn(useAdminAIUsage, 'useAIUsageStats').mockReturnValue({
        data: statsWithAlert,
        isLoading: false,
        error: null,
      } as never);

      render(<AIUsageContent />, { wrapper: createWrapper() });

      expect(screen.getByText(/Límite de Groq cercano/i)).toBeInTheDocument();
    });

    it('should render alerts when highErrorRateAlert is active', () => {
      const statsWithAlert: AIUsageStats = {
        ...mockStats,
        highErrorRateAlert: true,
      };

      vi.spyOn(useAdminAIUsage, 'useAIUsageStats').mockReturnValue({
        data: statsWithAlert,
        isLoading: false,
        error: null,
      } as never);

      render(<AIUsageContent />, { wrapper: createWrapper() });

      expect(screen.getByText(/Tasa de errores alta/i)).toBeInTheDocument();
    });

    it('should render alerts when highFallbackRateAlert is active', () => {
      const statsWithAlert: AIUsageStats = {
        ...mockStats,
        highFallbackRateAlert: true,
      };

      vi.spyOn(useAdminAIUsage, 'useAIUsageStats').mockReturnValue({
        data: statsWithAlert,
        isLoading: false,
        error: null,
      } as never);

      render(<AIUsageContent />, { wrapper: createWrapper() });

      expect(screen.getByText(/Muchos fallbacks a proveedores secundarios/i)).toBeInTheDocument();
    });

    it('should render alerts when highDailyCostAlert is active', () => {
      const statsWithAlert: AIUsageStats = {
        ...mockStats,
        highDailyCostAlert: true,
      };

      vi.spyOn(useAdminAIUsage, 'useAIUsageStats').mockReturnValue({
        data: statsWithAlert,
        isLoading: false,
        error: null,
      } as never);

      render(<AIUsageContent />, { wrapper: createWrapper() });

      expect(screen.getByText(/Costo diario alto/i)).toBeInTheDocument();
    });

    it('should render multiple alerts when multiple are active', () => {
      const statsWithAlerts: AIUsageStats = {
        ...mockStats,
        groqRateLimitAlert: true,
        highErrorRateAlert: true,
      };

      vi.spyOn(useAdminAIUsage, 'useAIUsageStats').mockReturnValue({
        data: statsWithAlerts,
        isLoading: false,
        error: null,
      } as never);

      render(<AIUsageContent />, { wrapper: createWrapper() });

      expect(screen.getByText(/Límite de Groq cercano/i)).toBeInTheDocument();
      expect(screen.getByText(/Tasa de errores alta/i)).toBeInTheDocument();
    });
  });
});
