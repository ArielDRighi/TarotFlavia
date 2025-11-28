import {
  Injectable,
  Inject,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { USER_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { IRefreshTokenRepository } from '../../../auth/domain/interfaces/refresh-token-repository.interface';
import { REFRESH_TOKEN_REPOSITORY } from '../../../auth/domain/interfaces/repository.tokens';
import { UpdateUserPlanDto } from '../dto/update-user-plan.dto';
import { UserWithoutPassword } from '../../entities/user.entity';

/**
 * Use case: Actualizar el plan de un usuario
 * Invalida todos los refresh tokens para forzar re-autenticación
 */
@Injectable()
export class UpdateUserPlanUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(
    id: number,
    updateUserPlanDto: UpdateUserPlanDto,
  ): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Actualizar campos del plan
    user.plan = updateUserPlanDto.plan;

    if (updateUserPlanDto.planStartedAt !== undefined) {
      user.planStartedAt = updateUserPlanDto.planStartedAt;
    }

    if (updateUserPlanDto.planExpiresAt !== undefined) {
      user.planExpiresAt = updateUserPlanDto.planExpiresAt;
    }

    if (updateUserPlanDto.subscriptionStatus !== undefined) {
      user.subscriptionStatus = updateUserPlanDto.subscriptionStatus;
    }

    if (updateUserPlanDto.stripeCustomerId !== undefined) {
      user.stripeCustomerId = updateUserPlanDto.stripeCustomerId;
    }

    try {
      const updatedUser = await this.userRepository.save(user);

      // Invalidar todos los refresh tokens del usuario para forzar re-login
      await this.refreshTokenRepository.revokeAllUserTokens(id);

      return updatedUser;
    } catch {
      throw new InternalServerErrorException('Error updating user plan');
    }
  }
}
