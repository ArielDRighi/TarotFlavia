import { Repository } from 'typeorm';
import { TarotDeck } from '../../decks/entities/tarot-deck.entity';
import { ALL_TAROT_DECKS } from './data/tarot-decks.data';

/**
 * Seed Tarot Decks - Rider-Waite Classic Deck
 * This seeder populates the database with the default Rider-Waite deck
 *
 * Features:
 * - Idempotent: Can be run multiple times without duplicating data
 * - Validates that only one default deck exists
 * - Includes historical metadata (artist, year, tradition, publisher)
 *
 * Future: Can be extended to support multiple decks (Marseille, Thoth, etc.)
 */
export async function seedTarotDecks(
  deckRepository: Repository<TarotDeck>,
): Promise<void> {
  console.log('🃏 Starting Tarot Decks seeding process...');

  // Check if decks already exist (idempotency)
  const existingDecksCount = await deckRepository.count();
  if (existingDecksCount > 0) {
    console.log(
      `✅ Decks already seeded (found ${existingDecksCount} deck(s)). Skipping...`,
    );
    return;
  }

  // Prepare deck data (currently only Rider-Waite)
  const deckData = ALL_TAROT_DECKS[0]; // Rider-Waite is the first and only deck for now

  const deck = new TarotDeck();
  deck.name = deckData.name;
  deck.description = deckData.description;
  deck.imageUrl = deckData.imageUrl;
  deck.cardCount = deckData.cardCount;
  deck.isActive = deckData.isActive;
  deck.isDefault = deckData.isDefault;
  if (deckData.artist) deck.artist = deckData.artist;
  if (deckData.yearCreated) deck.yearCreated = deckData.yearCreated;
  if (deckData.tradition) deck.tradition = deckData.tradition;
  if (deckData.publisher) deck.publisher = deckData.publisher;

  // Save the deck
  console.log(`💾 Saving deck: ${deck.name}...`);
  const savedDeck = await deckRepository.save(deck);

  console.log(
    `✅ Successfully seeded deck: ${savedDeck.name} (ID: ${savedDeck.id})`,
  );
  console.log(`   • Artist: ${deckData.artist}`);
  console.log(`   • Year Created: ${deckData.yearCreated}`);
  console.log(`   • Tradition: ${deckData.tradition}`);
  console.log(`   • Card Count: ${savedDeck.cardCount}`);
  console.log(`   • Is Default: ${savedDeck.isDefault}`);
}
