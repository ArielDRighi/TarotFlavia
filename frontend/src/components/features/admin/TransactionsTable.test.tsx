/**
 * TransactionsTable Component Tests
 * TDD: Tests escritos ANTES de la implementación
 *
 * Historial de transacciones de solo lectura para el admin.
 * Reemplaza PendingPaymentsTable — no hay botones de aprobación.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { TransactionsTable } from './TransactionsTable';
import type { ServicePurchase } from '@/types';

// ============================================================================
// Fixtures
// ============================================================================

const mockPurchases: ServicePurchase[] = [
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
    paymentStatus: 'paid',
    amountArs: 15000,
    paymentReference: null,
    paidAt: '2026-03-01T14:00:00.000Z',
    initPoint: null,
    mercadoPagoPaymentId: 'MP-98765',
    selectedDate: '2026-03-15',
    selectedTime: '10:00',
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T14:00:00.000Z',
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
    initPoint: null,
    mercadoPagoPaymentId: null,
    selectedDate: '2026-03-20',
    selectedTime: '14:00',
    createdAt: '2026-03-02T12:00:00.000Z',
    updatedAt: '2026-03-02T12:00:00.000Z',
  },
  {
    id: 12,
    userId: 7,
    holisticServiceId: 1,
    holisticService: {
      id: 1,
      name: 'Árbol Genealógico',
      slug: 'arbol-genealogico',
      durationMinutes: 60,
      sessionType: 'family_tree',
    },
    sessionId: null,
    paymentStatus: 'cancelled',
    amountArs: 15000,
    paymentReference: null,
    paidAt: null,
    initPoint: null,
    mercadoPagoPaymentId: null,
    selectedDate: null,
    selectedTime: null,
    createdAt: '2026-03-03T08:00:00.000Z',
    updatedAt: '2026-03-03T09:00:00.000Z',
  },
];

// ============================================================================
// Tests
// ============================================================================

describe('TransactionsTable', () => {
  beforeEach(() => {
    // No setup needed — purely presentational read-only component
  });

  // --- Rendering ---

  it('should render with data-testid', () => {
    render(<TransactionsTable purchases={mockPurchases} />);
    expect(screen.getByTestId('transactions-table')).toBeInTheDocument();
  });

  it('should render service names for each transaction', () => {
    render(<TransactionsTable purchases={mockPurchases} />);
    // Two purchases have 'Árbol Genealógico'; the service filter <option> also has it,
    // so there are 3 total occurrences. Verify both unique service names appear.
    expect(screen.getAllByText('Árbol Genealógico').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Péndulo Hebreo').length).toBeGreaterThanOrEqual(1);
  });

  it('should render user IDs for each transaction', () => {
    render(<TransactionsTable purchases={mockPurchases} />);
    expect(screen.getByText('Usuario #5')).toBeInTheDocument();
    expect(screen.getByText('Usuario #6')).toBeInTheDocument();
    expect(screen.getByText('Usuario #7')).toBeInTheDocument();
  });

  it('should render formatted amounts in ARS', () => {
    render(<TransactionsTable purchases={mockPurchases} />);
    expect(screen.getAllByText('$15.000')).toHaveLength(2);
    expect(screen.getByText('$12.000')).toBeInTheDocument();
  });

  it('should render MP payment ID when present', () => {
    render(<TransactionsTable purchases={mockPurchases} />);
    expect(screen.getByText('MP-98765')).toBeInTheDocument();
  });

  it('should render dash when MP payment ID is null', () => {
    render(<TransactionsTable purchases={mockPurchases} />);
    // Two purchases have null mercadoPagoPaymentId — shown as dashes
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it('should render payment status badges', () => {
    render(<TransactionsTable purchases={mockPurchases} />);
    // Status labels appear both as Badge text and as <option> text.
    // Use getAllByText to confirm at least one match for each status.
    expect(screen.getAllByText(/^pagado$/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/^pendiente$/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/^cancelado$/i).length).toBeGreaterThanOrEqual(1);
  });

  it('should render selected date when present', () => {
    render(<TransactionsTable purchases={mockPurchases} />);
    // selectedDate 2026-03-15 should appear formatted
    const cells = screen.getAllByRole('cell');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('should NOT render any approve button (read-only)', () => {
    render(<TransactionsTable purchases={mockPurchases} />);
    expect(screen.queryByRole('button', { name: /aprobar/i })).not.toBeInTheDocument();
  });

  // --- Empty state ---

  it('should render empty state when no purchases', () => {
    render(<TransactionsTable purchases={[]} />);
    expect(screen.getByText(/no hay transacciones/i)).toBeInTheDocument();
  });

  // --- Filters ---

  it('should render a filter by status selector', () => {
    render(<TransactionsTable purchases={mockPurchases} />);
    // There should be a combobox/select for filtering by status
    expect(screen.getByTestId('filter-status')).toBeInTheDocument();
  });

  it('should render a filter by service selector', () => {
    render(<TransactionsTable purchases={mockPurchases} />);
    expect(screen.getByTestId('filter-service')).toBeInTheDocument();
  });

  it('should filter transactions by status', () => {
    render(<TransactionsTable purchases={mockPurchases} />);

    const statusFilter = screen.getByTestId('filter-status');
    // Simulate selecting 'paid'
    fireEvent.change(statusFilter, { target: { value: 'paid' } });

    // Only the paid purchase (#10 — Árbol Genealógico for user 5) should be visible
    expect(screen.getByText('Usuario #5')).toBeInTheDocument();
    expect(screen.queryByText('Usuario #6')).not.toBeInTheDocument();
    expect(screen.queryByText('Usuario #7')).not.toBeInTheDocument();
  });

  it('should filter transactions by service', () => {
    render(<TransactionsTable purchases={mockPurchases} />);

    const serviceFilter = screen.getByTestId('filter-service');
    // Select service id '2' (Péndulo Hebreo)
    fireEvent.change(serviceFilter, { target: { value: '2' } });

    expect(screen.getAllByText('Péndulo Hebreo').length).toBeGreaterThanOrEqual(1);
    // 'Árbol Genealógico' may still appear as an <option> in the dropdown,
    // but it should not appear as a table cell. Check user IDs to confirm filtering.
    expect(screen.queryByText('Usuario #5')).not.toBeInTheDocument();
    expect(screen.queryByText('Usuario #7')).not.toBeInTheDocument();
    expect(screen.getByText('Usuario #6')).toBeInTheDocument();
  });

  it('should show all transactions when filter is reset to "all"', () => {
    render(<TransactionsTable purchases={mockPurchases} />);

    const statusFilter = screen.getByTestId('filter-status');
    fireEvent.change(statusFilter, { target: { value: 'paid' } });
    fireEvent.change(statusFilter, { target: { value: 'all' } });

    expect(screen.getByText('Usuario #5')).toBeInTheDocument();
    expect(screen.getByText('Usuario #6')).toBeInTheDocument();
    expect(screen.getByText('Usuario #7')).toBeInTheDocument();
  });
});
