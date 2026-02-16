/**
 * Test Data Fixtures for Birth Chart E2E Tests
 *
 * Datos de prueba compartidos para todos los tests E2E de carta astral.
 */

import type { Page } from '@playwright/test';

export const TEST_BIRTH_DATA = {
  name: 'María García',
  birthDate: '1990-05-15',
  birthTime: '14:30',
  birthPlace: 'Buenos Aires',
  birthPlaceFullName: 'Buenos Aires, Argentina',
};

export const TEST_USER_FREE = {
  email: 'free@test.com',
  password: 'Test123456!',
};

export const TEST_USER_PREMIUM = {
  email: 'premium@test.com',
  password: 'Test123456!',
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

/**
 * Helper para llenar el formulario de carta astral
 */
export async function fillBirthChartForm(
  page: Page,
  data: {
    name: string;
    birthDate?: string;
    birthTime: string;
    birthPlace: string;
    birthPlaceFullName: string;
  },
) {
  await page.getByLabel(/nombre/i).fill(data.name);
  if (data.birthDate) {
    await page.getByLabel(/fecha/i).fill(data.birthDate);
  }
  await page.getByLabel(/hora/i).fill(data.birthTime);
  await page.getByLabel(/lugar/i).fill(data.birthPlace);
  await page.getByText(new RegExp(data.birthPlaceFullName)).click();
}

/**
 * Helper para login como usuario premium
 */
export async function loginAsPremium(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(TEST_USER_PREMIUM.email);
  await page.getByLabel(/contraseña/i).fill(TEST_USER_PREMIUM.password);
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
}
