import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Cargar variables de entorno desde .env si existe (local development)
// En CI/CD, las variables se pasan como environment variables directamente
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log(`[DataSource] Cargando .env desde: ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.warn(
    '[DataSource] No se encontró el archivo .env - usando variables de entorno del sistema',
  );
}

// Validar que las variables críticas estén configuradas
if (!process.env.POSTGRES_PASSWORD) {
  throw new Error(
    'POSTGRES_PASSWORD environment variable must be set. Please configure it in your .env file or environment.',
  );
}

if (!process.env.POSTGRES_USER) {
  console.warn('[DataSource] POSTGRES_USER not set, using default: postgres');
}

// Log configuración en CI (para debug)
if (process.env.CI) {
  console.log('[DataSource] Running in CI environment');
  console.log(`[DataSource] POSTGRES_USER: ${process.env.POSTGRES_USER}`);
  console.log(`[DataSource] POSTGRES_HOST: ${process.env.POSTGRES_HOST}`);
  console.log(`[DataSource] POSTGRES_PORT: ${process.env.POSTGRES_PORT}`);
  console.log(`[DataSource] POSTGRES_DB: ${process.env.POSTGRES_DB}`);
}

// Configuración del DataSource para migraciones
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB || 'tarot_app',
  synchronize: false, // IMPORTANTE: desactivado para usar migraciones
  logging: true,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  ssl: false,
});
