/**
 * Jest Setup File - Configuración de Variables de Entorno para Tests E2E
 *
 * Este archivo se ejecuta ANTES de cada test suite para configurar el entorno E2E.
 * Establece NODE_ENV=test para que TypeORM use la base de datos E2E dedicada.
 */

// Configurar NODE_ENV para tests E2E
process.env.NODE_ENV = 'test';
process.env.E2E_TESTING = 'true';

// Configurar variables de base de datos E2E
process.env.TAROT_E2E_DB_HOST = process.env.TAROT_E2E_DB_HOST || 'localhost';
process.env.TAROT_E2E_DB_PORT = process.env.TAROT_E2E_DB_PORT || '5436';
process.env.TAROT_E2E_DB_USER =
  process.env.TAROT_E2E_DB_USER || 'tarot_e2e_user';
process.env.TAROT_E2E_DB_PASSWORD =
  process.env.TAROT_E2E_DB_PASSWORD || 'tarot_e2e_password_2024';
process.env.TAROT_E2E_DB_NAME = process.env.TAROT_E2E_DB_NAME || 'tarot_e2e';

console.log('[Setup Env] E2E Testing environment configured');
console.log(
  `[Setup Env] Database: ${process.env.TAROT_E2E_DB_NAME} on port ${process.env.TAROT_E2E_DB_PORT}`,
);
