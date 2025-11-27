import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { ITarotistaRepository } from '../../domain/interfaces/tarotista-repository.interface';
import {
  USER_REPOSITORY,
  TAROTISTA_REPOSITORY,
} from '../../domain/interfaces/repository.tokens';
import { UserDetailDto } from '../dto/user-detail.dto';
import { UserWithoutPassword } from '../../entities/user.entity';

/**
 * Use case: Obtener información detallada de un usuario
 * Incluye estadísticas de lecturas y uso de IA
 */
@Injectable()
export class GetUserDetailUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(TAROTISTA_REPOSITORY)
    private readonly tarotistaRepository: ITarotistaRepository,
  ) {}

  async execute(userId: number): Promise<UserDetailDto> {
    const user = await this.userRepository.findByIdWithReadings(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Calcular estadísticas
    const totalReadings = user.readings?.length || 0;
    const lastReading =
      user.readings && user.readings.length > 0
        ? user.readings.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
          )[0]
        : null;

    // TODO(TASK-029): Implement actual AI usage count from ai_usage_logs table
    // Currently assumes 1 interpretation per reading as a temporary measure.
    const totalAIUsage = totalReadings;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as UserWithoutPassword,
      statistics: {
        totalReadings,
        lastReadingDate: lastReading?.createdAt || null,
        totalAIUsage,
      },
    };
  }
}
