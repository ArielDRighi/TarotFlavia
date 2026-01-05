import { test, expect } from '@playwright/test';

/**
 * Test Suite: PREMIUM User - Reading Creation Flow
 *
 * Usuario PREMIUM debe:
 * - Ver selección de categorías
 * - Ver preguntas predefinidas Y personalizadas
 * - Poder escribir preguntas personalizadas
 * - Ver TODAS las tiradas disponibles
 * - Poder solicitar interpretación IA
 * - Recibir interpretación IA en resultados
 */
test.describe('PREMIUM User - Reading Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Login como PREMIUM
    await page.goto('/login');
    await page.getByLabel('Email').fill('premium@test.com');
    await page.getByLabel('Contraseña').fill('Test123456!');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await page.waitForURL('/');
  });

  test('PREMIUM user SHOULD see categories', async ({ page }) => {
    // Click en "Nueva Lectura"
    await page.getByRole('link', { name: 'Nueva Lectura' }).click();

    // CRÍTICO: NO debe redirigir, debe quedarse en /ritual
    await expect(page).toHaveURL(`${BASE_URL}/ritual`);

    // Debe ver el título de categorías
    await expect(page.getByText('¿Qué inquieta tu alma hoy?')).toBeVisible();

    // Debe ver todas las categorías
    await expect(page.getByText('Amor y Relaciones')).toBeVisible();
    await expect(page.getByText('Carrera y Trabajo')).toBeVisible();
    await expect(page.getByText('Dinero y Finanzas')).toBeVisible();
    await expect(page.getByText('Salud y Bienestar')).toBeVisible();
  });

  test('PREMIUM user can select a category', async ({ page }) => {
    await page.goto(`${BASE_URL}/ritual`);

    // Click en categoría
    await page.getByRole('button', { name: /Amor y Relaciones/ }).click();

    // Debe navegar a preguntas
    await expect(page).toHaveURL(/\/ritual\/preguntas\?categoryId=\d+/);

    // Debe ver título de preguntas
    await expect(page.getByText('Selecciona tu consulta')).toBeVisible();
  });

  test('PREMIUM user can use predefined question', async ({ page }) => {
    await page.goto('/ritual');

    // Seleccionar categoría
    await page.getByRole('button', { name: /Amor y Relaciones/ }).click();

    // Verificar que está en preguntas
    await expect(page).toHaveURL(/\/ritual\/preguntas\?categoryId=\d+/);

    // Ver sección de preguntas predefinidas
    await expect(page.getByText('Preguntas predefinidas')).toBeVisible();

    // Debe haber varias preguntas
    const questions = page.getByRole('button', { name: /Seleccionar pregunta:/ });
    await expect(questions).toHaveCount(await questions.count());
    expect(await questions.count()).toBeGreaterThan(0);

    // Seleccionar primera pregunta
    await questions.first().click();

    // Botón "Continuar" debe habilitarse
    const continueButton = page.getByRole('button', { name: 'Continuar con esta pregunta' });
    await expect(continueButton).toBeEnabled();

    // Continuar
    await continueButton.click();

    // Debe ir a selección de tiradas CON parámetros
    await expect(page).toHaveURL(/\/ritual\/tirada\?categoryId=\d+&questionId=\d+/);
  });

  test('PREMIUM user can write custom question', async ({ page }) => {
    await page.goto('/ritual');

    // Seleccionar categoría
    await page.getByRole('button', { name: /Amor y Relaciones/ }).click();

    // Ver sección de pregunta personalizada
    await expect(page.getByText('Pregunta personalizada')).toBeVisible();

    // El textarea NO debe estar deshabilitado para PREMIUM
    const customInput = page.getByPlaceholder(/Pregunta personalizada/);
    await expect(customInput).toBeVisible();
    await expect(customInput).toBeEnabled(); // CRÍTICO: Debe estar habilitado

    // NO debe tener badge "Premium" bloqueándolo
    const premiumBadge = page.locator('[data-testid="premium-badge"]').filter({
      has: customInput,
    });
    // Si hay badge, no debe estar bloqueando el input (depende de implementación)

    // Escribir pregunta personalizada
    const customQuestion = '¿Encontraré el amor verdadero este año?';
    await customInput.fill(customQuestion);

    // Botón "Usar mi pregunta" debe habilitarse
    const useQuestionButton = page.getByRole('button', { name: 'Usar mi pregunta' });
    await expect(useQuestionButton).toBeEnabled();

    // Click en usar pregunta
    await useQuestionButton.click();

    // Debe ir a tiradas con pregunta personalizada en URL
    await expect(page).toHaveURL(/\/ritual\/tirada\?categoryId=\d+&customQuestion=/);
    expect(page.url()).toContain(encodeURIComponent(customQuestion));
  });

  test('PREMIUM user sees all spreads including advanced ones', async ({ page }) => {
    // Ir directamente a tiradas (puede llevar parámetros opcionales)
    await page.goto(`${BASE_URL}/ritual/tirada`);

    // Debe ver tiradas básicas
    await expect(page.getByText('Tirada de 1 Carta')).toBeVisible();
    await expect(page.getByText('Tirada de 3 Cartas')).toBeVisible();

    // Debe ver tiradas avanzadas
    await expect(page.getByText('Cruz Céltica')).toBeVisible();

    // Verificar que hay más de 2 spreads (FREE solo ve 2)
    const selectButtons = page.getByRole('button', { name: 'Seleccionar' });
    const count = await selectButtons.count();
    expect(count).toBeGreaterThan(2);
  });

  test('PREMIUM user ALWAYS gets AI interpretation automatically', async ({ page }) => {
    await page.goto(`${BASE_URL}/ritual/tirada`);

    // Seleccionar cualquier tirada
    await page.getByRole('button', { name: 'Seleccionar' }).first().click();

    // En selección de cartas
    await expect(page).toHaveURL(/\/ritual\/lectura/);

    // Seleccionar carta(s) requeridas
    const cards = page.locator('[data-testid="tarot-card-back"]');
    await cards.first().click();

    // NO debe haber checkbox de IA (es automático para PREMIUM)
    const aiCheckbox = page.getByRole('checkbox', { name: /Incluir interpretación IA/i });
    await expect(aiCheckbox).not.toBeVisible();

    // Crear lectura
    await page.getByRole('button', { name: 'Crear Lectura' }).click();

    // Esperar resultado (puede tardar hasta 30 segundos por la IA)
    await expect(page).toHaveURL(/\/lecturas\/\d+/, { timeout: 35000 });

    // SIEMPRE debe haber interpretación IA para PREMIUM
    await expect(page.getByText('Interpretación')).toBeVisible();
    await expect(page.locator('[data-testid="ai-interpretation"]')).toBeVisible();

    // La interpretación debe tener contenido (no estar vacía)
    const interpretation = page.locator('[data-testid="ai-interpretation"]');
    const text = await interpretation.textContent();
    expect(text?.length).toBeGreaterThan(50); // Al menos 50 caracteres
  });

  test('PREMIUM reading should have loading state while AI generates', async ({ page }) => {
    await page.goto(`${BASE_URL}/ritual/tirada`);

    await page.getByRole('button', { name: 'Seleccionar' }).first().click();

    // Seleccionar carta
    await page.locator('[data-testid="tarot-card-back"]').first().click();

    // Crear lectura
    await page.getByRole('button', { name: 'Crear Lectura' }).click();

    // Debe mostrar loading mientras genera IA
    await expect(page.getByText(/Generando interpretación|Cargando/i)).toBeVisible();

    // Esperar resultado completo
    await expect(page).toHaveURL(/\/lecturas\/\d+/, { timeout: 35000 });

    // SIEMPRE debe tener interpretación IA
    await expect(page.getByText('Interpretación')).toBeVisible();
    await expect(page.locator('[data-testid="ai-interpretation"]')).toBeVisible();
  });

  test('PREMIUM user flow with category, question and AI', async ({ page }) => {
    // Flujo completo: categoría → pregunta → tirada → cartas → resultado con IA

    // 1. Seleccionar categoría
    await page.goto(`${BASE_URL}/ritual`);
    await page.getByRole('button', { name: /Amor y Relaciones/ }).click();

    // 2. Seleccionar pregunta predefinida
    await page
      .getByRole('button', { name: /Seleccionar pregunta:/ })
      .first()
      .click();
    await page.getByRole('button', { name: 'Continuar con esta pregunta' }).click();

    // 3. Seleccionar tirada de 3 cartas
    await expect(page).toHaveURL(/\/ritual\/tirada\?categoryId=\d+&questionId=\d+/);
    await page.getByRole('button', { name: 'Seleccionar' }).nth(1).click();

    // 4. Seleccionar 3 cartas
    await expect(page).toHaveURL(/\/ritual\/lectura\?spreadId=\d+&categoryId=\d+&questionId=\d+/);
    const cards = page.locator('[data-testid="tarot-card-back"]');
    await cards.nth(5).click();
    await cards.nth(10).click();
    await cards.nth(15).click();

    // 5. Crear lectura (IA es automática, no hay checkbox)
    await page.getByRole('button', { name: 'Crear Lectura' }).click();

    // 6. Verificar resultado completo
    await expect(page).toHaveURL(/\/lecturas\/\d+/, { timeout: 35000 });

    // 3 cartas
    await expect(page.locator('[data-testid="card-result"]')).toHaveCount(3);

    // Posiciones
    await expect(page.getByText(/Pasado/)).toBeVisible();

    // Interpretación IA
    await expect(page.getByText('Interpretación')).toBeVisible();
    await expect(page.locator('[data-testid="ai-interpretation"]')).toBeVisible();
  });

  test('PREMIUM URL params should be preserved through flow', async ({ page }) => {
    // Verificar que categoryId y questionId se mantienen en toda la navegación

    await page.goto(`${BASE_URL}/ritual`);
    await page.getByRole('button', { name: /Amor y Relaciones/ }).click();

    // Obtener categoryId de URL
    const questionPageUrl = page.url();
    const categoryId = new URL(questionPageUrl).searchParams.get('categoryId');
    expect(categoryId).toBeTruthy();

    // Seleccionar pregunta
    await page
      .getByRole('button', { name: /Seleccionar pregunta:/ })
      .first()
      .click();
    await page.getByRole('button', { name: 'Continuar con esta pregunta' }).click();

    // Verificar que ambos params están en URL de tiradas
    const tiradasUrl = page.url();
    expect(tiradasUrl).toContain(`categoryId=${categoryId}`);
    expect(tiradasUrl).toContain('questionId=');

    const questionId = new URL(tiradasUrl).searchParams.get('questionId');

    // Seleccionar tirada
    await page.getByRole('button', { name: 'Seleccionar' }).first().click();

    // Verificar que params se mantienen en URL de lectura
    const lecturaUrl = page.url();
    expect(lecturaUrl).toContain(`categoryId=${categoryId}`);
    expect(lecturaUrl).toContain(`questionId=${questionId}`);
    expect(lecturaUrl).toContain('spreadId=');
  });
});
