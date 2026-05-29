/**
 * Payment/purchase status for holistic service purchases
 */
export enum PurchaseStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  /**
   * Set automatically by the daily cron when a purchase is still PENDING
   * and its appointment date (selectedDate) passed more than 24 hours ago.
   * Distinct from CANCELLED which implies an explicit user/admin action.
   */
  EXPIRED = 'expired',
}
