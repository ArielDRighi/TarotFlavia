import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddBlockedDateForm } from './AddBlockedDateForm';
import { ExceptionType } from '@/types';
import { addBlockedDateSchema } from '@/lib/validations/scheduling-admin.schemas';

describe('AddBlockedDateForm', () => {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders data-testid for the form', () => {
    render(<AddBlockedDateForm onSubmit={onSubmit} onCancel={onCancel} isPending={false} />);
    expect(screen.getByTestId('add-blocked-date-form')).toBeInTheDocument();
  });

  it('renders date input field', () => {
    render(<AddBlockedDateForm onSubmit={onSubmit} onCancel={onCancel} isPending={false} />);
    expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument();
  });

  it('renders exception type select', () => {
    render(<AddBlockedDateForm onSubmit={onSubmit} onCancel={onCancel} isPending={false} />);
    expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument();
  });

  it('renders reason textarea', () => {
    render(<AddBlockedDateForm onSubmit={onSubmit} onCancel={onCancel} isPending={false} />);
    expect(screen.getByLabelText(/motivo/i)).toBeInTheDocument();
  });

  it('renders submit and cancel buttons', () => {
    render(<AddBlockedDateForm onSubmit={onSubmit} onCancel={onCancel} isPending={false} />);
    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    render(<AddBlockedDateForm onSubmit={onSubmit} onCancel={onCancel} isPending={false} />);
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows validation error when date is empty on submit', async () => {
    render(<AddBlockedDateForm onSubmit={onSubmit} onCancel={onCancel} isPending={false} />);
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }));
    expect(await screen.findByText(/fecha debe tener formato/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects an impossible calendar date like 2026-99-99 at schema level', () => {
    const result = addBlockedDateSchema.safeParse({
      exceptionDate: '2026-99-99',
      exceptionType: ExceptionType.BLOCKED,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const dateError = result.error.issues.find((i) => i.path.includes('exceptionDate'));
      expect(dateError).toBeDefined();
      expect(dateError?.message).toMatch(/no es válida/i);
    }
  });

  it('calls onSubmit with correct data for blocked type', async () => {
    render(<AddBlockedDateForm onSubmit={onSubmit} onCancel={onCancel} isPending={false} />);
    await userEvent.type(screen.getByLabelText(/fecha/i), '2026-04-01');
    // Select "blocked" type (default)
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }));
    expect(await screen.findByRole('button', { name: /guardar/i })).toBeInTheDocument();
    // After fix of date, submit should call onSubmit
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        exceptionDate: '2026-04-01',
        exceptionType: ExceptionType.BLOCKED,
      }),
      expect.anything()
    );
  });

  it('disables submit button while isPending is true', () => {
    render(<AddBlockedDateForm onSubmit={onSubmit} onCancel={onCancel} isPending={true} />);
    expect(screen.getByRole('button', { name: /guardar/i })).toBeDisabled();
  });
});
