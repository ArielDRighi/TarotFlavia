import { DataSource } from 'typeorm';

/**
 * DataSource configuration for Integration DB
 * Used to run migrations on the integration database
 */
const IntegrationDataSource = new DataSource({
  type: 'postgres',
  host: process.env.TAROT_INTEGRATION_DB_HOST || 'localhost',
  port: parseInt(process.env.TAROT_INTEGRATION_DB_PORT || '5439', 10),
  username: process.env.TAROT_INTEGRATION_DB_USER || 'tarot_integration_user',
  password:
    process.env.TAROT_INTEGRATION_DB_PASSWORD ||
    'tarot_integration_password_2024',
  database: process.env.TAROT_INTEGRATION_DB_NAME || 'tarot_integration',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: false,
});

export default IntegrationDataSource;
