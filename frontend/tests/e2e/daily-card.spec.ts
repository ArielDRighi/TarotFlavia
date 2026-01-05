import { test, expect } from '@playwright/test';

/**
 * Test Suite: Daily Card (Carta del Día)
 *
 * La carta del día debe funcionar para:
 * - Usuarios ANÓNIMOS (sin registro)
 * - Usuarios FREE
 * - Usuarios PREMIUM
 *
 * Todos reciben:
 * - Carta boca abajo
 * - Click revela la carta
 * - Nombre y descripción de la carta
 * - SIN interpretación IA (ni siquiera PREMIUM)
 * - Límite: 1 carta por día
 */
test.describe('Daily Card (Carta del Día)', () => {
  const BASE_URL = 'http://localhost:3001';

  test('ANONYMOUS user can get daily card', async ({ page }) => {
    // Ir a carta del día sin estar logueado
    await page.goto(`${BASE_URL}/carta-del-dia`);

    // Verificar título
    await expect(page.getByRole('heading', { name: 'Carta del Día' })).toBeVisible();

    // Ver carta boca abajo
    const card = page.getByTestId('tarot-card');
    await expect(card).toBeVisible();

    // Click en carta para revelarla
    // Nota: Puede tener animación, usar evaluate para forzar click
    await page.evaluate(() => {
      const cardElement = document.querySelector('[data-testid="tarot-card"]') as HTMLElement;
      if (cardElement) cardElement.click();
    });

    // Esperar a que se revele (dar tiempo para animación)
    await page.waitForTimeout(1000);

    // Debe mostrar nombre de carta
    await expect(page.locator('h2')).toBeVisible();

    // Debe mostrar descripción/palabras clave
    const description = page.locator('p').filter({ hasText: /,/ }); // Palabras clave separadas por comas
    await expect(description).toBeVisible();

    // NO debe haber interpretación IA
    await expect(page.getByText('Interpretación')).not.toBeVisible();
    await expect(page.locator('[data-testid="ai-interpretation"]')).not.toBeVisible();

    // Debe ver CTA de registro
    await expect(page.getByText(/Regístrate gratis/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Crear cuenta gratis/i })).toBeVisible();
  });

  test('FREE user can get daily card', async ({ page }) => {
    // Login como FREE
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel('Email').fill('free@test.com');
    await page.getByLabel('Contraseña').fill('Test123456!');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await page.waitForURL(`${BASE_URL}/`);

    // Ir a carta del día
    await page.goto(`${BASE_URL}/carta-del-dia`);

    // Click en carta
    await page.evaluate(() => {
      const cardElement = document.querySelector('[data-testid="tarot-card"]') as HTMLElement;
      if (cardElement) cardElement.click();
    });

    await page.waitForTimeout(1000);

    // Verificar resultado
    await expect(page.locator('h2')).toBeVisible();

    // FREE no tiene interpretación IA
    await expect(page.getByText('Interpretación')).not.toBeVisible();

    // NO debe ver CTA de registro (ya está logueado)
    await expect(page.getByText(/Regístrate gratis/i)).not.toBeVisible();
  });

  test('PREMIUM user can get daily card', async ({ page }) => {
    // Login como PREMIUM
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel('Email').fill('premium@test.com');
    await page.getByLabel('Contraseña').fill('Test123456!');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await page.waitForURL(`${BASE_URL}/`);

    // Ir a carta del día
    await page.goto(`${BASE_URL}/carta-del-dia`);

    // Click en carta
    await page.evaluate(() => {
      const cardElement = document.querySelector('[data-testid="tarot-card"]') as HTMLElement;
      if (cardElement) cardElement.click();
    });

    await page.waitForTimeout(1000);

    // Verificar resultado
    await expect(page.locator('h2')).toBeVisible();

    // Ni siquiera PREMIUM tiene IA en carta del día
    await expect(page.getByText('Interpretación')).not.toBeVisible();
  });

  test('daily card shows image and card details', async ({ page }) => {
    await page.goto(`${BASE_URL}/carta-del-dia`);

    // Revelar carta
    await page.evaluate(() => {
      const cardElement = document.querySelector('[data-testid="tarot-card"]') as HTMLElement;
      if (cardElement) cardElement.click();
    });

    await page.waitForTimeout(1000);

    // Debe mostrar imagen de la carta
    const cardImage = page.locator('img[alt*="Carta"]');
    await expect(cardImage).toBeVisible();

    // Debe tener src válido
    const src = await cardImage.getAttribute('src');
    expect(src).toBeTruthy();
    expect(src).not.toContain('undefined');

    // Debe mostrar nombre
    const cardName = page.locator('h2');
    await expect(cardName).toBeVisible();
    const name = await cardName.textContent();
    expect(name?.length).toBeGreaterThan(3);

    // Debe mostrar descripción con palabras clave
    const keywords = page.locator('p').filter({ hasText: /,/ });
    await expect(keywords).toBeVisible();
    const keywordsText = await keywords.textContent();
    expect(keywordsText?.split(',').length).toBeGreaterThanOrEqual(2);
  });

  test('success toast appears after revealing card', async ({ page }) => {
    await page.goto(`${BASE_URL}/carta-del-dia`);

    // Revelar carta
    await page.evaluate(() => {
      const cardElement = document.querySelector('[data-testid="tarot-card"]') as HTMLElement;
      if (cardElement) cardElement.click();
    });

    // Debe aparecer toast de éxito
    const toast = page.locator('[role="alert"]');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(/Tu carta del día está lista/i);
  });

  test('cannot get second daily card same day', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel('Email').fill('free@test.com');
    await page.getByLabel('Contraseña').fill('Test123456!');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await page.waitForURL(`${BASE_URL}/`);

    // Primera carta
    await page.goto(`${BASE_URL}/carta-del-dia`);
    await page.evaluate(() => {
      const cardElement = document.querySelector('[data-testid="tarot-card"]') as HTMLElement;
      if (cardElement) cardElement.click();
    });
    await page.waitForTimeout(1000);

    // Guardar nombre de la carta
    const firstCardName = await page.locator('h2').textContent();

    // Intentar obtener otra carta (refrescar página)
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Debe mostrar mensaje indicando que ya obtuvo carta hoy
    // O simplemente mostrar la misma carta del día
    // (Depende de implementación exacta, ajustar según corresponda)

    // Opción 1: Muestra mensaje de límite
    const toast = page.locator('[role="alert"]');
    const hasToast = await toast.isVisible();

    if (hasToast) {
      await expect(toast).toContainText(/Ya obtuviste tu carta del día/i);
    } else {
      // Opción 2: Muestra la misma carta automáticamente
      // Click para revelar si está boca abajo
      const card = page.getByTestId('tarot-card');
      if (await card.isVisible()) {
        await page.evaluate(() => {
          const cardElement = document.querySelector('[data-testid="tarot-card"]') as HTMLElement;
          if (cardElement) cardElement.click();
        });
        await page.waitForTimeout(1000);
      }

      // Debe ser la misma carta
      const secondCardName = await page.locator('h2').textContent();
      expect(secondCardName).toBe(firstCardName);
    }
  });

  test('card flip animation works', async ({ page }) => {
    await page.goto(`${BASE_URL}/carta-del-dia`);

    const card = page.getByTestId('tarot-card');

    // Verificar que inicialmente está boca abajo
    // (puede tener clase específica o data attribute)
    const initialState = await card.getAttribute('data-flipped');
    expect(initialState).toBeFalsy();

    // Click en carta
    await page.evaluate(() => {
      const cardElement = document.querySelector('[data-testid="tarot-card"]') as HTMLElement;
      if (cardElement) cardElement.click();
    });

    // Esperar animación
    await page.waitForTimeout(1500);

    // Verificar que cambió de estado
    const flippedState = await card.getAttribute('data-flipped');
    expect(flippedState).toBeTruthy();
  });

  test('clicking on already revealed card does nothing', async ({ page }) => {
    await page.goto(`${BASE_URL}/carta-del-dia`);

    // Revelar carta
    await page.evaluate(() => {
      const cardElement = document.querySelector('[data-testid="tarot-card"]') as HTMLElement;
      if (cardElement) cardElement.click();
    });

    await page.waitForTimeout(1000);

    // Guardar nombre
    const cardName = await page.locator('h2').textContent();

    // Click de nuevo en carta revelada
    await page.evaluate(() => {
      const cardElement = document.querySelector('[data-testid="tarot-card"]') as HTMLElement;
      if (cardElement) cardElement.click();
    });

    await page.waitForTimeout(500);

    // No debe cambiar (misma carta)
    const cardNameAfter = await page.locator('h2').textContent();
    expect(cardNameAfter).toBe(cardName);

    // No debe haber error
    const errorAlert = page.locator('[role="alert"]').filter({ hasText: /error/i });
    await expect(errorAlert).not.toBeVisible();
  });
});
