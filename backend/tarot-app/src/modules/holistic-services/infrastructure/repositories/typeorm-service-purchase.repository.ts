import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServicePurchase } from '../../entities/service-purchase.entity';
import { IServicePurchaseRepository } from '../../domain/interfaces/service-purchase-repository.interface';
import { PurchaseStatus } from '../../domain/enums/purchase-status.enum';

type ServicePurchaseScalarFields = Pick<
  ServicePurchase,
  | 'userId'
  | 'holisticServiceId'
  | 'sessionId'
  | 'paymentStatus'
  | 'amountArs'
  | 'paymentReference'
  | 'paidAt'
  | 'approvedByAdminId'
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

  async updateStatus(
    id: number,
    status: PurchaseStatus,
    extra?: Partial<ServicePurchase>,
  ): Promise<ServicePurchase | null> {
    const {
      user: _user,
      holisticService: _holisticService,
      session: _session,
      ...scalarExtra
    } = (extra ?? {}) as ServicePurchase;

    await this.repository.update(id, {
      paymentStatus: status,
      ...(scalarExtra as Partial<ServicePurchaseScalarFields>),
    });
    return this.repository.findOne({ where: { id } });
  }
}
