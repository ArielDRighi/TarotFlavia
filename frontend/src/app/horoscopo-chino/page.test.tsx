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
const mockUseAuthStore = vi.fn();

vi.mock('@/hooks/api/useChineseHoroscope', () => ({
  useChineseHoroscopesByYear: () => mockUseChineseHoroscopesByYear(),
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
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
  });

  it('should render page title', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });
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
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });
    mockUseChineseHoroscopesByYear.mockReturnValue({
      isLoading: false,
      data: [],
    });

    renderWithProviders(<HoroscopoChinoPage />);

    expect(screen.getByTestId('chinese-animal-selector')).toBeInTheDocument();
  });

  it('should navigate to animal page when clicking on an animal card', async () => {
    const user = userEvent.setup();
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });
    mockUseChineseHoroscopesByYear.mockReturnValue({
      isLoading: false,
      data: [],
    });

    renderWithProviders(<HoroscopoChinoPage />);

    const dragonCard = screen.getByTestId('chinese-animal-dragon');
    await user.click(dragonCard);

    expect(mockPush).toHaveBeenCalledWith('/horoscopo-chino/dragon');
  });
});
