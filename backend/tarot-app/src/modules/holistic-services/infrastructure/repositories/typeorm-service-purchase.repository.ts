import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ServicePurchase } from '../../entities/service-purchase.entity';
import { IServicePurchaseRepository } from '../../domain/interfaces/service-purchase-repository.interface';
import { PurchaseStatus } from '../../domain/enums/purchase-status.enum';
import { SessionType } from '../../../scheduling/domain/enums/session-type.enum';

type ServicePurchaseScalarFields = Pick<
  ServicePurchase,
  | 'userId'
  | 'holisticServiceId'
  | 'sessionId'
  | 'amountArs'
  | 'paymentReference'
  | 'paidAt'
  | 'approvedByAdminId'
  | 'mercadoPagoPaymentId'
  | 'preferenceId'
  | 'selectedDate'
  | 'selectedTime'
>;

@Injectable()
export class TypeOrmServicePurchaseRepository implements IServicePurchaseRepository {
  constructor(
    @InjectRepository(ServicePurchase)
    private readonly repository: Repository<ServicePurchase>,
  ) {}

  async save(purchaseData: Partial<ServicePurchase>): Promise<ServicePurchase> {
    const entity = this.repository.create(purchaseData);
    return this.repository.save(entity);
  }

  async findById(id: number): Promise<ServicePurchase | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async findByUserId(userId: number): Promise<ServicePurchase[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserIdWithService(userId: number): Promise<ServicePurchase[]> {
    return this.repository.find({
      where: { userId },
      relations: ['holisticService'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPendingByUserAndService(
    userId: number,
    holisticServiceId: number,
  ): Promise<ServicePurchase | null> {
    return this.repository.findOne({
      where: {
        userId,
        holisticServiceId,
        paymentStatus: PurchaseStatus.PENDING,
      },
    });
  }

  async findPendingPayments(): Promise<ServicePurchase[]> {
    return this.repository.find({
      where: { paymentStatus: PurchaseStatus.PENDING },
      relations: ['user', 'holisticService'],
      order: { createdAt: 'ASC' },
    });
  }

  async findByIdWithRelations(id: number): Promise<ServicePurchase | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'holisticService', 'session'],
    });
  }

  async findPaidUnassignedByUserAndSessionType(
    userId: number,
    sessionType: SessionType,
  ): Promise<ServicePurchase | null> {
    return this.repository.findOne({
      where: {
        userId,
        paymentStatus: PurchaseStatus.PAID,
        sessionId: IsNull(),
        holisticService: { sessionType },
      },
      relations: ['holisticService'],
    });
  }

  async updateStatus(
    id: number,
    status: PurchaseStatus,
    extra?: Partial<ServicePurchase>,
  ): Promise<ServicePurchase | null> {
    // Build a safe update payload by picking only the allowed scalar fields.
    // This prevents relation fields (user, holisticService, session) and
    // immutable fields (id, createdAt, updatedAt) from leaking into the
    // TypeORM update. paymentStatus is assigned explicitly so the status
    // argument always wins.
    const allowedKeys: (keyof ServicePurchaseScalarFields)[] = [
      'userId',
      'holisticServiceId',
      'sessionId',
      'amountArs',
      'paymentReference',
      'paidAt',
      'approvedByAdminId',
      'mercadoPagoPaymentId',
      'preferenceId',
      'selectedDate',
      'selectedTime',
    ];
    const scalarExtra: Partial<ServicePurchaseScalarFields> = {};
    if (extra) {
      for (const key of allowedKeys) {
        if (key in extra) {
          (scalarExtra as Record<string, unknown>)[key] = (
            extra as Record<string, unknown>
          )[key];
        }
      }
    }

    await this.repository.update(id, {
      ...scalarExtra,
      paymentStatus: status,
    });
    return this.repository.findOne({ where: { id } });
  }

  async findByMercadoPagoPaymentId(
    mercadoPagoPaymentId: string,
  ): Promise<ServicePurchase | null> {
    return this.repository.findOne({ where: { mercadoPagoPaymentId } });
  }

  async findByPreferenceId(
    preferenceId: string,
  ): Promise<ServicePurchase | null> {
    return this.repository.findOne({ where: { preferenceId } });
  }
}
