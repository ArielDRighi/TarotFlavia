import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { TarotDeck } from './decks/entities/tarot-deck.entity';
import { TarotCard } from './cards/entities/tarot-card.entity';
import { seedTarotDecks } from './database/seeds/tarot-decks.seeder';
import { seedTarotCards } from './database/seeds/tarot-cards.seeder';
import { seedTarotSpreads } from './database/seeds/tarot-spreads.seeder';

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
