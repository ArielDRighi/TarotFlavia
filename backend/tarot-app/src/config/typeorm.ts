import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { setTypeParser } from 'pg-types';

// BUGFIX: Ensure TIMESTAMP WITHOUT TIME ZONE columns are parsed as UTC.
// By default, node-postgres parses them as local time (no timezone info),
// which causes TypeORM Date objects to have incorrect UTC offsets on non-UTC
// machines (e.g. UTC-3 adds 3 hours: stored 11:48 → returned as 14:48Z).
// OID 1114 = TIMESTAMP WITHOUT TIME ZONE
setTypeParser(1114, (val: string) => new Date(val + 'Z'));

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

// Detectar si estamos en modo E2E testing o Integration testing
const isE2ETesting =
  process.env.NODE_ENV === 'test' || process.env.E2E_TESTING === 'true';
const isIntegrationTesting = process.env.INTEGRATION_TESTING === 'true';

// Configuración de la base de datos usando variables de entorno
// Prioridad: Integration Testing > E2E Testing > Production
const config = {
  type: 'postgres',
  host: isIntegrationTesting
    ? process.env.TAROT_INTEGRATION_DB_HOST ||
      process.env.POSTGRES_HOST ||
      'localhost'
    : isE2ETesting
      ? process.env.TAROT_E2E_DB_HOST || 'localhost'
      : process.env.TAROT_DB_HOST || process.env.POSTGRES_HOST || 'localhost',
  port: isIntegrationTesting
    ? parseInt(
        process.env.TAROT_INTEGRATION_DB_PORT ||
          process.env.POSTGRES_PORT ||
          '5439',
        10,
      )
    : isE2ETesting
      ? parseInt(process.env.TAROT_E2E_DB_PORT || '5436', 10)
      : parseInt(
          process.env.TAROT_DB_PORT || process.env.POSTGRES_PORT || '5435',
          10,
        ),
  username: isIntegrationTesting
    ? process.env.TAROT_INTEGRATION_DB_USER ||
      process.env.POSTGRES_USER ||
      'tarot_integration_user'
    : isE2ETesting
      ? process.env.TAROT_E2E_DB_USER || 'tarot_e2e_user'
      : process.env.TAROT_DB_USER || process.env.POSTGRES_USER || 'tarot_user',
  password: isIntegrationTesting
    ? process.env.TAROT_INTEGRATION_DB_PASSWORD ||
      process.env.POSTGRES_PASSWORD ||
      'tarot_integration_pass'
    : isE2ETesting
      ? process.env.TAROT_E2E_DB_PASSWORD || 'tarot_e2e_password_2024'
      : process.env.TAROT_DB_PASSWORD || process.env.POSTGRES_PASSWORD,
  database: isIntegrationTesting
    ? process.env.TAROT_INTEGRATION_DB_NAME ||
      process.env.POSTGRES_DB ||
      'tarot_integration'
    : isE2ETesting
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
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
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
if (process.env.NODE_ENV !== 'test' && !isE2ETesting && !isIntegrationTesting) {
  console.log(
    '[TypeORM Config] Verificando configuración de la base de datos:',
  );
  console.log(
    `Modo: ${isIntegrationTesting ? 'Integration Testing' : isE2ETesting ? 'E2E Testing' : 'Production'}`,
  );
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
