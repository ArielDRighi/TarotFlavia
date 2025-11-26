import { Injectable, Inject } from '@nestjs/common';
import { ITarotistaRepository } from '../../domain/interfaces/tarotista-repository.interface';
import { TarotistaCardMeaning } from '../../infrastructure/entities/tarotista-card-meaning.entity';
import { SetCustomMeaningDto } from '../dto/set-custom-meaning.dto';

/**
 * Use Case: Bulk Import Custom Card Meanings
 * Responsibility: Import multiple custom card meanings at once
 */
@Injectable()
export class BulkImportMeaningsUseCase {
  constructor(
    @Inject('ITarotistaRepository')
    private readonly tarotistaRepo: ITarotistaRepository,
  ) {}

  async execute(
    tarotistaId: number,
    meanings: SetCustomMeaningDto[],
  ): Promise<TarotistaCardMeaning[]> {
    const results: TarotistaCardMeaning[] = [];

    for (const meaningDto of meanings) {
      const meaning = await this.tarotistaRepo.upsertCardMeaning({
        tarotistaId,
        cardId: meaningDto.cardId,
        customMeaningUpright: meaningDto.customMeaningUpright,
        customMeaningReversed: meaningDto.customMeaningReversed,
        customDescription: meaningDto.customDescription,
      });
      results.push(meaning);
    }

    return results;
  }
}
