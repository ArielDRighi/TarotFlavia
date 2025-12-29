import { Repository } from 'typeorm';
import { TarotCard } from '../../modules/tarot/cards/entities/tarot-card.entity';
import { TarotDeck } from '../../modules/tarot/decks/entities/tarot-deck.entity';
import { ALL_TAROT_CARDS } from './data/tarot-cards.data';

/**
 * Seed Tarot Cards - 78 Cards Complete Dataset
 * This seeder populates the database with the complete Rider-Waite tarot deck
 * 22 Major Arcana + 56 Minor Arcana (14 cards per suit: Bastos, Copas, Espadas, Oros)
 *
 * Features:
 * - Idempotent: Can be run multiple times without duplicating data
 * - Validates deck existence before seeding
 * - Comprehensive card data with Spanish descriptions
 * - Content quality validation (TASK-011)
 */
export async function seedTarotCards(
  cardRepository: Repository<TarotCard>,
  deckRepository: Repository<TarotDeck>,
): Promise<void> {
  console.log('🌟 Starting Tarot Cards seeding process...');

  // Check if deck exists
  const deckCount = await deckRepository.count();
  if (deckCount === 0) {
    throw new Error(
      'Cannot seed cards: no deck exists. Please run deck seeder first.',
    );
  }

  // Check if cards already exist (idempotency)
  const existingCardsCount = await cardRepository.count();
  if (existingCardsCount > 0) {
    console.log(
      `✅ Cards already seeded (found ${existingCardsCount} cards). Skipping...`,
    );
    return;
  }

  // Find the Rider-Waite deck
  const riderWaiteDeck = await deckRepository.findOne({
    where: { name: 'Rider-Waite' },
  });

  if (!riderWaiteDeck) {
    throw new Error('Rider-Waite deck not found in database');
  }

  console.log(
    `📦 Found deck: ${riderWaiteDeck.name} (ID: ${riderWaiteDeck.id})`,
  );

  // Prepare cards data with validation
  const cardsToSeed = ALL_TAROT_CARDS.map((cardData, index) => {
    // Content quality validation (TASK-011)
    validateCardContent(cardData, index);

    const card = new TarotCard();
    card.name = cardData.name;
    card.number = cardData.number;
    card.category = cardData.category;
    card.imageUrl = cardData.imageUrl;
    card.meaningUpright = cardData.meaningUpright;
    card.meaningReversed = cardData.meaningReversed;
    card.description = cardData.description;
    card.keywords = cardData.keywords;
    card.deckId = riderWaiteDeck.id;
    return card;
  });

  // Validate total count
  if (cardsToSeed.length !== 78) {
    throw new Error(
      `Invalid card count: expected 78, got ${cardsToSeed.length}`,
    );
  }

  // Count cards by category for logging
  const arcanosMayores = cardsToSeed.filter(
    (c) => c.category === 'arcanos_mayores',
  ).length;
  const bastos = cardsToSeed.filter((c) => c.category === 'bastos').length;
  const copas = cardsToSeed.filter((c) => c.category === 'copas').length;
  const espadas = cardsToSeed.filter((c) => c.category === 'espadas').length;
  const oros = cardsToSeed.filter((c) => c.category === 'oros').length;

  console.log('📊 Card distribution:');
  console.log(`   • Arcanos Mayores: ${arcanosMayores}`);
  console.log(`   • Bastos (Wands): ${bastos}`);
  console.log(`   • Copas (Cups): ${copas}`);
  console.log(`   • Espadas (Swords): ${espadas}`);
  console.log(`   • Oros (Pentacles): ${oros}`);
  console.log(`   • TOTAL: ${cardsToSeed.length}`);

  // Save all cards in a single transaction
  console.log('💾 Saving cards to database...');
  await cardRepository.save(cardsToSeed);

  console.log('✅ Successfully seeded 78 tarot cards with complete content!');
}

/**
 * Validates that a card has complete content (TASK-011)
 * Throws error if any required field is missing or incomplete
 */
function validateCardContent(
  cardData: {
    name: string;
    description: string;
    meaningUpright: string;
    meaningReversed: string;
    keywords: string;
    imageUrl: string;
  },
  index: number,
): void {
  const errors: string[] = [];

  // Validate description
  if (!cardData.description || cardData.description.trim().length < 20) {
    errors.push(
      `Description missing or too short (min 20 chars, got ${cardData.description?.length || 0})`,
    );
  }

  // Validate meaningUpright
  if (!cardData.meaningUpright || cardData.meaningUpright.trim().length < 30) {
    errors.push(
      `MeaningUpright missing or too short (min 30 chars, got ${cardData.meaningUpright?.length || 0})`,
    );
  }

  // Validate meaningReversed
  if (
    !cardData.meaningReversed ||
    cardData.meaningReversed.trim().length < 30
  ) {
    errors.push(
      `MeaningReversed missing or too short (min 30 chars, got ${cardData.meaningReversed?.length || 0})`,
    );
  }

  // Validate keywords (at least 3)
  if (!cardData.keywords || cardData.keywords.trim() === '') {
    errors.push('Keywords missing');
  } else {
    const keywordCount = cardData.keywords.split(',').length;
    if (keywordCount < 3) {
      errors.push(
        `Keywords insufficient (min 3, got ${keywordCount}): ${cardData.keywords}`,
      );
    }
  }

  // Validate imageUrl
  if (!cardData.imageUrl || !cardData.imageUrl.match(/^https?:\/\/.+/)) {
    errors.push(
      `ImageUrl missing or invalid: ${cardData.imageUrl || 'undefined'}`,
    );
  }

  // Check for placeholder text (only in specific problematic patterns)
  const placeholderPatterns = [
    /lorem ipsum/i,
    /todo:/i,
    /\bplaceholder\b/i,
    /pendiente de/i, // "pendiente de completar", etc.
    /\bpendiente\b(?!\s*(de|s))/i, // "pendiente" solo, no "pendientes" o "pendiente de"
  ];
  const textToCheck = [
    cardData.description,
    cardData.meaningUpright,
    cardData.meaningReversed,
  ].join(' ');

  placeholderPatterns.forEach((pattern) => {
    if (pattern.test(textToCheck)) {
      errors.push(`Contains placeholder text matching pattern: ${pattern}`);
    }
  });

  // If any validation failed, throw error with details
  if (errors.length > 0) {
    throw new Error(
      `Card #${index + 1} "${cardData.name}" has incomplete content:\n${errors.map((e) => `  - ${e}`).join('\n')}`,
    );
  }
}
