import { Repository } from 'typeorm';
import { TarotCard } from '../../cards/entities/tarot-card.entity';
import { TarotDeck } from '../../decks/entities/tarot-deck.entity';
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

  // Prepare cards data
  const cardsToSeed = ALL_TAROT_CARDS.map((cardData) => {
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

  console.log('✅ Successfully seeded 78 tarot cards!');
}
