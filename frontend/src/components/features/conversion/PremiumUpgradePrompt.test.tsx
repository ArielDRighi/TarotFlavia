import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ---------------------------------------------------------------------------
// Mocks — declared before component import so Vitest hoists them correctly
// ---------------------------------------------------------------------------

const mockMutate = vi.fn();
const mockRouterPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/api/useSubscription', () => ({
  useCreatePreapproval: vi.fn(),
}));

// Import after mocks
import PremiumUpgradePrompt from './PremiumUpgradePrompt';
import { useAuth } from '@/hooks/useAuth';
import { useCreatePreapproval } from '@/hooks/api/useSubscription';

// ---------------------------------------------------------------------------
// Helper cast
// ---------------------------------------------------------------------------
const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockUseCreatePreapproval = useCreatePreapproval as ReturnType<typeof vi.fn>;

// ---------------------------------------------------------------------------
// Default mocks setup
// ---------------------------------------------------------------------------

function setupFreeUser() {
  mockUseAuth.mockReturnValue({
    user: { id: 1, email: 'test@test.com', name: 'Test', plan: 'free', roles: [] },
    isAuthenticated: true,
  });
}

function setupAnonymousUser() {
  mockUseAuth.mockReturnValue({
    user: null,
    isAuthenticated: false,
  });
}

