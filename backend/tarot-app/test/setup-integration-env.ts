/**
 * Jest Setup File - Configuración de Variables de Entorno para Tests de Integración
 *
 * Este archivo se ejecuta ANTES de cada test suite para configurar el entorno de integración.
 * Establece INTEGRATION_TESTING=true para que TypeORM use la base de datos de integración dedicada.
 */

// Configurar flag de integration testing para que TypeORM use la BD de integración
process.env.INTEGRATION_TESTING = 'true';

// Deshabilitar validación de firma de webhook en tests de integración.
// Si MP_WEBHOOK_SECRET estuviera definido en CI, validateSignature rechazaría
// todos los webhooks que envían x-signature vacío.
process.env.MP_WEBHOOK_SECRET = '';

// Configurar variables de base de datos de integración
process.env.TAROT_INTEGRATION_DB_HOST =
  process.env.TAROT_INTEGRATION_DB_HOST || 'localhost';
process.env.TAROT_INTEGRATION_DB_PORT =
  process.env.TAROT_INTEGRATION_DB_PORT || '5439';
process.env.TAROT_INTEGRATION_DB_USER =
  process.env.TAROT_INTEGRATION_DB_USER || 'tarot_integration_user';
process.env.TAROT_INTEGRATION_DB_PASSWORD =
  process.env.TAROT_INTEGRATION_DB_PASSWORD ||
  'tarot_integration_password_2024';
process.env.TAROT_INTEGRATION_DB_NAME =
  process.env.TAROT_INTEGRATION_DB_NAME || 'tarot_integration';

if (
  process.env.VERBOSE_TESTS === 'true' ||
  process.env.DEBUG_TESTS === 'true'
) {
  console.log(
    '[Setup Integration Env] Integration Testing environment configured',
  );
  console.log(
    `[Setup Integration Env] Database: ${process.env.TAROT_INTEGRATION_DB_NAME} on port ${process.env.TAROT_INTEGRATION_DB_PORT}`,
  );
}
