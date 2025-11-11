import { Injectable, Inject, Logger } from '@nestjs/common';
import { IReadingRepository } from '../../domain/interfaces/reading-repository.interface';
import { ReadingValidatorService } from '../services/reading-validator.service';

@Injectable()
export class DeleteReadingUseCase {
  private readonly logger = new Logger(DeleteReadingUseCase.name);

  constructor(
    @Inject('IReadingRepository')
    private readonly readingRepo: IReadingRepository,
    private readonly validator: ReadingValidatorService,
  ) {}

  async execute(readingId: number, userId: number): Promise<void> {
    // Verificar ownership
    const reading = await this.validator.validateReadingOwnership(
      readingId,
      userId,
    );

    // Verificar que no esté ya eliminada
    this.validator.validateReadingNotDeleted(reading);

    // Soft delete
    await this.readingRepo.softDelete(readingId);

    this.logger.log(`Reading ${readingId} soft deleted by user ${userId}`);
  }
}
