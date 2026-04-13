import { CardFreeInterpretation } from '../../entities/card-free-interpretation.entity';

export interface ICardFreeInterpretationRepository {
  findByCardsAndCategory(
    cardIds: number[],
    orientations: ('upright' | 'reversed')[],
    categoryId: number,
  ): Promise<CardFreeInterpretation[]>;
}

export const CARD_FREE_INTERPRETATION_REPOSITORY =
  'ICardFreeInterpretationRepository';
