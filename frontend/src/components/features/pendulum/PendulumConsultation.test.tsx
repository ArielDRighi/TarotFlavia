import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

import { PendulumConsultation } from './PendulumConsultation';
import { RateLimitError } from '@/lib/api/axios-config';
import { toast } from '@/hooks/utils/useToast';

vi.mock('@/hooks/utils/useToast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock useArticleSnippet so EncyclopediaInfoWidget renders with data
const mockUseArticleSnippet = vi.fn();
vi.mock('@/hooks/api/useEncyclopediaArticles', () => ({
  useArticleSnippet: () => mockUseArticleSnippet(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock hooks and stores
const mockUseAuthStore = vi.fn();
const mockUsePendulumCapabilities = vi.fn();
const mockUsePendulumQuery = vi.fn();

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

vi.mock('@/hooks/api/usePendulum', () => ({
  usePendulumCapabilities: () => mockUsePendulumCapabilities(),
  usePendulumQuery: () => mockUsePendulumQuery(),
}));

// Mock pendulum child components
vi.mock('@/components/features/pendulum', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/features/pendulum')>();
  return {
    ...actual,
    Pendulum: ({ movement }: { movement: string }) => (
      <div data-testid="pendulum-animation" data-movement={movement} />
    ),
    // El disclaimer real es un modal; acá lo reducimos a un botón "Aceptar" cuando está abierto
    PendulumDisclaimer: ({ open, onAccept }: { open: boolean; onAccept: () => void }) =>
      open ? (
        <button type="button" data-testid="disclaimer-accept" onClick={onAccept}>
          Aceptar
        </button>
      ) : null,
    PendulumLimitBanner: () => <div data-testid="pendulum-limit-banner" />,
    PendulumResponseDisplay: () => null,
    PendulumBlockedContent: ({ open, category }: { open: boolean; category: string }) =>
      open ? <div data-testid="pendulum-blocked-content">{category}</div> : null,
  };
});

/** Construye un AxiosError real (isAxiosError === true) con el status y body dados */
function createAxiosError(status: number, data: Record<string, unknown>): AxiosError {
  const response = { status, data } as AxiosResponse;
  return new AxiosError(
    'Request failed',
    String(status),
    {} as InternalAxiosRequestConfig,
    undefined,
    response
  );
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('PendulumConsultation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });
    mockUsePendulumCapabilities.mockReturnValue({
      canUse: true,
    });
    mockUsePendulumQuery.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    mockUseArticleSnippet.mockReturnValue({
      data: {
        id: 2,
        slug: 'guia-pendulo',
        nameEs: 'Guía del Péndulo',
        snippet: 'Snippet del péndulo.',
      },
      isLoading: false,
      error: null,
    });
  });

  it('T-SEO-015: la tarjeta informativa ya no vive acá (la nota de uso la renderiza la página)', () => {
    renderWithProviders(<PendulumConsultation />);

    expect(screen.queryByTestId('pendulum-intro')).not.toBeInTheDocument();
  });

  it('debe renderizar correctamente la página con la tarjeta informativa', () => {
    renderWithProviders(<PendulumConsultation />);

    // The page should still render without errors
    expect(screen.getByText('Péndulo Digital')).toBeInTheDocument();
  });

  it('debe renderizar el titulo de la pagina', () => {
    renderWithProviders(<PendulumConsultation />);

    expect(screen.getByText('Péndulo Digital')).toBeInTheDocument();
  });

  // ==========================================================================
  // TASK-515: el error de límite (403/429) ya no se traga en silencio
  // ==========================================================================
  describe('TASK-515: manejo de errores al consultar', () => {
    /** Abre el disclaimer y lo acepta para disparar la consulta */
    async function consultar() {
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: 'Consultar al Péndulo' }));
      await user.click(screen.getByTestId('disclaimer-accept'));
    }

    it('403 anónimo: muestra el mensaje del backend en un toast y vuelve el péndulo a reposo', async () => {
      const backendMessage =
        'Ya has usado tu consulta gratuita del Péndulo. Regístrate para obtener más consultas.';
      const mutateAsync = vi
        .fn()
        .mockRejectedValue(createAxiosError(403, { message: backendMessage }));
      mockUsePendulumQuery.mockReturnValue({ mutateAsync, isPending: false });

      renderWithProviders(<PendulumConsultation />);
      await consultar();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(backendMessage);
      });
      expect(screen.getByTestId('pendulum-animation')).toHaveAttribute('data-movement', 'idle');
      expect(screen.getByRole('button', { name: 'Consultar al Péndulo' })).toBeEnabled();
      expect(screen.queryByTestId('pendulum-blocked-content')).not.toBeInTheDocument();
    });

    it('403 sin message: usa un fallback en español', async () => {
      const mutateAsync = vi.fn().mockRejectedValue(createAxiosError(403, {}));
      mockUsePendulumQuery.mockReturnValue({ mutateAsync, isPending: false });

      renderWithProviders(<PendulumConsultation />);
      await consultar();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledTimes(1);
      });
      const [message] = vi.mocked(toast.error).mock.calls[0];
      expect(message).toMatch(/consulta/i);
      expect(message).not.toMatch(/limit|reached|error/i);
    });

    it('429 (RateLimitError del interceptor): muestra su mensaje en un toast', async () => {
      const mutateAsync = vi
        .fn()
        .mockRejectedValue(new RateLimitError('Has alcanzado tu límite de consultas.'));
      mockUsePendulumQuery.mockReturnValue({ mutateAsync, isPending: false });

      renderWithProviders(<PendulumConsultation />);
      await consultar();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Has alcanzado tu límite de consultas.');
      });
      expect(screen.getByTestId('pendulum-animation')).toHaveAttribute('data-movement', 'idle');
    });

    it('otro error (red, 500): toast genérico en español', async () => {
      const mutateAsync = vi.fn().mockRejectedValue(new Error('Network Error'));
      mockUsePendulumQuery.mockReturnValue({ mutateAsync, isPending: false });

      renderWithProviders(<PendulumConsultation />);
      await consultar();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledTimes(1);
      });
      const [message] = vi.mocked(toast.error).mock.calls[0];
      expect(message).not.toBe('Network Error');
      expect(message).toMatch(/péndulo|intenta/i);
    });

    it('BLOCKED_CONTENT sigue abriendo PendulumBlockedContent sin toast', async () => {
      const mutateAsync = vi
        .fn()
        .mockRejectedValue(
          createAxiosError(400, {
            code: 'BLOCKED_CONTENT',
            category: 'salud',
            message: 'Bloqueado',
          })
        );
      mockUsePendulumQuery.mockReturnValue({ mutateAsync, isPending: false });

      renderWithProviders(<PendulumConsultation />);
      await consultar();

      expect(await screen.findByTestId('pendulum-blocked-content')).toHaveTextContent('salud');
      expect(toast.error).not.toHaveBeenCalled();
      expect(screen.getByTestId('pendulum-animation')).toHaveAttribute('data-movement', 'idle');
    });
  });
});
