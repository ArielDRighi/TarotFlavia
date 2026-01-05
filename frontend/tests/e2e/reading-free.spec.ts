import { test, expect } from '@playwright/test';

/**
 * Test Suite: FREE User - Reading Creation Flow
 *
 * Usuario FREE debe:
 * - NO ver selección de categorías
 * - NO ver preguntas predefinidas/personalizadas
 * - Ir directamente a selección de tiradas (spreads)
 * - Solo ver tiradas de 1-3 cartas
 * - Seleccionar cartas manualmente
 * - NO tener interpretación IA en resultados
 */
test.describe('FREE User - Reading Creation', () => {
  const BASE_URL = 'http://localhost:3001';

  test.beforeEach(async ({ page }) => {
    // Login como usuario FREE antes de cada test
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel('Email').fill('free@test.com');
    await page.getByLabel('Contraseña').fill('Test123456!');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await page.waitForURL(`${BASE_URL}/`);
  });

  test('FREE user should NOT see categories', async ({ page }) => {
    // Click en "Nueva Lectura"
    await page.getByRole('link', { name: 'Nueva Lectura' }).click();

    // CRÍTICO: Debe redirigir automáticamente a /ritual/tirada
    // NO debe quedarse en /ritual mostrando categorías
    await expect(page).toHaveURL(/\/ritual\/tirada/);

    // NO debe ver el título de categorías
    await expect(page.getByText('¿Qué inquieta tu alma hoy?')).not.toBeVisible();

    // NO debe ver categorías
    await expect(page.getByText('Amor y Relaciones')).not.toBeVisible();
  });

  test('FREE user should only see basic spreads (1-3 cards)', async ({ page }) => {
    // Ir directamente a selección de tiradas
    await page.goto(`${BASE_URL}/ritual/tirada`);

    // Debe ver tiradas básicas
    await expect(page.getByText('Tirada de 1 Carta')).toBeVisible();
    await expect(page.getByText('Tirada de 3 Cartas')).toBeVisible();

    // NO debe ver tiradas complejas
    await expect(page.getByText('Cruz Céltica')).not.toBeVisible();
    await expect(page.getByText('Herradura')).not.toBeVisible();
    await expect(page.getByText(/10 cartas/)).not.toBeVisible();
  });

  test('FREE user can select a spread', async ({ page }) => {
    await page.goto(`${BASE_URL}/ritual/tirada`);

    // Verificar que hay botones de selección
    const selectButtons = page.getByRole('button', { name: 'Seleccionar' });
    await expect(selectButtons).toHaveCount(2); // Solo 2 spreads para FREE

    // Click en primer spread (1 carta)
    await selectButtons.first().click();

    // Debe navegar a selección de cartas
    await expect(page).toHaveURL(/\/ritual\/lectura\?spreadId=\d+$/);

    // IMPORTANTE: URL NO debe tener categoryId ni questionId
    expect(page.url()).not.toContain('categoryId');
    expect(page.url()).not.toContain('questionId');
  });

  test('FREE user can create 1-card reading', async ({ page }) => {
    await page.goto(`${BASE_URL}/ritual/tirada`);

    // Seleccionar tirada de 1 carta
    await page.getByRole('button', { name: 'Seleccionar' }).first().click();

    // Verificar que está en selección de cartas
    await expect(page).toHaveURL(/\/ritual\/lectura\?spreadId=\d+/);

    // Debe ver 78 cartas boca abajo
    const cards = page.locator('[data-testid="tarot-card-back"]');
    await expect(cards).toHaveCount(78);

    // Seleccionar 1 carta
    await cards.nth(10).click();

    // Verificar contador
    await expect(page.getByText('1/1 cartas seleccionadas')).toBeVisible();

    // NO debe ver nada relacionado con IA
    await expect(page.getByText('Interpretación')).not.toBeVisible();
    await expect(page.getByText('IA')).not.toBeVisible();

    // Botón "Crear Lectura" debe estar habilitado
    const submitButton = page.getByRole('button', { name: 'Crear Lectura' });
    await expect(submitButton).toBeEnabled();

    // Crear lectura
    await submitButton.click();

    // Esperar resultado
    await expect(page).toHaveURL(/\/lecturas\/\d+/);

    // Verificar que muestra 1 carta
    await expect(page.locator('[data-testid="card-result"]')).toHaveCount(1);

    // Debe mostrar nombre de la carta
    await expect(page.locator('h2')).toBeVisible();

    // NO debe haber interpretación IA
    await expect(page.getByText('Interpretación')).not.toBeVisible();
    await expect(page.locator('[data-testid="ai-interpretation"]')).not.toBeVisible();
  });

  test('FREE user can create 3-card reading', async ({ page }) => {
    await page.goto(`${BASE_URL}/ritual/tirada`);

    // Seleccionar tirada de 3 cartas
    await page.getByRole('button', { name: 'Seleccionar' }).nth(1).click();

    await expect(page).toHaveURL(/\/ritual\/lectura\?spreadId=\d+/);

    const cards = page.locator('[data-testid="tarot-card-back"]');

    // Seleccionar 3 cartas
    await cards.nth(5).click();
    await expect(page.getByText('1/3 cartas seleccionadas')).toBeVisible();

    await cards.nth(15).click();
    await expect(page.getByText('2/3 cartas seleccionadas')).toBeVisible();

    await cards.nth(25).click();
    await expect(page.getByText('3/3 cartas seleccionadas')).toBeVisible();

    // Crear lectura
    await page.getByRole('button', { name: 'Crear Lectura' }).click();

    // Verificar resultado
    await expect(page).toHaveURL(/\/lecturas\/\d+/);
    await expect(page.locator('[data-testid="card-result"]')).toHaveCount(3);

    // Debe mostrar posiciones (Pasado, Presente, Futuro)
    await expect(page.getByText(/Pasado/)).toBeVisible();
    await expect(page.getByText(/Presente/)).toBeVisible();
    await expect(page.getByText(/Futuro/)).toBeVisible();

    // NO debe haber interpretación IA
    await expect(page.getByText('Interpretación')).not.toBeVisible();
  });

  test('FREE user cannot select more cards than required', async ({ page }) => {
    await page.goto(`${BASE_URL}/ritual/tirada`);

    // Seleccionar tirada de 1 carta
    await page.getByRole('button', { name: 'Seleccionar' }).first().click();

    const cards = page.locator('[data-testid="tarot-card-back"]');

    // Seleccionar 1 carta
    await cards.nth(10).click();

    // Verificar que está seleccionada
    await expect(page.locator('[data-testid="tarot-card-selected"]')).toHaveCount(1);

    // Intentar seleccionar otra carta
    await cards.nth(20).click();

    // Debe seguir teniendo solo 1 seleccionada (no debe permitir más)
    await expect(page.locator('[data-testid="tarot-card-selected"]')).toHaveCount(1);
  });

  test('FREE user cannot deselect and reselect cards', async ({ page }) => {
    await page.goto(`${BASE_URL}/ritual/tirada`);

    // Seleccionar tirada de 3 cartas
    await page.getByRole('button', { name: 'Seleccionar' }).nth(1).click();

    const cards = page.locator('[data-testid="tarot-card-back"]');

    // Seleccionar 2 cartas
    await cards.nth(5).click();
    await cards.nth(10).click();

    // Verificar 2 seleccionadas
    await expect(page.locator('[data-testid="tarot-card-selected"]')).toHaveCount(2);

    // Deseleccionar la primera (click de nuevo)
    await cards.nth(5).click();

    // Debe tener solo 1
    await expect(page.locator('[data-testid="tarot-card-selected"]')).toHaveCount(1);

    // Seleccionar otra
    await cards.nth(15).click();

    // Ahora debe tener 2 nuevamente
    await expect(page.locator('[data-testid="tarot-card-selected"]')).toHaveCount(2);
  });

  test('submit button should be disabled until selection is complete', async ({ page }) => {
    await page.goto(`${BASE_URL}/ritual/tirada`);
    await page.getByRole('button', { name: 'Seleccionar' }).nth(1).click();

    const submitButton = page.getByRole('button', { name: 'Crear Lectura' });

    // Inicialmente debe estar deshabilitado
    await expect(submitButton).toBeDisabled();

    const cards = page.locator('[data-testid="tarot-card-back"]');

    // Seleccionar 1 carta
    await cards.nth(5).click();
    await expect(submitButton).toBeDisabled(); // Aún deshabilitado (faltan 2)

    // Seleccionar 2da carta
    await cards.nth(10).click();
    await expect(submitButton).toBeDisabled(); // Aún deshabilitado (falta 1)

    // Seleccionar 3ra carta
    await cards.nth(15).click();
    await expect(submitButton).toBeEnabled(); // Ahora debe estar habilitado
  });

  test('reading result should show card names and descriptions', async ({ page }) => {
    await page.goto(`${BASE_URL}/ritual/tirada`);
    await page.getByRole('button', { name: 'Seleccionar' }).first().click();

    // Seleccionar carta
    await page.locator('[data-testid="tarot-card-back"]').first().click();
    await page.getByRole('button', { name: 'Crear Lectura' }).click();

    // En resultado
    await expect(page).toHaveURL(/\/lecturas\/\d+/);

    // Debe mostrar imagen de carta
    await expect(page.locator('img[alt*="Carta"]')).toBeVisible();

    // Debe mostrar nombre
    await expect(page.locator('h2')).toBeVisible();

    // Debe mostrar descripción/palabras clave
    await expect(page.locator('p')).toContainText(/./); // Cualquier texto
  });
});
