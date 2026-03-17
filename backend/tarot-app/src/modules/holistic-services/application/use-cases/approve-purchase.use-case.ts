import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SERVICE_PURCHASE_REPOSITORY,
  IServicePurchaseRepository,
} from '../../domain/interfaces';
import { ApprovePurchaseDto } from '../dto/purchase.dto';
import { PurchaseResponseDto } from '../dto/purchase-response.dto';
import { PurchaseStatus } from '../../domain/enums/purchase-status.enum';
import { ServicePurchase } from '../../entities/service-purchase.entity';
import { EmailService } from '../../../email/email.service';

@Injectable()
export class ApprovePurchaseUseCase {
  private readonly logger = new Logger(ApprovePurchaseUseCase.name);

  constructor(
    @Inject(SERVICE_PURCHASE_REPOSITORY)
    private readonly servicePurchaseRepository: IServicePurchaseRepository,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    purchaseId: number,
    adminId: number,
    dto: ApprovePurchaseDto,
  ): Promise<PurchaseResponseDto> {
    const purchase =
      await this.servicePurchaseRepository.findByIdWithRelations(purchaseId);
    if (!purchase) {
      throw new NotFoundException(`Compra no encontrada: ${purchaseId}`);
    }

    if (purchase.paymentStatus !== PurchaseStatus.PENDING) {
      throw new BadRequestException(
        `La compra no puede ser aprobada porque su estado es: ${purchase.paymentStatus}`,
      );
    }

    const updateResult = await this.servicePurchaseRepository.updateStatus(
      purchaseId,
      PurchaseStatus.PAID,
      {
        approvedByAdminId: adminId,
        paidAt: new Date(),
        paymentReference: dto.paymentReference ?? null,
      },
    );

    if (!updateResult) {
      throw new NotFoundException(
        `Error al actualizar la compra: ${purchaseId}`,
      );
    }

    const updated =
      await this.servicePurchaseRepository.findByIdWithRelations(purchaseId);

    if (!updated) {
      throw new NotFoundException(
        `Error al recuperar la compra actualizada: ${purchaseId}`,
      );
    }

    await this.sendConfirmationEmail(purchase, updated);

    return this.mapToResponseDto(updated);
  }

  private async sendConfirmationEmail(
    original: ServicePurchase,
    updated: ServicePurchase,
  ): Promise<void> {
    try {
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:3000';
      const bookingUrl = `${frontendUrl}/servicios/reservar/${updated.id}`;
      const rawWhatsapp = original.holisticService.whatsappNumber;
      // wa.me requiere el número sin '+', espacios ni separadores
      const whatsappNumberForLink = rawWhatsapp.replace(/\D/g, '');

      await this.emailService.sendHolisticServiceConfirmation(
        original.user.email,
        {
          userName: original.user.name,
          serviceName: original.holisticService.name,
          amountArs: updated.amountArs,
          whatsappNumber: rawWhatsapp,
          whatsappNumberForLink,
          bookingUrl,
        },
      );
    } catch (error) {
      this.logger.error(
        `Error al enviar email de confirmación para compra ${updated.id}`,
        error instanceof Error ? error.stack : String(error),
      );
      // No relanzar — el pago ya fue aprobado
    }
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

    if (
      purchase.paymentStatus === PurchaseStatus.PAID &&
      purchase.holisticService
    ) {
      dto.whatsappNumber = purchase.holisticService.whatsappNumber;
    }

    return dto;
  }
}
