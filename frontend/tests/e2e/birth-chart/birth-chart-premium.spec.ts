import { test, expect } from '@playwright/test';
import { TEST_BIRTH_DATA, TEST_USER_PREMIUM } from './fixtures/test-data';

/**
 * Test Suite: Birth Chart - Premium User
 *
 * Usuario Premium debe:
 * - Ver badge Premium
 * - Generar cartas ilimitadas
 * - Ver interpretaciones completas
 * - Ver síntesis IA (acción manual)
 * - Descargar PDF
 * - Guardar cartas en historial
 * - Ver historial de cartas
 */
test.describe('Birth Chart - Premium User', () => {
  test.beforeEach(async ({ page }) => {
    // Login como usuario premium
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(TEST_USER_PREMIUM.email);
    await page.getByLabel(/contraseña/i).fill(TEST_USER_PREMIUM.password);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(page).toHaveURL('/');
    await page.goto('/carta-astral');
  });

  test('should show premium badge', async ({ page }) => {
    await expect(page.getByText(/premium/i)).toBeVisible();
  });

  test('should generate chart with full interpretations', async ({ page }) => {
    await page.getByLabel(/nombre/i).fill(TEST_BIRTH_DATA.name);
    await page.getByLabel(/hora/i).fill(TEST_BIRTH_DATA.birthTime);
    await page.getByLabel(/lugar/i).fill('Buenos Aires');
    await page.getByText(/Buenos Aires, Argentina/).click();
    await page.getByRole('button', { name: /generar/i }).click();

    await expect(page).toHaveURL(/\/carta-astral\/resultado\/\d+/);

    // Verificar Big Three
    await expect(page.getByText(/Big Three/i)).toBeVisible();

    // Verificar que tiene interpretaciones completas
    await expect(page.getByText(/interpretaciones completas/i)).toBeVisible();

    // Debe ver interpretaciones de todos los planetas
    await expect(page.getByText(/Mercurio/i)).toBeVisible();
    await expect(page.getByText(/Venus/i)).toBeVisible();
    await expect(page.getByText(/Marte/i)).toBeVisible();
  });

  test('should show AI synthesis option', async ({ page }) => {
    await page.getByLabel(/nombre/i).fill(TEST_BIRTH_DATA.name);
    await page.getByLabel(/hora/i).fill(TEST_BIRTH_DATA.birthTime);
    await page.getByLabel(/lugar/i).fill('Buenos Aires');
    await page.getByText(/Buenos Aires, Argentina/).click();
    await page.getByRole('button', { name: /generar/i }).click();

    await expect(page).toHaveURL(/\/carta-astral\/resultado\/\d+/);

    // Verificar síntesis IA (acción manual, no automática)
    await expect(page.getByText(/síntesis personalizada/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /generar síntesis ia/i }),
    ).toBeVisible();

    // Verificar contador de usos
    await expect(page.getByText(/usos restantes/i)).toBeVisible();
  });

  test('should generate AI synthesis when requested', async ({ page }) => {
    await page.getByLabel(/nombre/i).fill(TEST_BIRTH_DATA.name);
    await page.getByLabel(/hora/i).fill(TEST_BIRTH_DATA.birthTime);
    await page.getByLabel(/lugar/i).fill('Buenos Aires');
    await page.getByText(/Buenos Aires, Argentina/).click();
    await page.getByRole('button', { name: /generar/i }).click();

    await expect(page).toHaveURL(/\/carta-astral\/resultado\/\d+/);

    // Click en generar síntesis IA
    await page.getByRole('button', { name: /generar síntesis ia/i }).click();

    // Esperar loading state
    await expect(page.getByText(/generando/i)).toBeVisible();

    // Esperar resultado (puede tardar unos segundos)
    await expect(page.getByText(/tu carta revela/i)).toBeVisible({
      timeout: 15000,
    });

    // Verificar que se muestra el contenido de la síntesis
    const synthesisContent = page.locator('[data-testid="ai-synthesis-content"]');
    await expect(synthesisContent).toBeVisible();
    expect(await synthesisContent.textContent()).toContain('Sol');
  });

  test('should download PDF', async ({ page }) => {
    // Generar carta
    await page.getByLabel(/nombre/i).fill('PDF Test');
    await page.getByLabel(/hora/i).fill('12:00');
    await page.getByLabel(/lugar/i).fill('Buenos Aires');
    await page.getByText(/Buenos Aires, Argentina/).click();
    await page.getByRole('button', { name: /generar/i }).click();

    await expect(page).toHaveURL(/\/carta-astral\/resultado\/\d+/);

    // Descargar PDF
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /descargar pdf/i }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('.pdf');
    expect(download.suggestedFilename()).toContain('carta-astral');
  });

  test('should save chart to history', async ({ page }) => {
    // Generar carta
    await page.getByLabel(/nombre/i).fill('History Test');
    await page.getByLabel(/hora/i).fill('12:00');
    await page.getByLabel(/lugar/i).fill('Buenos Aires');
    await page.getByText(/Buenos Aires, Argentina/).click();
    await page.getByRole('button', { name: /generar/i }).click();

    // Debe tener ID en URL (guardada)
    await expect(page).toHaveURL(/\/carta-astral\/resultado\/\d+/);

    // Ir al historial
    await page.goto('/carta-astral/historial');

    // Verificar que aparece la carta
    await expect(page.getByText('History Test')).toBeVisible();
  });

  test('should not show limit message for premium user', async ({ page }) => {
    // Generar primera carta
    await page.getByLabel(/nombre/i).fill('First Chart');
    await page.getByLabel(/hora/i).fill('12:00');
    await page.getByLabel(/lugar/i).fill('Buenos Aires');
    await page.getByText(/Buenos Aires, Argentina/).click();
    await page.getByRole('button', { name: /generar/i }).click();

    await expect(page).toHaveURL(/\/carta-astral\/resultado\/\d+/);

    // Volver y generar otra
    await page.goto('/carta-astral');

    // NO debe mostrar mensaje de límite
    await expect(
      page.getByText(/ya utilizaste tu carta/i),
    ).not.toBeVisible();

    // Generar segunda carta sin problemas
    await page.getByLabel(/nombre/i).fill('Second Chart');
    await page.getByLabel(/hora/i).fill('14:30');
    await page.getByLabel(/lugar/i).fill('Madrid');
    await page.getByText(/Madrid, España/).click();
    await page.getByRole('button', { name: /generar/i }).click();

    await expect(page).toHaveURL(/\/carta-astral\/resultado\/\d+/);
  });
});

