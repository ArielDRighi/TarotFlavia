import { Injectable } from '@nestjs/common';
import { TarotReading } from '../../entities/tarot-reading.entity';
import { ReadingListItemDto } from '../../dto/reading-list-item.dto';
import { CardPreviewDto } from '../../dto/card-preview.dto';

@Injectable()
export class ReadingMapperService {
  /**
   * Transforma una entidad TarotReading en un DTO para listado
   * @param reading Entidad TarotReading con relaciones cargadas (cards, cardPositions)
   * @returns ReadingListItemDto con preview de cartas
   */
  toListItemDto(reading: TarotReading): ReadingListItemDto {
    // Determinar la pregunta a mostrar
    const question =
      reading.question ||
      reading.customQuestion ||
      reading.predefinedQuestion?.question ||
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

    return {
      id: reading.id,
      question,
      spreadId: reading.spreadId || 0,
      spreadName: reading.spreadName || 'Tirada desconocida',
      cardsCount,
      cardPreviews,
      createdAt: reading.createdAt.toISOString(),
      deletedAt: reading.deletedAt?.toISOString(),
    };
  }
}
