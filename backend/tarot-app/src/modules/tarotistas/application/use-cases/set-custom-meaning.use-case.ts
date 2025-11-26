import { Injectable, Inject } from '@nestjs/common';
import { ITarotistaRepository } from '../../domain/interfaces/tarotista-repository.interface';
import { SetCustomMeaningDto } from '../dto/set-custom-meaning.dto';
import { TarotistaCardMeaning } from '../../infrastructure/entities/tarotista-card-meaning.entity';

/**
 * Use Case: Set Custom Card Meaning for a Tarotista
 * Responsibility: Handle custom card interpretations per tarotista
 */
@Injectable()
export class SetCustomMeaningUseCase {
  constructor(
    @Inject('ITarotistaRepository')
    private readonly tarotistaRepo: ITarotistaRepository,
  ) {}

  async execute(
    tarotistaId: number,
    dto: SetCustomMeaningDto,
  ): Promise<TarotistaCardMeaning> {
    // Cast cardId to number (class-validator ensures type at runtime)
    const cardId = dto.cardId as unknown as number;

    const meaningData: Partial<TarotistaCardMeaning> = {
      tarotistaId,
      cardId,
      customMeaningUpright:
        (dto.customMeaningUpright as unknown as string) || null,
      customMeaningReversed:
        (dto.customMeaningReversed as unknown as string) || null,
      customKeywords: (dto.customKeywords as unknown as string) || null,
      customDescription: (dto.customDescription as unknown as string) || null,
      privateNotes: (dto.privateNotes as unknown as string) || null,
    };

    return await this.tarotistaRepo.upsertCardMeaning(meaningData);
  }

  async getAllMeanings(tarotistaId: number): Promise<TarotistaCardMeaning[]> {
    return await this.tarotistaRepo.findAllCardMeanings(tarotistaId);
  }

  async deleteMeaning(tarotistaId: number, cardId: number): Promise<void> {
    await this.tarotistaRepo.deleteCardMeaning(tarotistaId, cardId);
  }
}
