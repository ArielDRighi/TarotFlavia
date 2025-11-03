import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Cargar variables de entorno al inicio
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[TypeORM Config] Cargando .env desde: ${envPath}`);
  }
  dotenv.config({ path: envPath });
} else {
  if (process.env.NODE_ENV !== 'test') {
    console.warn('[TypeORM Config] No se encontró el archivo .env');
  }
}

// Configuración de la base de datos usando variables de entorno
const config = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB || 'tarot_app',
  synchronize: false, // Desactivado - ahora usamos migraciones
  autoLoadEntities: true,
  logging: process.env.NODE_ENV !== 'test', // Disable logging in test environment
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  migrationsRun: true, // Ejecutar migraciones automáticamente al iniciar
  ssl: false,
  dropSchema: false,
};

// Verificar que las variables críticas estén definidas
if (process.env.NODE_ENV !== 'test') {
  console.log(
    '[TypeORM Config] Verificando configuración de la base de datos:',
  );
  console.log(`Host: ${config.host}`);
  console.log(`Puerto: ${config.port}`);
  console.log(`Usuario: ${config.username}`);
  console.log(`Base de Datos: ${config.database}`);
  console.log(`Contraseña existe: ${Boolean(config.password)}`);
}

// Si falta alguna configuración crítica, usar valores por defecto
if (!config.password) {
  console.warn(
    '[TypeORM Config] ADVERTENCIA: No se encontró la contraseña en las variables de entorno. Usando valor predeterminado.',
  );
  config.password = 'CanonEos50d'; // Valor por defecto en caso de emergencia
}

export default registerAs('database', () => config);

export const connectionSource = new DataSource(config as DataSourceOptions);
