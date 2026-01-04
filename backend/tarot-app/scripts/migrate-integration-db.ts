/**
 * Script to run migrations on the integration database
 * Run with: npx ts-node -r tsconfig-paths/register scripts/migrate-integration-db.ts
 */
import { DataSource } from 'typeorm';

const IntegrationDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5439,
  username: 'tarot_integration_user',
  password: 'tarot_integration_password_2024',
  database: 'tarot_integration',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});

async function runMigrations() {
  console.log('🔄 Connecting to integration database...');
  await IntegrationDataSource.initialize();

  console.log('🔄 Running migrations...');
  const migrations = await IntegrationDataSource.runMigrations();

  console.log(`✅ Executed ${migrations.length} migrations:`);
  migrations.forEach((migration) => {
    console.log(`  - ${migration.name}`);
  });

  await IntegrationDataSource.destroy();
  console.log('✅ Done!');
}

runMigrations().catch((error) => {
  console.error('❌ Error running migrations:', error);
  process.exit(1);
});
