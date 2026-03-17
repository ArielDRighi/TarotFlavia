/**
 * ApprovePaymentDialog Component Tests
 * TDD: Tests escritos ANTES de la implementación
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApprovePaymentDialog } from './ApprovePaymentDialog';
import type { ServicePurchase } from '@/types';

const mockPurchase: ServicePurchase = {
  id: 10,
  userId: 5,
  holisticServiceId: 1,
  holisticService: {
    id: 1,
    name: 'Árbol Genealógico',
    slug: 'arbol-genealogico',
    durationMinutes: 60,
    sessionType: 'family_tree',
  },
  sessionId: null,
  paymentStatus: 'pending',
  amountArs: 15000,
  paymentReference: null,
  paidAt: null,
  initPoint: null,
  createdAt: '2026-03-01T10:00:00.000Z',
  updatedAt: '2026-03-01T10:00:00.000Z',
};

describe('ApprovePaymentDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnConfirm.mockClear();
  });

  it('should not render when closed', () => {
    render(
      <ApprovePaymentDialog
        purchase={mockPurchase}
        open={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isPending={false}
      />
    );

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('should render dialog when open', () => {
    render(
      <ApprovePaymentDialog
        purchase={mockPurchase}
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isPending={false}
      />
    );

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('should show service name in dialog', () => {
    render(
      <ApprovePaymentDialog
        purchase={mockPurchase}
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isPending={false}
      />
    );

    expect(screen.getByText('Árbol Genealógico')).toBeInTheDocument();
  });

  it('should show amount in dialog', () => {
    render(
      <ApprovePaymentDialog
        purchase={mockPurchase}
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isPending={false}
      />
    );

    expect(screen.getByText(/\$15\.000/)).toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', () => {
    render(
      <ApprovePaymentDialog
        purchase={mockPurchase}
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isPending={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm when confirm button is clicked', () => {
    render(
      <ApprovePaymentDialog
        purchase={mockPurchase}
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isPending={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /aprobar pago/i }));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm with paymentReference when provided', async () => {
    render(
      <ApprovePaymentDialog
        purchase={mockPurchase}
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isPending={false}
      />
    );

    const referenceInput = screen.getByPlaceholderText(/referencia/i);
    fireEvent.change(referenceInput, { target: { value: 'MP-123456' } });

    fireEvent.click(screen.getByRole('button', { name: /aprobar pago/i }));
    expect(mockOnConfirm).toHaveBeenCalledWith({ paymentReference: 'MP-123456' });
  });

  it('should call onConfirm with undefined paymentReference when empty', () => {
    render(
      <ApprovePaymentDialog
        purchase={mockPurchase}
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isPending={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /aprobar pago/i }));
    expect(mockOnConfirm).toHaveBeenCalledWith({ paymentReference: undefined });
  });

  it('should disable buttons while pending', () => {
    render(
      <ApprovePaymentDialog
        purchase={mockPurchase}
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isPending={true}
      />
    );

    expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /aprobando/i })).toBeInTheDocument();
  });
});
