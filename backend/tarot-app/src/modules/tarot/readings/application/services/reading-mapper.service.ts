import { Injectable } from '@nestjs/common';
import { TarotReading } from '../../entities/tarot-reading.entity';
import { ReadingListItemDto } from '../../dto/reading-list-item.dto';
import { CardPreviewDto } from '../../dto/card-preview.dto';

/**
 * Mapeo de cantidad de cartas a nombre de tirada (fallback para lecturas antiguas)
 * Usado cuando spreadName es null pero tenemos cartas para inferir el tipo
 */
const SPREAD_NAME_BY_CARD_COUNT: Record<number, string> = {
  1: 'Tirada de 1 Carta',
  3: 'Tirada de 3 Cartas',
  5: 'Tirada de 5 Cartas',
  10: 'Cruz Céltica',
};

@Injectable()
export class ReadingMapperService {
  /**
   * Transforma una entidad TarotReading en un DTO para listado
   * @param reading Entidad TarotReading con relaciones cargadas (cards, cardPositions)
   * @returns ReadingListItemDto con preview de cartas
   */
  toListItemDto(reading: TarotReading): ReadingListItemDto {
    // Determinar la pregunta a mostrar
    // Prioridad: customQuestion (premium) > predefinedQuestion.questionText (free) > question (legacy)
    const question =
      reading.customQuestion ||
      reading.predefinedQuestion?.questionText ||
      reading.question ||
      '';

    // Obtener total de cartas
    const cardsCount = reading.cards?.length || 0;

    // Obtener preview de las primeras 3 cartas con su orientación
    const cardPreviews: CardPreviewDto[] =
      reading.cards?.slice(0, 3).map((card) => {
        // Buscar la orientación de esta carta en cardPositions
        const position = reading.cardPositions?.find(
          (pos) => pos.cardId === card.id,
        );

        return {
          id: card.id,
          name: card.name,
          imageUrl: card.imageUrl,
          isReversed: position?.isReversed || false,
        };
      }) || [];

    // Determinar spreadName con fallback inteligente para lecturas antiguas
    const spreadName =
      reading.spreadName ||
      SPREAD_NAME_BY_CARD_COUNT[cardsCount] ||
      'Tirada desconocida';

    return {
      id: reading.id,
      question,
      spreadId: reading.spreadId || 0,
      spreadName,
      cardsCount,
      cardPreviews,
      createdAt: reading.createdAt.toISOString(),
      deletedAt: reading.deletedAt?.toISOString(),
    };
  }
}
