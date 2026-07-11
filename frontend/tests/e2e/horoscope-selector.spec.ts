import { test, expect, type Page } from '@playwright/test';

/**
 * E2E del selector de horóscopo (T-PROD-010 / hallazgo PROD-008).
 *
 * Existe porque los tests unitarios NO pueden cubrir esto: jsdom no tiene motor de
 * layout, así que solo pueden afirmar clases de Tailwind. Los dos bugs que esta
 * suite cubre (nombres recortados y página desplazada) son bugs de layout: ninguno
 * era detectable en Vitest y ambos se escaparon hasta la revisión.
 */

const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 900 };

const PAGES = [
  {
    name: 'occidental',
    // Capricornio es el nombre más largo: es el que se recortaba.
    url: '/horoscopo/capricorn',
    listUrl: '/horoscopo',
    selector: '[data-testid="zodiac-selector"]',
    selectedCard: '[data-testid="zodiac-card-capricorn"]',
  },
  {
    name: 'chino',
    url: '/horoscopo-chino/snake',
    listUrl: '/horoscopo-chino',
    selector: '[data-testid="chinese-animal-selector"]',
    selectedCard: '[data-testid="chinese-animal-snake"]',
  },
];

/** Los viewports móviles reales del criterio de aceptación. */
const MOBILE_WIDTHS = [320, 360, 390, 430];

/** Nombres cuyo texto no entra en su caja (se están recortando). */
async function getClippedNames(page: Page, selector: string): Promise<string[]> {
  return page.evaluate((sel) => {
    const container = document.querySelector(sel);
    if (!container) return ['<selector no encontrado>'];

    return [...container.querySelectorAll('p')]
      .filter((name) => name.scrollWidth > name.clientWidth)
      .map((name) => name.textContent ?? '');
  }, selector);
}

for (const horoscope of PAGES) {
  test.describe(`Selector de horóscopo ${horoscope.name}`, () => {
    test('en móvil, los 12 nombres se leen completos', async ({ page }) => {
      await page.setViewportSize(MOBILE);
      await page.goto(horoscope.url);
      await page.waitForSelector(horoscope.selector);

      expect(await getClippedNames(page, horoscope.selector)).toEqual([]);
    });

    test('en móvil, la página NO carga desplazada horizontalmente', async ({ page }) => {
      // REGRESIÓN: centrar la tarjeta activa con scrollIntoView desplazaba también el
      // documento (la spec scrollea todos los ancestros scrolleables), y la página
      // cargaba corrida hasta 64px. Debe scrollear solo el carrusel.
      await page.setViewportSize(MOBILE);
      await page.goto(horoscope.url);
      await page.waitForSelector(horoscope.selector);

      expect(await page.evaluate(() => Math.round(window.scrollX))).toBe(0);
    });

    test('en móvil, la tarjeta seleccionada queda a la vista', async ({ page }) => {
      await page.setViewportSize(MOBILE);
      await page.goto(horoscope.url);
      await page.waitForSelector(horoscope.selectedCard);

      const isVisible = await page.evaluate(
        ({ sel, card }) => {
          const c = document.querySelector(sel)?.getBoundingClientRect();
          const k = document.querySelector(card)?.getBoundingClientRect();
          if (!c || !k) return false;
          return k.left >= c.left - 1 && k.right <= c.right + 1;
        },
        { sel: horoscope.selector, card: horoscope.selectedCard }
      );

      expect(isVisible).toBe(true);
    });

    test('en desktop, el selector no scrollea (se ven las 12 tarjetas)', async ({ page }) => {
      // El carrusel es solo para móvil: en desktop se conserva la fila de 12 columnas.
      await page.setViewportSize(DESKTOP);
      await page.goto(horoscope.url);
      await page.waitForSelector(horoscope.selector);

      const scrolls = await page.evaluate((sel) => {
        const c = document.querySelector(sel);
        return !!c && c.scrollWidth > c.clientWidth;
      }, horoscope.selector);

      expect(scrolls).toBe(false);
      expect(await page.evaluate(() => Math.round(window.scrollX))).toBe(0);
    });

    // La página de LISTADO usa la grilla, no el carrusel, y recortaba los nombres
    // con el mismo síntoma (en /horoscopo, "Capricornio" se cortaba hasta en 430px).
    for (const width of MOBILE_WIDTHS) {
      test(`en el listado a ${width}px, los 12 nombres se leen completos`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(horoscope.listUrl);
        await page.waitForSelector(horoscope.selector);

        expect(await getClippedNames(page, horoscope.selector)).toEqual([]);
      });
    }
  });
}
