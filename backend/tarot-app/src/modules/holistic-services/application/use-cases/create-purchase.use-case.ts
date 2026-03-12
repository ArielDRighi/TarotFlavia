import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import {
  HOLISTIC_SERVICE_REPOSITORY,
  IHolisticServiceRepository,
  SERVICE_PURCHASE_REPOSITORY,
  IServicePurchaseRepository,
} from '../../domain/interfaces';
import { CreatePurchaseDto } from '../dto/purchase.dto';
import { PurchaseResponseDto } from '../dto/purchase-response.dto';
import { PurchaseStatus } from '../../domain/enums/purchase-status.enum';
import { ServicePurchase } from '../../entities/service-purchase.entity';

@Injectable()
export class CreatePurchaseUseCase {
  constructor(
    @Inject(HOLISTIC_SERVICE_REPOSITORY)
    private readonly holisticServiceRepository: IHolisticServiceRepository,
    @Inject(SERVICE_PURCHASE_REPOSITORY)
    private readonly servicePurchaseRepository: IServicePurchaseRepository,
  ) {}

  async execute(
    userId: number,
    dto: CreatePurchaseDto,
  ): Promise<PurchaseResponseDto> {
    const service = await this.holisticServiceRepository.findById(
      dto.holisticServiceId,
    );
    if (!service) {
      throw new NotFoundException(
        `Servicio holístico no encontrado: ${dto.holisticServiceId}`,
      );
    }

    if (!service.isActive) {
      throw new BadRequestException(
        'El servicio seleccionado no está disponible actualmente',
      );
    }

    const existing =
      await this.servicePurchaseRepository.findPendingByUserAndService(
        userId,
        dto.holisticServiceId,
      );
    if (existing) {
      throw new ConflictException(
        'Ya tenés una compra pendiente de este servicio. Esperá la aprobación del pago.',
      );
    }

    const purchase = await this.servicePurchaseRepository.save({
      userId,
      holisticServiceId: dto.holisticServiceId,
      paymentStatus: PurchaseStatus.PENDING,
      amountArs: service.priceArs,
      sessionId: null,
      paymentReference: null,
      paidAt: null,
      approvedByAdminId: null,
    });

    return this.mapToResponseDto(purchase);
  }

  private mapToResponseDto(purchase: ServicePurchase): PurchaseResponseDto {
    return {
      id: purchase.id,
      userId: purchase.userId,
      holisticServiceId: purchase.holisticServiceId,
      sessionId: purchase.sessionId,
      paymentStatus: purchase.paymentStatus,
      amountArs: purchase.amountArs,
      paymentReference: purchase.paymentReference,
      paidAt: purchase.paidAt,
      // whatsappNumber no se incluye para compras PENDING
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
    };
  }
}
