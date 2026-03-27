import {
  Injectable,
  BadRequestException,
  BadGatewayException,
  NotFoundException,
  Inject,
  Logger,
} from '@nestjs/common';
import { MercadoPagoService } from '../../../payments/infrastructure/services/mercadopago.service';
import { SubscriptionStatus } from '../../../users/entities/user.entity';
import { CancelSubscriptionResponseDto } from '../dto/cancel-subscription-response.dto';
import { USER_REPOSITORY } from '../../../users/domain/interfaces/repository.tokens';
import { IUserRepository } from '../../../users/domain/interfaces/user-repository.interface';

@Injectable()
export class CancelSubscriptionUseCase {
  private readonly logger = new Logger(CancelSubscriptionUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
    private readonly mercadoPagoService: MercadoPagoService,
  ) {}

  async execute(userId: number): Promise<CancelSubscriptionResponseDto> {
    // 1. Buscar usuario
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 2. Validar que tiene suscripción activa
    if (!user.mpPreapprovalId || !user.subscriptionStatus) {
      throw new BadRequestException('No tenés una suscripción activa');
    }

    if (user.subscriptionStatus === SubscriptionStatus.CANCELLED) {
      throw new BadRequestException('La suscripción ya está cancelada');
    }

    // 3. Cancelar en Mercado Pago
    try {
      await this.mercadoPagoService.cancelPreapproval(user.mpPreapprovalId);
      this.logger.log(
        `Preapproval ${user.mpPreapprovalId} cancelado en MP para usuario ${userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error al cancelar preapproval ${user.mpPreapprovalId} en MP para usuario ${userId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new BadGatewayException(
        'Error al cancelar la suscripción en Mercado Pago',
      );
    }

    // 4. Actualizar estado en DB — plan NO cambia, solo subscriptionStatus
    user.subscriptionStatus = SubscriptionStatus.CANCELLED;
    await this.userRepo.save(user);

    this.logger.log(
      `Suscripción cancelada exitosamente para usuario ${userId}. Plan sigue activo hasta ${user.planExpiresAt?.toISOString() ?? 'N/A'}`,
    );

    return {
      message: 'Suscripción cancelada exitosamente',
      planExpiresAt: user.planExpiresAt
        ? user.planExpiresAt.toISOString()
        : null,
    };
  }
}
