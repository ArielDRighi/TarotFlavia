/**
 * Test Data Fixtures for Birth Chart E2E Tests
 *
 * Datos de prueba compartidos para todos los tests E2E de carta astral.
 */

export const TEST_BIRTH_DATA = {
  name: 'María García',
  birthDate: '1990-05-15',
  birthTime: '14:30',
  birthPlace: 'Buenos Aires',
  birthPlaceFullName: 'Buenos Aires, Argentina',
};

export const TEST_USER_FREE = {
  email: 'free@test.com',
  password: 'TestPassword123!',
};

export const TEST_USER_PREMIUM = {
  email: 'premium@test.com',
  password: 'TestPassword123!',
};

/**
 * Datos adicionales para diferentes escenarios de prueba
 */
export const ALTERNATIVE_BIRTH_DATA = {
  name: 'Juan Pérez',
  birthDate: '1985-12-25',
  birthTime: '08:45',
  birthPlace: 'Madrid',
  birthPlaceFullName: 'Madrid, España',
};

/**
 * Helper para generar coordenadas de prueba
 */
export const TEST_COORDINATES = {
  buenosAires: {
    latitude: -34.6037,
    longitude: -58.3816,
    timezone: 'America/Argentina/Buenos_Aires',
  },
  madrid: {
    latitude: 40.4168,
    longitude: -3.7038,
    timezone: 'Europe/Madrid',
  },
};
