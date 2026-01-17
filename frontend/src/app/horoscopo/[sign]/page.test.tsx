import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import HoroscopeSignPage from './page';
import { ZodiacSign } from '@/types/horoscope.types';

// Mock next/navigation
const mockPush = vi.fn();
const mockParams = { sign: 'aries' };

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
const mockUseTodayHoroscope = vi.fn();
const mockUseAuthStore = vi.fn();

vi.mock('@/hooks/api/useHoroscope', () => ({
  useTodayHoroscope: (sign: ZodiacSign | null) => mockUseTodayHoroscope(sign),
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

// Mock data
const mockHoroscope = {
  id: 1,
  zodiacSign: ZodiacSign.ARIES,
  horoscopeDate: '2026-01-17',
  generalContent: 'Hoy es un buen día para Aries...',
  areas: {
    love: { content: 'Amor en el aire', score: 8 },
    wellness: { content: 'Buena energía', score: 7 },
    money: { content: 'Oportunidades financieras', score: 6 },
  },
  luckyNumber: 7,
  luckyColor: 'Rojo',
  luckyTime: 'Mañana',
};

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

describe('HoroscopeSignPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    mockParams.sign = 'aries';
  });

  it('should render horoscope detail when data is loaded', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
    });
    mockUseTodayHoroscope.mockReturnValue({
      isLoading: false,
      error: null,
      data: mockHoroscope,
    });

    renderWithProviders(<HoroscopeSignPage />);

    expect(screen.getByTestId('horoscope-detail')).toBeInTheDocument();
    expect(screen.getByText('Hoy es un buen día para Aries...')).toBeInTheDocument();
  });

  it('should render skeleton when loading', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
    });
    mockUseTodayHoroscope.mockReturnValue({
      isLoading: true,
      error: null,
      data: null,
    });

    renderWithProviders(<HoroscopeSignPage />);

    expect(screen.getByTestId('horoscope-skeleton-detail')).toBeInTheDocument();
  });

  it('should render error message when horoscope is not available', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
    });
    mockUseTodayHoroscope.mockReturnValue({
      isLoading: false,
      error: new Error('Not found'),
      data: null,
    });

    renderWithProviders(<HoroscopeSignPage />);

    expect(screen.getByText('Horóscopo no disponible')).toBeInTheDocument();
  });

  it('should render zodiac sign selector', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
    });
    mockUseTodayHoroscope.mockReturnValue({
      isLoading: false,
      error: null,
      data: mockHoroscope,
    });

    renderWithProviders(<HoroscopeSignPage />);

    expect(screen.getByTestId('zodiac-selector')).toBeInTheDocument();
  });

  it('should navigate back when clicking back button', async () => {
    const user = userEvent.setup();
    mockUseAuthStore.mockReturnValue({
      user: null,
    });
    mockUseTodayHoroscope.mockReturnValue({
      isLoading: false,
      error: null,
      data: mockHoroscope,
    });

    renderWithProviders(<HoroscopeSignPage />);

    const backButton = screen.getByRole('button', { name: /todos los signos/i });
    await user.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/horoscopo');
  });

  it('should navigate to another sign when clicking on zodiac selector', async () => {
    const user = userEvent.setup();
    mockUseAuthStore.mockReturnValue({
      user: null,
    });
    mockUseTodayHoroscope.mockReturnValue({
      isLoading: false,
      error: null,
      data: mockHoroscope,
    });

    renderWithProviders(<HoroscopeSignPage />);

    const taurusCard = screen.getByTestId('zodiac-card-taurus');
    await user.click(taurusCard);

    expect(mockPush).toHaveBeenCalledWith('/horoscopo/taurus');
  });

  it('should show error for invalid zodiac sign', () => {
    mockParams.sign = 'invalid-sign';
    mockUseAuthStore.mockReturnValue({
      user: null,
    });
    mockUseTodayHoroscope.mockReturnValue({
      isLoading: false,
      error: null,
      data: null,
    });

    renderWithProviders(<HoroscopeSignPage />);

    expect(screen.getByText('Signo no válido')).toBeInTheDocument();
  });

  it('should highlight user sign in selector when authenticated with birthDate', () => {
    mockUseAuthStore.mockReturnValue({
      user: { id: 1, email: 'test@test.com', birthDate: '1990-03-25' }, // Aries
    });
    mockUseTodayHoroscope.mockReturnValue({
      isLoading: false,
      error: null,
      data: mockHoroscope,
    });

    renderWithProviders(<HoroscopeSignPage />);

    const ariesCard = screen.getByTestId('zodiac-card-aries');
    expect(ariesCard).toHaveClass('border-accent');
  });
});
