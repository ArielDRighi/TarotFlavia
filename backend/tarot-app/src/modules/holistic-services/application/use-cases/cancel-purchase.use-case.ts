import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
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
export class CancelPurchaseUseCase {
  constructor(
    @Inject(SERVICE_PURCHASE_REPOSITORY)
    private readonly servicePurchaseRepository: IServicePurchaseRepository,
  ) {}

  async execute(
    purchaseId: number,
    requestingUserId: number,
    isAdmin: boolean,
  ): Promise<PurchaseResponseDto> {
    const purchase = await this.servicePurchaseRepository.findById(purchaseId);
    if (!purchase) {
      throw new NotFoundException(`Compra no encontrada: ${purchaseId}`);
    }

    if (!isAdmin && purchase.userId !== requestingUserId) {
      throw new ForbiddenException(
        'No tenés permiso para cancelar esta compra',
      );
    }

    if (purchase.paymentStatus !== PurchaseStatus.PENDING) {
      throw new BadRequestException(
        `Solo se pueden cancelar compras en estado PENDIENTE. Estado actual: ${purchase.paymentStatus}`,
      );
    }

    const updated = await this.servicePurchaseRepository.updateStatus(
      purchaseId,
      PurchaseStatus.CANCELLED,
      {},
    );

    if (!updated) {
      throw new NotFoundException(`Error al cancelar la compra: ${purchaseId}`);
    }

    return this.mapToResponseDto(updated);
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
      preferenceId: purchase.preferenceId,
      initPoint: null,
      selectedDate: purchase.selectedDate,
      selectedTime: purchase.selectedTime,
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
    };
  }
}
