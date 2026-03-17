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

  findByIdWithRelations(id: number): Promise<ServicePurchase | null>;

  updateStatus(
    id: number,
    status: PurchaseStatus,
    extra?: Partial<ServicePurchase>,
  ): Promise<ServicePurchase | null>;

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
