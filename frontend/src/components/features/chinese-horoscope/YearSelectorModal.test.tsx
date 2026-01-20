/**
 * BirthDateSelectorModal (YearSelectorModal) Component Tests
 *
 * Tests for the modal that requests full birth date for Chinese horoscope calculation.
 * Full date is required because Chinese New Year varies each year.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { YearSelectorModal } from './YearSelectorModal';

describe('YearSelectorModal (BirthDateSelectorModal)', () => {
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

    expect(screen.getByText(/¿Cuándo nació esta persona\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Dragón/i)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<YearSelectorModal {...defaultProps} open={false} />);

    expect(screen.queryByText(/¿Cuándo nació esta persona\?/i)).not.toBeInTheDocument();
  });

  it('should have data-testid for accessibility', () => {
    render(<YearSelectorModal {...defaultProps} />);

    expect(screen.getByTestId('year-selector-modal')).toBeInTheDocument();
  });

  it('should render date input field', () => {
    render(<YearSelectorModal {...defaultProps} />);

    const input = screen.getByLabelText(/Fecha de nacimiento/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'date');
    expect(input).toHaveAttribute('min', '1900-01-01');
  });

  it('should render confirm and cancel buttons', () => {
    render(<YearSelectorModal {...defaultProps} />);

    expect(screen.getByRole('button', { name: /confirmar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('should disable confirm button when date is empty', () => {
    render(<YearSelectorModal {...defaultProps} />);

    const confirmButton = screen.getByRole('button', { name: /confirmar/i });
    expect(confirmButton).toBeDisabled();
  });

  it('should enable confirm button when date is entered', async () => {
    const user = userEvent.setup();
    render(<YearSelectorModal {...defaultProps} />);

    const input = screen.getByLabelText(/Fecha de nacimiento/i);
    const confirmButton = screen.getByRole('button', { name: /confirmar/i });

    await user.type(input, '1988-06-15');

    expect(confirmButton).toBeEnabled();
  });

  it('should call onConfirm with birth date string when confirm button is clicked', async () => {
    const user = userEvent.setup();
    render(<YearSelectorModal {...defaultProps} />);

    const input = screen.getByLabelText(/Fecha de nacimiento/i);
    const confirmButton = screen.getByRole('button', { name: /confirmar/i });

    await user.type(input, '1988-06-15');
    await user.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledWith('1988-06-15');
  });

  it('should call onOpenChange with false when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<YearSelectorModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should validate date range (1900 to today)', async () => {
    const user = userEvent.setup();
    render(<YearSelectorModal {...defaultProps} />);

    const input = screen.getByLabelText(/Fecha de nacimiento/i);

    // Test lower bound
    await user.clear(input);
    await user.type(input, '1899-01-01');
    expect(screen.getByText(/fecha debe ser entre 1900 y hoy/i)).toBeInTheDocument();

    // Test valid date
    await user.clear(input);
    await user.type(input, '1988-06-15');
    expect(screen.queryByText(/fecha debe ser entre 1900 y hoy/i)).not.toBeInTheDocument();
  });

  it('should reset input when modal is reopened', async () => {
    const user = userEvent.setup();
    const mockOnOpenChange = vi.fn();
    const { rerender } = render(
      <YearSelectorModal {...defaultProps} open={true} onOpenChange={mockOnOpenChange} />
    );

    // Enter date
    const input = screen.getByLabelText(/Fecha de nacimiento/i);
    await user.type(input, '1988-06-15');
    expect(input).toHaveValue('1988-06-15');

    // Close modal by clicking cancel button (this triggers reset via handleOpenChange)
    await user.click(screen.getByRole('button', { name: /Cancelar/i }));

    // Verify onOpenChange was called with false
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);

    // Rerender with closed then open again - the internal state was reset by handleOpenChange
    rerender(<YearSelectorModal {...defaultProps} open={false} onOpenChange={mockOnOpenChange} />);
    rerender(<YearSelectorModal {...defaultProps} open={true} onOpenChange={mockOnOpenChange} />);

    // Input should be empty after reset
    const newInput = screen.getByLabelText(/Fecha de nacimiento/i);
    expect(newInput).toHaveValue('');
  });

  it('should show animal emoji if provided', () => {
    render(<YearSelectorModal {...defaultProps} animalEmoji="🐉" />);

    expect(screen.getByText('🐉')).toBeInTheDocument();
  });

  it('should explain why full date is needed in description', () => {
    render(<YearSelectorModal {...defaultProps} />);

    expect(screen.getByText(/año nuevo chino/i)).toBeInTheDocument();
  });
});
