import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import PenduloPage from './page';
import { createMockUser, createMockPendulumFeatureLimit } from '@/test/factories';

// Create mock functions
const mockMutateAsync = vi.fn();

// Mock hooks
const mockUsePendulumQuery = vi.fn();
const mockUsePendulumCapabilities = vi.fn();
const mockUseAuthStore = vi.fn();

vi.mock('@/hooks/api/usePendulum', () => ({
  usePendulumQuery: () => mockUsePendulumQuery(),
  usePendulumCapabilities: () => mockUsePendulumCapabilities(),
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

// Mock components
vi.mock('@/components/features/pendulum', () => ({
  Pendulum: ({
    movement,
    isGlowing,
    'data-testid': dataTestId,
  }: {
    movement: string;
    isGlowing: boolean;
    'data-testid'?: string;
  }) => (
    <div data-testid={dataTestId || 'pendulum'} data-movement={movement} data-glowing={isGlowing}>
      Pendulum Component
    </div>
  ),
  PendulumDisclaimer: ({
    open,
    onAccept,
    onCancel,
  }: {
    open: boolean;
    onAccept: () => void;
    onCancel: () => void;
  }) =>
    open ? (
      <div data-testid="pendulum-disclaimer">
        <button onClick={onAccept} data-testid="accept-disclaimer">
          Entiendo y Acepto
        </button>
        <button onClick={onCancel} data-testid="cancel-disclaimer">
          Cancelar
        </button>
      </div>
    ) : null,
  PendulumLimitBanner: () => <div data-testid="limit-banner">Limit Banner</div>,
  PendulumResponseDisplay: ({
    response,
  }: {
    response: { responseText: string; interpretation: string };
  }) => (
    <div data-testid="pendulum-response">
      <div data-testid="response-text">{response.responseText}</div>
      <div data-testid="interpretation">{response.interpretation}</div>
    </div>
  ),
  PendulumBlockedContent: ({
    open,
    category,
    onClose,
  }: {
    open: boolean;
    category: string;
    onClose: () => void;
  }) =>
    open ? (
      <div data-testid="blocked-content">
        <div data-testid="blocked-category">{category}</div>
        <button onClick={onClose} data-testid="close-blocked">
          Cerrar
        </button>
      </div>
    ) : null,
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} className={className} data-testid="button">
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({
    value,
    onChange,
    placeholder,
    disabled,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    disabled?: boolean;
  }) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      data-testid="question-input"
    />
  ),
}));

vi.mock('@/hooks/api/useEncyclopediaArticles', () => ({
  useArticleSnippet: () => ({ data: null, isLoading: false, error: null }),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card-content">
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet">{children}</div>,
  SheetTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-trigger">{children}</div>
  ),
  SheetContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-content">{children}</div>
  ),
  SheetHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-header">{children}</div>
  ),
  SheetTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-title">{children}</div>
  ),
  SheetDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-description">{children}</div>
  ),
}));

