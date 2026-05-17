/**
 * Holistic Services utilities
 *
 * Shared helpers for purchase display logic used across
 * MyServicesList and MyServicesWidget components.
 */

import { parseDateString } from '@/lib/utils/date';
import type { ServicePurchase, PurchaseStatus } from '@/types';

// ============================================================================
// Types
// ============================================================================

/**
 * Display status derived from a ServicePurchase.
 * Extends PurchaseStatus with 'confirmed', 'completed', and 'expired'.
 *
 * - 'confirmed': paid, future appointment date
 * - 'completed': paid, past appointment date (or no date)
 * - 'expired':   pending, appointment date already passed
 */
export type DisplayStatus = PurchaseStatus | 'confirmed' | 'completed' | 'expired';

// ============================================================================
// Helpers
// ============================================================================

/**
 * Derives a display status from the purchase.
 *
 * - "paid" + future selectedDate        → "confirmed"
 * - "paid" + past selectedDate (or none) → "completed"
 * - "pending" + past selectedDate        → "expired"
 * - "pending" + future/no selectedDate   → "pending"
 * - any other status                     → paymentStatus as-is
 *
 * Both `parseDateString` and the "today" reference use LOCAL noon
 * (new Date(y, m, d, 12, 0, 0)) so that same-day comparisons are
 * stable regardless of the time-of-day the function is called.
 */
export function deriveDisplayStatus(purchase: ServicePurchase): DisplayStatus {
  const now = new Date();
  // Normalize "today" to local noon — same anchor as parseDateString
  const todayNoon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);

  if (purchase.paymentStatus === 'paid') {
    if (!purchase.selectedDate) return 'completed';
    const appointmentDate = parseDateString(purchase.selectedDate);
    return appointmentDate >= todayNoon ? 'confirmed' : 'completed';
  }

  if (purchase.paymentStatus === 'pending' && purchase.selectedDate) {
    const appointmentDate = parseDateString(purchase.selectedDate);
    if (appointmentDate < todayNoon) return 'expired';
  }

  return purchase.paymentStatus;
}
