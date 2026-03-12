import { ServicePurchase } from '../../entities/service-purchase.entity';
import { PurchaseStatus } from '../enums/purchase-status.enum';

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
}
