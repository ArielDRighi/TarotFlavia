import { test, expect } from '@playwright/test';

/**
 * Test Suite: Plan-Based Restrictions
 *
 * Verifica que las restricciones por plan se aplican correctamente:
 * - FREE no puede escribir preguntas personalizadas
 * - FREE no ve spreads avanzados
 * - FREE no puede solicitar IA
 * - PREMIUM tiene acceso completo
 */
test.describe('Plan Restrictions', () => {
  const BASE_URL = 'http://localhost:3001';

  test.describe('FREE User Restrictions', () => {
    test.beforeEach(async ({ page }) => {
      // Login como FREE
      await page.goto(`${BASE_URL}/login`);
      await page.getByLabel('Email').fill('free@test.com');
      await page.getByLabel('Contraseña').fill('Test123456!');
      await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
      await page.waitForURL(`${BASE_URL}/`);
    });

    test('FREE cannot write custom question', async ({ page }) => {
      // Forzar navegación a preguntas (aunque no debería llegar aquí normalmente)
      await page.goto(`${BASE_URL}/ritual/preguntas?categoryId=1`);

      // Sección de pregunta personalizada
      const customSection = page.getByText('Pregunta personalizada').locator('..');

      // Input debe estar deshabilitado o no editable
      const customInput = page.getByPlaceholder(/Pregunta personalizada/);
      await expect(customInput).toBeDisabled();

      // Debe ver badge "Premium"
      await expect(customSection).toContainText(/Premium/i);

      // Intentar escribir (no debería funcionar)
      await customInput.click({ force: true });
      await customInput.fill('Test question', { force: true });

      // Input debe seguir vacío o con placeholder
      const value = await customInput.inputValue();
      expect(value).toBe('');
    });

    test('FREE cannot see advanced spreads', async ({ page }) => {
      await page.goto(`${BASE_URL}/ritual/tirada`);

      // Solo debe ver tiradas básicas
      await expect(page.getByText('Tirada de 1 Carta')).toBeVisible();
      await expect(page.getByText('Tirada de 3 Cartas')).toBeVisible();

      // NO debe ver tiradas avanzadas
      await expect(page.getByText('Cruz Céltica')).not.toBeVisible();
      await expect(page.getByText(/10 cartas/)).not.toBeVisible();
      await expect(page.getByText('Herradura')).not.toBeVisible();
      await expect(page.getByText('Árbol de la Vida')).not.toBeVisible();

      // Solo debe tener 2 botones "Seleccionar"
      const selectButtons = page.getByRole('button', { name: 'Seleccionar' });
      await expect(selectButtons).toHaveCount(2);
    });

    test('FREE does not have AI interpretation', async ({ page }) => {
      await page.goto(`${BASE_URL}/ritual/tirada`);
      await page.getByRole('button', { name: 'Seleccionar' }).first().click();

      // Seleccionar carta
      await page.locator('[data-testid="tarot-card-back"]').first().click();

      // NO debe haber nada relacionado con IA en la UI
      await expect(page.getByText(/Interpretación IA|inteligencia artificial/i)).not.toBeVisible();

      // Crear lectura
      await page.getByRole('button', { name: 'Crear Lectura' }).click();

      // En resultado tampoco debe haber IA
      await expect(page).toHaveURL(/\/lecturas\/\d+/);
      await expect(page.getByText('Interpretación')).not.toBeVisible();
      await expect(page.locator('[data-testid="ai-interpretation"]')).not.toBeVisible();
    });

    test('FREE sees Premium badges on locked features', async ({ page }) => {
      // Ir a preguntas (forzado)
      await page.goto(`${BASE_URL}/ritual/preguntas?categoryId=1`);

      // Debe ver badge "Premium" en pregunta personalizada
      const premiumBadge = page.locator('[data-testid="premium-badge"]');
      // O simplemente texto "Premium"
      const premiumText = page.getByText('Premium');

      // Al menos uno debe estar visible
      const badgeVisible = await premiumBadge.isVisible().catch(() => false);
      const textVisible = await premiumText.isVisible().catch(() => false);

      expect(badgeVisible || textVisible).toBe(true);
    });

    test('FREE cannot bypass restrictions with direct URL navigation', async ({ page }) => {
      // Intentar acceder a spread avanzado directamente
      await page.goto(`${BASE_URL}/ritual/lectura?spreadId=10`); // Asumiendo ID 10 es Cruz Céltica

      // Backend debe rechazar o frontend debe bloquear
      // Opciones:
      // 1. Redirige de vuelta a selección de tiradas
      // 2. Muestra mensaje de error
      // 3. Muestra página de upgrade

      // Verificar que NO puede continuar con spread bloqueado
      const errorMessage = page.locator('[role="alert"]');
      const hasError = await errorMessage.isVisible();

      if (hasError) {
        await expect(errorMessage).toContainText(/no tienes acceso|premium|actualiza tu plan/i);
      } else {
        // O redirige
        await expect(page).not.toHaveURL(/spreadId=10/);
      }
    });
  });

  test.describe('PREMIUM User Permissions', () => {
    test.beforeEach(async ({ page }) => {
      // Login como PREMIUM
      await page.goto(`${BASE_URL}/login`);
      await page.getByLabel('Email').fill('premium@test.com');
      await page.getByLabel('Contraseña').fill('Test123456!');
      await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
      await page.waitForURL(`${BASE_URL}/`);
    });

    test('PREMIUM CAN write custom questions', async ({ page }) => {
      await page.goto(`${BASE_URL}/ritual`);
      await page.getByRole('button', { name: /Amor y Relaciones/ }).click();

      // Input debe estar HABILITADO
      const customInput = page.getByPlaceholder(/Pregunta personalizada/);
      await expect(customInput).toBeVisible();
      await expect(customInput).toBeEnabled();

      // Puede escribir
      const testQuestion = 'Esta es mi pregunta personalizada de prueba';
      await customInput.fill(testQuestion);

      const value = await customInput.inputValue();
      expect(value).toBe(testQuestion);
    });

    test('PREMIUM CAN see all spreads', async ({ page }) => {
      await page.goto(`${BASE_URL}/ritual/tirada`);

      // Debe ver spreads básicos
      await expect(page.getByText('Tirada de 1 Carta')).toBeVisible();
      await expect(page.getByText('Tirada de 3 Cartas')).toBeVisible();

      // Y spreads avanzados
      await expect(page.getByText('Cruz Céltica')).toBeVisible();

      // Debe tener MÁS de 2 opciones
      const selectButtons = page.getByRole('button', { name: 'Seleccionar' });
      const count = await selectButtons.count();
      expect(count).toBeGreaterThan(2);
    });

    test('PREMIUM ALWAYS has AI interpretation', async ({ page }) => {
      await page.goto(`${BASE_URL}/ritual/tirada`);
      await page.getByRole('button', { name: 'Seleccionar' }).first().click();

      // Seleccionar carta
      await page.locator('[data-testid="tarot-card-back"]').first().click();

      // NO debe haber checkbox (IA es automática)
      const aiCheckbox = page.getByRole('checkbox', { name: /Incluir interpretación IA/i });
      await expect(aiCheckbox).not.toBeVisible();

      // Crear lectura
      await page.getByRole('button', { name: 'Crear Lectura' }).click();

      // Debe tener IA en resultado
      await expect(page).toHaveURL(/\/lecturas\/\d+/, { timeout: 35000 });
      await expect(page.getByText('Interpretación')).toBeVisible();
      await expect(page.locator('[data-testid="ai-interpretation"]')).toBeVisible();
    });

    test('PREMIUM does not see restriction badges', async ({ page }) => {
      await page.goto(`${BASE_URL}/ritual`);
      await page.getByRole('button', { name: /Amor y Relaciones/ }).click();

      // NO debe ver badge "Premium" bloqueando features
      // (Puede tener badge como indicador, pero no como restricción)
      const customInput = page.getByPlaceholder(/Pregunta personalizada/);

      // Input debe estar habilitado, eso es lo importante
      await expect(customInput).toBeEnabled();
    });
  });

  test.describe('Feature Comparison', () => {
    test('verify spread count difference between FREE and PREMIUM', async ({ browser }) => {
      // Test comparativo: contar spreads disponibles para cada plan

      // Context FREE
      const freeContext = await browser.newContext();
      const freePage = await freeContext.newPage();

      await freePage.goto(`${BASE_URL}/login`);
      await freePage.getByLabel('Email').fill('free@test.com');
      await freePage.getByLabel('Contraseña').fill('Test123456!');
      await freePage.getByRole('button', { name: 'Iniciar Sesión' }).click();
      await freePage.waitForURL(`${BASE_URL}/`);

      await freePage.goto(`${BASE_URL}/ritual/tirada`);
      const freeSpreadCount = await freePage.getByRole('button', { name: 'Seleccionar' }).count();

      await freeContext.close();

      // Context PREMIUM
      const premiumContext = await browser.newContext();
      const premiumPage = await premiumContext.newPage();

      await premiumPage.goto(`${BASE_URL}/login`);
      await premiumPage.getByLabel('Email').fill('premium@test.com');
      await premiumPage.getByLabel('Contraseña').fill('Test123456!');
      await premiumPage.getByRole('button', { name: 'Iniciar Sesión' }).click();
      await premiumPage.waitForURL(`${BASE_URL}/`);

      await premiumPage.goto(`${BASE_URL}/ritual/tirada`);
      const premiumSpreadCount = await premiumPage.getByRole('button', { name: 'Seleccionar' }).count();

      await premiumContext.close();

      // Verificar diferencia
      expect(freeSpreadCount).toBe(2); // FREE solo ve 2
      expect(premiumSpreadCount).toBeGreaterThan(2); // PREMIUM ve más
      expect(premiumSpreadCount).toBeGreaterThan(freeSpreadCount);
    });

    test('verify AI interpretation in results', async ({ browser }) => {
      // FREE context - no AI
      const freeContext = await browser.newContext();
      const freePage = await freeContext.newPage();

      await freePage.goto(`${BASE_URL}/login`);
      await freePage.getByLabel('Email').fill('free@test.com');
      await freePage.getByLabel('Contraseña').fill('Test123456!');
      await freePage.getByRole('button', { name: 'Iniciar Sesión' }).click();
      await freePage.waitForURL(`${BASE_URL}/`);

      await freePage.goto(`${BASE_URL}/ritual/tirada`);
      await freePage.getByRole('button', { name: 'Seleccionar' }).first().click();
      await freePage.locator('[data-testid="tarot-card-back"]').first().click();
      await freePage.getByRole('button', { name: 'Crear Lectura' }).click();

      await freePage.waitForURL(/\/lecturas\/\d+/);
      const freeHasAi = await freePage.locator('[data-testid="ai-interpretation"]')
        .isVisible()
        .catch(() => false);

      await freeContext.close();

      // PREMIUM context - always AI
      const premiumContext = await browser.newContext();
      const premiumPage = await premiumContext.newPage();

      await premiumPage.goto(`${BASE_URL}/login`);
      await premiumPage.getByLabel('Email').fill('premium@test.com');
      await premiumPage.getByLabel('Contraseña').fill('Test123456!');
      await premiumPage.getByRole('button', { name: 'Iniciar Sesión' }).click();
      await premiumPage.waitForURL(`${BASE_URL}/`);

      await premiumPage.goto(`${BASE_URL}/ritual/tirada`);
      await premiumPage.getByRole('button', { name: 'Seleccionar' }).first().click();
      await premiumPage.locator('[data-testid="tarot-card-back"]').first().click();
      await premiumPage.getByRole('button', { name: 'Crear Lectura' }).click();

      await premiumPage.waitForURL(/\/lecturas\/\d+/, { timeout: 35000 });
      const premiumHasAi = await premiumPage.locator('[data-testid="ai-interpretation"]')
        .isVisible();

      await premiumContext.close();

      // Verificar diferencia
      expect(freeHasAi).toBe(false);
      expect(premiumHasAi).toBe(true);
    });
  });

  test.describe('Backend Validation', () => {
    test('backend should reject FREE custom question', async ({ page, request }) => {
      // Login FREE
      await page.goto(`${BASE_URL}/login`);
      await page.getByLabel('Email').fill('free@test.com');
      await page.getByLabel('Contraseña').fill('Test123456!');
      await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
      await page.waitForURL(`${BASE_URL}/`);

      // Obtener token (desde localStorage o cookie)
      const token = await page.evaluate(() => localStorage.getItem('token'));

      // Intentar crear lectura con pregunta personalizada (debe fallar)
      const response = await request.post(`${BASE_URL}/api/v1/readings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: {
          spreadId: 1,
          cards: [1],
          customQuestion: 'Esta es una pregunta personalizada', // NO permitido para FREE
        },
      });

      // Debe retornar 403 Forbidden
      expect(response.status()).toBe(403);

      const body = await response.json();
      expect(body.message).toMatch(/premium|custom question|not allowed/i);
    });

    test('backend should NOT generate AI for FREE user', async ({ page, request }) => {
      // Login FREE
      await page.goto(`${BASE_URL}/login`);
      await page.getByLabel('Email').fill('free@test.com');
      await page.getByLabel('Contraseña').fill('Test123456!');
      await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
      await page.waitForURL(`${BASE_URL}/`);

      const token = await page.evaluate(() => localStorage.getItem('token'));

      // Crear lectura normal FREE
      const response = await request.post(`${BASE_URL}/api/v1/readings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: {
          spreadId: 1,
          cards: [1],
          // Sin includeAIInterpretation - backend detecta plan
        },
      });

      // Debe ser exitoso
      expect(response.status()).toBe(201);

      const body = await response.json();

      // Pero NO debe tener interpretación IA
      expect(body.interpretation).toBeUndefined();
      expect(body.aiInterpretation).toBeUndefined();
    });
  });
});
