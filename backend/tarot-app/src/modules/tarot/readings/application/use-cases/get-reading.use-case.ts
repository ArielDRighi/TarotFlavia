import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IReadingRepository } from '../../domain/interfaces/reading-repository.interface';
import { ReadingValidatorService } from '../services/reading-validator.service';
import { TarotReading } from '../../entities/tarot-reading.entity';

@Injectable()
export class GetReadingUseCase {
  constructor(
    @Inject('IReadingRepository')
    private readonly readingRepo: IReadingRepository,
    private readonly validator: ReadingValidatorService,
  ) {}

  async execute(
    readingId: number,
    userId: number,
    isAdmin = false,
  ): Promise<TarotReading> {
    const reading = await this.readingRepo.findById(readingId, [
      'deck',
      'cards',
      'user',
    ]);

    if (!reading) {
      throw new NotFoundException(`Reading with ID ${readingId} not found`);
    }

    // Validar ownership si no es admin
    if (!isAdmin) {
      await this.validator.validateReadingOwnership(readingId, userId);
    }

    return reading;
  }
}
