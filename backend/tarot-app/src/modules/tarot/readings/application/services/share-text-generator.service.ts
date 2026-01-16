import { Injectable } from '@nestjs/common';
import { TarotReading } from '../../entities/tarot-reading.entity';
import { DailyReading } from '../../../daily-reading/entities/daily-reading.entity';
import { TarotCard } from '../../../cards/entities/tarot-card.entity';

type UserPlan = 'anonymous' | 'free' | 'premium';
type ReadingType = 'daily' | 'tarot';

@Injectable()
export class ShareTextGeneratorService {
  /**
   * Genera texto formateado para compartir una lectura según el plan del usuario
   * @param reading - La lectura (DailyReading o TarotReading)
   * @param userPlan - Plan del usuario: anonymous, free, premium
   * @param readingType - Tipo de lectura: daily o tarot
   * @returns Texto formateado con emojis y CTA apropiado
   */
  generateShareText(
    reading: DailyReading | TarotReading,
    userPlan: UserPlan,
    readingType: ReadingType,
  ): string {
    if (readingType === 'daily') {
      return this.generateDailyCardShareText(reading as DailyReading, userPlan);
    }
    return this.generateTarotReadingShareText(
      reading as TarotReading,
      userPlan,
    );
  }

  /**
   * Genera texto para compartir una carta diaria
   */
  private generateDailyCardShareText(
    reading: DailyReading,
    userPlan: UserPlan,
  ): string {
    const { card, isReversed, interpretation } = reading;
    const cardName = isReversed ? `${card.name} (Invertida)` : card.name;
    const meaning = isReversed ? card.meaningReversed : card.meaningUpright;

    // Header según plan
    const header =
      userPlan === 'premium'
        ? '🌟 Mi Carta del Día en Auguria ✨'
        : '🌟 Carta del Día en Auguria';

    // Sección de carta
    let text = `${header}\n\n🃏 ${cardName}\n\n`;

    // Interpretación o significado
    if (userPlan === 'premium' && interpretation) {
      // Premium: interpretación completa
      const truncated = this.truncateText(interpretation, 5000);
      text += `💭 Interpretación personalizada:\n"${truncated}"\n\n`;
    } else {
      // Free/Anonymous: significado básico
      const truncated = this.truncateText(meaning, 5000);
      text += `${truncated}\n\n`;
    }

    // CTA y footer
    text += `━━━━━━━━━━━━━━━━━━\n`;
    text += this.getCTA(userPlan);
    text += ` → auguriatarot.com`;

    return text;
  }

  /**
   * Genera texto para compartir una lectura de tarot
   */
  private generateTarotReadingShareText(
    reading: TarotReading,
    userPlan: UserPlan,
  ): string {
    const { cards, cardPositions, customQuestion, question, interpretation } =
      reading;

    // Header según plan
    const header =
      userPlan === 'premium'
        ? '✨ Mi Lectura de Tarot en Auguria'
        : '🌟 Mi Lectura de Tarot en Auguria';

    // Pregunta
    const displayQuestion = customQuestion || question || 'Lectura general';

    // Resumen de cartas con flechas para invertidas
    const cardsStr = cardPositions
      .map((cp) => {
        const card = cards.find((c) => c.id === cp.cardId);
        return cp.isReversed ? `${card?.name} ↓` : card?.name;
      })
      .join(', ');

    let text = `${header}\n\n❓ ${displayQuestion}\n\n🃏 ${cardsStr}\n\n`;

    // Interpretación o significados por posición
    if (userPlan === 'premium' && interpretation) {
      // Premium: interpretación completa
      const truncated = this.truncateText(interpretation, 5000);
      text += `💭 Interpretación personalizada:\n"${truncated}"\n\n`;
    } else {
      // FREE/ANONYMOUS: Significados de cartas por posición
      cardPositions.forEach((cp) => {
        const card = cards.find((c) => c.id === cp.cardId) as
          | TarotCard
          | undefined;
        if (!card) return;

        const meaning = cp.isReversed
          ? card.meaningReversed
          : card.meaningUpright;
        const truncated = this.truncateText(meaning, 5000);
        text += `${cp.position}: ${truncated}\n`;
      });
      text += '\n';
    }

    // CTA y footer
    text += `━━━━━━━━━━━━━━━━━━\n`;
    text += this.getCTA(userPlan);
    text += ` → auguriatarot.com`;

    return text;
  }

  /**
   * Retorna el CTA apropiado según el plan del usuario
   */
  private getCTA(userPlan: UserPlan): string {
    switch (userPlan) {
      case 'anonymous':
        return '✨ Regístrate gratis';
      case 'free':
        return '✨ Descubre más lecturas';
      case 'premium':
        return '✨ Obtén interpretaciones personalizadas';
      default:
        return '✨ Descubre Auguria';
    }
  }

  /**
   * Trunca texto a una longitud máxima sin cortar palabras
   */
  private truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;

    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...';
  }
}
