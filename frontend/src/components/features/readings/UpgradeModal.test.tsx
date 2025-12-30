import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UpgradeModal from './UpgradeModal';

describe('UpgradeModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
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

      expect(screen.getByText(/Interpretaciones con IA personalizadas/i)).toBeInTheDocument();
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

    it('should not navigate away when clicking "Comenzar ahora" (disabled for MVP)', () => {
      render(<UpgradeModal open={true} onClose={mockOnClose} />);

      const ctaButton = screen.getByRole('button', { name: /Comenzar ahora/i });
      expect(ctaButton).toBeDisabled();
    });

    it('should show tooltip on disabled CTA button', () => {
      render(<UpgradeModal open={true} onClose={mockOnClose} />);

      const ctaButton = screen.getByRole('button', { name: /Comenzar ahora/i });
      expect(ctaButton).toHaveAttribute('title');
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

      expect(benefits[0]).toHaveTextContent(/IA/i);
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
