import { TarotReading } from '../../../src/modules/tarot/readings/entities/tarot-reading.entity';
import { User } from '../../../src/modules/users/entities/user.entity';
import { TarotSpread } from '../../../src/modules/tarot/spreads/entities/tarot-spread.entity';
import { TarotCard } from '../../../src/modules/tarot/cards/entities/tarot-card.entity';

interface CreateReadingFactoryOptions {
  id?: number;
  user?: User;
  userId?: number;
  spread?: TarotSpread;
  spreadId?: number;
  cards?: TarotCard[];
  cardPositions?: Array<{
    cardId: number;
    position: string;
    isReversed: boolean;
  }>;
  question?: string;
  category?: string;
  isShared?: boolean;
  shareToken?: string | null;
  deletedAt?: Date | null;
}

/**
 * Factory para crear lecturas de tarot de prueba
 */
export class ReadingFactory {
  private static counter = 1;

  /**
   * Crea una lectura de prueba con valores por defecto
   */
  static create(options: CreateReadingFactoryOptions = {}): TarotReading {
    const id = options.id ?? this.counter++;

    const reading = new TarotReading();
    reading.id = id;
    reading.userId = options.userId ?? 1;
    reading.user = options.user ?? undefined;
    reading.spreadId = options.spreadId ?? 1;
    reading.spread = options.spread ?? undefined;
    reading.cards = options.cards ?? [];
    reading.cardPositions = options.cardPositions ?? [];
    reading.question = options.question ?? 'Test question';
    reading.category = options.category ?? 'General';
    reading.isShared = options.isShared ?? false;
    reading.shareToken = options.shareToken ?? null;
    reading.deletedAt = options.deletedAt ?? null;
    reading.createdAt = new Date();
    reading.updatedAt = new Date();

    return reading;
  }

  /**
   * Crea una lectura compartida
   */
  static createShared(options: CreateReadingFactoryOptions = {}): TarotReading {
    return this.create({
      ...options,
      isShared: true,
      shareToken: options.shareToken ?? `share-token-${Date.now()}`,
    });
  }

  /**
   * Crea una lectura eliminada (soft delete)
   */
  static createDeleted(
    options: CreateReadingFactoryOptions = {},
  ): TarotReading {
    return this.create({
      ...options,
      deletedAt: options.deletedAt ?? new Date(),
    });
  }

  /**
   * Crea múltiples lecturas
   */
  static createMany(
    count: number,
    options: CreateReadingFactoryOptions = {},
  ): TarotReading[] {
    const readings: TarotReading[] = [];
    for (let i = 0; i < count; i++) {
      readings.push(this.create(options));
    }
    return readings;
  }

  /**
   * Resetea el contador
   */
  static resetCounter(): void {
    this.counter = 1;
  }
}
