import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import ChineseHoroscopeAnimalPage from './page';
import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

// Mock next/navigation
const mockPush = vi.fn();
const mockParams = { animal: 'dragon' };

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useParams: () => mockParams,
}));

// Mock hooks
const mockUseChineseHoroscope = vi.fn();

vi.mock('@/hooks/api/useChineseHoroscope', () => ({
  useChineseHoroscope: () => mockUseChineseHoroscope(),
}));

// Test wrapper
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

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('ChineseHoroscopeAnimalPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  it('should render animal selector', () => {
    mockUseChineseHoroscope.mockReturnValue({
      isLoading: false,
      data: {
        id: 1,
        animal: ChineseZodiacAnimal.DRAGON,
        year: 2026,
        generalOverview: 'Test overview',
        areas: {
          love: { content: 'Love content', rating: 8 },
          career: { content: 'Career content', rating: 7 },
          wellness: { content: 'Wellness content', rating: 9 },
          finance: { content: 'Finance content', rating: 6 },
        },
        luckyElements: {
          numbers: [3, 7, 9],
          colors: ['Rojo', 'Dorado'],
          directions: ['Sur', 'Este'],
          months: [3, 6, 9],
        },
        compatibility: {
          best: [ChineseZodiacAnimal.RAT],
          good: [ChineseZodiacAnimal.MONKEY],
          challenging: [ChineseZodiacAnimal.DOG],
        },
        monthlyHighlights: 'Test highlights',
      },
      error: null,
    });

    renderWithProviders(<ChineseHoroscopeAnimalPage />);

    expect(screen.getByTestId('chinese-animal-selector')).toBeInTheDocument();
  });

  it('should render loading state', () => {
    mockUseChineseHoroscope.mockReturnValue({
      isLoading: true,
      data: null,
      error: null,
    });

    renderWithProviders(<ChineseHoroscopeAnimalPage />);

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('should render error state when horoscope not found', () => {
    mockUseChineseHoroscope.mockReturnValue({
      isLoading: false,
      data: null,
      error: new Error('Not found'),
    });

    renderWithProviders(<ChineseHoroscopeAnimalPage />);

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`Horóscopo no disponible para ${currentYear}`)).toBeInTheDocument();
  });

  it('should render horoscope detail when data is loaded', () => {
    mockUseChineseHoroscope.mockReturnValue({
      isLoading: false,
      data: {
        id: 1,
        animal: ChineseZodiacAnimal.DRAGON,
        year: 2026,
        generalOverview: 'Test overview for dragon',
        areas: {
          love: { content: 'Love content', rating: 8 },
          career: { content: 'Career content', rating: 7 },
          wellness: { content: 'Wellness content', rating: 9 },
          finance: { content: 'Finance content', rating: 6 },
        },
        luckyElements: {
          numbers: [3, 7, 9],
          colors: ['Rojo', 'Dorado'],
          directions: ['Sur', 'Este'],
          months: [3, 6, 9],
        },
        compatibility: {
          best: [ChineseZodiacAnimal.RAT],
          good: [ChineseZodiacAnimal.MONKEY],
          challenging: [ChineseZodiacAnimal.DOG],
        },
        monthlyHighlights: 'Test highlights',
      },
      error: null,
    });

    renderWithProviders(<ChineseHoroscopeAnimalPage />);

    expect(screen.getByText('Test overview for dragon')).toBeInTheDocument();
  });

  it('should show invalid animal message for invalid animal', () => {
    // Change params to invalid animal
    mockParams.animal = 'invalid-animal';

    mockUseChineseHoroscope.mockReturnValue({
      isLoading: false,
      data: null,
      error: null,
    });

    renderWithProviders(<ChineseHoroscopeAnimalPage />);

    expect(screen.getByText('Animal no válido')).toBeInTheDocument();
    expect(screen.getByText('Ver todos los animales')).toBeInTheDocument();
  });

  it('should navigate back when clicking back button', async () => {
    const user = userEvent.setup();
    mockParams.animal = 'dragon';

    mockUseChineseHoroscope.mockReturnValue({
      isLoading: false,
      data: {
        id: 1,
        animal: ChineseZodiacAnimal.DRAGON,
        year: 2026,
        generalOverview: 'Test overview',
        areas: {
          love: { content: 'Love content', rating: 8 },
          career: { content: 'Career content', rating: 7 },
          wellness: { content: 'Wellness content', rating: 9 },
          finance: { content: 'Finance content', rating: 6 },
        },
        luckyElements: {
          numbers: [3, 7, 9],
          colors: ['Rojo', 'Dorado'],
          directions: ['Sur', 'Este'],
          months: [3, 6, 9],
        },
        compatibility: {
          best: [ChineseZodiacAnimal.RAT],
          good: [ChineseZodiacAnimal.MONKEY],
          challenging: [ChineseZodiacAnimal.DOG],
        },
        monthlyHighlights: null,
      },
      error: null,
    });

    renderWithProviders(<ChineseHoroscopeAnimalPage />);

    const backButton = screen.getByRole('button', { name: /Todos los animales/i });
    await user.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/horoscopo-chino');
  });
});
