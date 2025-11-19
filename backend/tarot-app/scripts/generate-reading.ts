#!/usr/bin/env ts-node
/**
 * CLI para generar una lectura de prueba
 * Útil para testing sin hacer requests HTTP
 *
 * Uso: npm run generate:reading -- --userId=1 --spreadId=1
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ReadingsOrchestratorService } from '../src/modules/tarot/readings/application/services/readings-orchestrator.service';
import { UsersService } from '../src/modules/users/users.service';
import { SpreadsService } from '../src/modules/tarot/spreads/spreads.service';
import { CardsService } from '../src/modules/tarot/cards/cards.service';
import { User } from '../src/modules/users/entities/user.entity';

interface GenerateReadingOptions {
  userId?: number;
  email?: string;
  spreadId?: number;
  question?: string;
  customQuestion?: boolean;
}

async function bootstrap() {
  // Parse CLI arguments
  const args = process.argv.slice(2);
  const options: GenerateReadingOptions = {};

  args.forEach((arg) => {
    const [key, value] = arg.replace('--', '').split('=');
    if (key && value) {
      if (key === 'userId' || key === 'spreadId') {
        options[key] = parseInt(value, 10);
      } else if (key === 'customQuestion') {
        options[key] = value === 'true';
      } else if (key === 'email' || key === 'question') {
        options[key] = value;
      }
    }
  });

  const app = await NestFactory.createApplicationContext(AppModule);
  const readingsService = app.get(ReadingsOrchestratorService);
  const usersService = app.get(UsersService);
  const spreadsService = app.get(SpreadsService);
  const cardsService = app.get(CardsService);

  try {
    console.log('🔮 Generating test reading...\n');

    // Get or validate user
    let user: User;
    if (options.userId) {
      const foundUser = await usersService.findById(options.userId);
      if (!foundUser) {
        throw new Error(`User with ID ${options.userId} not found`);
      }
      user = foundUser;
    } else if (options.email) {
      const foundUser = await usersService.findByEmail(options.email);
      if (!foundUser) {
        throw new Error(`User with email ${options.email} not found`);
      }
      user = foundUser;
    } else {
      // Default to free test user
      const foundUser = await usersService.findByEmail('free@test.com');
      if (!foundUser) {
        throw new Error(
          'Default test user (free@test.com) not found. Run npm run db:seed:users first.',
        );
      }
      user = foundUser;
    }

    console.log(`👤 User: ${user.email} (${user.name})`);
    console.log(`   Roles: ${user.roles.join(', ')}`);
    console.log(`   Plan: ${user.plan}\n`);

    // Get spread
    const spreadId = options.spreadId || 1;
    const spread = await spreadsService.findById(spreadId);
    if (!spread) {
      throw new Error(`Spread with ID ${spreadId} not found`);
    }

    console.log(`🃏 Spread: ${spread.name} (${spread.cardCount} cards)`);
    console.log(`   ${spread.description}\n`);

    // Get random cards
    const allCards = await cardsService.findAll();
    const selectedCards = allCards
      .sort(() => Math.random() - 0.5)
      .slice(0, spread.cardCount);

    console.log(`📋 Selected cards:`);
    selectedCards.forEach((card, index) => {
      const position = spread.positions[index] || {
        name: `Position ${index + 1}`,
      };
      const isReversed = Math.random() > 0.5;
      console.log(
        `   ${index + 1}. ${card.name} (${isReversed ? 'Reversed' : 'Upright'}) - ${position.name}`,
      );
    });
    console.log('');

    // Create reading
    const question = options.question || '¿Qué me depara el futuro en el amor?';
    const createReadingDto = {
      deckId: 1,
      spreadId: spread.id,
      cardIds: selectedCards.map((c) => c.id),
      cardPositions: selectedCards.map((card, index) => ({
        cardId: card.id,
        position: spread.positions[index]?.name || `position_${index + 1}`,
        isReversed: Math.random() > 0.5,
      })),
      generateInterpretation: true,
      ...(options.customQuestion
        ? { customQuestion: question }
        : { predefinedQuestionId: 1 }),
    };

    console.log(`❓ Question: ${question}\n`);
    console.log('⏳ Creating reading with AI interpretation...\n');

    const reading = await readingsService.create(user, createReadingDto);

    console.log('✅ Reading created successfully!\n');
    console.log(`📊 Reading Details:`);
    console.log(`   ID: ${reading.id}`);
    console.log(`   Created: ${reading.createdAt.toISOString()}`);
    console.log(`   Question: ${reading.question}`);
    console.log(`   Cards: ${reading.cards.length}`);
    console.log(
      `   Has Interpretation: ${reading.interpretation ? 'Yes' : 'No'}\n`,
    );

    if (reading.interpretation && typeof reading.interpretation === 'string') {
      console.log(`🤖 AI Interpretation (preview):`);
      const preview = reading.interpretation.substring(0, 200);
      console.log(`   Content: ${preview}...\n`);
    }

    console.log('✨ Done!');
  } catch (error) {
    console.error('❌ Error generating reading:', error);
    console.error('\n💡 Usage:');
    console.error('  npm run generate:reading');
    console.error('  npm run generate:reading -- --email=premium@test.com');
    console.error('  npm run generate:reading -- --userId=1 --spreadId=2');
    console.error(
      '  npm run generate:reading -- --userId=1 --question="Mi pregunta" --customQuestion=true',
    );
    process.exit(1);
  } finally {
    await app.close();
  }
}

void bootstrap();