function setupPremiumUser() {
  mockUseAuth.mockReturnValue({
    user: { id: 1, email: 'test@test.com', name: 'Test', plan: 'premium', roles: [] },
    isAuthenticated: true,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PremiumUpgradePrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCreatePreapproval.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  // ── Variant: modal ────────────────────────────────────────────────────────

  describe('variant modal', () => {
    it('debe renderizar un dialog cuando variant es modal', () => {
      setupFreeUser();
      render(
        <PremiumUpgradePrompt
          open={true}
          onClose={vi.fn()}
          feature="preguntas personalizadas"
          variant="modal"
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('no debe renderizar el dialog cuando open es false', () => {
      setupFreeUser();
      render(
        <PremiumUpgradePrompt
          open={false}
          onClose={vi.fn()}
          feature="preguntas personalizadas"
          variant="modal"
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('debe mostrar el nombre del feature bloqueado en el modal', () => {
      setupFreeUser();
      render(
        <PremiumUpgradePrompt
          open={true}
          onClose={vi.fn()}
          feature="preguntas personalizadas"
          variant="modal"
        />
      );

      // Feature name appears in the dialog title; getAllByText handles multiple matches
      const matches = screen.getAllByText(/preguntas personalizadas/i);
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    it('debe llamar onClose cuando se cierra el modal', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();
      setupFreeUser();
      render(
        <PremiumUpgradePrompt
          open={true}
          onClose={mockOnClose}
          feature="preguntas personalizadas"
          variant="modal"
        />
      );

      await user.keyboard('{Escape}');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  // ── Variant: inline ───────────────────────────────────────────────────────

  describe('variant inline', () => {
    it('debe renderizar una card cuando variant es inline', () => {
      setupFreeUser();
      render(<PremiumUpgradePrompt feature="tiradas avanzadas" variant="inline" />);

      expect(screen.getByTestId('premium-upgrade-prompt-inline')).toBeInTheDocument();
    });

    it('debe mostrar el nombre del feature en la card inline', () => {
      setupFreeUser();
      render(<PremiumUpgradePrompt feature="tiradas avanzadas" variant="inline" />);

      // Feature name appears in both the heading and the description span
      const matches = screen.getAllByText(/tiradas avanzadas/i);
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ── Variant: banner ───────────────────────────────────────────────────────

  describe('variant banner', () => {
    it('debe renderizar un banner cuando variant es banner', () => {
      setupFreeUser();
      render(<PremiumUpgradePrompt feature="interpretaciones personalizadas" variant="banner" />);

      expect(screen.getByTestId('premium-upgrade-prompt-banner')).toBeInTheDocument();
    });

    it('debe mostrar el nombre del feature en el banner', () => {
      setupFreeUser();
      render(<PremiumUpgradePrompt feature="interpretaciones personalizadas" variant="banner" />);

      expect(screen.getByText(/interpretaciones personalizadas/i)).toBeInTheDocument();
    });
  });

  // ── Lógica de usuario premium ─────────────────────────────────────────────

  describe('usuario premium', () => {
    it('no debe renderizar nada si el usuario es premium (variant modal)', () => {
      setupPremiumUser();
      render(
        <PremiumUpgradePrompt
          open={true}
          onClose={vi.fn()}
          feature="preguntas personalizadas"
          variant="modal"
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('no debe renderizar nada si el usuario es premium (variant inline)', () => {
      setupPremiumUser();
      render(<PremiumUpgradePrompt feature="tiradas avanzadas" variant="inline" />);

      expect(screen.queryByTestId('premium-upgrade-prompt-inline')).not.toBeInTheDocument();
    });

    it('no debe renderizar nada si el usuario es premium (variant banner)', () => {
      setupPremiumUser();
      render(<PremiumUpgradePrompt feature="interpretaciones" variant="banner" />);

      expect(screen.queryByTestId('premium-upgrade-prompt-banner')).not.toBeInTheDocument();
    });
  });

  // ── Lógica de usuario anónimo ─────────────────────────────────────────────

  describe('usuario anónimo', () => {
    it('debe redirigir a /registro con query param si usuario no autenticado (modal)', async () => {
      const user = userEvent.setup();
      setupAnonymousUser();
      render(
        <PremiumUpgradePrompt
          open={true}
          onClose={vi.fn()}
          feature="preguntas personalizadas"
          variant="modal"
        />
      );

      const ctaButton = screen.getByRole('button', { name: /premium/i });
      await user.click(ctaButton);

      expect(mockRouterPush).toHaveBeenCalledWith('/registro?redirect=/premium');
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('debe redirigir a /registro con query param si usuario no autenticado (inline)', async () => {
      const user = userEvent.setup();
      setupAnonymousUser();
      render(<PremiumUpgradePrompt feature="tiradas avanzadas" variant="inline" />);

      const ctaButton = screen.getByRole('button', { name: /premium/i });
      await user.click(ctaButton);

      expect(mockRouterPush).toHaveBeenCalledWith('/registro?redirect=/premium');
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('debe redirigir a /registro con query param si usuario no autenticado (banner)', async () => {
      const user = userEvent.setup();
      setupAnonymousUser();
      render(<PremiumUpgradePrompt feature="interpretaciones" variant="banner" />);

      const ctaButton = screen.getByRole('button', { name: /premium/i });
      await user.click(ctaButton);

      expect(mockRouterPush).toHaveBeenCalledWith('/registro?redirect=/premium');
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  // ── Lógica de usuario free ────────────────────────────────────────────────

  describe('usuario free — inicia flujo MP', () => {
    it('debe llamar useCreatePreapproval mutate si usuario free (modal)', async () => {
      const user = userEvent.setup();
      setupFreeUser();
      mockUseCreatePreapproval.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });

      render(
        <PremiumUpgradePrompt
          open={true}
          onClose={vi.fn()}
          feature="preguntas personalizadas"
          variant="modal"
        />
      );

      const ctaButton = screen.getByRole('button', { name: /premium/i });
      await user.click(ctaButton);

      expect(mockMutate).toHaveBeenCalledOnce();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    it('debe llamar useCreatePreapproval mutate si usuario free (inline)', async () => {
      const user = userEvent.setup();
      setupFreeUser();
      mockUseCreatePreapproval.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });

      render(<PremiumUpgradePrompt feature="tiradas avanzadas" variant="inline" />);

      const ctaButton = screen.getByRole('button', { name: /premium/i });
      await user.click(ctaButton);

      expect(mockMutate).toHaveBeenCalledOnce();
    });

    it('debe llamar useCreatePreapproval mutate si usuario free (banner)', async () => {
      const user = userEvent.setup();
      setupFreeUser();
      mockUseCreatePreapproval.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });

      render(<PremiumUpgradePrompt feature="interpretaciones" variant="banner" />);

      const ctaButton = screen.getByRole('button', { name: /premium/i });
      await user.click(ctaButton);

      expect(mockMutate).toHaveBeenCalledOnce();
    });

    it('debe redirigir a initPoint de MP al recibir respuesta exitosa', async () => {
      const user = userEvent.setup();
      setupFreeUser();

      // Simulate mutate calling onSuccess with initPoint
      mockUseCreatePreapproval.mockReturnValue({
        mutate: vi.fn().mockImplementation((_vars, options) => {
          options?.onSuccess?.({ initPoint: 'https://www.mercadopago.com/checkout' });
        }),
        isPending: false,
      });

      const originalLocation = window.location;
      try {
        Object.defineProperty(window, 'location', {
          writable: true,
          value: { href: '' },
        });

        render(
          <PremiumUpgradePrompt
            open={true}
            onClose={vi.fn()}
            feature="preguntas personalizadas"
            variant="modal"
          />
        );

        const ctaButton = screen.getByRole('button', { name: /premium/i });
        await user.click(ctaButton);

        expect(window.location.href).toBe('https://www.mercadopago.com/checkout');
      } finally {
        Object.defineProperty(window, 'location', {
          writable: true,
          value: originalLocation,
        });
      }
    });

    it('debe mostrar estado de carga mientras isPending es true', () => {
      setupFreeUser();
      mockUseCreatePreapproval.mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });

      render(
        <PremiumUpgradePrompt
          open={true}
          onClose={vi.fn()}
          feature="preguntas personalizadas"
          variant="modal"
        />
      );

      const ctaButton = screen.getByRole('button', { name: /cargando/i });
      expect(ctaButton).toBeDisabled();
    });
  });

  // ── Prop trigger ──────────────────────────────────────────────────────────

  describe('prop trigger', () => {
    it('debe renderizar con trigger discovery (modal)', () => {
      setupFreeUser();
      render(
        <PremiumUpgradePrompt
          open={true}
          onClose={vi.fn()}
          feature="preguntas personalizadas"
          variant="modal"
          trigger="discovery"
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('debe renderizar con trigger limit-reached (modal)', () => {
      setupFreeUser();
      render(
        <PremiumUpgradePrompt
          open={true}
          onClose={vi.fn()}
          feature="lecturas diarias"
          variant="modal"
          trigger="limit-reached"
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
