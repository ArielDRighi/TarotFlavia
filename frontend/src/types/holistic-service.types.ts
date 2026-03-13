/**
 * Holistic Service Types
 *
 * Types for the holistic services module (Árbol Genealógico,
 * Péndulo Hebreo, Limpiezas Energéticas).
 * Reflect exactly the backend HolisticService entity contracts.
 */

import type { SessionType } from './session.types';

/**
 * Holistic service session type subset
 * Only session types used by holistic services
 */
export type HolisticSessionType = Extract<
  SessionType,
  'FAMILY_TREE' | 'ENERGY_CLEANING' | 'HEBREW_PENDULUM'
>;

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
