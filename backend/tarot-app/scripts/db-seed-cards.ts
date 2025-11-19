#!/usr/bin/env ts-node
/**
 * Script para seedear solo las cartas de tarot
 * Útil para testing cuando solo necesitas las cartas
 *
 * Uso: npm run db:seed:cards
 */

import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { TarotDeck } from '../src/modules/tarot/decks/entities/tarot-deck.entity';
import { TarotCard } from '../src/modules/tarot/cards/entities/tarot-card.entity';
import { seedTarotDecks } from '../src/database/seeds/tarot-decks.seeder';
import { seedTarotCards } from '../src/database/seeds/tarot-cards.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const deckRepository = app.get<Repository<TarotDeck>>(
    getRepositoryToken(TarotDeck),
  );
  const cardRepository = app.get<Repository<TarotCard>>(
    getRepositoryToken(TarotCard),
  );

  try {
    console.log('🃏 Starting cards seeding process...\n');

    // Seed Decks first (required for cards)
    console.log('📍 Step 1/2: Seeding Tarot Decks...');
    await seedTarotDecks(deckRepository);
    console.log('✅ Decks seeded successfully\n');

    // Seed Cards
    console.log('📍 Step 2/2: Seeding Tarot Cards...');
    await seedTarotCards(cardRepository, deckRepository);
    console.log('✅ Cards seeded successfully\n');

    console.log('✨ Cards seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding cards:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

void bootstrap();
