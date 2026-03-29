import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActivationPage } from './ActivationPage';

// ============================================================================
// Mocks
// ============================================================================

const mockPush = vi.fn();
const mockSearchParams = {
  get: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock('next/link', () => ({
  default: function MockLink({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  },
}));

// Mock subscription hook
const mockUseSubscriptionStatus = vi.fn();
vi.mock('@/hooks/api/useSubscription', () => ({
  useSubscriptionStatus: (options?: { refetchInterval?: number | false }) =>
    mockUseSubscriptionStatus(options),
}));

// Mock capabilities invalidation
const mockInvalidateCapabilities = vi.fn();
vi.mock('@/hooks/api/useUserCapabilities', () => ({
  useInvalidateCapabilities: () => mockInvalidateCapabilities,
}));

// Mock auth store
const mockSetUser = vi.fn();
const mockAuthStore = vi.fn();
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockAuthStore(),
}));

// ============================================================================
// Test Setup
// ============================================================================

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('ActivationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });

    // Default: user is authenticated and free
    mockAuthStore.mockReturnValue({
      user: { id: 1, email: 'test@test.com', plan: 'free', subscriptionStatus: null },
      isAuthenticated: true,
      setUser: mockSetUser,
    });

    // Default: status not premium yet
    mockUseSubscriptionStatus.mockReturnValue({
      data: { plan: 'free', subscriptionStatus: null, planExpiresAt: null, mpPreapprovalId: null },
      isLoading: false,
    });

    // Default: no query params
    mockSearchParams.get.mockReturnValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ============================================================================
  // Sin status — redirige a /premium
  // ============================================================================

  describe('Sin status en query params', () => {
    it('should redirect to /premium when no status param is present', async () => {
      mockSearchParams.get.mockReturnValue(null);

      renderWithProviders(<ActivationPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/premium');
      });
    });

    it('should redirect to /premium when status param is an invalid/unknown value', async () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'status') return 'unknown';
        return null;
      });

      renderWithProviders(<ActivationPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/premium');
      });
    });
  });

  // ============================================================================
  // Sanitización del parámetro redirect (open-redirect prevention)
  // ============================================================================

  describe('Sanitización del parámetro redirect', () => {
    beforeEach(() => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'status') return 'authorized';
        return null;
      });

      mockUseSubscriptionStatus.mockReturnValue({
        data: {
          plan: 'premium',
          subscriptionStatus: 'active',
          planExpiresAt: '2026-04-01T00:00:00Z',
          mpPreapprovalId: 'mp_123',
        },
        isLoading: false,
      });
    });

    it('should redirect to /perfil (fallback) when redirect param is an external URL', async () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'status') return 'authorized';
        if (key === 'redirect') return 'https://evil.com/steal';
        return null;
      });

      renderWithProviders(<ActivationPage />);

      await waitFor(() => {
        expect(screen.getByTestId('activation-success')).toBeInTheDocument();
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/perfil');
        expect(mockPush).not.toHaveBeenCalledWith('https://evil.com/steal');
      });
    });

    it('should redirect to /perfil (fallback) when redirect param is a protocol-relative URL', async () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'status') return 'authorized';
        if (key === 'redirect') return '//evil.com';
        return null;
      });

      renderWithProviders(<ActivationPage />);

      await waitFor(() => {
        expect(screen.getByTestId('activation-success')).toBeInTheDocument();
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/perfil');
        expect(mockPush).not.toHaveBeenCalledWith('//evil.com');
      });
    });
  });

  // ============================================================================
  // Estado: authorized — muestra spinner, inicia polling
  // ============================================================================

  describe('Estado authorized', () => {
    beforeEach(() => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'status') return 'authorized';
        return null;
      });
    });

    it('should render spinner with "Activando tu plan Premium..." message', () => {
      renderWithProviders(<ActivationPage />);

      expect(screen.getByTestId('activation-loading')).toBeInTheDocument();
      expect(screen.getByText(/activando tu plan premium/i)).toBeInTheDocument();
    });

    it('should start polling (useSubscriptionStatus called with refetchInterval: 2000)', () => {
      renderWithProviders(<ActivationPage />);

      expect(mockUseSubscriptionStatus).toHaveBeenCalledWith(
        expect.objectContaining({ refetchInterval: 2000, enabled: true })
      );
    });

    it('should show success state and stop polling when plan becomes premium', async () => {
      mockUseSubscriptionStatus.mockReturnValue({
        data: {
          plan: 'premium',
          subscriptionStatus: 'active',
          planExpiresAt: '2026-04-01T00:00:00Z',
          mpPreapprovalId: 'mp_123',
        },
        isLoading: false,
      });

      renderWithProviders(<ActivationPage />);

      await waitFor(() => {
        expect(screen.getByTestId('activation-success')).toBeInTheDocument();
      });
    });

    it('should update Zustand store with plan=premium when activation detected', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        plan: 'free' as const,
        subscriptionStatus: null,
      };
      mockAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        setUser: mockSetUser,
      });

      mockUseSubscriptionStatus.mockReturnValue({
        data: {
          plan: 'premium',
          subscriptionStatus: 'active',
          planExpiresAt: '2026-04-01T00:00:00Z',
          mpPreapprovalId: 'mp_123',
        },
        isLoading: false,
      });

      renderWithProviders(<ActivationPage />);

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith(
          expect.objectContaining({
            plan: 'premium',
            subscriptionStatus: 'active',
          })
        );
      });
    });

    it('should invalidate capabilities query when activation detected', async () => {
      mockUseSubscriptionStatus.mockReturnValue({
        data: {
          plan: 'premium',
          subscriptionStatus: 'active',
          planExpiresAt: '2026-04-01T00:00:00Z',
          mpPreapprovalId: 'mp_123',
        },
        isLoading: false,
      });

      renderWithProviders(<ActivationPage />);

      await waitFor(() => {
        expect(mockInvalidateCapabilities).toHaveBeenCalled();
      });
    });

    it('should redirect to /perfil after 3 seconds when no redirect param', async () => {
      mockUseSubscriptionStatus.mockReturnValue({
        data: {
          plan: 'premium',
          subscriptionStatus: 'active',
          planExpiresAt: '2026-04-01T00:00:00Z',
          mpPreapprovalId: 'mp_123',
        },
        isLoading: false,
      });

      renderWithProviders(<ActivationPage />);

      await waitFor(() => {
        expect(screen.getByTestId('activation-success')).toBeInTheDocument();
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/perfil');
      });
    });

    it('should redirect to custom redirect param after 3 seconds', async () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'status') return 'authorized';
        if (key === 'redirect') return '/lecturas';
        return null;
      });

      mockUseSubscriptionStatus.mockReturnValue({
        data: {
          plan: 'premium',
          subscriptionStatus: 'active',
          planExpiresAt: '2026-04-01T00:00:00Z',
          mpPreapprovalId: 'mp_123',
        },
        isLoading: false,
      });

      renderWithProviders(<ActivationPage />);

      await waitFor(() => {
        expect(screen.getByTestId('activation-success')).toBeInTheDocument();
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/lecturas');
      });
    });

    it('should show timeout message after 30 seconds without premium activation', async () => {
      // Plan never becomes premium
      mockUseSubscriptionStatus.mockReturnValue({
        data: {
          plan: 'free',
          subscriptionStatus: null,
          planExpiresAt: null,
          mpPreapprovalId: null,
        },
        isLoading: false,
      });

      renderWithProviders(<ActivationPage />);

      expect(screen.getByTestId('activation-loading')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(30000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('activation-timeout')).toBeInTheDocument();
      });

      expect(screen.getByText(/estamos procesando tu pago/i)).toBeInTheDocument();
    });

    it('should show "Ir al inicio" button on timeout', async () => {
      mockUseSubscriptionStatus.mockReturnValue({
        data: {
          plan: 'free',
          subscriptionStatus: null,
          planExpiresAt: null,
          mpPreapprovalId: null,
        },
        isLoading: false,
      });

      renderWithProviders(<ActivationPage />);

      act(() => {
        vi.advanceTimersByTime(30000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('btn-go-home-timeout')).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // Estado: pending
  // ============================================================================

  describe('Estado pending', () => {
    beforeEach(() => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'status') return 'pending';
        return null;
      });
    });

    it('should render pending message', () => {
      renderWithProviders(<ActivationPage />);

      expect(screen.getByTestId('activation-pending')).toBeInTheDocument();
      expect(screen.getByText(/tu pago está siendo procesado/i)).toBeInTheDocument();
    });

    it('should render "Ir al inicio" button', () => {
      renderWithProviders(<ActivationPage />);

      expect(screen.getByTestId('btn-go-home-pending')).toBeInTheDocument();
    });

    it('should NOT start polling when status is pending', () => {
      renderWithProviders(<ActivationPage />);

      expect(mockUseSubscriptionStatus).toHaveBeenCalledWith(
        expect.objectContaining({ refetchInterval: false, enabled: false })
      );
    });
  });

  // ============================================================================
  // Estado: failure
  // ============================================================================

  describe('Estado failure', () => {
    beforeEach(() => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'status') return 'failure';
        return null;
      });
    });

    it('should render failure error message', () => {
      renderWithProviders(<ActivationPage />);

      expect(screen.getByTestId('activation-failure')).toBeInTheDocument();
      expect(screen.getByText(/hubo un problema con tu pago/i)).toBeInTheDocument();
    });

    it('should render "Reintentar" button that navigates to /premium', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProviders(<ActivationPage />);

      const retryBtn = screen.getByTestId('btn-retry');
      await user.click(retryBtn);

      expect(mockPush).toHaveBeenCalledWith('/premium');
    });

    it('should render "Ir al inicio" button', () => {
      renderWithProviders(<ActivationPage />);

      expect(screen.getByTestId('btn-go-home-failure')).toBeInTheDocument();
    });

    it('should NOT start polling when status is failure', () => {
      renderWithProviders(<ActivationPage />);

      expect(mockUseSubscriptionStatus).toHaveBeenCalledWith(
        expect.objectContaining({ refetchInterval: false, enabled: false })
      );
    });
  });
});
