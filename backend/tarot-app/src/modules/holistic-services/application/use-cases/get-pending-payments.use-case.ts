import { Injectable, Inject } from '@nestjs/common';
import {
  SERVICE_PURCHASE_REPOSITORY,
  IServicePurchaseRepository,
} from '../../domain/interfaces';
import { PurchaseResponseDto } from '../dto/purchase-response.dto';
import { ServicePurchase } from '../../entities/service-purchase.entity';

@Injectable()
export class GetPendingPaymentsUseCase {
  constructor(
    @Inject(SERVICE_PURCHASE_REPOSITORY)
    private readonly servicePurchaseRepository: IServicePurchaseRepository,
  ) {}

  async execute(): Promise<PurchaseResponseDto[]> {
    const purchases =
      await this.servicePurchaseRepository.findPendingPayments();
    return purchases.map((purchase) => this.mapToResponseDto(purchase));
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
    }

    return dto;
  }
}
