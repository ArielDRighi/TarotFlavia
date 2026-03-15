/**
 * Holistic Service Types
 *
 * Types for the holistic services module (Árbol Genealógico,
 * Péndulo Hebreo, Limpiezas Energéticas).
 * Reflect exactly the backend HolisticService entity contracts.
 */

/**
 * Holistic service session type
 * Values match backend session-type.enum.ts for holistic services (snake_case)
 */
export type HolisticSessionType = 'family_tree' | 'energy_cleaning' | 'hebrew_pendulum';

/**
 * Public holistic service (catalog listing)
 * Coincide con backend HolisticServiceResponseDto (sin datos sensibles)
 */
export interface HolisticService {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  priceArs: number;
  durationMinutes: number;
  sessionType: HolisticSessionType;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Public holistic service detail (single service page)
 * Coincide con backend HolisticServiceDetailResponseDto
 * Incluye descripción larga; NO incluye whatsappNumber ni mercadoPagoLink
 */
export interface HolisticServiceDetail extends HolisticService {
  longDescription: string;
}

/**
 * Admin holistic service (full data including sensitive fields)
 * Coincide con backend HolisticServiceAdminResponseDto
 */
export interface HolisticServiceAdmin extends HolisticServiceDetail {
  whatsappNumber: string;
  mercadoPagoLink: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a holistic service (admin only)
 * Coincide con backend CreateHolisticServiceDto
 */
export interface CreateHolisticServicePayload {
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  priceArs: number;
  durationMinutes: number;
  sessionType: HolisticSessionType;
  whatsappNumber: string;
  mercadoPagoLink: string;
  imageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
}

/**
 * DTO for updating a holistic service (admin only)
 * All fields are optional (Partial of create)
 */
export type UpdateHolisticServicePayload = Partial<CreateHolisticServicePayload>;

// ============================================================================
// Public Availability (T-SF-M02)
// ============================================================================

/**
 * A single availability slot for a given date
 * Coincide con backend ServiceAvailabilitySlot
 */
export interface ServiceAvailabilitySlot {
  time: string;
  available: boolean;
}

/**
 * Response from the public availability endpoint
 * Coincide con backend ServiceAvailabilityResponseDto
 */
export interface ServiceAvailabilityResponse {
  date: string;
  slots: ServiceAvailabilitySlot[];
}
