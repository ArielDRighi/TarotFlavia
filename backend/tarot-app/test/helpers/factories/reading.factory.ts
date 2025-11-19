import { TarotReading } from '../../../src/modules/tarot/readings/entities/tarot-reading.entity';

interface CreateReadingFactoryOptions {
  id?: number;
  question?: string;
  customQuestion?: string | null;
  predefinedQuestionId?: number | null;
  cardPositions?: Array<{
    cardId: number;
    position: string;
    isReversed: boolean;
  }>;
  interpretation?: string | null;
  tarotistaId?: number | null;
  isPublic?: boolean;
  sharedToken?: string | null;
  deletedAt?: Date;
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
    reading.question = options.question ?? 'Test question';
    reading.customQuestion = options.customQuestion ?? null;
    reading.predefinedQuestionId = options.predefinedQuestionId ?? null;
    reading.cardPositions = options.cardPositions ?? [];
    reading.interpretation = options.interpretation ?? null;
    reading.tarotistaId = options.tarotistaId ?? null;
    reading.isPublic = options.isPublic ?? false;
    reading.sharedToken = options.sharedToken ?? null;
    reading.deletedAt = options.deletedAt;
    reading.regenerationCount = 0;
    reading.viewCount = 0;
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
      isPublic: true,
      sharedToken: options.sharedToken ?? `share-token-${Date.now()}`,
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