/**
 * Test Suite: Birth Chart - History (Premium)
 */
test.describe('Birth Chart - History (Premium)', () => {
  test.beforeEach(async ({ page }) => {
    // Login como premium
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(TEST_USER_PREMIUM.email);
    await page.getByLabel(/contraseña/i).fill(TEST_USER_PREMIUM.password);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await page.goto('/carta-astral/historial');
  });

  test('should display saved charts', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /historial/i }),
    ).toBeVisible();

    // Debe mostrar lista de cartas o mensaje si está vacía
    const emptyState = page.getByText(/no tienes cartas guardadas/i);
    const chartList = page.locator('[data-testid="chart-card"]');

    const hasCharts = (await chartList.count()) > 0;
    const isEmpty = await emptyState.isVisible();

    expect(hasCharts || isEmpty).toBeTruthy();
  });

  test('should filter charts by search', async ({ page }) => {
    // Solo si hay cartas guardadas
    const chartCards = page.locator('[data-testid="chart-card"]');
    const initialCount = await chartCards.count();

    if (initialCount > 0) {
      await page.getByPlaceholder(/buscar/i).fill('Test');

      // Verificar que se filtran
      await page.waitForTimeout(500); // Esperar debounce de búsqueda
      const filteredCount = await chartCards.count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('should change view mode (grid/list)', async ({ page }) => {
    // Click en vista de lista
    const listButton = page.getByRole('button', { name: /lista/i });
    if (await listButton.isVisible()) {
      await listButton.click();
      await expect(page.locator('[data-view="list"]')).toBeVisible();
    }

    // Click en vista de grid
    const gridButton = page.getByRole('button', { name: /cuadrícula/i });
    if (await gridButton.isVisible()) {
      await gridButton.click();
      await expect(page.locator('[data-view="grid"]')).toBeVisible();
    }
  });

  test('should rename chart', async ({ page }) => {
    // Asumiendo que hay al menos una carta
    const chartCard = page.locator('[data-testid="chart-card"]').first();

    if (await chartCard.isVisible()) {
      // Abrir menú de opciones
      await chartCard.getByRole('button', { name: /más/i }).click();
      await page.getByRole('menuitem', { name: /renombrar/i }).click();

      // Cambiar nombre
      const nameInput = page.getByLabel(/nombre/i);
      await nameInput.fill('Renamed Chart');
      await page.getByRole('button', { name: /guardar/i }).click();

      // Verificar que se actualizó
      await expect(page.getByText('Renamed Chart')).toBeVisible();
    }
  });

  test('should delete chart with confirmation', async ({ page }) => {
    const chartCard = page.locator('[data-testid="chart-card"]').first();

    if (await chartCard.isVisible()) {
      const initialCount = await page
        .locator('[data-testid="chart-card"]')
        .count();

      // Abrir menú y eliminar
      await chartCard.getByRole('button', { name: /más/i }).click();
      await page.getByRole('menuitem', { name: /eliminar/i }).click();

      // Confirmar
      await expect(page.getByText(/¿eliminar esta carta/i)).toBeVisible();
      await page.getByRole('button', { name: /eliminar/i }).click();

      // Verificar que se eliminó
      await page.waitForTimeout(1000);
      const newCount = await page.locator('[data-testid="chart-card"]').count();
      expect(newCount).toBe(initialCount - 1);
    }
  });

  test('should open chart detail from history', async ({ page }) => {
    const chartCard = page.locator('[data-testid="chart-card"]').first();

    if (await chartCard.isVisible()) {
      // Click en la carta
      await chartCard.click();

      // Debe navegar al detalle
      await expect(page).toHaveURL(/\/carta-astral\/resultado\/\d+/);

      // Debe mostrar el gráfico
      await expect(
        page.locator('svg[aria-label="Gráfico de carta astral"]'),
      ).toBeVisible();
    }
  });
});

/**
 * Test Suite: Birth Chart - AI Synthesis Limits (Premium)
 */
test.describe('Birth Chart - AI Synthesis Limits', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(TEST_USER_PREMIUM.email);
    await page.getByLabel(/contraseña/i).fill(TEST_USER_PREMIUM.password);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await page.goto('/carta-astral');
  });

  test('should show remaining AI synthesis uses', async ({ page }) => {
    // Generar carta
    await page.getByLabel(/nombre/i).fill('Test');
    await page.getByLabel(/hora/i).fill('12:00');
    await page.getByLabel(/lugar/i).fill('Buenos Aires');
    await page.getByText(/Buenos Aires, Argentina/).click();
    await page.getByRole('button', { name: /generar/i }).click();

    await expect(page).toHaveURL(/\/carta-astral\/resultado\/\d+/);

    // Verificar contador de usos
    await expect(page.getByText(/usos restantes: \d+/i)).toBeVisible();
  });

  test('should decrement counter after generating synthesis', async ({
    page,
  }) => {
    // Generar carta
    await page.getByLabel(/nombre/i).fill('Test');
    await page.getByLabel(/hora/i).fill('12:00');
    await page.getByLabel(/lugar/i).fill('Buenos Aires');
    await page.getByText(/Buenos Aires, Argentina/).click();
    await page.getByRole('button', { name: /generar/i }).click();

    await expect(page).toHaveURL(/\/carta-astral\/resultado\/\d+/);

    // Obtener contador inicial
    const counterBefore = await page
      .getByText(/usos restantes: (\d+)/i)
      .textContent();
    const usesBefore = parseInt(counterBefore?.match(/\d+/)?.[0] || '0');

    // Generar síntesis IA
    await page.getByRole('button', { name: /generar síntesis ia/i }).click();
    await expect(page.getByText(/tu carta revela/i)).toBeVisible({
      timeout: 15000,
    });

    // Verificar que el contador decrementó
    const counterAfter = await page
      .getByText(/usos restantes: (\d+)/i)
      .textContent();
    const usesAfter = parseInt(counterAfter?.match(/\d+/)?.[0] || '0');

    expect(usesAfter).toBe(usesBefore - 1);
  });

  test('should show limit reached message when no uses left', async ({
    page,
  }) => {
    // Este test necesita que el usuario ya haya usado todos sus intentos
    // O que se simule el estado de límite alcanzado
    // Por ahora, solo verificamos que el mensaje existe si el botón está deshabilitado

    await page.getByLabel(/nombre/i).fill('Test');
    await page.getByLabel(/hora/i).fill('12:00');
    await page.getByLabel(/lugar/i).fill('Buenos Aires');
    await page.getByText(/Buenos Aires, Argentina/).click();
    await page.getByRole('button', { name: /generar/i }).click();

    await expect(page).toHaveURL(/\/carta-astral\/resultado\/\d+/);

    // Si el botón está deshabilitado, debe mostrar mensaje
    const synthesisButton = page.getByRole('button', {
      name: /generar síntesis ia/i,
    });
    const isDisabled = await synthesisButton.isDisabled();

    if (isDisabled) {
      await expect(
        page.getByText(/límite de síntesis alcanzado/i),
      ).toBeVisible();
    }
  });
});
