import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  SERVICE_PURCHASE_REPOSITORY,
  IServicePurchaseRepository,
} from '../../domain/interfaces';
import { PurchaseResponseDto } from '../dto/purchase-response.dto';
import { PurchaseStatus } from '../../domain/enums/purchase-status.enum';
import { ServicePurchase } from '../../entities/service-purchase.entity';

@Injectable()
export class GetPurchaseByIdUseCase {
  constructor(
    @Inject(SERVICE_PURCHASE_REPOSITORY)
    private readonly servicePurchaseRepository: IServicePurchaseRepository,
  ) {}

  async execute(
    purchaseId: number,
    requestingUserId: number,
  ): Promise<PurchaseResponseDto> {
    const purchase =
      await this.servicePurchaseRepository.findByIdWithRelations(purchaseId);

    if (!purchase) {
      throw new NotFoundException('Compra no encontrada');
    }

    if (purchase.userId !== requestingUserId) {
      throw new ForbiddenException('No tienes permiso para ver esta compra');
    }

    return this.mapToResponseDto(purchase);
  }

  private mapToResponseDto(purchase: ServicePurchase): PurchaseResponseDto {
    const dto: PurchaseResponseDto = {
      id: purchase.id,
      userId: purchase.userId,
      holisticServiceId: purchase.holisticServiceId,
      sessionId: purchase.sessionId,
      paymentStatus: purchase.paymentStatus,
      amountArs: purchase.amountArs,
      paymentReference: purchase.paymentReference,
      paidAt: purchase.paidAt,
      preferenceId: purchase.preferenceId,
      initPoint: null,
      selectedDate: purchase.selectedDate,
      selectedTime: purchase.selectedTime,
      mercadoPagoPaymentId: purchase.mercadoPagoPaymentId,
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
    };

    if (purchase.holisticService) {
      dto.holisticService = {
        id: purchase.holisticService.id,
        name: purchase.holisticService.name,
        slug: purchase.holisticService.slug,
        durationMinutes: purchase.holisticService.durationMinutes,
      };

      if (purchase.paymentStatus === PurchaseStatus.PAID) {
        dto.whatsappNumber = purchase.holisticService.whatsappNumber;
      }
    }

    return dto;
  }
}
