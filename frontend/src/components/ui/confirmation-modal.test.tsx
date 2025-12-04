import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfirmationModal } from './confirmation-modal';

describe('ConfirmationModal', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: 'Confirmar acción',
    description: '¿Estás seguro de realizar esta acción?',
    onConfirm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal when open is true', () => {
      render(<ConfirmationModal {...defaultProps} />);

      expect(screen.getByText('Confirmar acción')).toBeInTheDocument();
      expect(screen.getByText('¿Estás seguro de realizar esta acción?')).toBeInTheDocument();
    });

    it('should not render modal when open is false', () => {
      render(<ConfirmationModal {...defaultProps} open={false} />);

      expect(screen.queryByText('Confirmar acción')).not.toBeInTheDocument();
    });

    it('should render default confirm button text as "Confirmar"', () => {
      render(<ConfirmationModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
    });

    it('should render default cancel button text as "Cancelar"', () => {
      render(<ConfirmationModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    });

    it('should render custom confirm button text', () => {
      render(<ConfirmationModal {...defaultProps} confirmText="Eliminar" />);

      expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument();
    });

    it('should render custom cancel button text', () => {
      render(<ConfirmationModal {...defaultProps} cancelText="Volver" />);

      expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should apply default variant styles by default', () => {
      render(<ConfirmationModal {...defaultProps} />);

      const confirmButton = screen.getByRole('button', { name: 'Confirmar' });
      expect(confirmButton).not.toHaveClass('bg-destructive');
    });

    it('should apply destructive variant styles when variant is destructive', () => {
      render(<ConfirmationModal {...defaultProps} variant="destructive" />);

      const confirmButton = screen.getByRole('button', { name: 'Confirmar' });
      expect(confirmButton).toHaveAttribute('data-variant', 'destructive');
    });
  });

  describe('Loading State', () => {
    it('should show spinner and disable confirm button when loading', () => {
      render(<ConfirmationModal {...defaultProps} loading={true} />);

      const confirmButton = screen.getByRole('button', { name: /Confirmar/i });
      expect(confirmButton).toBeDisabled();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should not show spinner when not loading', () => {
      render(<ConfirmationModal {...defaultProps} loading={false} />);

      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    it('should disable cancel button when loading', () => {
      render(<ConfirmationModal {...defaultProps} loading={true} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Interactions', () => {
    it('should call onConfirm when confirm button is clicked', async () => {
      const onConfirm = vi.fn();
      render(<ConfirmationModal {...defaultProps} onConfirm={onConfirm} />);

      fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onOpenChange with false when cancel button is clicked', () => {
      const onOpenChange = vi.fn();
      render(<ConfirmationModal {...defaultProps} onOpenChange={onOpenChange} />);

      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should handle async onConfirm and wait for completion', async () => {
      const onConfirm = vi
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      const onOpenChange = vi.fn();

      render(
        <ConfirmationModal {...defaultProps} onConfirm={onConfirm} onOpenChange={onOpenChange} />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

      expect(onConfirm).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('should not close modal if async onConfirm throws error', async () => {
      const onConfirm = vi.fn().mockRejectedValue(new Error('Test error'));
      const onOpenChange = vi.fn();

      render(
        <ConfirmationModal {...defaultProps} onConfirm={onConfirm} onOpenChange={onOpenChange} />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledTimes(1);
      });

      expect(onOpenChange).not.toHaveBeenCalledWith(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper dialog role', () => {
      render(<ConfirmationModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have accessible title', () => {
      render(<ConfirmationModal {...defaultProps} />);

      expect(screen.getByRole('heading', { name: 'Confirmar acción' })).toBeInTheDocument();
    });
  });
});
