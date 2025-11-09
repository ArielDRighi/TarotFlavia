import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { TarotDeck } from '../../modules/tarot/decks/entities/tarot-deck.entity';
import { TarotCard } from '../../modules/tarot/cards/entities/tarot-card.entity';
import { ReadingCategory } from '../../modules/categories/entities/reading-category.entity';
import { PredefinedQuestion } from '../../modules/predefined-questions/entities/predefined-question.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Tarotista } from '../../modules/tarotistas/entities/tarotista.entity';
import { TarotistaConfig } from '../../modules/tarotistas/entities/tarotista-config.entity';
import { seedTarotDecks } from './tarot-decks.seeder';
import { seedTarotCards } from './tarot-cards.seeder';
import { seedTarotSpreads } from './tarot-spreads.seeder';
import { seedReadingCategories } from './reading-categories.seeder';
import { seedPredefinedQuestions } from './predefined-questions.seeder';
import { seedUsers } from './users.seeder';
import { seedFlaviaUser } from './flavia-user.seeder';
import { seedFlaviaTarotista } from './flavia-tarotista.seeder';
import { seedFlaviaIAConfig } from './flavia-ia-config.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  const deckRepository = app.get<Repository<TarotDeck>>(
    getRepositoryToken(TarotDeck),
  );
  const cardRepository = app.get<Repository<TarotCard>>(
    getRepositoryToken(TarotCard),
  );
  const categoryRepository = app.get<Repository<ReadingCategory>>(
    getRepositoryToken(ReadingCategory),
  );
  const questionRepository = app.get<Repository<PredefinedQuestion>>(
    getRepositoryToken(PredefinedQuestion),
  );
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  const tarotistaRepository = app.get<Repository<Tarotista>>(
    getRepositoryToken(Tarotista),
  );
  const tarotistaConfigRepository = app.get<Repository<TarotistaConfig>>(
    getRepositoryToken(TarotistaConfig),
  );

  try {
    console.log('🌱 Starting database seeding process...\n');

    // ========== FLAVIA SEEDERS (NEW - CRITICAL FOR MARKETPLACE) ==========
    console.log('📍 Step 1: Seeding Flavia (Main Tarotista)...');

    // Seed Flavia User
    const flaviaUserId = await seedFlaviaUser(userRepository);
    console.log(`✅ Flavia user created/found (ID: ${flaviaUserId})\n`);

    // Seed Flavia Tarotista Profile
    const flaviaTarotistaId = await seedFlaviaTarotista(
      flaviaUserId,
      tarotistaRepository,
      userRepository,
    );
    console.log(
      `✅ Flavia tarotista profile created/found (ID: ${flaviaTarotistaId})\n`,
    );

    // Seed Flavia IA Configuration
    const flaviaConfigId = await seedFlaviaIAConfig(
      flaviaTarotistaId,
      tarotistaConfigRepository,
      tarotistaRepository,
    );
    console.log(`✅ Flavia IA config created/found (ID: ${flaviaConfigId})\n`);

    console.log('✨ Flavia seeding completed!\n');

    // ========== EXISTING SEEDERS ==========
    console.log('📍 Step 2: Seeding existing data...\n');

    // Seed Reading Categories first
    await seedReadingCategories(categoryRepository);

    // Seed Decks first (required for cards)
    await seedTarotDecks(deckRepository);

    // Seed Cards (requires deck to exist)
    await seedTarotCards(cardRepository, deckRepository);

    // Seed Spreads
    await seedTarotSpreads(dataSource);

    // Seed Predefined Questions (requires categories to exist)
    await seedPredefinedQuestions(questionRepository, categoryRepository);

    // Seed Test Users (for development and E2E testing)
    await seedUsers(userRepository);

    console.log('\n✨ ¡Datos iniciales cargados con éxito!');
  } catch (error) {
    console.error('❌ Error al cargar datos iniciales:', error);
  } finally {
    await app.close();
  }
}

void bootstrap();
