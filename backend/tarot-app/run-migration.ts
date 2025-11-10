#!/usr/bin/env ts-node
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { HistoricalDataMigration } from './migrate-historical-data';
import * as path from 'path';

// Load environment variables
config();

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // Initialize DataSource
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'tarot_db',
    entities: [path.join(__dirname, 'src/**/*.entity{.ts,.js}')],
    synchronize: false,
  });

  try {
    console.log('🔌 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Database connected\n');

    const migration = new HistoricalDataMigration(dataSource);

    switch (command) {
      case 'migrate':
        await migration.runAll();
        break;

      case 'rollback':
        await migration.rollbackAll();
        break;

      case 'validate':
        await migration.validateDataIntegrity();
        break;

      case 'migrate:readings':
        await migration.migrateReadingsToFlavia();
        break;

      case 'migrate:cache': {
        // Find Flavia's ID first
        const flaviaResult = await dataSource.query<Array<{ id: number }>>(
          `SELECT t.id FROM tarotistas t
           INNER JOIN "user" u ON u.id = t.user_id
           WHERE u.email = 'flavia@tarotflavia.com'
           LIMIT 1`,
        );

        if (flaviaResult && flaviaResult.length > 0) {
          await migration.migrateCacheKeys(flaviaResult[0].id);
        } else {
          console.error('❌ Flavia tarotista not found');
        }
        break;
      }

      case 'migrate:roles':
        await migration.migrateAdminRoles();
        break;

      default:
        console.log(`
📦 Historical Data Migration Tool

Usage:
  npm run migrate:historical-data <command>

Commands:
  migrate              Run all migrations (readings, cache, roles)
  rollback             Rollback all migrations
  validate             Validate data integrity
  migrate:readings     Migrate only readings to Flavia
  migrate:cache        Migrate only cache keys
  migrate:roles        Migrate only admin roles

Examples:
  npm run migrate:historical-data migrate
  npm run migrate:historical-data validate
  npm run migrate:historical-data rollback
        `);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\n🔌 Database connection closed');
    }
  }
}

void main();
