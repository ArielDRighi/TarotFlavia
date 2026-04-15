import { DataSource } from 'typeorm';
import { TarotCard } from '../../modules/tarot/cards/entities/tarot-card.entity';
import { CardFreeInterpretation } from '../../modules/tarot/cards/entities/card-free-interpretation.entity';
import { ReadingCategory } from '../../modules/categories/entities/reading-category.entity';
import { CARD_FREE_INTERPRETATIONS } from '../../modules/tarot/cards/seeds/card-free-interpretations.data';
import { buildCardSlug } from './seed-slug.helper';

/**
 * T-FR-S01: Seed Card Free Interpretations
 *
 * Populates the `card_free_interpretation` table with 132 pre-written texts:
 * 22 Major Arcana × 3 categories (amor, salud, dinero) × 2 orientations (upright, reversed)
 *
 * Features:
 * - Idempotent: upsert by (cardId + categoryId + orientation) unique constraint
 * - Validates required entities exist before inserting
 * - Logs progress and final count
 *
 * Requires:
 *  - TarotCard table populated (run tarot-cards.seeder first)
 *  - ReadingCategory table populated with slugs: 'amor-relaciones', 'salud-bienestar', 'dinero-finanzas'
 */
export async function seedCardFreeInterpretations(
  dataSource: DataSource,
): Promise<void> {
  console.log('🃏 Starting Card Free Interpretations seeding process...');

  const cardRepo = dataSource.getRepository(TarotCard);
  const categoryRepo = dataSource.getRepository(ReadingCategory);
  const interpretationRepo = dataSource.getRepository(CardFreeInterpretation);

  // ------------------------------------------------------------------
  // 1. Load required lookup data
  // ------------------------------------------------------------------

  // Load all Major Arcana cards (name → id map)
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

  // Build a slug → id map for cards using the same slug logic used in data file
  const cardSlugToId = new Map<string, number>();
  for (const card of majorArcanaCards) {
    const slug = buildCardSlug(card.name);
    cardSlugToId.set(slug, card.id);
  }

  // Load FREE-allowed categories: amor-relaciones, salud-bienestar, dinero-finanzas
  const FREE_CATEGORY_SLUGS = [
    'amor-relaciones',
    'salud-bienestar',
    'dinero-finanzas',
  ] as const;
  const categories = await categoryRepo.find({
    where: FREE_CATEGORY_SLUGS.map((slug) => ({ slug })),
    select: ['id', 'slug'],
  });

  if (categories.length === 0) {
    console.warn(
      '⚠️  No FREE categories found (amor-relaciones, salud-bienestar, dinero-finanzas). ' +
        'Run reading-categories seeder first. Skipping card free interpretations seeding.',
    );
    return;
  }

  const categorySlugToId = new Map<string, number>();
  for (const cat of categories) {
    categorySlugToId.set(cat.slug, cat.id);
  }

  const missingCategories = FREE_CATEGORY_SLUGS.filter(
    (slug) => !categorySlugToId.has(slug),
  );
  if (missingCategories.length > 0) {
    console.warn(
      `⚠️  Missing categories: ${missingCategories.join(', ')}. ` +
        `Found only: ${categories.map((c) => c.slug).join(', ')}`,
    );
    console.warn('   Interpretations for missing categories will be skipped.');
  }

  // ------------------------------------------------------------------
  // 2. Upsert interpretations
  // ------------------------------------------------------------------

  let inserted = 0;
  let skipped = 0;
  let warnings = 0;

  for (const data of CARD_FREE_INTERPRETATIONS) {
    const cardId = cardSlugToId.get(data.cardSlug);
    if (cardId === undefined) {
      console.warn(`   ⚠️  Card not found for slug: "${data.cardSlug}"`);
      warnings++;
      continue;
    }

    const categoryId = categorySlugToId.get(data.categorySlug);
    if (categoryId === undefined) {
      // Category not seeded yet — skip silently (already warned above)
      skipped++;
      continue;
    }

    // Upsert: insert or update on conflict (cardId, categoryId, orientation)
    await interpretationRepo
      .createQueryBuilder()
      .insert()
      .into(CardFreeInterpretation)
      .values({
        cardId,
        categoryId,
        orientation: data.orientation,
        content: data.content,
      })
      .orUpdate(['content'], ['cardId', 'categoryId', 'orientation'])
      .execute();

    inserted++;
  }

  // ------------------------------------------------------------------
  // 3. Summary
  // ------------------------------------------------------------------

  const totalInDb = await interpretationRepo.count();

  console.log(`✅ Card Free Interpretations seeding complete!`);
  console.log(`   • Upserted: ${inserted} records`);
  if (skipped > 0) {
    console.log(`   • Skipped (missing category): ${skipped}`);
  }
  if (warnings > 0) {
    console.log(`   • Warnings (unknown card slug): ${warnings}`);
  }
  console.log(`   • Total records in DB: ${totalInDb}`);
}
