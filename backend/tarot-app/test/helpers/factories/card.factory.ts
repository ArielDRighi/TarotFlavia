import { TarotCard } from '../../../src/modules/tarot/cards/entities/tarot-card.entity';
import { TarotDeck } from '../../../src/modules/tarot/decks/entities/tarot-deck.entity';

interface CreateCardFactoryOptions {
  id?: number;
  name?: string;
  number?: number;
  category?: string;
  imageUrl?: string;
  reversedImageUrl?: string;
  meaningUpright?: string;
  meaningReversed?: string;
  description?: string;
  keywords?: string;
  deckId?: number;
  deck?: TarotDeck;
}

/**
 * Factory para crear cartas de tarot de prueba
 */
export class CardFactory {
  private static counter = 1;

  /**
   * Crea una carta de prueba con valores por defecto
   */
  static create(options: CreateCardFactoryOptions = {}): TarotCard {
    const id = options.id ?? this.counter++;

    const card = new TarotCard();
    card.id = id;
    card.name = options.name ?? `The Card ${id}`;
    card.number = options.number ?? id - 1;
    card.category = options.category ?? 'arcanos_mayores';
    card.imageUrl = options.imageUrl ?? `https://example.com/card${id}.jpg`;
    card.reversedImageUrl =
      options.reversedImageUrl ?? `https://example.com/card${id}-reversed.jpg`;
    card.meaningUpright = options.meaningUpright ?? 'Positive meaning';
    card.meaningReversed = options.meaningReversed ?? 'Reversed meaning';
    card.description = options.description ?? `Description of card ${id}`;
    card.keywords = options.keywords ?? 'test,keywords';
    card.deckId = options.deckId ?? 1;
    card.deck = options.deck ?? undefined;
    card.createdAt = new Date();
    card.updatedAt = new Date();

    return card;
  }

  /**
   * Crea un Arcano Mayor
   */
  static createMajorArcana(options: CreateCardFactoryOptions = {}): TarotCard {
    return this.create({
      ...options,
      category: 'arcanos_mayores',
      name: options.name ?? `Major Arcana ${options.id ?? this.counter}`,
    });
  }

  /**
   * Crea un Arcano Menor
   */
  static createMinorArcana(options: CreateCardFactoryOptions = {}): TarotCard {
    return this.create({
      ...options,
      category: 'arcanos_menores',
      name: options.name ?? `Minor Arcana ${options.id ?? this.counter}`,
    });
  }

  /**
   * Crea múltiples cartas
   */
  static createMany(
    count: number,
    options: CreateCardFactoryOptions = {},
  ): TarotCard[] {
    const cards: TarotCard[] = [];
    for (let i = 0; i < count; i++) {
      cards.push(this.create(options));
    }
    return cards;
  }

  /**
   * Crea las cartas clásicas para una lectura de 3 cartas
   */
  static createThreeCardSpread(): TarotCard[] {
    return [
      this.create({ id: 1, name: 'The Fool', number: 0 }),
      this.create({ id: 2, name: 'The Magician', number: 1 }),
      this.create({ id: 3, name: 'The High Priestess', number: 2 }),
    ];
  }

  /**
   * Resetea el contador
   */
  static resetCounter(): void {
    this.counter = 1;
  }
}
