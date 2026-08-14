/**
 * HoroscopeSignPanel - Tests
 *
 * Es la parte cliente de `/horoscopo/[sign]`: el horóscopo del día, que depende
 * del día calendario local del visitante. La ficha estática del signo y la
 * validación del segmento viven en el servidor desde T-SEO-004.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { HoroscopeSignPanel } from './HoroscopeSignPanel';
import { ZodiacSign } from '@/types/horoscope.types';

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
const mockUseTodayHoroscope = vi.fn();
const mockUseAuthStore = vi.fn();

vi.mock('@/hooks/api/useHoroscope', () => ({
  useLocalHoroscope: (sign: ZodiacSign | null) => mockUseTodayHoroscope(sign),
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

describe('HoroscopeSignPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
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

    renderWithProviders(<HoroscopeSignPanel sign={ZodiacSign.ARIES} />);

    expect(screen.getByTestId('horoscope-detail')).toBeInTheDocument();
    expect(screen.getByText('Hoy es un buen día para Aries...')).toBeInTheDocument();
  });

  it('consulta el horóscopo del signo que recibe por props', () => {
    mockUseAuthStore.mockReturnValue({ user: null });
    mockUseTodayHoroscope.mockReturnValue({
      isLoading: false,
      error: null,
      data: mockHoroscope,
    });

    renderWithProviders(<HoroscopeSignPanel sign={ZodiacSign.LEO} />);

    expect(mockUseTodayHoroscope).toHaveBeenCalledWith(ZodiacSign.LEO);
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

    renderWithProviders(<HoroscopeSignPanel sign={ZodiacSign.ARIES} />);

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

    renderWithProviders(<HoroscopeSignPanel sign={ZodiacSign.ARIES} />);

    expect(screen.getByText('Horóscopo no disponible')).toBeInTheDocument();
  });

  it('mantiene el horóscopo en pantalla si un refetch en background falla', () => {
    // Guardar por `error` en vez de por `!data` le borraba al visitante un
    // horóscopo que ya estaba viendo. Ver el patrón documentado en el backlog.
    mockUseAuthStore.mockReturnValue({ user: null });
    mockUseTodayHoroscope.mockReturnValue({
      isLoading: false,
      error: new Error('Network error'),
      data: mockHoroscope,
    });

    renderWithProviders(<HoroscopeSignPanel sign={ZodiacSign.ARIES} />);

    expect(screen.getByTestId('horoscope-detail')).toBeInTheDocument();
    expect(screen.queryByText('Horóscopo no disponible')).not.toBeInTheDocument();
  });

  it('avisa cuando está mostrando el horóscopo del día anterior', () => {
    mockUseAuthStore.mockReturnValue({ user: null });
    mockUseTodayHoroscope.mockReturnValue({
      isLoading: false,
      error: null,
      data: mockHoroscope,
      isShowingPreviousDay: true,
    });

    renderWithProviders(<HoroscopeSignPanel sign={ZodiacSign.ARIES} />);

    expect(screen.getByTestId('showing-previous-day-notice')).toBeInTheDocument();
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

    renderWithProviders(<HoroscopeSignPanel sign={ZodiacSign.ARIES} />);

    expect(screen.getByTestId('zodiac-selector')).toBeInTheDocument();
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

    renderWithProviders(<HoroscopeSignPanel sign={ZodiacSign.ARIES} />);

    const taurusCard = screen.getByTestId('zodiac-card-taurus');
    await user.click(taurusCard);

    expect(mockPush).toHaveBeenCalledWith('/horoscopo/taurus');
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

    renderWithProviders(<HoroscopeSignPanel sign={ZodiacSign.ARIES} />);

    const ariesCard = screen.getByTestId('zodiac-card-aries');
    expect(ariesCard).toHaveClass('border-accent');
  });
});
