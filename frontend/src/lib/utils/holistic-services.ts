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
 * Uses `parseDateString` (noon-local trick) to avoid UTC-midnight day shift
 * when comparing the appointment date against today.
 */
export function deriveDisplayStatus(purchase: ServicePurchase): DisplayStatus {
  if (purchase.paymentStatus === 'paid') {
    if (!purchase.selectedDate) return 'completed';
    const appointmentDate = parseDateString(purchase.selectedDate);
    return appointmentDate >= new Date() ? 'confirmed' : 'completed';
  }

  if (purchase.paymentStatus === 'pending' && purchase.selectedDate) {
    const appointmentDate = parseDateString(purchase.selectedDate);
    if (appointmentDate < new Date()) return 'expired';
  }

  return purchase.paymentStatus;
}
