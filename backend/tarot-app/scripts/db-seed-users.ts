#!/usr/bin/env ts-node
/**
 * Script para seedear usuarios de prueba
 * Crea usuarios con credenciales conocidas para testing:
 * - admin@test.com (admin)
 * - premium@test.com (premium user)
 * - free@test.com (free user)
 *
 * Uso: npm run db:seed:users
 */

import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { User } from '../src/modules/users/entities/user.entity';
import { seedUsers } from '../src/database/seeds/users.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

  try {
    console.log('👥 Starting test users seeding process...\n');

    console.log('📍 Creating test users...');
    await seedUsers(userRepository);
    console.log('✅ Test users created successfully\n');

    console.log('🔑 Test User Credentials:');
    console.log('  Admin:   admin@test.com   / admin123');
    console.log('  Premium: premium@test.com / premium123');
    console.log('  Free:    free@test.com    / free123\n');

    console.log('✨ Users seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

void bootstrap();
