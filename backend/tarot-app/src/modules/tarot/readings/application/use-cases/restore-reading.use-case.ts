import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { IReadingRepository } from '../../domain/interfaces/reading-repository.interface';
import { ReadingValidatorService } from '../services/reading-validator.service';
import { TarotReading } from '../../entities/tarot-reading.entity';

@Injectable()
export class RestoreReadingUseCase {
  private readonly logger = new Logger(RestoreReadingUseCase.name);

  constructor(
    @Inject('IReadingRepository')
    private readonly readingRepo: IReadingRepository,
    private readonly validator: ReadingValidatorService,
  ) {}

  async execute(readingId: number, userId: number): Promise<TarotReading> {
    // Verificar ownership (including deleted readings)
    const reading = await this.validator.validateReadingOwnership(
      readingId,
      userId,
      true, // includeDeleted
    );

    // Verificar que esté eliminada
    this.validator.validateReadingDeleted(reading);

    // Restaurar
    await this.readingRepo.restore(readingId);

    const restored = await this.readingRepo.findById(readingId);

    if (!restored) {
      throw new NotFoundException(
        `Reading with ID ${readingId} not found after restore`,
      );
    }

    this.logger.log(`Reading ${readingId} restored by user ${userId}`);

    return restored;
  }
}
