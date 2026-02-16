import { test, expect } from '@playwright/test';
import { TEST_BIRTH_DATA, fillBirthChartForm } from './fixtures/test-data';

/**
 * Test Suite: Birth Chart - Anonymous User
 *
 * Usuario anónimo debe:
 * - Ver formulario de carta astral
 * - Poder autocompletar lugar de nacimiento
 * - Generar 1 carta lifetime
 * - Ver gráfico de carta astral (SVG)
 * - Ver solo Big Three (Sol, Luna, Ascendente)
 * - NO ver interpretaciones completas
 * - NO poder descargar PDF
 * - NO poder guardar en historial
 * - Ver límite alcanzado después de 1ra generación
 */
test.describe('Birth Chart - Anonymous User', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/carta-astral');
  });

  test('should display birth chart form', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /carta astral/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/nombre/i)).toBeVisible();
    await expect(page.getByLabel(/fecha/i)).toBeVisible();
    await expect(page.getByLabel(/hora/i)).toBeVisible();
    await expect(page.getByLabel(/lugar/i)).toBeVisible();
  });

  test('should autocomplete birth place', async ({ page }) => {
    await page.getByLabel(/lugar/i).fill('Buenos');

    // Esperar que aparezcan las sugerencias
    await expect(page.getByRole('listbox')).toBeVisible();
    await expect(page.getByText(/Buenos Aires/)).toBeVisible();

    // Seleccionar lugar
    await page.getByText(/Buenos Aires, Argentina/).click();

    // Verificar que se seleccionó
    await expect(page.getByText(/coordenadas/i)).toBeVisible();
  });

  test('should generate chart for anonymous user', async ({ page }) => {
    // Llenar formulario
    await page.getByLabel(/nombre/i).fill(TEST_BIRTH_DATA.name);

    // Fecha
    await page.getByLabel(/fecha/i).fill(TEST_BIRTH_DATA.birthDate);

    // Hora
    await page.getByLabel(/hora/i).fill(TEST_BIRTH_DATA.birthTime);

    // Lugar
    await page.getByLabel(/lugar/i).fill('Buenos Aires');
    await page.getByText(/Buenos Aires, Argentina/).click();

    // Submit
    await page.getByRole('button', { name: /generar mi carta/i }).click();

    // Esperar resultado
    await expect(page).toHaveURL(/\/carta-astral\/resultado/);

    // Verificar elementos del resultado
    await expect(
      page.getByRole('heading', { name: new RegExp(TEST_BIRTH_DATA.name) }),
    ).toBeVisible();
    await expect(page.getByText(/Big Three/i)).toBeVisible();
    await expect(page.getByText(/Sol en/i)).toBeVisible();
    await expect(page.getByText(/Luna en/i)).toBeVisible();
    await expect(page.getByText(/Ascendente en/i)).toBeVisible();
  });

  test('should show chart wheel visualization', async ({ page }) => {
    // Generar carta (simplificado)
    await page.getByLabel(/nombre/i).fill('Test User');
    await page.getByLabel(/hora/i).fill('12:00');
    await page.getByLabel(/lugar/i).fill('Buenos Aires');
    await page.getByText(/Buenos Aires, Argentina/).click();
    await page.getByRole('button', { name: /generar/i }).click();

    await expect(page).toHaveURL(/\/carta-astral\/resultado/);

    // Verificar que el gráfico SVG está presente
    await expect(
      page.locator('svg[aria-label="Gráfico de carta astral"]'),
    ).toBeVisible();
  });

  test('should show limit reached message after using free chart', async ({
    page,
    context,
  }) => {
    // Establecer fingerprint consistente
    await context.addCookies([
      {
        name: 'fingerprint',
        value: 'e2e-test-fingerprint-anon',
        domain: 'localhost',
        path: '/',
      },
    ]);

    // Primera generación
    await page.getByLabel(/nombre/i).fill('First Chart');
    await page.getByLabel(/hora/i).fill('12:00');
    await page.getByLabel(/lugar/i).fill('Buenos Aires');
    await page.getByText(/Buenos Aires, Argentina/).click();
    await page.getByRole('button', { name: /generar/i }).click();

    await expect(page).toHaveURL(/\/carta-astral\/resultado/);

    // Volver e intentar otra
    await page.goto('/carta-astral');

    // Debería mostrar mensaje de límite
    await expect(
      page.getByText(/ya utilizaste tu carta gratuita/i),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /crear cuenta/i }),
    ).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Intentar submit sin llenar campos
    await page.getByRole('button', { name: /generar/i }).click();

    // Verificar errores de validación
    await expect(page.getByText(/nombre es requerido/i)).toBeVisible();
  });

  test('should show upsell for anonymous user', async ({ page }) => {
    // Generar carta
    await page.getByLabel(/nombre/i).fill('Test User');
    await page.getByLabel(/hora/i).fill('14:30');
    await page.getByLabel(/lugar/i).fill('Buenos Aires');
    await page.getByText(/Buenos Aires, Argentina/).click();
    await page.getByRole('button', { name: /generar/i }).click();

    await expect(page).toHaveURL(/\/carta-astral\/resultado/);

    // Verificar CTAs para registrarse/upgrade
    await expect(page.getByText(/desbloquea/i)).toBeVisible();
    await expect(
      page.getByRole('link', { name: /crear cuenta/i }),
    ).toBeVisible();

    // NO debe ver botón de descargar PDF
    await expect(
      page.getByRole('button', { name: /descargar pdf/i }),
    ).not.toBeVisible();
  });
});

