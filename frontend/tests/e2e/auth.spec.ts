import { test, expect } from '@playwright/test';

/**
 * Test Suite: Authentication & Login
 *
 * Verifica que el flujo de login funciona correctamente y que
 * los usuarios son redirigidos al home (/) después de login exitoso.
 */
test.describe('Login Flow', () => {
  test('FREE user should redirect to home after login', async ({ page }) => {
    // Ir a login
    await page.goto('/login');

    // Verificar que estamos en la página de login
    await expect(page).toHaveTitle(/Iniciar Sesión/);
    await expect(page.getByRole('heading', { name: 'Bienvenido al Oráculo' })).toBeVisible();

    // Llenar formulario con credenciales FREE
    await page.getByLabel('Email').fill('free@test.com');
    await page.getByLabel('Contraseña').fill('Test123456!');

    // Click en botón de login
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    // CRÍTICO: Debe redirigir a home (/), NO a /perfil
    await expect(page).toHaveURL(`${BASE_URL}/`);

    // Verificar que está autenticado (aparece menú de usuario)
    await expect(page.getByRole('link', { name: 'Nueva Lectura' })).toBeVisible();

    // Verificar que aparece el avatar del usuario
    await expect(page.getByTestId('user-menu-trigger')).toBeVisible();
  });

  test('PREMIUM user should redirect to home after login', async ({ page }) => {
    await page.goto('/login');

    // Llenar formulario con credenciales PREMIUM
    await page.getByLabel('Email').fill('premium@test.com');
    await page.getByLabel('Contraseña').fill('Test123456!');

    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    // Verificar redirección a home
    await expect(page).toHaveURL(`${BASE_URL}/`);
    await expect(page.getByRole('link', { name: 'Nueva Lectura' })).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Credenciales incorrectas
    await page.getByLabel('Email').fill('wrong@email.com');
    await page.getByLabel('Contraseña').fill('wrongpassword');

    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    // Debe mostrar error
    await expect(page.getByRole('alert')).toContainText(/Email o contraseña incorrectos/i);

    // NO debe redirigir
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test('should show loading state during login', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.getByLabel('Email').fill('free@test.com');
    await page.getByLabel('Contraseña').fill('Test123456!');

    // Click en login
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    // Debe mostrar estado de loading
    await expect(page.getByText('Iniciando...')).toBeVisible();
  });

  test('logout should redirect to home', async ({ page }) => {
    // Login primero
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel('Email').fill('free@test.com');
    await page.getByLabel('Contraseña').fill('Test123456!');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await page.waitForURL(`${BASE_URL}/`);

    // Abrir menú de usuario
    await page.getByTestId('user-menu-trigger').click();

    // Click en cerrar sesión
    await page.getByRole('menuitem', { name: 'Cerrar Sesión' }).click();

    // Debe volver al home o login
    // (Depende de la implementación, ajustar según corresponda)
    await expect(page).toHaveURL(/\/(login)?$/);
  });
});
