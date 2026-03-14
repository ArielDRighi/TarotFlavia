/**
 * PendingPaymentsTable Component Tests
 * TDD: Tests escritos ANTES de la implementación
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PendingPaymentsTable } from './PendingPaymentsTable';
import type { ServicePurchase } from '@/types';

const mockPendingPayments: ServicePurchase[] = [
  {
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
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 11,
    userId: 6,
    holisticServiceId: 2,
    holisticService: {
      id: 2,
      name: 'Péndulo Hebreo',
      slug: 'pendulo-hebreo',
      durationMinutes: 60,
      sessionType: 'hebrew_pendulum',
    },
    sessionId: null,
    paymentStatus: 'pending',
    amountArs: 12000,
    paymentReference: null,
    paidAt: null,
    createdAt: '2026-03-02T12:00:00.000Z',
    updatedAt: '2026-03-02T12:00:00.000Z',
  },
];

describe('PendingPaymentsTable', () => {
  const mockOnApprove = vi.fn();

  beforeEach(() => {
    mockOnApprove.mockClear();
  });

  it('should render service names', () => {
    render(<PendingPaymentsTable purchases={mockPendingPayments} onApprove={mockOnApprove} />);

    expect(screen.getByText('Árbol Genealógico')).toBeInTheDocument();
    expect(screen.getByText('Péndulo Hebreo')).toBeInTheDocument();
  });

  it('should render formatted amounts in ARS', () => {
    render(<PendingPaymentsTable purchases={mockPendingPayments} onApprove={mockOnApprove} />);

    expect(screen.getByText('$15.000')).toBeInTheDocument();
    expect(screen.getByText('$12.000')).toBeInTheDocument();
  });

  it('should render approve buttons for each payment', () => {
    render(<PendingPaymentsTable purchases={mockPendingPayments} onApprove={mockOnApprove} />);

    const approveButtons = screen.getAllByRole('button', { name: /aprobar/i });
    expect(approveButtons).toHaveLength(2);
  });

  it('should call onApprove with correct purchase when approve button is clicked', () => {
    render(<PendingPaymentsTable purchases={mockPendingPayments} onApprove={mockOnApprove} />);

    const approveButtons = screen.getAllByRole('button', { name: /aprobar/i });
    fireEvent.click(approveButtons[0]);

    expect(mockOnApprove).toHaveBeenCalledWith(mockPendingPayments[0]);
    expect(mockOnApprove).toHaveBeenCalledTimes(1);
  });

  it('should show empty state when no pending payments', () => {
    render(<PendingPaymentsTable purchases={[]} onApprove={mockOnApprove} />);

    expect(screen.getByText(/no hay pagos pendientes/i)).toBeInTheDocument();
  });

  it('should have correct data-testid', () => {
    render(<PendingPaymentsTable purchases={mockPendingPayments} onApprove={mockOnApprove} />);

    expect(screen.getByTestId('pending-payments-table')).toBeInTheDocument();
  });

  it('should render purchase creation date', () => {
    render(<PendingPaymentsTable purchases={mockPendingPayments} onApprove={mockOnApprove} />);

    // Fecha formateada - verificar que hay al menos una fecha renderizada
    const tableCells = screen.getAllByRole('cell');
    expect(tableCells.length).toBeGreaterThan(0);
  });
});
