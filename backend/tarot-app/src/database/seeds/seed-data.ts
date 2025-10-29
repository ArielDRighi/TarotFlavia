import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { TarotDeck } from '../../modules/tarot/decks/entities/tarot-deck.entity';
import { TarotCard } from '../../modules/tarot/cards/entities/tarot-card.entity';
import { seedTarotDecks } from './tarot-decks.seeder';
import { seedTarotCards } from './tarot-cards.seeder';
import { seedTarotSpreads } from './tarot-spreads.seeder';
import { seedReadingCategories } from './reading-categories.seed';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  const deckRepository = app.get<Repository<TarotDeck>>(
    getRepositoryToken(TarotDeck),
  );
  const cardRepository = app.get<Repository<TarotCard>>(
    getRepositoryToken(TarotCard),
  );

  try {
    console.log('🌱 Starting database seeding process...\n');

    // Seed Reading Categories first
    await seedReadingCategories(dataSource);

    // Seed Decks first (required for cards)
    await seedTarotDecks(deckRepository);

    // Seed Cards (requires deck to exist)
    await seedTarotCards(cardRepository, deckRepository);

    // Seed Spreads
    await seedTarotSpreads(dataSource);

    console.log('¡Datos iniciales cargados con éxito!');
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error);
  } finally {
    await app.close();
  }
}

void bootstrap();
