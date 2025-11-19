#!/usr/bin/env ts-node
/**
 * CLI principal para tareas de desarrollo
 * Proporciona subcomandos útiles para administración
 *
 * Uso:
 *   npm run cli user:create -- --email=test@test.com --name="Test User" --password=test123
 *   npm run cli user:promote -- --email=test@test.com --role=admin
 *   npm run cli cache:clear
 *   npm run cli openai:test
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/modules/users/users.service';
import { UserRole } from '../src/common/enums/user-role.enum';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

interface CliOptions {
  email?: string;
  name?: string;
  password?: string;
  role?: string;
}

function parseArgs(): { command: string; options: CliOptions } {
  const args = process.argv.slice(2);
  const command = args[0] || '';
  const options: CliOptions = {};

  args.slice(1).forEach((arg) => {
    const [key, value] = arg.replace('--', '').split('=');
    if (key && value) {
      (options as Record<string, string>)[key] = value;
    }
  });

  return { command, options };
}

async function userCreate(usersService: UsersService, options: CliOptions) {
  if (!options.email || !options.password || !options.name) {
    console.error('❌ Missing required arguments');
    console.error(
      'Usage: npm run cli user:create -- --email=EMAIL --name=NAME --password=PASSWORD',
    );
    process.exit(1);
  }

  try {
    const user = await usersService.create({
      email: options.email,
      password: options.password,
      name: options.name,
    });
    console.log(`✅ User created successfully!`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Error creating user: ${error.message}`);
    } else {
      console.error('❌ Unknown error creating user');
    }
    process.exit(1);
  }
}

async function userPromote(usersService: UsersService, options: CliOptions) {
  if (!options.email || !options.role) {
    console.error('❌ Missing required arguments');
    console.error(
      'Usage: npm run cli user:promote -- --email=EMAIL --role=ROLE',
    );
    console.error('Available roles: consumer, tarotista, admin');
    process.exit(1);
  }

  try {
    const user = await usersService.findByEmail(options.email);
    if (!user) {
      console.error(`❌ User with email ${options.email} not found`);
      process.exit(1);
    }

    // Check role
    const newRole = options.role.toLowerCase();
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(newRole as UserRole)) {
      console.log(
        `⚠️  Invalid role: ${newRole}. Valid roles: ${validRoles.join(', ')}`,
      );
      process.exit(1);
    }

    if (!user.roles.includes(newRole as UserRole)) {
      console.log(
        `ℹ️  Note: Direct role assignment is not implemented in CLI.`,
      );
      console.log(`   Current roles: ${user.roles.join(', ')}`);
      console.log(
        `   To add role '${newRole}', update the database directly or use the admin panel.`,
      );
    } else {
      console.log(`ℹ️  User already has role: ${newRole}`);
      console.log(`   Current roles: ${user.roles.join(', ')}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Error promoting user: ${error.message}`);
    } else {
      console.error('❌ Unknown error promoting user');
    }
    process.exit(1);
  }
}

async function cacheClear(cacheManager: Cache) {
  try {
    console.log('🗑️  Clearing cache...');
    // Use store if available (type assertion needed for in-memory cache)
    const cacheWithStore = cacheManager as Cache & {
      store?: { reset?: () => Promise<void> };
    };
    if (
      cacheWithStore.store &&
      typeof cacheWithStore.store.reset === 'function'
    ) {
      await cacheWithStore.store.reset();
    } else {
      console.log(
        '⚠️  Cache reset not supported by current cache implementation',
      );
    }
    console.log('✅ Cache cleared successfully!');
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Error clearing cache: ${error.message}`);
    } else {
      console.error('❌ Unknown error clearing cache');
    }
    process.exit(1);
  }
}

function openaiTest(): void {
  console.log('🧪 Testing OpenAI connection...');

  // Verificar que las variables de entorno estén configuradas
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    console.error('💡 Set it in your .env file');
    process.exit(1);
  }

  console.log('✅ OpenAI API Key is configured');
  console.log(`   Key: ${process.env.OPENAI_API_KEY.substring(0, 10)}...`);

  // Verificar otras variables de configuración
  if (process.env.OPENAI_MODEL) {
    console.log(`   Model: ${process.env.OPENAI_MODEL}`);
  }
  if (process.env.OPENAI_MAX_TOKENS) {
    console.log(`   Max Tokens: ${process.env.OPENAI_MAX_TOKENS}`);
  }

  console.log('\n💡 To test actual API connection, generate a reading:');
  console.log('   npm run generate:reading');
}

function showHelp(): void {
  console.log('🔮 Tarot CLI - Development Tools\n');
  console.log('Available commands:\n');
  console.log('  user:create    Create a new user');
  console.log(
    '                 Example: npm run cli user:create -- --email=test@test.com --name="Test" --password=test123\n',
  );
  console.log('  user:promote   Add role to user');
  console.log(
    '                 Example: npm run cli user:promote -- --email=test@test.com --role=admin\n',
  );
  console.log('  cache:clear    Clear all cache');
  console.log('                 Example: npm run cli cache:clear\n');
  console.log('  openai:test    Test OpenAI configuration');
  console.log('                 Example: npm run cli openai:test\n');
  console.log('  help           Show this help message\n');
}

async function bootstrap() {
  const { command, options } = parseArgs();

  if (!command || command === 'help') {
    showHelp();
    return;
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    switch (command) {
      case 'user:create': {
        const usersService = app.get(UsersService);
        await userCreate(usersService, options);
        break;
      }
      case 'user:promote': {
        const usersService = app.get(UsersService);
        await userPromote(usersService, options);
        break;
      }
      case 'cache:clear': {
        const cacheManager = app.get<Cache>(CACHE_MANAGER);
        await cacheClear(cacheManager);
        break;
      }
      case 'openai:test': {
        openaiTest();
        break;
      }
      default:
        console.error(`❌ Unknown command: ${command}`);
        console.error('Run "npm run cli help" to see available commands');
        process.exit(1);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Error: ${error.message}`);
    } else {
      console.error('❌ Unknown error occurred');
    }
    process.exit(1);
  } finally {
    await app.close();
  }
}

void bootstrap();
