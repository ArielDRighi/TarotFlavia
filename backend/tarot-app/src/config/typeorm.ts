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

// Detectar si estamos en modo E2E testing
const isE2ETesting =
  process.env.NODE_ENV === 'test' || process.env.E2E_TESTING === 'true';

// Configuración de la base de datos usando variables de entorno
// Si estamos en E2E testing, usar la base de datos E2E dedicada
const config = {
  type: 'postgres',
  host: isE2ETesting
    ? process.env.TAROT_E2E_DB_HOST || 'localhost'
    : process.env.TAROT_DB_HOST || process.env.POSTGRES_HOST || 'localhost',
  port: isE2ETesting
    ? parseInt(process.env.TAROT_E2E_DB_PORT || '5436', 10)
    : parseInt(
        process.env.TAROT_DB_PORT || process.env.POSTGRES_PORT || '5435',
        10,
      ),
  username: isE2ETesting
    ? process.env.TAROT_E2E_DB_USER || 'tarot_e2e_user'
    : process.env.TAROT_DB_USER || process.env.POSTGRES_USER || 'tarot_user',
  password: isE2ETesting
    ? process.env.TAROT_E2E_DB_PASSWORD || 'tarot_e2e_password_2024'
    : process.env.TAROT_DB_PASSWORD || process.env.POSTGRES_PASSWORD,
  database: isE2ETesting
    ? process.env.TAROT_E2E_DB_NAME || 'tarot_e2e'
    : process.env.TAROT_DB_NAME || process.env.POSTGRES_DB || 'tarot_db',
  synchronize: false, // Desactivado - ahora usamos migraciones
  autoLoadEntities: true,
  logging:
    (process.env.NODE_ENV === 'development' && !isE2ETesting) ||
    (isE2ETesting && process.env.E2E_ENABLE_LOGGING === 'true')
      ? ['query', 'error', 'warn']
      : false, // Habilitado en desarrollo para detectar N+1 queries. Para E2E: set E2E_ENABLE_LOGGING=true para habilitar logs durante pruebas E2E
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  migrationsRun: isE2ETesting ? false : true, // No ejecutar migraciones automáticamente en E2E (ya se ejecutan en globalSetup)
  ssl: false,
  dropSchema: false,
  // Connection pooling configuration
  extra: {
    // Maximum number of connections in the pool
    max: parseInt(
      process.env.DB_POOL_SIZE ||
        (process.env.NODE_ENV === 'production' ? '25' : '10'),
      10,
    ),
    // Minimum number of connections to keep in the pool (25% of max)
    min: Math.ceil(
      parseInt(
        process.env.DB_POOL_SIZE ||
          (process.env.NODE_ENV === 'production' ? '25' : '10'),
        10,
      ) * 0.25,
    ),
    // Maximum time (ms) to wait for connection from pool
    connectionTimeoutMillis: parseInt(
      process.env.DB_CONNECTION_TIMEOUT || '30000',
      10,
    ),
    // Time (ms) before idle connection is closed
    idleTimeoutMillis: 30000,
    // Application name for PostgreSQL connection tracking
    application_name: 'tarot-app',
    // Statement timeout (prevent runaway queries)
    statement_timeout: 30000, // 30 seconds
    // Query timeout for individual queries
    query_timeout: parseInt(process.env.DB_MAX_QUERY_TIME || '5000', 10),
    // Connection retry configuration
    // PostgreSQL will retry connection attempts with exponential backoff
    connectionRetryAttempts: 3,
    connectionRetryDelay: 1000, // Start with 1 second, doubles each retry
  },
  // Log slow queries for performance monitoring
  maxQueryExecutionTime: parseInt(process.env.DB_MAX_QUERY_TIME || '5000', 10),
};

// Verificar que las variables críticas estén definidas
if (process.env.NODE_ENV !== 'test' && !isE2ETesting) {
  console.log(
    '[TypeORM Config] Verificando configuración de la base de datos:',
  );
  console.log(`Modo: ${isE2ETesting ? 'E2E Testing' : 'Production'}`);
  console.log(`Host: ${config.host}`);
  console.log(`Puerto: ${config.port}`);
  console.log(`Usuario: ${config.username}`);
  console.log(`Base de Datos: ${config.database}`);
  console.log(`Contraseña existe: ${Boolean(config.password)}`);
  console.log(
    `Pool Size: ${config.extra.max} (min: ${config.extra.min}, timeout: ${config.extra.connectionTimeoutMillis}ms)`,
  );
  console.log(
    `Max Query Time: ${config.maxQueryExecutionTime}ms (queries lentas serán logueadas)`,
  );
  console.log(
    `Retry Strategy: ${config.extra.connectionRetryAttempts} intentos con delay inicial de ${config.extra.connectionRetryDelay}ms (backoff exponencial)`,
  );
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
