import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import AdminDashboardPage from './page';
import * as dashboardApi from '@/lib/api/dashboard-api';
import type { StatsResponseDto, ChartsResponseDto } from '@/types/admin.types';

// Mock the API module
vi.mock('@/lib/api/dashboard-api');

// Helper to create QueryClient for tests
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

// Wrapper component for React Query
function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('AdminDashboardPage', () => {
  const mockStats: StatsResponseDto = {
    users: {
      totalUsers: 150,
      activeUsersLast7Days: 80,
      activeUsersLast30Days: 120,
      newRegistrationsPerDay: [],
      planDistribution: [
        { plan: 'Gratis', count: 100, percentage: 50 },
        { plan: 'Premium', count: 100, percentage: 50 },
      ],
    },
    readings: {
      totalReadings: 450,
      readingsLast7Days: 120,
      readingsLast30Days: 380,
      readingsPerDay: [],
    },
    cards: {
      totalCards: 78,
      mostDrawnCard: 'The Fool',
      leastDrawnCard: 'The Tower',
    },
    openai: {
      totalPrompts: 450,
      totalCost: 25.5,
      aiCostsPerDay: [],
    },
    questions: {
      totalQuestions: 15,
      mostCommonQuestion: '¿Encontraré el amor?',
    },
  };

  const mockCharts: ChartsResponseDto = {
    userRegistrations: [],
    readingsPerDay: [
      { date: '2025-12-01', count: 10 },
      { date: '2025-12-02', count: 15 },
    ],
    aiCostsPerDay: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dashboardApi.fetchDashboardStats).mockResolvedValue(mockStats);
    vi.mocked(dashboardApi.fetchDashboardCharts).mockResolvedValue(mockCharts);
  });

  it('should render admin dashboard with correct title', async () => {
    render(<AdminDashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByRole('heading', { level: 1, name: /dashboard admin/i })).toBeInTheDocument();
  });

  it('should have container class', () => {
    const { container } = render(<AdminDashboardPage />, { wrapper: createWrapper() });

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('container');
  });

  it('should have py-8 class', () => {
    const { container } = render(<AdminDashboardPage />, { wrapper: createWrapper() });

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('py-8');
  });

  it('should have font-serif class on heading', () => {
    render(<AdminDashboardPage />, { wrapper: createWrapper() });

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('font-serif');
  });
});
