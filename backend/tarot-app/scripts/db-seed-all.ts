#!/usr/bin/env ts-node
/**
 * Script para ejecutar todos los seeders en orden correcto
 * Verifica dependencias entre seeders
 *
 * Uso: npm run db:seed:all
 */

import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { TarotDeck } from '../src/modules/tarot/decks/entities/tarot-deck.entity';
import { TarotCard } from '../src/modules/tarot/cards/entities/tarot-card.entity';
import { ReadingCategory } from '../src/modules/categories/entities/reading-category.entity';
import { PredefinedQuestion } from '../src/modules/predefined-questions/entities/predefined-question.entity';
import { User } from '../src/modules/users/entities/user.entity';
import { Tarotista } from '../src/modules/tarotistas/entities/tarotista.entity';
import { TarotistaConfig } from '../src/modules/tarotistas/entities/tarotista-config.entity';
import { seedTarotDecks } from '../src/database/seeds/tarot-decks.seeder';
import { seedTarotCards } from '../src/database/seeds/tarot-cards.seeder';
import { seedTarotSpreads } from '../src/database/seeds/tarot-spreads.seeder';
import { seedReadingCategories } from '../src/database/seeds/reading-categories.seeder';
import { seedPredefinedQuestions } from '../src/database/seeds/predefined-questions.seeder';
import { seedUsers } from '../src/database/seeds/users.seeder';
import { seedFlaviaUser } from '../src/database/seeds/flavia-user.seeder';
import { seedFlaviaTarotista } from '../src/database/seeds/flavia-tarotista.seeder';
import { seedFlaviaIAConfig } from '../src/database/seeds/flavia-ia-config.seeder';

interface SeederStep {
  name: string;
  dependencies: string[];
  execute: () => Promise<void>;
}

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
    console.log(
      '🌱 Starting complete seeding process with dependency verification...\n',
    );

    // Definir seeders con sus dependencias
    const seeders: SeederStep[] = [
      {
        name: 'Reading Categories',
        dependencies: [],
        execute: async () => {
          await seedReadingCategories(categoryRepository);
        },
      },
      {
        name: 'Tarot Decks',
        dependencies: [],
        execute: async () => {
          await seedTarotDecks(deckRepository);
        },
      },
      {
        name: 'Tarot Cards',
        dependencies: ['Tarot Decks'],
        execute: async () => {
          await seedTarotCards(cardRepository, deckRepository);
        },
      },
      {
        name: 'Tarot Spreads',
        dependencies: [],
        execute: async () => {
          await seedTarotSpreads(dataSource);
        },
      },
      {
        name: 'Predefined Questions',
        dependencies: ['Reading Categories'],
        execute: async () => {
          await seedPredefinedQuestions(questionRepository, categoryRepository);
        },
      },
      {
        name: 'Flavia User',
        dependencies: [],
        execute: async () => {
          const flaviaUserId = await seedFlaviaUser(userRepository);
          (global as { flaviaUserId?: number }).flaviaUserId = flaviaUserId;
          console.log(`   → Flavia User ID: ${flaviaUserId}`);
        },
      },
      {
        name: 'Flavia Tarotista',
        dependencies: ['Flavia User'],
        execute: async () => {
          const flaviaUserId = (global as { flaviaUserId?: number })
            .flaviaUserId;
          if (!flaviaUserId) {
            throw new Error('Flavia User ID not found in global context');
          }
          const flaviaTarotistaId = await seedFlaviaTarotista(
            flaviaUserId,
            tarotistaRepository,
            userRepository,
          );
          (global as { flaviaTarotistaId?: number }).flaviaTarotistaId =
            flaviaTarotistaId;
          console.log(`   → Flavia Tarotista ID: ${flaviaTarotistaId}`);
        },
      },
      {
        name: 'Flavia IA Config',
        dependencies: ['Flavia Tarotista'],
        execute: async () => {
          const flaviaTarotistaId = (global as { flaviaTarotistaId?: number })
            .flaviaTarotistaId;
          if (!flaviaTarotistaId) {
            throw new Error('Flavia Tarotista ID not found in global context');
          }
          const flaviaConfigId = await seedFlaviaIAConfig(
            flaviaTarotistaId,
            tarotistaConfigRepository,
            tarotistaRepository,
          );
          console.log(`   → Flavia Config ID: ${flaviaConfigId}`);
        },
      },
      {
        name: 'Test Users',
        dependencies: [],
        execute: async () => {
          await seedUsers(userRepository);
        },
      },
    ];

    // Ejecutar seeders en orden
    const completed = new Set<string>();
    let stepNumber = 1;

    for (const seeder of seeders) {
      // Verificar dependencias
      const unmetDependencies = seeder.dependencies.filter(
        (dep) => !completed.has(dep),
      );

      if (unmetDependencies.length > 0) {
        throw new Error(
          `Seeder "${seeder.name}" has unmet dependencies: ${unmetDependencies.join(', ')}`,
        );
      }

      console.log(`📍 Step ${stepNumber}/${seeders.length}: ${seeder.name}...`);
      if (seeder.dependencies.length > 0) {
        console.log(`   Dependencies: ${seeder.dependencies.join(', ')}`);
      }

      await seeder.execute();
      completed.add(seeder.name);
      console.log(`✅ ${seeder.name} completed\n`);

      stepNumber++;
    }

    console.log('✨ All seeders executed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   Total seeders: ${seeders.length}`);
    console.log(`   Successfully completed: ${completed.size}`);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

void bootstrap();
