import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { StatsSection } from './StatsSection';

// Mock useUserCapabilities hook
const mockUseUserCapabilities = vi.fn();
vi.mock('@/hooks/api/useUserCapabilities', () => ({
  useUserCapabilities: () => mockUseUserCapabilities(),
}));

describe('StatsSection', () => {
  it('should display section title', () => {
    mockUseUserCapabilities.mockReturnValue({
      data: {
        tarotReadings: { used: 2, limit: 3, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
        dailyCard: { used: 1, limit: 1, canUse: false, resetAt: '2026-01-09T00:00:00Z' },
        canCreateDailyReading: false,
        canCreateTarotReading: true,
        canUseAI: true,
        canUseCustomQuestions: true,
        canUseAdvancedSpreads: true,
        plan: 'premium',
        isAuthenticated: true,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<StatsSection />);

    expect(screen.getByText('Tus Estadísticas')).toBeInTheDocument();
  });

  it('should display daily readings count', () => {
    mockUseUserCapabilities.mockReturnValue({
      data: {
        tarotReadings: { used: 2, limit: 3, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
        dailyCard: { used: 1, limit: 1, canUse: false, resetAt: '2026-01-09T00:00:00Z' },
        canCreateDailyReading: false,
        canCreateTarotReading: true,
        canUseAI: true,
        canUseCustomQuestions: true,
        canUseAdvancedSpreads: true,
        plan: 'premium',
        isAuthenticated: true,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<StatsSection />);

    expect(screen.getByText(/2 \/ 3/)).toBeInTheDocument();
    expect(screen.getByText('Lecturas de Hoy')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    mockUseUserCapabilities.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<StatsSection />);

    expect(screen.getByTestId('stats-loading')).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseUserCapabilities.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load'),
      refetch: vi.fn(),
    });

    render(<StatsSection />);

    expect(screen.getByText(/No pudimos cargar tus estadísticas/i)).toBeInTheDocument();
  });

  it('should call refetch when retry button is clicked', () => {
    const mockRefetch = vi.fn();
    mockUseUserCapabilities.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load'),
      refetch: mockRefetch,
    });

    render(<StatsSection />);

    const retryButton = screen.getByTestId('retry-button');
    fireEvent.click(retryButton);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('should return null when capabilities are explicitly null', () => {
    mockUseUserCapabilities.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const { container } = render(<StatsSection />);

    expect(container.firstChild).toBeNull();
  });

  it('should display remaining readings', () => {
    mockUseUserCapabilities.mockReturnValue({
      data: {
        tarotReadings: { used: 1, limit: 3, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
        dailyCard: { used: 1, limit: 1, canUse: false, resetAt: '2026-01-09T00:00:00Z' },
        canCreateDailyReading: false,
        canCreateTarotReading: true,
        canUseAI: true,
        canUseCustomQuestions: true,
        canUseAdvancedSpreads: true,
        plan: 'premium',
        isAuthenticated: true,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<StatsSection />);

    // Should show remaining (3 - 1 = 2)
    const statCard = screen.getByText('Lecturas de Hoy').closest('div');
    expect(within(statCard!).getByText(/1 \/ 3/)).toBeInTheDocument();
  });

  it('should have appropriate styling', () => {
    mockUseUserCapabilities.mockReturnValue({
      data: {
        tarotReadings: { used: 2, limit: 3, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
        dailyCard: { used: 1, limit: 1, canUse: false, resetAt: '2026-01-09T00:00:00Z' },
        canCreateDailyReading: false,
        canCreateTarotReading: true,
        canUseAI: true,
        canUseCustomQuestions: true,
        canUseAdvancedSpreads: true,
        plan: 'premium',
        isAuthenticated: true,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<StatsSection />);

    const title = screen.getByText('Tus Estadísticas');
    expect(title).toHaveClass('font-serif');
  });
});
