import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Cargar variables de entorno desde .env si existe
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log(`[Integration DataSource] Cargando .env desde: ${envPath}`);
  dotenv.config({ path: envPath });
}

/**
 * DataSource para ejecutar migraciones en la base de datos de tests de integración
 * Base de datos: tarot_integration (puerto 5439)
 */
export const IntegrationDataSource = new DataSource({
  type: 'postgres',
  host: process.env.TAROT_INTEGRATION_DB_HOST || 'localhost',
  port: parseInt(process.env.TAROT_INTEGRATION_DB_PORT || '5439', 10),
  username: process.env.TAROT_INTEGRATION_DB_USER || 'tarot_integration_user',
  password:
    process.env.TAROT_INTEGRATION_DB_PASSWORD ||
    'tarot_integration_password_2024',
  database: process.env.TAROT_INTEGRATION_DB_NAME || 'tarot_integration',
  synchronize: false,
  logging: true,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
});
