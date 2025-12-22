import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';

/**
 * Configuración de TypeORM para Tests de Integración
 *
 * Usa PostgreSQL dedicado (tarot_integration) en Docker puerto 5437.
 * Base de datos aislada de dev (5435) y E2E (5436).
 */
export const integrationDataSourceOptions: TypeOrmModuleOptions &
  DataSourceOptions = {
  type: 'postgres',
  host: process.env.TAROT_INTEGRATION_DB_HOST || 'localhost',
  port: parseInt(process.env.TAROT_INTEGRATION_DB_PORT || '5439', 10),
  username: process.env.TAROT_INTEGRATION_DB_USER || 'tarot_integration_user',
  password:
    process.env.TAROT_INTEGRATION_DB_PASSWORD ||
    'tarot_integration_password_2024',
  database: process.env.TAROT_INTEGRATION_DB_NAME || 'tarot_integration',
  entities: [join(__dirname, '../src/**/*.entity{.ts,.js}')],
  synchronize: true, // Auto-crear esquema en cada ejecución
  dropSchema: true, // Limpiar antes de cada suite de tests
  logging: false,
  migrations: [],
};

export const IntegrationDataSource = new DataSource(
  integrationDataSourceOptions,
);
