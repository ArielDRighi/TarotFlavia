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
 * Extends PurchaseStatus with 'confirmed' and 'completed' for paid purchases.
 */
export type DisplayStatus = PurchaseStatus | 'confirmed' | 'completed';

// ============================================================================
// Helpers
// ============================================================================

/**
 * Derives a display status from the purchase.
 *
 * - Non-paid purchases → use paymentStatus as-is
 * - "paid" with future selectedDate → "confirmed"
 * - "paid" with past selectedDate (or no date) → "completed"
 *
 * Uses `parseDateString` (noon-local trick) to avoid UTC-midnight day shift
 * when comparing the appointment date against today.
 */
export function deriveDisplayStatus(purchase: ServicePurchase): DisplayStatus {
  if (purchase.paymentStatus !== 'paid') return purchase.paymentStatus;

  if (!purchase.selectedDate) return 'completed';

  const appointmentDate = parseDateString(purchase.selectedDate);
  const today = new Date();
  return appointmentDate >= today ? 'confirmed' : 'completed';
}
