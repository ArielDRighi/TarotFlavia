import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import { MercadoPagoService } from '../../../payments/infrastructure/services/mercadopago.service';

@Injectable()
export class CreatePurchaseUseCase {
  private readonly logger = new Logger(CreatePurchaseUseCase.name);

  constructor(
    @Inject(HOLISTIC_SERVICE_REPOSITORY)
    private readonly holisticServiceRepository: IHolisticServiceRepository,
    @Inject(SERVICE_PURCHASE_REPOSITORY)
    private readonly servicePurchaseRepository: IServicePurchaseRepository,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    userId: number,
    dto: CreatePurchaseDto,
    userEmail: string,
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
      selectedDate: dto.selectedDate ?? null,
      selectedTime: dto.selectedTime ?? null,
    });

    // Create Mercado Pago preference (non-blocking on failure)
    let preferenceId: string | null = null;
    let initPoint: string | null = null;

    try {
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ??
        'http://localhost:3001';
      const backendUrl =
        this.configService.get<string>('BACKEND_URL') ??
        'http://localhost:3000';

      const mpResult = await this.mercadoPagoService.createPreference({
        purchaseId: purchase.id,
        serviceName: service.name,
        amountArs: service.priceArs,
        userEmail,
        notificationUrl: `${backendUrl}/api/v1/webhooks/mercadopago`,
        backUrls: {
          success: `${frontendUrl}/servicios/pago-exitoso`,
          pending: `${frontendUrl}/servicios/pago-pendiente`,
          failure: `${frontendUrl}/servicios/pago-fallido`,
        },
      });

      preferenceId = mpResult.preferenceId;
      initPoint = mpResult.initPoint;

      // Persist preferenceId on the purchase
      await this.servicePurchaseRepository.updateStatus(
        purchase.id,
        PurchaseStatus.PENDING,
        { preferenceId },
      );

      purchase.preferenceId = preferenceId;
    } catch (error) {
      this.logger.error(
        `Error al crear preferencia MP para compra ${purchase.id}`,
        error instanceof Error ? error.stack : String(error),
      );
      // Purchase was already created — do not fail the request
    }

    return this.mapToResponseDto(purchase, initPoint);
  }

  private mapToResponseDto(
    purchase: ServicePurchase,
    initPoint: string | null,
  ): PurchaseResponseDto {
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
      initPoint,
      selectedDate: purchase.selectedDate,
      selectedTime: purchase.selectedTime,
      mercadoPagoPaymentId: purchase.mercadoPagoPaymentId,
      // whatsappNumber no se incluye para compras PENDING
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
    };
  }
}
