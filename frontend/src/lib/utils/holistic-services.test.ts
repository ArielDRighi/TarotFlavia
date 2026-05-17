/**
 * Tests for holistic-services utility
 *
 * TDD — T-BUG-003-A: deriveDisplayStatus debe retornar 'expired'
 * para compras pending con selectedDate en el pasado.
 *
 * Cubre todas las ramas:
 * - paid + fecha futura → 'confirmed'
 * - paid + fecha pasada → 'completed'
 * - paid + sin fecha    → 'completed'
 * - pending + fecha pasada → 'expired'
 * - pending + fecha futura → 'pending'
 * - pending + sin fecha    → 'pending'
 * - cancelled              → 'cancelled'
 * - refunded               → 'refunded'
 */

import { describe, it, expect } from 'vitest';
import { deriveDisplayStatus } from './holistic-services';
import type { ServicePurchase } from '@/types';

// ============================================================================
// Mock factory
// ============================================================================

function makePurchase(overrides: Partial<ServicePurchase>): ServicePurchase {
  return {
    id: 1,
    userId: 1,
    holisticServiceId: 1,
    holisticService: undefined,
    sessionId: null,
    paymentStatus: 'pending',
    amountArs: 5000,
    paymentReference: null,
    paidAt: null,
    initPoint: null,
    selectedDate: null,
    selectedTime: null,
    mercadoPagoPaymentId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

// ============================================================================
// Tests: paid purchases
// ============================================================================

describe('deriveDisplayStatus — paid purchases', () => {
  it('should return "confirmed" for paid purchase with future selectedDate', () => {
    const purchase = makePurchase({
      paymentStatus: 'paid',
      selectedDate: '2099-12-31',
    });
    expect(deriveDisplayStatus(purchase)).toBe('confirmed');
  });

  it('should return "completed" for paid purchase with past selectedDate', () => {
    const purchase = makePurchase({
      paymentStatus: 'paid',
      selectedDate: '2020-01-01',
    });
    expect(deriveDisplayStatus(purchase)).toBe('completed');
  });

  it('should return "completed" for paid purchase without selectedDate', () => {
    const purchase = makePurchase({
      paymentStatus: 'paid',
      selectedDate: null,
    });
    expect(deriveDisplayStatus(purchase)).toBe('completed');
  });
});

// ============================================================================
// Tests: pending purchases
// ============================================================================

describe('deriveDisplayStatus — pending purchases', () => {
  it('should return "expired" for pending purchase with past selectedDate', () => {
    const purchase = makePurchase({
      paymentStatus: 'pending',
      selectedDate: '2020-06-15',
    });
    expect(deriveDisplayStatus(purchase)).toBe('expired');
  });

  it('should return "pending" for pending purchase with future selectedDate', () => {
    const purchase = makePurchase({
      paymentStatus: 'pending',
      selectedDate: '2099-12-31',
    });
    expect(deriveDisplayStatus(purchase)).toBe('pending');
  });

  it('should return "pending" for pending purchase without selectedDate', () => {
    const purchase = makePurchase({
      paymentStatus: 'pending',
      selectedDate: null,
    });
    expect(deriveDisplayStatus(purchase)).toBe('pending');
  });
});

// ============================================================================
// Tests: other statuses
// ============================================================================

describe('deriveDisplayStatus — other statuses', () => {
  it('should return "cancelled" for cancelled purchase', () => {
    const purchase = makePurchase({ paymentStatus: 'cancelled' });
    expect(deriveDisplayStatus(purchase)).toBe('cancelled');
  });

  it('should return "refunded" for refunded purchase', () => {
    const purchase = makePurchase({ paymentStatus: 'refunded' });
    expect(deriveDisplayStatus(purchase)).toBe('refunded');
  });

  it('should return "cancelled" for cancelled purchase with past selectedDate (no expiry logic)', () => {
    const purchase = makePurchase({
      paymentStatus: 'cancelled',
      selectedDate: '2020-01-01',
    });
    expect(deriveDisplayStatus(purchase)).toBe('cancelled');
  });
});
