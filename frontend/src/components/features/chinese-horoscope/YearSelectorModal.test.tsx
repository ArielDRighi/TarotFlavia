/**
 * YearSelectorModal Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { YearSelectorModal } from './YearSelectorModal';

describe('YearSelectorModal', () => {
  const mockOnConfirm = vi.fn();
  const mockOnOpenChange = vi.fn();

  const defaultProps = {
    open: true,
    animalNameEs: 'Dragón',
    onConfirm: mockOnConfirm,
    onOpenChange: mockOnOpenChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal when open', () => {
    render(<YearSelectorModal {...defaultProps} />);

    expect(screen.getByText(/¿En qué año nació esta persona\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Dragón/i)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<YearSelectorModal {...defaultProps} open={false} />);

    expect(screen.queryByText(/¿En qué año nació esta persona\?/i)).not.toBeInTheDocument();
  });

  it('should have data-testid for accessibility', () => {
    render(<YearSelectorModal {...defaultProps} />);

    expect(screen.getByTestId('year-selector-modal')).toBeInTheDocument();
  });

  it('should render year input field', () => {
    render(<YearSelectorModal {...defaultProps} />);

    const input = screen.getByLabelText(/Año de nacimiento/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveAttribute('min', '1900');
  });

  it('should render confirm and cancel buttons', () => {
    render(<YearSelectorModal {...defaultProps} />);

    expect(screen.getByRole('button', { name: /confirmar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('should disable confirm button when year is empty', () => {
    render(<YearSelectorModal {...defaultProps} />);

    const confirmButton = screen.getByRole('button', { name: /confirmar/i });
    expect(confirmButton).toBeDisabled();
  });

  it('should enable confirm button when year is entered', async () => {
    const user = userEvent.setup();
    render(<YearSelectorModal {...defaultProps} />);

    const input = screen.getByLabelText(/Año de nacimiento/i);
    const confirmButton = screen.getByRole('button', { name: /confirmar/i });

    await user.type(input, '1988');

    expect(confirmButton).toBeEnabled();
  });

  it('should call onConfirm with year when confirm button is clicked', async () => {
    const user = userEvent.setup();
    render(<YearSelectorModal {...defaultProps} />);

    const input = screen.getByLabelText(/Año de nacimiento/i);
    const confirmButton = screen.getByRole('button', { name: /confirmar/i });

    await user.type(input, '1988');
    await user.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledWith(1988);
  });

  it('should call onOpenChange with false when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<YearSelectorModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should validate year range (1900-current year)', async () => {
    const user = userEvent.setup();
    render(<YearSelectorModal {...defaultProps} />);

    const input = screen.getByLabelText(/Año de nacimiento/i);
    const currentYear = new Date().getFullYear();

    // Test lower bound
    await user.clear(input);
    await user.type(input, '1899');
    expect(screen.getByText(/debe ser entre 1900 y/i)).toBeInTheDocument();

    // Test upper bound
    await user.clear(input);
    await user.type(input, String(currentYear + 1));
    expect(screen.getByText(/debe ser entre 1900 y/i)).toBeInTheDocument();

    // Test valid year
    await user.clear(input);
    await user.type(input, '1988');
    expect(screen.queryByText(/debe ser entre 1900 y/i)).not.toBeInTheDocument();
  });

  it('should reset input when modal is reopened', async () => {
    const { rerender } = render(<YearSelectorModal {...defaultProps} open={false} />);

    // Open and enter year
    rerender(<YearSelectorModal {...defaultProps} open={true} />);
    const input = screen.getByLabelText(/Año de nacimiento/i);
    await userEvent.setup().type(input, '1988');

    // Close modal
    rerender(<YearSelectorModal {...defaultProps} open={false} />);

    // Reopen modal - input should be empty
    rerender(<YearSelectorModal {...defaultProps} open={true} />);
    const newInput = screen.getByLabelText(/Año de nacimiento/i);
    expect(newInput).toHaveValue(null);
  });

  it('should show animal emoji if provided', () => {
    render(<YearSelectorModal {...defaultProps} animalEmoji="🐉" />);

    expect(screen.getByText('🐉')).toBeInTheDocument();
  });
});
