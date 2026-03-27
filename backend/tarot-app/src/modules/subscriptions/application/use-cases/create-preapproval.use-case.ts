import {
  Injectable,
  BadRequestException,
  BadGatewayException,
  InternalServerErrorException,
  NotFoundException,
  Inject,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoService } from '../../../payments/infrastructure/services/mercadopago.service';
import { UserPlan } from '../../../users/entities/user.entity';
import { CreatePreapprovalResponseDto } from '../dto/create-preapproval-response.dto';
import { USER_REPOSITORY } from '../../../users/domain/interfaces/repository.tokens';
import { IUserRepository } from '../../../users/domain/interfaces/user-repository.interface';

@Injectable()
export class CreatePreapprovalUseCase {
  private readonly logger = new Logger(CreatePreapprovalUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    userId: number,
    userEmail: string,
  ): Promise<CreatePreapprovalResponseDto> {
    // 1. Buscar usuario
    const user = await this.userRepo.findById(userId);

    // Fix 1: Guard — usuario debe existir
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 2. Validar que el usuario no sea ya premium
    if (user.plan === UserPlan.PREMIUM) {
      throw new BadRequestException(
        'El usuario ya tiene un plan premium activo',
      );
    }

    // 3. Obtener configuración de entorno
    const preapprovalPlanId =
      this.configService.get<string>('MP_PREAPPROVAL_PLAN_ID') ?? '';

    // Fix 2: Validar que MP_PREAPPROVAL_PLAN_ID esté configurado
    if (!preapprovalPlanId) {
      throw new InternalServerErrorException(
        'MP_PREAPPROVAL_PLAN_ID no está configurado',
      );
    }

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';
    const backendUrl =
      this.configService.get<string>('BACKEND_URL') ?? 'http://localhost:3000';

    const externalReference = `sub_${userId}`;
    const backUrl = `${frontendUrl}/premium/activacion`;
    const notificationUrl = `${backendUrl}/api/v1/webhooks/mercadopago`;

    // 4. Crear preapproval en Mercado Pago
    let preapprovalId: string;
    let initPoint: string;

    try {
      const result = await this.mercadoPagoService.createPreapproval({
        preapprovalPlanId,
        payerEmail: userEmail,
        externalReference,
        backUrl,
        notificationUrl,
      });
      preapprovalId = result.preapprovalId;
      initPoint = result.initPoint;
    } catch (error) {
      this.logger.error(
        `Error al crear preapproval en MP para usuario ${userId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new BadGatewayException(
        'Error al crear la suscripción en Mercado Pago',
      );
    }

    // 5. Persistir mpPreapprovalId en el usuario
    // Fix 3: Compensación — si el save falla, cancelar el preapproval creado en MP
    try {
      user.mpPreapprovalId = preapprovalId;
      await this.userRepo.save(user);
      this.logger.log(
        `mpPreapprovalId ${preapprovalId} guardado para usuario ${userId}`,
      );
    } catch (saveError) {
      this.logger.error(
        `Error al persistir mpPreapprovalId para usuario ${userId}, intentando cancelar preapproval ${preapprovalId}`,
        saveError instanceof Error ? saveError.stack : String(saveError),
      );
      try {
        await this.mercadoPagoService.cancelPreapproval(preapprovalId);
        this.logger.log(
          `Preapproval ${preapprovalId} cancelado exitosamente tras error de persistencia`,
        );
      } catch (cancelError) {
        this.logger.error(
          `No se pudo cancelar el preapproval ${preapprovalId} en MP tras error de persistencia`,
          cancelError instanceof Error
            ? cancelError.stack
            : String(cancelError),
        );
      }
      throw new InternalServerErrorException(
        'Error al guardar los datos de suscripción',
      );
    }

    return { initPoint };
  }
}
