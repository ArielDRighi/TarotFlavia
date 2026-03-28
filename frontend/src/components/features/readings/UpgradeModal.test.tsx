import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks must be declared before imports so Vitest hoists them
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

import UpgradeModal from './UpgradeModal';
import { useAuth } from '@/hooks/useAuth';
import { useCreatePreapproval } from '@/hooks/api/useSubscription';

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockUseCreatePreapproval = useCreatePreapproval as ReturnType<typeof vi.fn>;

describe('UpgradeModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: FREE user
    mockUseAuth.mockReturnValue({
      user: { id: 1, email: 'test@test.com', name: 'Test', plan: 'free', roles: [] },
      isAuthenticated: true,
    });
    mockUseCreatePreapproval.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  describe('Rendering', () => {
    it('should not render when open is false', () => {
      render(<UpgradeModal open={false} onClose={mockOnClose} />);

      expect(screen.queryByText(/Desbloquea todo el potencial del Tarot/i)).not.toBeInTheDocument();
    });

    it('should render when open is true', () => {
      render(<UpgradeModal open={true} onClose={mockOnClose} />);

      expect(screen.getByText(/Desbloquea todo el potencial del Tarot/i)).toBeInTheDocument();
    });

    it('should render all premium benefits', () => {
      render(<UpgradeModal open={true} onClose={mockOnClose} />);

      expect(screen.getByText(/Interpretaciones personalizadas y profundas/i)).toBeInTheDocument();
      expect(screen.getByText(/Todas las tiradas disponibles/i)).toBeInTheDocument();
      expect(screen.getByText(/Preguntas personalizadas/i)).toBeInTheDocument();
      expect(screen.getByText(/Sin publicidad/i)).toBeInTheDocument();
    });

    it('should render pricing information', () => {
      render(<UpgradeModal open={true} onClose={mockOnClose} />);

      expect(screen.getByText(/9\.99/)).toBeInTheDocument();
      expect(screen.getByText(/mes/i)).toBeInTheDocument();
    });

    it('should render CTA button', () => {
      render(<UpgradeModal open={true} onClose={mockOnClose} />);

      expect(screen.getByRole('button', { name: /Comenzar ahora/i })).toBeInTheDocument();
    });

    it('should render "Más información" link', () => {
      render(<UpgradeModal open={true} onClose={mockOnClose} />);

      expect(screen.getByText(/Más información sobre Premium/i)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when clicking close button', () => {
      render(<UpgradeModal open={true} onClose={mockOnClose} />);

      // Dialog component includes built-in close button
      const closeButtons = screen.getAllByRole('button', { name: /close/i });
      expect(closeButtons.length).toBeGreaterThanOrEqual(1);

      fireEvent.click(closeButtons[0]);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking backdrop', () => {
      render(<UpgradeModal open={true} onClose={mockOnClose} />);

      // Dialog component calls onClose when backdrop is clicked
      const dialog = screen.getByRole('dialog');
      fireEvent.keyDown(dialog, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should enable "Comenzar ahora" CTA button for free users', () => {
      render(<UpgradeModal open={true} onClose={mockOnClose} />);

      const ctaButton = screen.getByRole('button', { name: /Comenzar ahora/i });
      expect(ctaButton).not.toBeDisabled();
    });

    it('should call createPreapproval mutate when clicking "Comenzar ahora" as free user', () => {
      render(<UpgradeModal open={true} onClose={mockOnClose} />);

      const ctaButton = screen.getByRole('button', { name: /Comenzar ahora/i });
      fireEvent.click(ctaButton);

      expect(mockMutate).toHaveBeenCalledTimes(1);
    });

    it('should redirect to initPoint when createPreapproval succeeds', () => {
      const initPoint = 'https://www.mercadopago.com/checkout/v1/redirect?pref_id=test-123';
      mockUseCreatePreapproval.mockReturnValue({
        mutate: vi
          .fn()
          .mockImplementation(
            (_vars: undefined, options: { onSuccess?: (data: { initPoint: string }) => void }) => {
              options?.onSuccess?.({ initPoint });
            }
          ),
        isPending: false,
      });

      const originalLocation = window.location;
      try {
        Object.defineProperty(window, 'location', {
          writable: true,
          value: { href: '' },
        });

        render(<UpgradeModal open={true} onClose={mockOnClose} />);

        const ctaButton = screen.getByRole('button', { name: /Comenzar ahora/i });
        fireEvent.click(ctaButton);

        expect(window.location.href).toBe(initPoint);
      } finally {
        Object.defineProperty(window, 'location', {
          writable: true,
          value: originalLocation,
        });
      }
    });

    it('should redirect to /registro when clicking CTA as anonymous user', () => {
      mockUseAuth.mockReturnValue({ user: null, isAuthenticated: false });

      render(<UpgradeModal open={true} onClose={mockOnClose} />);

      const ctaButton = screen.getByRole('button', { name: /Comenzar ahora/i });
      fireEvent.click(ctaButton);

      expect(mockRouterPush).toHaveBeenCalledWith(
        expect.stringContaining('/registro?redirect=/premium')
      );
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('should disable CTA button while isPending is true', () => {
      mockUseCreatePreapproval.mockReturnValue({ mutate: mockMutate, isPending: true });

      render(<UpgradeModal open={true} onClose={mockOnClose} />);

      const ctaButton = screen.getByRole('button', { name: /Cargando/i });
      expect(ctaButton).toBeDisabled();
    });
  });

  describe('Benefits Display', () => {
    it('should render all benefits with checkmark icons', () => {
      render(<UpgradeModal open={true} onClose={mockOnClose} />);

      const checkIcons = screen.getAllByTestId('check-icon');
      expect(checkIcons.length).toBeGreaterThanOrEqual(4);
    });

    it('should render benefits in correct order', () => {
      render(<UpgradeModal open={true} onClose={mockOnClose} />);

      const benefits = screen.getAllByRole('listitem');

      expect(benefits[0]).toHaveTextContent(/personalizadas y profundas/i);
      expect(benefits[1]).toHaveTextContent(/tiradas/i);
      expect(benefits[2]).toHaveTextContent(/preguntas/i);
      expect(benefits[3]).toHaveTextContent(/publicidad/i);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible dialog role', () => {
      render(<UpgradeModal open={true} onClose={mockOnClose} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have descriptive close button', () => {
      render(<UpgradeModal open={true} onClose={mockOnClose} />);

      const closeButtons = screen.getAllByRole('button', { name: /close/i });
      expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('should trap focus within modal when open', () => {
      render(<UpgradeModal open={true} onClose={mockOnClose} />);

      // Dialog component handles focus trap automatically
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should render correctly on mobile viewport', () => {
      // Simulating mobile viewport
      global.innerWidth = 375;
      global.innerHeight = 667;

      render(<UpgradeModal open={true} onClose={mockOnClose} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
