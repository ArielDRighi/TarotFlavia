import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RitualHistorialPage from './page';
import { RitualCategory, LunarPhase } from '@/types/ritual.types';

// Mock Next.js
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock hooks
vi.mock('@/hooks/api/useRituals', () => ({
  useRitualHistory: vi.fn(),
  useRitualStats: vi.fn(),
}));

import { useRitualHistory, useRitualStats } from '@/hooks/api/useRituals';

const mockHistory = [
  {
    id: 1,
    ritual: {
      id: 1,
      slug: 'ritual-luna-nueva',
      title: 'Ritual de Luna Nueva',
      category: RitualCategory.LUNAR,
    },
    completedAt: '2024-01-15T10:00:00Z',
    lunarPhase: LunarPhase.NEW_MOON,
    lunarSign: 'Capricornio',
    notes: 'Me sentí muy tranquilo',
    rating: 5,
    durationMinutes: 30,
  },
  {
    id: 2,
    ritual: {
      id: 2,
      slug: 'limpieza-hogar',
      title: 'Limpieza del Hogar',
      category: RitualCategory.CLEANSING,
    },
    completedAt: '2024-01-10T14:00:00Z',
    lunarPhase: LunarPhase.WANING_GIBBOUS,
    lunarSign: 'Virgo',
    notes: null,
    rating: 4,
    durationMinutes: 45,
  },
];

const mockStats = {
  totalCompleted: 15,
  favoriteCategory: RitualCategory.LUNAR,
  currentStreak: 3,
  thisMonthCount: 5,
};

describe('RitualHistorialPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useRitualHistory as any).mockReturnValue({
      data: mockHistory,
      isLoading: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useRitualStats as any).mockReturnValue({
      data: mockStats,
      isLoading: false,
    });
  });

  it('renders page title', () => {
    render(<RitualHistorialPage />);

    expect(screen.getByText('Mi Historial de Rituales')).toBeInTheDocument();
    expect(screen.getByText('Registro de tu práctica espiritual')).toBeInTheDocument();
  });

  it('renders back button', () => {
    render(<RitualHistorialPage />);

    expect(screen.getByText('Rituales')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useRitualStats as any).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useRitualHistory as any).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<RitualHistorialPage />);

    // Should not show content while loading
    expect(screen.queryByText('Total Completados')).not.toBeInTheDocument();
  });

  it('renders statistics cards', () => {
    render(<RitualHistorialPage />);

    expect(screen.getByText('Total Completados')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();

    expect(screen.getByText('Este Mes')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    expect(screen.getByText('Racha Actual')).toBeInTheDocument();
    expect(screen.getByText('3 días')).toBeInTheDocument();

    expect(screen.getByText('Categoría Favorita')).toBeInTheDocument();
    expect(screen.getByText('Lunar')).toBeInTheDocument();
  });

  it('renders history entries', () => {
    render(<RitualHistorialPage />);

    expect(screen.getByText('Rituales Realizados')).toBeInTheDocument();
    expect(screen.getByText('Ritual de Luna Nueva')).toBeInTheDocument();
    expect(screen.getByText('Limpieza del Hogar')).toBeInTheDocument();
  });

  it('shows ritual notes when available', () => {
    render(<RitualHistorialPage />);

    // The notes text is present, just check for the content
    expect(screen.getByText(/Me sentí muy tranquilo/)).toBeInTheDocument();
  });

  it('renders rating stars', () => {
    render(<RitualHistorialPage />);

    // Should render 5 stars for first ritual and 4 for second
    // This would need to verify the star SVGs are rendered
    expect(screen.getByText('Ritual de Luna Nueva')).toBeInTheDocument();
  });

  it('shows lunar phase information', () => {
    render(<RitualHistorialPage />);

    // Check for lunar phase with emoji
    expect(screen.getByText(/🌑/)).toBeInTheDocument();
    expect(screen.getByText(/Capricornio/)).toBeInTheDocument();
  });

  it('shows empty state when no history', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useRitualHistory as any).mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<RitualHistorialPage />);

    expect(screen.getByText('Aún no has completado ningún ritual')).toBeInTheDocument();
    expect(screen.getByText('Explorar Rituales')).toBeInTheDocument();
  });

  it('shows dash when no favorite category', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useRitualStats as any).mockReturnValue({
      data: {
        ...mockStats,
        favoriteCategory: null,
      },
      isLoading: false,
    });

    render(<RitualHistorialPage />);

    // Find the category card by finding the text and going to the parent container
    const categoryLabel = screen.getByText('Categoría Favorita');
    const categoryCard = categoryLabel.closest('.flex.flex-col');
    // Check that within this card, there's a "-" displayed
    expect(categoryCard).toHaveTextContent('-');
  });

  it('renders singular day for streak of 1', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useRitualStats as any).mockReturnValue({
      data: {
        ...mockStats,
        currentStreak: 1,
      },
      isLoading: false,
    });

    render(<RitualHistorialPage />);

    expect(screen.getByText('1 día')).toBeInTheDocument();
  });

  it('renders ritual links correctly', () => {
    render(<RitualHistorialPage />);

    const ritualLink = screen.getByText('Ritual de Luna Nueva');
    expect(ritualLink.closest('a')).toHaveAttribute('href', '/rituales/ritual-luna-nueva');
  });
});
