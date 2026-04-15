import { DataSource } from 'typeorm';
import { TarotCard } from '../../modules/tarot/cards/entities/tarot-card.entity';
import { DAILY_FREE_INTERPRETATIONS } from '../../modules/tarot/cards/seeds/daily-free-interpretations.data';
import { buildCardSlug } from './seed-slug.helper';

/**
 * T-FR-S02: Seed Daily Free Interpretations
 *
 * Populates the `dailyFreeUpright` and `dailyFreeReversed` fields in `tarot_card`
 * for all 22 Major Arcana.
 *
 * 44 texts total: 22 Major Arcana × 2 orientations (upright, reversed)
 * Tone: "daily energy" — present, mentions amor, bienestar and dinero briefly
 *
 * Features:
 * - Idempotent: UPDATE by card slug (safe to re-run)
 * - Validates cards exist before updating
 * - Logs progress and final count
 *
 * Requires:
 *  - TarotCard table populated (run tarot-cards.seeder first)
 *  - AddDailyFreeFieldsToTarotCard migration applied
 */
export async function seedDailyFreeInterpretations(
  dataSource: DataSource,
): Promise<void> {
  console.log('🌟 Starting Daily Free Interpretations seeding process...');

  const cardRepo = dataSource.getRepository(TarotCard);

  // ------------------------------------------------------------------
  // 1. Load all Major Arcana cards
  // ------------------------------------------------------------------
  const majorArcanaCards = await cardRepo.find({
    where: { category: 'arcanos_mayores' },
    select: ['id', 'name'],
  });

  if (majorArcanaCards.length === 0) {
    throw new Error(
      'No Major Arcana cards found. Run tarot-cards.seeder first.',
    );
  }

  console.log(`   📋 Found ${majorArcanaCards.length} Major Arcana cards`);

  // Build slug → id map
  const cardSlugToId = new Map<string, number>();
  for (const card of majorArcanaCards) {
    const slug = buildCardSlug(card.name);
    cardSlugToId.set(slug, card.id);
  }

  // ------------------------------------------------------------------
  // 2. UPDATE each card with dailyFreeUpright / dailyFreeReversed
  // ------------------------------------------------------------------

  let updated = 0;
  let warnings = 0;

  for (const data of DAILY_FREE_INTERPRETATIONS) {
    const cardId = cardSlugToId.get(data.cardSlug);
    if (cardId === undefined) {
      console.warn(`   ⚠️  Card not found for slug: "${data.cardSlug}"`);
      warnings++;
      continue;
    }

    await cardRepo.update(cardId, {
      dailyFreeUpright: data.dailyUpright,
      dailyFreeReversed: data.dailyReversed,
    });

    updated++;
  }

  // ------------------------------------------------------------------
  // 3. Summary
  // ------------------------------------------------------------------

  const seededCount = await cardRepo.count({
    where: { category: 'arcanos_mayores' },
  });

  console.log(`✅ Daily Free Interpretations seeding complete!`);
  console.log(`   • Updated: ${updated} cards`);
  if (warnings > 0) {
    console.log(`   • Warnings (unknown card slug): ${warnings}`);
  }
  console.log(`   • Major Arcana cards in DB: ${seededCount}`);
}
