import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { WelcomeModal } from './WelcomeModal';

describe('WelcomeModal', () => {
  it('should not render when isOpen is false', () => {
    render(<WelcomeModal isOpen={false} onClose={vi.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(<WelcomeModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should display welcome title', () => {
    render(<WelcomeModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/bienvenid[ao]/i)).toBeInTheDocument();
  });

  it('should explain FREE plan features', () => {
    render(<WelcomeModal isOpen={true} onClose={vi.fn()} />);

    // Verificar que se menciona la funcionalidad FREE
    expect(screen.getAllByText(/carta del día/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/1 lectura.*día/i)).toBeInTheDocument();
  });

  it('should explain limitations and differences with PREMIUM', () => {
    render(<WelcomeModal isOpen={true} onClose={vi.fn()} />);

    // Verificar que se menciona la limitación FREE (sin IA)
    expect(screen.getByText(/sin interpretación de ia/i)).toBeInTheDocument();

    // Verificar que se menciona la ventaja PREMIUM
    expect(screen.getByText(/premium/i)).toBeInTheDocument();

    const ctaButton = screen.getByRole('button', { name: /comenzar|explorar|empezar/i });
    expect(ctaButton).toBeInTheDocument();
  });

  it('should call onClose when CTA button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<WelcomeModal isOpen={true} onClose={onClose} />);

    const ctaButton = screen.getByRole('button', { name: /comenzar|explorar|empezar/i });
    await user.click(ctaButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<WelcomeModal isOpen={true} onClose={onClose} />);

    // Dialog tiene un botón X de cierre automático de Radix UI
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ── Canon místico (T-PREM-007) ────────────────────────────────────────────

  describe('Canon styling', () => {
    it('el título usa Cormorant serif y el token de marca text-primary', () => {
      render(<WelcomeModal isOpen={true} onClose={vi.fn()} />);

      const title = screen.getByText(/bienvenid[ao]/i);
      expect(title).toHaveClass('font-serif');
      expect(title.className).toContain('text-primary');
    });

    it('la caja de conversión PREMIUM es un callout dorado de marca', () => {
      render(<WelcomeModal isOpen={true} onClose={vi.fn()} />);

      const heading = screen.getByText(/prueba premium/i);
      const callout = heading.closest('[class*="bg-secondary/"]');
      expect(callout).not.toBeNull();
      expect(callout?.className).toContain('border-secondary');
    });

    it('el CTA principal tiene foco dorado visible (focus-visible:ring-secondary)', () => {
      render(<WelcomeModal isOpen={true} onClose={vi.fn()} />);

      const ctaButton = screen.getByRole('button', { name: /comenzar|explorar|empezar/i });
      expect(ctaButton.className).toContain('focus-visible:ring-secondary');
    });

    it('no usa paleta púrpura/rosa cruda (off-canon)', () => {
      render(<WelcomeModal isOpen={true} onClose={vi.fn()} />);

      expect(document.body.querySelector('[class*="purple"]')).toBeNull();
      expect(document.body.querySelector('[class*="pink"]')).toBeNull();
    });
  });
});
