import { ServicePurchase } from '../../entities/service-purchase.entity';
import { PurchaseStatus } from '../enums/purchase-status.enum';
import { SessionType } from '../../../scheduling/domain/enums/session-type.enum';

export interface IServicePurchaseRepository {
  save(purchase: Partial<ServicePurchase>): Promise<ServicePurchase>;

  findById(id: number): Promise<ServicePurchase | null>;

  findByUserId(userId: number): Promise<ServicePurchase[]>;

  findByUserIdWithService(userId: number): Promise<ServicePurchase[]>;

  findPendingByUserAndService(
    userId: number,
    holisticServiceId: number,
  ): Promise<ServicePurchase | null>;

  findPendingPayments(): Promise<ServicePurchase[]>;

  /**
   * Returns all purchases regardless of status, with user and holisticService
   * relations loaded. Used by the admin transactions history view.
   */
  findAllPurchases(): Promise<ServicePurchase[]>;

  findByIdWithRelations(id: number): Promise<ServicePurchase | null>;

  updateStatus(
    id: number,
    status: PurchaseStatus,
    extra?: Partial<ServicePurchase>,
  ): Promise<ServicePurchase | null>;

  /**
   * Updates a purchase status atomically, only if the current status matches
   * the expected status. Returns true if the update was applied (exactly 1 row
   * affected), false if the row was already in a different state (idempotent /
   * race condition guard).
   */
  updateStatusIfCurrent(
    id: number,
    expectedStatus: PurchaseStatus,
    newStatus: PurchaseStatus,
    extra?: Partial<ServicePurchase>,
  ): Promise<boolean>;

  /**
   * Finds a paid purchase for a user with no session assigned yet,
   * matching the holistic service's session type.
   */
  findPaidUnassignedByUserAndSessionType(
    userId: number,
    sessionType: SessionType,
  ): Promise<ServicePurchase | null>;

  /**
   * Finds a purchase by its Mercado Pago payment ID.
   * Used during webhook processing to locate the purchase to update.
   */
  findByMercadoPagoPaymentId(
    mercadoPagoPaymentId: string,
  ): Promise<ServicePurchase | null>;

  /**
   * Finds a purchase by its Mercado Pago preference ID.
   * Used as a fallback lookup when the webhook references a preference ID.
   */
  findByPreferenceId(preferenceId: string): Promise<ServicePurchase | null>;
}
