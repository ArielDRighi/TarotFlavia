import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LimitReachedModal from './LimitReachedModal';

describe('LimitReachedModal', () => {
  const mockOnClose = vi.fn();
  const mockOnUpgrade = vi.fn();

  it('should render modal when open', () => {
    render(
      <LimitReachedModal
        open={true}
        onClose={mockOnClose}
        onUpgrade={mockOnUpgrade}
        currentLimit={2}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Has alcanzado tu límite diario/i)).toBeInTheDocument();
  });

  it('should not render modal when closed', () => {
    render(
      <LimitReachedModal
        open={false}
        onClose={mockOnClose}
        onUpgrade={mockOnUpgrade}
        currentLimit={2}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should display current limit in the message', () => {
    render(
      <LimitReachedModal
        open={true}
        onClose={mockOnClose}
        onUpgrade={mockOnUpgrade}
        currentLimit={2}
      />
    );

    expect(screen.getByText(/2 lecturas/i)).toBeInTheDocument();
  });

  it('should show Premium benefits', () => {
    render(
      <LimitReachedModal
        open={true}
        onClose={mockOnClose}
        onUpgrade={mockOnUpgrade}
        currentLimit={2}
      />
    );

    expect(screen.getByText(/3 lecturas diarias/i)).toBeInTheDocument();
    expect(screen.getByText(/Interpretaciones personalizadas/i)).toBeInTheDocument();
  });

  it('should call onUpgrade when clicking upgrade button', async () => {
    const user = userEvent.setup();
    render(
      <LimitReachedModal
        open={true}
        onClose={mockOnClose}
        onUpgrade={mockOnUpgrade}
        currentLimit={2}
      />
    );

    const upgradeButton = screen.getByRole('button', { name: /actualizar a premium/i });
    await user.click(upgradeButton);

    expect(mockOnUpgrade).toHaveBeenCalledOnce();
  });

  it('should call onClose when clicking "Volver mañana" button', async () => {
    const user = userEvent.setup();
    render(
      <LimitReachedModal
        open={true}
        onClose={mockOnClose}
        onUpgrade={mockOnUpgrade}
        currentLimit={2}
      />
    );

    const closeButton = screen.getByRole('button', { name: /volver mañana/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledOnce();
  });

  it('should show different message for ANONYMOUS users (limit 1)', () => {
    render(
      <LimitReachedModal
        open={true}
        onClose={mockOnClose}
        onUpgrade={mockOnUpgrade}
        currentLimit={1}
      />
    );

    expect(screen.getByText(/1 lectura/i)).toBeInTheDocument();
  });

  it('should be accessible with proper ARIA labels', () => {
    render(
      <LimitReachedModal
        open={true}
        onClose={mockOnClose}
        onUpgrade={mockOnUpgrade}
        currentLimit={2}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName();
  });

  it('should close when Escape key is pressed', async () => {
    const user = userEvent.setup();
    render(
      <LimitReachedModal
        open={true}
        onClose={mockOnClose}
        onUpgrade={mockOnUpgrade}
        currentLimit={2}
      />
    );

    await user.keyboard('{Escape}');

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close when clicking outside modal (overlay)', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <LimitReachedModal
        open={true}
        onClose={mockOnClose}
        onUpgrade={mockOnUpgrade}
        currentLimit={2}
      />
    );

    // Click on overlay (backdrop)
    const overlay = container.querySelector('[role="dialog"]')?.parentElement;
    if (overlay) {
      await user.click(overlay);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });
});
