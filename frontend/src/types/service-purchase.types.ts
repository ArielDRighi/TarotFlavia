/**
 * Service Purchase Types
 *
 * Types for service purchase lifecycle (create, pay, approve).
 * Reflect exactly the backend ServicePurchase entity contracts.
 */

/**
 * Purchase status enum
 * DEBE coincidir exactamente con backend PurchaseStatus enum (lowercase)
 */
export type PurchaseStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';

/**
 * Summary of the purchased holistic service (nested in purchase response)
 */
export interface PurchasedServiceSummary {
  id: number;
  name: string;
  slug: string;
  durationMinutes: number;
}

/**
 * Service purchase response
 * Coincide con backend PurchaseResponseDto
 * whatsappNumber solo se incluye cuando paymentStatus === PAID
 */
export interface ServicePurchase {
  id: number;
  userId: number;
  holisticServiceId: number;
  holisticService?: PurchasedServiceSummary;
  sessionId: number | null;
  paymentStatus: PurchaseStatus;
  amountArs: number;
  paymentReference: string | null;
  paidAt: string | null;
  whatsappNumber?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO to create a purchase (authenticated user)
 * Coincide con backend CreatePurchaseDto
 */
export interface CreatePurchasePayload {
  holisticServiceId: number;
}

/**
 * DTO to approve a purchase (admin only)
 * Coincide con backend ApprovePurchaseDto
 */
export interface ApprovePurchasePayload {
  paymentReference?: string;
}
