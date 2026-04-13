import { Injectable, Inject } from '@nestjs/common';
import {
  ICardFreeInterpretationRepository,
  CARD_FREE_INTERPRETATION_REPOSITORY,
} from './domain/interfaces/card-free-interpretation-repository.interface';
import { TarotCard } from './entities/tarot-card.entity';

type CardPosition = { cardId: number; position: string; isReversed: boolean };

export type FreeInterpretationsMap = Record<number, { content: string }>;

@Injectable()
export class CardFreeInterpretationService {
  constructor(
    @Inject(CARD_FREE_INTERPRETATION_REPOSITORY)
    private readonly repo: ICardFreeInterpretationRepository,
  ) {}

  /**
   * Busca interpretaciones pre-escritas para un conjunto de cartas con sus orientaciones
   * y una categoría dada. Retorna un mapa indexado por posición (0..N-1) donde cada
   * entrada contiene el texto a mostrar al usuario FREE.
   *
   * Si no existe una interpretación pre-escrita para una combinación
   * (carta + categoría + orientación), cae al fallback: meaningUpright o meaningReversed
   * de la entidad TarotCard según la orientación correspondiente.
   *
   * @param cards - Cartas de tarot validadas (en el mismo orden que cardPositions)
   * @param cardPositions - Posiciones y orientaciones de cada carta
   * @param categoryId - ID de la categoría elegida por el usuario FREE
   * @returns Mapa { [positionIndex]: { content: string } }
   */
  async findByCardsAndCategory(
    cards: TarotCard[],
    cardPositions: CardPosition[],
    categoryId: number,
  ): Promise<FreeInterpretationsMap> {
    if (cards.length === 0 || cardPositions.length === 0) {
      return {};
    }

    const cardIds = cardPositions.map((p) => p.cardId);
    const orientations = cardPositions.map((p): 'upright' | 'reversed' =>
      p.isReversed ? 'reversed' : 'upright',
    );

    const interpretations = await this.repo.findByCardsAndCategory(
      cardIds,
      orientations,
      categoryId,
    );

    // Indexar las interpretaciones encontradas por cardId + orientation para lookup O(1)
    const interpretationIndex = new Map<string, string>();
    for (const interp of interpretations) {
      const key = `${interp.cardId}::${interp.orientation}`;
      interpretationIndex.set(key, interp.content);
    }

    // Construir mapa indexado por posición
    const cardById = new Map<number, TarotCard>(cards.map((c) => [c.id, c]));

    const result: FreeInterpretationsMap = {};

    for (let i = 0; i < cardPositions.length; i++) {
      const pos = cardPositions[i];
      const orientation: 'upright' | 'reversed' = pos.isReversed
        ? 'reversed'
        : 'upright';
      const key = `${pos.cardId}::${orientation}`;

      const foundContent = interpretationIndex.get(key);

      if (foundContent !== undefined) {
        result[i] = { content: foundContent };
      } else {
        // Fallback: significado crudo de la carta
        const card = cardById.get(pos.cardId);
        const fallbackContent =
          card !== undefined
            ? pos.isReversed
              ? card.meaningReversed
              : card.meaningUpright
            : '';
        result[i] = { content: fallbackContent };
      }
    }

    return result;
  }
}
