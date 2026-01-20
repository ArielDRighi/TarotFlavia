import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import ChineseHoroscopeAnimalPage from './page';
import { ChineseZodiacAnimal, ChineseElementCode } from '@/types/chinese-horoscope.types';

// Mock next/navigation
const mockPush = vi.fn();
const mockParams = { animal: 'dragon' };
const mockSearchParams = { get: vi.fn() };

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useParams: () => mockParams,
  useSearchParams: () => mockSearchParams,
}));

// Mock auth store
const mockAuthStore = {
  user: null as { birthDate?: string } | null,
  isAuthenticated: false,
};

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockAuthStore,
}));

// Mock hooks
const mockUseMyAnimalHoroscope = vi.fn();
const mockUseChineseHoroscopeByElement = vi.fn();
const mockUseCalculateAnimal = vi.fn();

vi.mock('@/hooks/api/useChineseHoroscope', () => ({
  useMyAnimalHoroscope: () => mockUseMyAnimalHoroscope(),
  useChineseHoroscopeByElement: () => mockUseChineseHoroscopeByElement(),
  useCalculateAnimal: (birthDate: string | null) => mockUseCalculateAnimal(birthDate),
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
    mockSearchParams.get.mockReturnValue(null);
    mockParams.animal = 'dragon';
    mockAuthStore.user = null;
    mockAuthStore.isAuthenticated = false;
    mockUseCalculateAnimal.mockReturnValue({
      data: null,
      isLoading: false,
    });
  });

  it('should render animal selector', () => {
    mockUseMyAnimalHoroscope.mockReturnValue({
      isLoading: false,
      data: null,
      error: null,
    });
    mockUseChineseHoroscopeByElement.mockReturnValue({
      isLoading: false,
      data: null,
      error: null,
    });

    renderWithProviders(<ChineseHoroscopeAnimalPage />);

    expect(screen.getByTestId('chinese-animal-selector')).toBeInTheDocument();
  });

  it('should show YearInputBanner when not user animal and no element', () => {
    mockUseMyAnimalHoroscope.mockReturnValue({
      isLoading: false,
      data: null,
      error: null,
    });
    mockUseChineseHoroscopeByElement.mockReturnValue({
      isLoading: false,
      data: null,
      error: null,
    });

    renderWithProviders(<ChineseHoroscopeAnimalPage />);

    expect(
      screen.getByText(/Ingresa la fecha de nacimiento para ver el horóscopo personalizado/i)
    ).toBeInTheDocument();
  });

  it('should render loading state when fetching horoscope', () => {
    mockSearchParams.get.mockReturnValue('wood');
    mockUseMyAnimalHoroscope.mockReturnValue({
      isLoading: false,
      data: null,
      error: null,
    });
    mockUseChineseHoroscopeByElement.mockReturnValue({
      isLoading: true,
      data: null,
      error: null,
    });

    renderWithProviders(<ChineseHoroscopeAnimalPage />);

    expect(screen.getByText('Cargando horóscopo...')).toBeInTheDocument();
  });

  it('should render error state when horoscope not found', () => {
    mockSearchParams.get.mockReturnValue('wood');
    mockUseMyAnimalHoroscope.mockReturnValue({
      isLoading: false,
      data: null,
      error: null,
    });
    mockUseChineseHoroscopeByElement.mockReturnValue({
      isLoading: false,
      data: null,
      error: new Error('Not found'),
    });

    renderWithProviders(<ChineseHoroscopeAnimalPage />);

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`Horóscopo no disponible para ${currentYear}`)).toBeInTheDocument();
  });

  it('should render horoscope detail when data is loaded', () => {
    mockSearchParams.get.mockReturnValue('wood');
    mockUseMyAnimalHoroscope.mockReturnValue({
      isLoading: false,
      data: null,
      error: null,
    });
    mockUseChineseHoroscopeByElement.mockReturnValue({
      isLoading: false,
      data: {
        id: 1,
        animal: ChineseZodiacAnimal.DRAGON,
        birthElement: 'wood' as ChineseElementCode,
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
    mockParams.animal = 'invalid-animal';

    mockUseMyAnimalHoroscope.mockReturnValue({
      isLoading: false,
      data: null,
      error: null,
    });
    mockUseChineseHoroscopeByElement.mockReturnValue({
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

    mockUseMyAnimalHoroscope.mockReturnValue({
      isLoading: false,
      data: null,
      error: null,
    });
    mockUseChineseHoroscopeByElement.mockReturnValue({
      isLoading: false,
      data: null,
      error: null,
    });

    renderWithProviders(<ChineseHoroscopeAnimalPage />);

    const backButton = screen.getByRole('button', { name: /Todos los animales/i });
    await user.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/horoscopo-chino');
  });

  it('should show horoscope directly when viewing own animal (isMyAnimal === true)', () => {
    mockParams.animal = 'dragon';
    mockAuthStore.user = { birthDate: '1988-03-15' };
    mockAuthStore.isAuthenticated = true;

    // User's calculated animal matches the current animal
    mockUseCalculateAnimal.mockReturnValue({
      data: {
        animal: ChineseZodiacAnimal.DRAGON,
        birthElement: 'earth' as ChineseElementCode,
      },
      isLoading: false,
    });

    mockUseMyAnimalHoroscope.mockReturnValue({
      isLoading: false,
      data: {
        id: 1,
        animal: ChineseZodiacAnimal.DRAGON,
        birthElement: 'earth' as ChineseElementCode,
        year: 2026,
        generalOverview: 'Tu año como Dragón de Tierra',
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

    mockUseChineseHoroscopeByElement.mockReturnValue({
      isLoading: false,
      data: null,
      error: null,
    });

    renderWithProviders(<ChineseHoroscopeAnimalPage />);

    // Should NOT show YearInputBanner
    expect(
      screen.queryByText(/Ingresa el año de nacimiento para ver el horóscopo personalizado/i)
    ).not.toBeInTheDocument();

    // Should show the horoscope directly
    expect(screen.getByText('Tu año como Dragón de Tierra')).toBeInTheDocument();
  });
});
