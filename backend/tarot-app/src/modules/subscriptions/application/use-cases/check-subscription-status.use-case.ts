import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { SubscriptionStatusResponseDto } from '../dto/subscription-status-response.dto';
import { USER_REPOSITORY } from '../../../users/domain/interfaces/repository.tokens';
import { IUserRepository } from '../../../users/domain/interfaces/user-repository.interface';

@Injectable()
export class CheckSubscriptionStatusUseCase {
  private readonly logger = new Logger(CheckSubscriptionStatusUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(userId: number): Promise<SubscriptionStatusResponseDto> {
    // Leer estado fresco directamente desde la DB (para polling)
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    this.logger.debug(
      `Estado de suscripción para usuario ${userId}: plan=${user.plan}, status=${user.subscriptionStatus ?? 'null'}`,
    );

    return {
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus ?? null,
      planExpiresAt: user.planExpiresAt
        ? user.planExpiresAt.toISOString()
        : null,
      mpPreapprovalId: user.mpPreapprovalId ?? null,
    };
  }
}
