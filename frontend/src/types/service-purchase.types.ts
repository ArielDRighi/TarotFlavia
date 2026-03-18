/**
 * Service Purchase Types
 *
 * Types for service purchase lifecycle (create, pay).
 * Reflect exactly the backend ServicePurchase entity contracts.
 */

import type { HolisticSessionType } from './holistic-service.types';

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
  sessionType: HolisticSessionType;
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
  /** URL de pago generada por Mercado Pago. Coincide con backend PurchaseResponseDto.initPoint */
  initPoint: string | null;
  /** ID de la preferencia de Mercado Pago. Coincide con backend PurchaseResponseDto.preferenceId */
  preferenceId?: string | null;
  /** ID del pago en Mercado Pago. Coincide con backend PurchaseResponseDto.mercadoPagoPaymentId */
  mercadoPagoPaymentId: string | null;
  /** Fecha elegida por el usuario al momento de contratar (YYYY-MM-DD) */
  selectedDate?: string | null;
  /** Horario elegido por el usuario al momento de contratar (HH:MM) */
  selectedTime?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO to create a purchase (authenticated user)
 * Coincide con backend CreatePurchaseDto
 */
export interface CreatePurchasePayload {
  holisticServiceId: number;
  /** Fecha elegida por el usuario (YYYY-MM-DD) */
  selectedDate: string;
  /** Horario elegido por el usuario (HH:MM) */
  selectedTime: string;
}
