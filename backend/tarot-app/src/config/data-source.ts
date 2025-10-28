import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Cargar variables de entorno
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log(`[DataSource] Cargando .env desde: ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.warn('[DataSource] No se encontró el archivo .env');
}

// Configuración del DataSource para migraciones
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'CanonEos50d',
  database: process.env.POSTGRES_DB || 'tarot_app',
  synchronize: false, // IMPORTANTE: desactivado para usar migraciones
  logging: true,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  ssl: false,
});
