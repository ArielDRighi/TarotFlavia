import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Cargar variables de entorno al inicio
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Configuración dedicada para la base de datos E2E
const e2eConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.TAROT_E2E_DB_HOST || 'localhost',
  port: parseInt(process.env.TAROT_E2E_DB_PORT || '5436', 10),
  username: process.env.TAROT_E2E_DB_USER || 'tarot_e2e_user',
  password: process.env.TAROT_E2E_DB_PASSWORD || 'tarot_e2e_password_2024',
  database: process.env.TAROT_E2E_DB_NAME || 'tarot_e2e',
  synchronize: false, // Usar migraciones en lugar de sincronización automática
  logging: false, // Desactivar logs en tests E2E
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  migrationsRun: false, // Las migraciones se ejecutan manualmente en tests
  ssl: false,
  dropSchema: false,
};

// Solo mostrar logs de configuración si DEBUG está habilitado
if (process.env.DEBUG) {
  console.log('[TypeORM E2E Config] Configuración E2E:');
  console.log(`Host: ${e2eConfig.host}`);
  console.log(`Puerto: ${e2eConfig.port}`);
  console.log(`Usuario: ${e2eConfig.username}`);
  console.log(`Base de Datos: ${e2eConfig.database}`);
}

export const e2eConnectionSource = new DataSource(e2eConfig);
