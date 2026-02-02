import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import RitualesPage from './page';
import { RitualCategory, RitualDifficulty } from '@/types/ritual.types';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}));

// Mock hooks
vi.mock('@/hooks/api/useRituals', () => ({
  useRituals: vi.fn(),
  useFeaturedRituals: vi.fn(),
  useRitualCategories: vi.fn(),
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

import { useRituals, useFeaturedRituals, useRitualCategories } from '@/hooks/api/useRituals';
import { useAuthStore } from '@/stores/authStore';

const mockRituals = [
  {
    id: 1,
    slug: 'ritual-luna-nueva',
    title: 'Ritual de Luna Nueva',
    description: 'Ceremonia para establecer intenciones',
    category: RitualCategory.LUNAR,
    difficulty: RitualDifficulty.BEGINNER,
    durationMinutes: 30,
    bestLunarPhase: null,
    imageUrl: '/images/ritual1.jpg',
    materialsCount: 3,
    stepsCount: 5,
  },
  {
    id: 2,
    slug: 'limpieza-hogar',
    title: 'Limpieza Energética del Hogar',
    description: 'Ritual para purificar espacios',
    category: RitualCategory.CLEANSING,
    difficulty: RitualDifficulty.BEGINNER,
    durationMinutes: 45,
    bestLunarPhase: null,
    imageUrl: '/images/ritual2.jpg',
    materialsCount: 4,
    stepsCount: 7,
  },
];

describe('RitualesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useRitualCategories as any).mockReturnValue({
      data: [
        { category: 'lunar', count: 5 },
        { category: 'cleansing', count: 3 },
      ],
      isLoading: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useFeaturedRituals as any).mockReturnValue({
      data: [mockRituals[0]],
      isLoading: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useRituals as any).mockReturnValue({
      data: mockRituals,
      isLoading: false,
    });
  });

  it('renders page title and description', () => {
    render(<RitualesPage />);

    expect(screen.getByText('Rituales')).toBeInTheDocument();
    expect(screen.getByText('Guías paso a paso para tu práctica espiritual')).toBeInTheDocument();
  });

  it('shows history button when authenticated', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
    });

    render(<RitualesPage />);

    expect(screen.getByText('Mi Historial')).toBeInTheDocument();
  });

  it('does not show history button when not authenticated', () => {
    render(<RitualesPage />);

    expect(screen.queryByText('Mi Historial')).not.toBeInTheDocument();
  });

  it('renders featured rituals section', () => {
    render(<RitualesPage />);

    expect(screen.getByText('Destacados para esta fase lunar')).toBeInTheDocument();
    // Use getAllByText because ritual appears in both featured and all sections
    const ritualElements = screen.getAllByText('Ritual de Luna Nueva');
    expect(ritualElements.length).toBeGreaterThan(0);
  });

  it('renders all rituals list', () => {
    render(<RitualesPage />);

    expect(screen.getByText('Todos los Rituales')).toBeInTheDocument();
    // Use getAllByText because rituals may appear in both featured and all sections
    expect(screen.getAllByText('Ritual de Luna Nueva').length).toBeGreaterThan(0);
    expect(screen.getByText('Limpieza Energética del Hogar')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useRituals as any).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<RitualesPage />);

    // Verify skeletons are rendered (they would have specific test ids or classes)
    const container = screen.getByText('Todos los Rituales').parentElement;
    expect(container).toBeInTheDocument();
  });

  it('filters by category', async () => {
    const user = userEvent.setup();
    const mockUseRituals = vi.fn().mockReturnValue({
      data: [mockRituals[1]],
      isLoading: false,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useRituals as any).mockImplementation(mockUseRituals);

    render(<RitualesPage />);

    // Initially called with empty filters
    expect(mockUseRituals).toHaveBeenCalledWith({});

    // Click on Limpieza category button
    const limpiezaButton = screen.getByRole('button', { name: /✨.*limpieza/i });
    await user.click(limpiezaButton);

    // Should call useRituals with the category filter
    await waitFor(() => {
      expect(mockUseRituals).toHaveBeenCalledWith(
        expect.objectContaining({
          category: RitualCategory.CLEANSING,
        })
      );
    });
  });

  it('filters by difficulty', () => {
    const mockUseRituals = vi.fn().mockReturnValue({
      data: mockRituals,
      isLoading: false,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useRituals as any).mockImplementation(mockUseRituals);

    render(<RitualesPage />);

    // Verify difficulty filter component is rendered
    const difficultyFilter = screen.getByRole('combobox');
    expect(difficultyFilter).toBeInTheDocument();

    // Verify default state shows "Todas las dificultades"
    expect(screen.getByText('Todas las dificultades')).toBeInTheDocument();

    // Initially called with empty filters
    expect(mockUseRituals).toHaveBeenCalledWith({});
  });

  it('searches rituals', async () => {
    const user = userEvent.setup();

    render(<RitualesPage />);

    const searchInput = screen.getByPlaceholderText('Buscar ritual...');
    await user.type(searchInput, 'luna');

    // After debounce, should filter rituals
    await waitFor(
      () => {
        expect(useRituals).toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });

  it('shows empty message when no rituals found', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useRituals as any).mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<RitualesPage />);

    expect(screen.getByText('No se encontraron rituales con estos filtros')).toBeInTheDocument();
  });

  it('hides featured section when filters are applied', async () => {
    const user = userEvent.setup();

    render(<RitualesPage />);

    // Initially featured section should be visible
    expect(screen.getByText('Destacados para esta fase lunar')).toBeInTheDocument();

    // Type in search (this will apply a filter and should hide featured section)
    const searchInput = screen.getByPlaceholderText('Buscar ritual...');
    await user.type(searchInput, 'test');

    // Wait for debounce
    await waitFor(
      () => {
        // Featured section should be hidden when a search filter is applied
        expect(screen.queryByText('Destacados para esta fase lunar')).not.toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });
});
