import { TarotSpread } from '../../../src/modules/tarot/spreads/entities/tarot-spread.entity';

interface CreateSpreadFactoryOptions {
  id?: number;
  name?: string;
  description?: string;
  cardCount?: number;
  positions?: Array<{ name: string; description: string }>;
  imageUrl?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isBeginnerFriendly?: boolean;
  whenToUse?: string;
}

/**
 * Factory para crear spreads de tarot de prueba
 */
export class SpreadFactory {
  private static counter = 1;

  /**
   * Crea un spread de prueba con valores por defecto
   */
  static create(options: CreateSpreadFactoryOptions = {}): TarotSpread {
    const id = options.id ?? this.counter++;

    const spread = new TarotSpread();
    spread.id = id;
    spread.name = options.name ?? `Test Spread ${id}`;
    spread.description = options.description ?? `Description for spread ${id}`;
    spread.cardCount = options.cardCount ?? 3;
    spread.positions = options.positions ?? [
      { name: 'Past', description: 'Past influences' },
      { name: 'Present', description: 'Current situation' },
      { name: 'Future', description: 'Future outcome' },
    ];
    spread.imageUrl = options.imageUrl ?? `https://example.com/spread${id}.jpg`;
    spread.difficulty = options.difficulty ?? 'beginner';
    spread.isBeginnerFriendly = options.isBeginnerFriendly ?? true;
    spread.whenToUse = options.whenToUse ?? 'General guidance';
    spread.createdAt = new Date();
    spread.updatedAt = new Date();

    return spread;
  }

  /**
   * Crea una tirada de 3 cartas clásica
   */
  static createThreeCardSpread(
    options: CreateSpreadFactoryOptions = {},
  ): TarotSpread {
    return this.create({
      ...options,
      name: options.name ?? 'Three Card Spread',
      cardCount: 3,
      positions: [
        { name: 'Past', description: 'Past influences' },
        { name: 'Present', description: 'Current situation' },
        { name: 'Future', description: 'Future outcome' },
      ],
    });
  }

  /**
   * Crea una tirada de una carta
   */
  static createSingleCardSpread(
    options: CreateSpreadFactoryOptions = {},
  ): TarotSpread {
    return this.create({
      ...options,
      name: options.name ?? 'Single Card Spread',
      cardCount: 1,
      positions: [
        { name: 'Answer', description: 'The answer to your question' },
      ],
    });
  }

  /**
   * Crea una Cruz Celta
   */
  static createCelticCross(
    options: CreateSpreadFactoryOptions = {},
  ): TarotSpread {
    return this.create({
      ...options,
      name: options.name ?? 'Celtic Cross',
      cardCount: 10,
      difficulty: 'advanced',
      isBeginnerFriendly: false,
      positions: [
        { name: 'Present', description: 'Current situation' },
        { name: 'Challenge', description: 'Immediate challenge' },
        { name: 'Past', description: 'Past influences' },
        { name: 'Future', description: 'Future influences' },
        { name: 'Above', description: 'Conscious goal' },
        { name: 'Below', description: 'Unconscious influences' },
        { name: 'Advice', description: 'Advice' },
        { name: 'External', description: 'External influences' },
        { name: 'Hopes', description: 'Hopes and fears' },
        { name: 'Outcome', description: 'Final outcome' },
      ],
    });
  }

  /**
   * Crea múltiples spreads
   */
  static createMany(
    count: number,
    options: CreateSpreadFactoryOptions = {},
  ): TarotSpread[] {
    const spreads: TarotSpread[] = [];
    for (let i = 0; i < count; i++) {
      spreads.push(this.create(options));
    }
    return spreads;
  }

  /**
   * Resetea el contador
   */
  static resetCounter(): void {
    this.counter = 1;
  }
}
