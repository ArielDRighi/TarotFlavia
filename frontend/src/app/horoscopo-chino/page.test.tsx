import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import HoroscopoChinoPage from './page';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock hooks
const mockUseChineseHoroscopesByYear = vi.fn();
const mockUseCalculateAnimal = vi.fn();
const mockUseMyAnimalHoroscope = vi.fn();

vi.mock('@/hooks/api/useChineseHoroscope', () => ({
  useChineseHoroscopesByYear: () => mockUseChineseHoroscopesByYear(),
  useCalculateAnimal: () => mockUseCalculateAnimal(),
  useMyAnimalHoroscope: () => mockUseMyAnimalHoroscope(),
}));

// Mock useAuth hook - default: authenticated user
const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
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

describe('HoroscopoChinoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    // Default mock for useCalculateAnimal
    mockUseCalculateAnimal.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    // Default mock for useMyAnimalHoroscope
    mockUseMyAnimalHoroscope.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    // Default: authenticated user
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1 },
    });
  });

  it('should render page title', () => {
    mockUseChineseHoroscopesByYear.mockReturnValue({
      isLoading: false,
      data: [],
    });

    renderWithProviders(<HoroscopoChinoPage />);

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`Horóscopo Chino ${currentYear}`)).toBeInTheDocument();
    expect(
      screen.getByText('Descubre las predicciones anuales según tu animal')
    ).toBeInTheDocument();
  });

  it('should render animal selector when not loading', () => {
    mockUseChineseHoroscopesByYear.mockReturnValue({
      isLoading: false,
      data: [],
    });

    renderWithProviders(<HoroscopoChinoPage />);

    expect(screen.getByTestId('chinese-animal-selector')).toBeInTheDocument();
  });

  it('should open year selector modal when clicking on an animal card', async () => {
    const user = userEvent.setup();
    mockUseChineseHoroscopesByYear.mockReturnValue({
      isLoading: false,
      data: [],
    });

    renderWithProviders(<HoroscopoChinoPage />);

    const dragonCard = screen.getByTestId('chinese-animal-dragon');
    await user.click(dragonCard);

    // Should open modal instead of navigating directly
    expect(screen.getByTestId('year-selector-modal')).toBeInTheDocument();
  });

  describe('Anonymous users (HU-HCH-001)', () => {
    beforeEach(() => {
      // Set up as anonymous user
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
      });
    });

    it('should render AnimalCalculator for anonymous users', () => {
      mockUseChineseHoroscopesByYear.mockReturnValue({
        isLoading: false,
        data: [],
      });

      renderWithProviders(<HoroscopoChinoPage />);

      expect(screen.getByTestId('animal-calculator')).toBeInTheDocument();
    });

    it('should show animal calculator title for anonymous users', () => {
      mockUseChineseHoroscopesByYear.mockReturnValue({
        isLoading: false,
        data: [],
      });

      renderWithProviders(<HoroscopoChinoPage />);

      expect(screen.getByRole('heading', { name: /descubre tu animal/i })).toBeInTheDocument();
    });
  });
});