// Test wrapper with QueryClient
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('PenduloPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks: authenticated FREE user with capabilities
    mockUseAuthStore.mockReturnValue({
      user: createMockUser({ plan: 'free' }),
    });
    mockUsePendulumCapabilities.mockReturnValue(
      createMockPendulumFeatureLimit({ used: 0, limit: 3, canUse: true, period: 'monthly' })
    );
    mockUsePendulumQuery.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      renderWithProviders(<PenduloPage />);

      expect(screen.getByText('Péndulo Digital')).toBeInTheDocument();
    });

    it('should render pendulum component', () => {
      renderWithProviders(<PenduloPage />);

      expect(screen.getByTestId('pendulum')).toBeInTheDocument();
    });

    it('should render limit banner', () => {
      renderWithProviders(<PenduloPage />);

      expect(screen.getByTestId('limit-banner')).toBeInTheDocument();
    });
  });

  describe('Premium User - Question Input', () => {
    beforeEach(() => {
      mockUseAuthStore.mockReturnValue({
        user: createMockUser({ plan: 'premium' }),
      });
      mockUsePendulumCapabilities.mockReturnValue(
        createMockPendulumFeatureLimit({ used: 0, limit: 1, canUse: true, period: 'daily' })
      );
    });

    it('should show question input for premium user', () => {
      renderWithProviders(<PenduloPage />);

      expect(screen.getByTestId('question-input')).toBeInTheDocument();
    });

    it('should allow typing question', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PenduloPage />);

      const input = screen.getByTestId('question-input');
      await user.type(input, '¿Debo aceptar este trabajo?');

      expect(input).toHaveValue('¿Debo aceptar este trabajo?');
    });
  });

  describe('Non-Premium User', () => {
    it('should NOT show question input for anonymous user', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
      });
      mockUsePendulumCapabilities.mockReturnValue(
        createMockPendulumFeatureLimit({ used: 0, limit: 1, canUse: true, period: 'lifetime' })
      );

      renderWithProviders(<PenduloPage />);

      expect(screen.queryByTestId('question-input')).not.toBeInTheDocument();
    });

    it('should show mental question prompt for non-premium users', () => {
      renderWithProviders(<PenduloPage />);

      expect(screen.getByText(/formula tu pregunta mentalmente/i)).toBeInTheDocument();
    });
  });

  describe('Disclaimer Flow', () => {
    it('should show disclaimer when consult button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PenduloPage />);

      const consultButton = screen.getByText('Consultar al Péndulo');
      await user.click(consultButton);

      expect(screen.getByTestId('pendulum-disclaimer')).toBeInTheDocument();
    });

    it('should NOT execute query when disclaimer is shown', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PenduloPage />);

      const consultButton = screen.getByText('Consultar al Péndulo');
      await user.click(consultButton);

      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it('should execute query when disclaimer is accepted', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue({
        response: 'yes',
        movement: 'vertical',
        responseText: 'Sí',
        interpretation: 'El universo afirma tu camino.',
        queryId: 1,
        lunarPhase: '🌕',
        lunarPhaseName: 'Luna Llena',
      });

      renderWithProviders(<PenduloPage />);

      const consultButton = screen.getByText('Consultar al Péndulo');
      await user.click(consultButton);

      const acceptButton = screen.getByTestId('accept-disclaimer');
      await user.click(acceptButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled();
      });
    });

    it('should NOT execute query when disclaimer is cancelled', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PenduloPage />);

      const consultButton = screen.getByText('Consultar al Péndulo');
      await user.click(consultButton);

      const cancelButton = screen.getByTestId('cancel-disclaimer');
      await user.click(cancelButton);

      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it('should close disclaimer when cancelled', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PenduloPage />);

      const consultButton = screen.getByText('Consultar al Péndulo');
      await user.click(consultButton);

      expect(screen.getByTestId('pendulum-disclaimer')).toBeInTheDocument();

      const cancelButton = screen.getByTestId('cancel-disclaimer');
      await user.click(cancelButton);

      expect(screen.queryByTestId('pendulum-disclaimer')).not.toBeInTheDocument();
    });
  });

  describe('Pendulum States', () => {
    it('should show idle movement initially', () => {
      renderWithProviders(<PenduloPage />);

      const pendulum = screen.getByTestId('pendulum');
      expect(pendulum).toHaveAttribute('data-movement', 'idle');
    });

    it('should show searching movement when query is pending', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  response: 'yes',
                  movement: 'vertical',
                  responseText: 'Sí',
                  interpretation: 'Test',
                  queryId: 1,
                  lunarPhase: '🌕',
                  lunarPhaseName: 'Luna Llena',
                }),
              100
            );
          })
      );

      renderWithProviders(<PenduloPage />);

      const consultButton = screen.getByText('Consultar al Péndulo');
      await user.click(consultButton);

      const acceptButton = screen.getByTestId('accept-disclaimer');
      await user.click(acceptButton);

      await waitFor(() => {
        const pendulum = screen.getByTestId('pendulum');
        expect(pendulum).toHaveAttribute('data-movement', 'searching');
      });
    });

    it('should show response movement after query completes', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue({
        response: 'yes',
        movement: 'vertical',
        responseText: 'Sí',
        interpretation: 'El universo afirma tu camino.',
        queryId: 1,
        lunarPhase: '🌕',
        lunarPhaseName: 'Luna Llena',
      });

      renderWithProviders(<PenduloPage />);

      const consultButton = screen.getByText('Consultar al Péndulo');
      await user.click(consultButton);

      const acceptButton = screen.getByTestId('accept-disclaimer');
      await user.click(acceptButton);

      await waitFor(
        () => {
          const pendulum = screen.getByTestId('pendulum');
          expect(pendulum).toHaveAttribute('data-movement', 'vertical');
        },
        { timeout: 6000 }
      );
    });
  });

  describe('Response Display', () => {
    it('should show response after query completes', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue({
        response: 'yes',
        movement: 'vertical',
        responseText: 'Sí',
        interpretation: 'El universo afirma tu camino.',
        queryId: 1,
        lunarPhase: '🌕',
        lunarPhaseName: 'Luna Llena',
      });

      renderWithProviders(<PenduloPage />);

      const consultButton = screen.getByText('Consultar al Péndulo');
      await user.click(consultButton);

      const acceptButton = screen.getByTestId('accept-disclaimer');
      await user.click(acceptButton);

      await waitFor(
        () => {
          expect(screen.getByTestId('pendulum-response')).toBeInTheDocument();
        },
        { timeout: 6000 }
      );
    }, 10000);

    it('should display correct response text', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue({
        response: 'no',
        movement: 'horizontal',
        responseText: 'No',
        interpretation: 'El universo sugiere otra dirección.',
        queryId: 2,
        lunarPhase: '🌑',
        lunarPhaseName: 'Luna Nueva',
      });

      renderWithProviders(<PenduloPage />);

      const consultButton = screen.getByText('Consultar al Péndulo');
      await user.click(consultButton);

      const acceptButton = screen.getByTestId('accept-disclaimer');
      await user.click(acceptButton);

      await waitFor(
        () => {
          expect(screen.getByTestId('response-text')).toHaveTextContent('No');
        },
        { timeout: 6000 }
      );
    }, 10000);
  });

  describe('New Consultation', () => {
    it('should show "Nueva consulta" button after response is shown', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue({
        response: 'yes',
        movement: 'vertical',
        responseText: 'Sí',
        interpretation: 'El universo afirma tu camino.',
        queryId: 1,
        lunarPhase: '🌕',
        lunarPhaseName: 'Luna Llena',
      });

      renderWithProviders(<PenduloPage />);

      const consultButton = screen.getByText('Consultar al Péndulo');
      await user.click(consultButton);

      const acceptButton = screen.getByTestId('accept-disclaimer');
      await user.click(acceptButton);

      await waitFor(
        () => {
          expect(screen.getByText('Nueva consulta')).toBeInTheDocument();
        },
        { timeout: 6000 }
      );
    }, 10000);

    it('should reset state when "Nueva consulta" is clicked', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue({
        response: 'yes',
        movement: 'vertical',
        responseText: 'Sí',
        interpretation: 'El universo afirma tu camino.',
        queryId: 1,
        lunarPhase: '🌕',
        lunarPhaseName: 'Luna Llena',
      });

      renderWithProviders(<PenduloPage />);

      const consultButton = screen.getByText('Consultar al Péndulo');
      await user.click(consultButton);

      const acceptButton = screen.getByTestId('accept-disclaimer');
      await user.click(acceptButton);

      await waitFor(
        () => {
          expect(screen.getByText('Nueva consulta')).toBeInTheDocument();
        },
        { timeout: 6000 }
      );

      const newConsultButton = screen.getByText('Nueva consulta');
      await user.click(newConsultButton);

      expect(screen.queryByTestId('pendulum-response')).not.toBeInTheDocument();
      expect(screen.getByText('Consultar al Péndulo')).toBeInTheDocument();
    }, 10000);
  });

  describe('Blocked Content', () => {
    it('should show blocked content modal when content is blocked', async () => {
      const user = userEvent.setup();
      mockUseAuthStore.mockReturnValue({
        user: createMockUser({ plan: 'premium' }),
      });
      mockMutateAsync.mockRejectedValue({
        isAxiosError: true,
        response: {
          data: {
            code: 'BLOCKED_CONTENT',
            category: 'salud',
          },
        },
      });

      renderWithProviders(<PenduloPage />);

      const input = screen.getByTestId('question-input');
      await user.type(input, '¿Tengo cáncer?');

      const consultButton = screen.getByText('Consultar al Péndulo');
      await user.click(consultButton);

      const acceptButton = screen.getByTestId('accept-disclaimer');
      await user.click(acceptButton);

      await waitFor(() => {
        expect(screen.getByTestId('blocked-content')).toBeInTheDocument();
      });
    });

    it('should display correct category in blocked content', async () => {
      const user = userEvent.setup();
      mockUseAuthStore.mockReturnValue({
        user: createMockUser({ plan: 'premium' }),
      });
      mockMutateAsync.mockRejectedValue({
        isAxiosError: true,
        response: {
          data: {
            code: 'BLOCKED_CONTENT',
            category: 'financiero',
          },
        },
      });

      renderWithProviders(<PenduloPage />);

      const consultButton = screen.getByText('Consultar al Péndulo');
      await user.click(consultButton);

      const acceptButton = screen.getByTestId('accept-disclaimer');
      await user.click(acceptButton);

      await waitFor(() => {
        expect(screen.getByTestId('blocked-category')).toHaveTextContent('financiero');
      });
    });
  });

  describe('Usage Limits', () => {
    it('should disable consult button when limit is reached', () => {
      mockUsePendulumCapabilities.mockReturnValue(
        createMockPendulumFeatureLimit({ used: 3, limit: 3, canUse: false, period: 'monthly' })
      );

      renderWithProviders(<PenduloPage />);

      const consultButton = screen.getByText('Consultar al Péndulo');
      expect(consultButton).toBeDisabled();
    });

    it('should NOT show disclaimer when clicking disabled button', async () => {
      const user = userEvent.setup();
      mockUsePendulumCapabilities.mockReturnValue(
        createMockPendulumFeatureLimit({ used: 3, limit: 3, canUse: false, period: 'monthly' })
      );

      renderWithProviders(<PenduloPage />);

      const consultButton = screen.getByText('Consultar al Péndulo');
      await user.click(consultButton);

      expect(screen.queryByTestId('pendulum-disclaimer')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithProviders(<PenduloPage />);

      expect(
        screen.getByRole('heading', { level: 1, name: /péndulo digital/i })
      ).toBeInTheDocument();
    });
  });

  describe('Info Sheet', () => {
    it('should render info button', () => {
      renderWithProviders(<PenduloPage />);

      expect(screen.getByTestId('sheet-trigger')).toBeInTheDocument();
    });

    it('should display sheet with info content', () => {
      renderWithProviders(<PenduloPage />);

      // Sheet content should be rendered (mocked in test)
      expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
    });

    it('should show "Cómo usar el péndulo" title in sheet', () => {
      renderWithProviders(<PenduloPage />);

      expect(screen.getByText('Cómo usar el péndulo')).toBeInTheDocument();
    });

    it('should display movement explanations', () => {
      renderWithProviders(<PenduloPage />);

      expect(screen.getByText(/Vertical:/)).toBeInTheDocument();
      expect(screen.getByText(/Sí/)).toBeInTheDocument();
      expect(screen.getByText(/Horizontal:/)).toBeInTheDocument();
      expect(screen.getByText(/No/)).toBeInTheDocument();
      expect(screen.getByText(/Circular:/)).toBeInTheDocument();
      expect(screen.getByText(/Quizás/)).toBeInTheDocument();
    });

    it('should display pendulum description', () => {
      renderWithProviders(<PenduloPage />);

      expect(screen.getByText(/El péndulo es una herramienta de adivinación/i)).toBeInTheDocument();
    });
  });

  describe('Premium Question Submission', () => {
    it('should send question to API for premium users', async () => {
      const user = userEvent.setup();
      mockUseAuthStore.mockReturnValue({
        user: createMockUser({ plan: 'premium' }),
      });
      mockMutateAsync.mockResolvedValue({
        response: 'yes',
        movement: 'vertical',
        responseText: 'Sí',
        interpretation: 'El universo afirma tu camino.',
        queryId: 1,
        lunarPhase: '🌕',
        lunarPhaseName: 'Luna Llena',
      });

      renderWithProviders(<PenduloPage />);

      const input = screen.getByTestId('question-input');
      await user.type(input, '¿Debo aceptar este trabajo?');

      const consultButton = screen.getByText('Consultar al Péndulo');
      await user.click(consultButton);

      const acceptButton = screen.getByTestId('accept-disclaimer');
      await user.click(acceptButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({ question: '¿Debo aceptar este trabajo?' });
      });
    });

    it('should NOT send question for non-premium users', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue({
        response: 'yes',
        movement: 'vertical',
        responseText: 'Sí',
        interpretation: 'El universo afirma tu camino.',
        queryId: null,
        lunarPhase: '🌕',
        lunarPhaseName: 'Luna Llena',
      });

      renderWithProviders(<PenduloPage />);

      const consultButton = screen.getByText('Consultar al Péndulo');
      await user.click(consultButton);

      const acceptButton = screen.getByTestId('accept-disclaimer');
      await user.click(acceptButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({ question: undefined });
      });
    });
  });
});
