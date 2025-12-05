import { Injectable, Inject, Logger } from '@nestjs/common';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { USER_REPOSITORY } from '../../domain/interfaces/repository.tokens';

/**
 * Use case: Increment User AI Requests Counter
 * Called after successful AI interpretation to track usage
 */
@Injectable()
export class IncrementUserAIRequestsUseCase {
  private readonly logger = new Logger(IncrementUserAIRequestsUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(userId: number): Promise<void> {
    await this.userRepo.incrementAIRequestsMonth(userId);
    this.logger.debug(`Incremented AI requests for user ${userId}`);
  }
}