/**
 * Test Suite: Birth Chart - Result Page (Anonymous)
 */
test.describe('Birth Chart - Result Page (Anonymous)', () => {
  test.beforeEach(async ({ page }) => {
    // Generar carta primero
    await page.goto('/carta-astral');

    // Verificar que el formulario se renderizó correctamente
    const nameField = page.getByLabel(/nombre/i);
    const timeField = page.getByLabel(/hora/i);
    const placeField = page.getByLabel(/lugar/i);

    await expect(nameField, 'Expected name field on birth chart form').toBeVisible();
    await expect(timeField, 'Expected time field on birth chart form').toBeVisible();
    await expect(placeField, 'Expected place field on birth chart form').toBeVisible();

    // Llenar formulario usando helper
    await fillBirthChartForm(page, {
      name: 'Test User',
      birthTime: '14:30',
      birthPlace: 'Buenos Aires',
      birthPlaceFullName: 'Buenos Aires, Argentina',
    });

    await page.getByRole('button', { name: /generar/i }).click();
    await expect(page).toHaveURL(/\/carta-astral\/resultado/);

    // Verificar que el gráfico se generó correctamente
    await expect(
      page.locator('svg[aria-label="Gráfico de carta astral"]'),
    ).toBeVisible();
  });

  test('should display tabs with different views', async ({ page }) => {
    // Tab de gráfico (por defecto)
    await expect(
      page.locator('svg[aria-label="Gráfico de carta astral"]'),
    ).toBeVisible();

    // Tab de posiciones
    await page.getByRole('tab', { name: /posiciones/i }).click();
    await expect(page.getByRole('table')).toBeVisible();

    // Tab de aspectos
    await page.getByRole('tab', { name: /aspectos/i }).click();
    await expect(page.getByText(/aspectos planetarios/i)).toBeVisible();

    // Tab de distribución (puede no estar visible para anónimos)
    const distributionTab = page.getByRole('tab', { name: /distribución/i });
    if (await distributionTab.isVisible()) {
      await distributionTab.click();
    }
  });

  test('should expand Big Three interpretations', async ({ page }) => {
    // Click en Sol
    await page.getByRole('button', { name: /sol en/i }).click();

    // Verificar que se expande la interpretación
    await expect(page.getByText(/tu esencia/i)).toBeVisible();
  });

  test('should NOT show full interpretations for anonymous', async ({
    page,
  }) => {
    // NO debe ver interpretaciones completas de todos los planetas
    await expect(
      page.getByText(/interpretaciones completas/i),
    ).not.toBeVisible();

    // NO debe ver interpretación de Mercurio, Venus, etc. en detalle
    await expect(page.getByText(/Mercurio en Casa/i)).not.toBeVisible();
  });

  test('should display planet positions table', async ({ page }) => {
    // Ir a tab de posiciones
    await page.getByRole('tab', { name: /posiciones/i }).click();

    // Verificar que muestra tabla con planetas
    const table = page.getByRole('table');
    await expect(table).toBeVisible();

    // Debe mostrar al menos los 10 planetas
    const planetRowCount = await table.locator('tbody tr').count();
    expect(planetRowCount).toBeGreaterThanOrEqual(10);

    // Debe mostrar columnas: Planeta, Grado, Signo, Casa
    await expect(table.getByRole('columnheader', { name: /planeta/i })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: /signo/i })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: /casa/i })).toBeVisible();
  });

  test('should display aspect matrix', async ({ page }) => {
    // Ir a tab de aspectos
    await page.getByRole('tab', { name: /aspectos/i }).click();

    // Debe mostrar matriz de aspectos
    await expect(page.getByText(/aspectos planetarios/i)).toBeVisible();

    // Debe haber al menos algunos aspectos visibles
    // (depende de la carta, pero típicamente hay varios)
    const aspectItems = page.locator('[data-testid="aspect-item"]');
    const count = await aspectItems.count();
    expect(count).toBeGreaterThan(0);
  });
});
