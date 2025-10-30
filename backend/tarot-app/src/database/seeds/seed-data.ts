import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { TarotDeck } from '../../modules/tarot/decks/entities/tarot-deck.entity';
import { TarotCard } from '../../modules/tarot/cards/entities/tarot-card.entity';
import { ReadingCategory } from '../../modules/categories/entities/reading-category.entity';
import { PredefinedQuestion } from '../../modules/predefined-questions/entities/predefined-question.entity';
import { seedTarotDecks } from './tarot-decks.seeder';
import { seedTarotCards } from './tarot-cards.seeder';
import { seedTarotSpreads } from './tarot-spreads.seeder';
import { seedReadingCategories } from './reading-categories.seeder';
import { seedPredefinedQuestions } from './predefined-questions.seeder';

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

  try {
    console.log('🌱 Starting database seeding process...\n');

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

    console.log('\n✨ ¡Datos iniciales cargados con éxito!');
  } catch (error) {
    console.error('❌ Error al cargar datos iniciales:', error);
  } finally {
    await app.close();
  }
}

void bootstrap();
