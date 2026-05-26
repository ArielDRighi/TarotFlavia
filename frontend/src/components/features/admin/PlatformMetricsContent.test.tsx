/**
 * Tests for PlatformMetricsContent component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlatformMetricsContent } from './PlatformMetricsContent';
import * as usePlatformMetricsModule from '@/hooks/api/usePlatformMetrics';
import type { PlatformMetricsDto } from '@/types';

vi.mock('@/hooks/api/usePlatformMetrics');

const mockMetrics: PlatformMetricsDto = {
  totalReadings: 1500,
  completedSessions: 87,
  totalRevenueShare: 52500.0,
  totalPlatformFee: 22500.0,
  totalGrossRevenue: 75000.0,
  activeTarotistas: 10,
  activeUsers: 500,
  period: {
    start: new Date('2024-12-01T00:00:00Z'),
    end: new Date('2024-12-31T23:59:59Z'),
  },
  topTarotistas: [
    {
      tarotistaId: 1,
      nombrePublico: 'Luna Misteriosa',
      totalReadings: 150,
      completedSessions: 30,
      totalRevenueShare: 5250.0,
      totalPlatformFee: 2250.0,
      totalGrossRevenue: 7500.0,
      averageRating: 4.8,
      totalReviews: 50,
      period: {
        start: new Date('2024-12-01T00:00:00Z'),
        end: new Date('2024-12-31T23:59:59Z'),
      },
    },
  ],
};

describe('PlatformMetricsContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading skeletons when isLoading is true', () => {
    vi.mocked(usePlatformMetricsModule.usePlatformMetrics).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
      isSuccess: false,
    } as ReturnType<typeof usePlatformMetricsModule.usePlatformMetrics>);

    render(<PlatformMetricsContent />);

    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  it('should render completedSessions value (not hardcoded 0)', () => {
    vi.mocked(usePlatformMetricsModule.usePlatformMetrics).mockReturnValue({
      data: mockMetrics,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as ReturnType<typeof usePlatformMetricsModule.usePlatformMetrics>);

    render(<PlatformMetricsContent />);

    expect(screen.getByText('87')).toBeInTheDocument();
  });

  it('should NOT render "Próximamente" badge when completedSessions data is available', () => {
    vi.mocked(usePlatformMetricsModule.usePlatformMetrics).mockReturnValue({
      data: mockMetrics,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as ReturnType<typeof usePlatformMetricsModule.usePlatformMetrics>);

    render(<PlatformMetricsContent />);

    expect(screen.queryByText('Próximamente')).not.toBeInTheDocument();
  });

  it('should render completedSessions in top tarotistas table', () => {
    vi.mocked(usePlatformMetricsModule.usePlatformMetrics).mockReturnValue({
      data: mockMetrics,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as ReturnType<typeof usePlatformMetricsModule.usePlatformMetrics>);

    render(<PlatformMetricsContent />);

    // The tarotista row should show 30 sessions (not '-')
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('should NOT render "-" in sessions column when data is available', () => {
    vi.mocked(usePlatformMetricsModule.usePlatformMetrics).mockReturnValue({
      data: mockMetrics,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as ReturnType<typeof usePlatformMetricsModule.usePlatformMetrics>);

    render(<PlatformMetricsContent />);

    // There should be no '-' text in the table cells
    const cells = screen.queryAllByText('-');
    expect(cells).toHaveLength(0);
  });

  it('should render completedSessions = 0 correctly (not hiding zero)', () => {
    const metricsWithZeroSessions: PlatformMetricsDto = {
      ...mockMetrics,
      completedSessions: 0,
      topTarotistas: [
        {
          ...mockMetrics.topTarotistas[0],
          completedSessions: 0,
        },
      ],
    };

    vi.mocked(usePlatformMetricsModule.usePlatformMetrics).mockReturnValue({
      data: metricsWithZeroSessions,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as ReturnType<typeof usePlatformMetricsModule.usePlatformMetrics>);

    render(<PlatformMetricsContent />);

    // Should show 0, not '-' or 'Próximamente'
    expect(screen.queryByText('Próximamente')).not.toBeInTheDocument();
    // The card header should still be visible
    expect(screen.getByText('Sesiones Completadas')).toBeInTheDocument();
    // 0 should be rendered (formatted as "0" by formatLargeNumber)
    const zeroCells = screen.getAllByText('0');
    // At least 2 occurrences of "0": one in the card, one in the table session column
    expect(zeroCells.length).toBeGreaterThanOrEqual(2);
    // No '-' placeholders in the table
    expect(screen.queryAllByText('-')).toHaveLength(0);
  });

  it('should show error alert when there is an error', () => {
    vi.mocked(usePlatformMetricsModule.usePlatformMetrics).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('API Error'),
      isError: true,
      isSuccess: false,
    } as ReturnType<typeof usePlatformMetricsModule.usePlatformMetrics>);

    render(<PlatformMetricsContent />);

    expect(
      screen.getByText('Error al cargar métricas. Por favor, intenta de nuevo.')
    ).toBeInTheDocument();
  });

  it('should render period selector', () => {
    vi.mocked(usePlatformMetricsModule.usePlatformMetrics).mockReturnValue({
      data: mockMetrics,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as ReturnType<typeof usePlatformMetricsModule.usePlatformMetrics>);

    render(<PlatformMetricsContent />);

    expect(screen.getByText('30 días')).toBeInTheDocument();
  });

  it('should render top tarotistas table with tarotista name', () => {
    vi.mocked(usePlatformMetricsModule.usePlatformMetrics).mockReturnValue({
      data: mockMetrics,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as ReturnType<typeof usePlatformMetricsModule.usePlatformMetrics>);

    render(<PlatformMetricsContent />);

    expect(screen.getByText('Luna Misteriosa')).toBeInTheDocument();
  });
});
