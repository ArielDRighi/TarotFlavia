import { test, expect } from '@playwright/test';

/**
 * E2E de status HTTP en rutas dinámicas públicas (T-SEO-006).
 *
 * Existe porque los tests unitarios NO pueden cubrir esto: aseveran que la ruta
 * llama a `notFound()`, pero no qué status sale por el socket. El bug que esta
 * suite cierra era exactamente esa brecha: las rutas llamaban a `notFound()`
 * —y los tests lo verificaban— y aun así la respuesta salía **200** con la
 * página de no-encontrado (soft-404), porque el `app/loading.tsx` global
 * confirmaba la respuesta antes de que corriera el cuerpo de la página.
 *
 * Un soft-404 es lo peor de los dos mundos para SEO: Google indexa la URL como
 * válida y vacía en vez de descartarla.
 */

/** Slug/id que no existe en ninguna ruta: sondea el 404 sin depender de datos. */
const SLUG_INVENTADO = 'inventado-xyz-t-seo-006';

/**
 * Una entrada por patrón de ruta dinámica pública. Si se agrega una sección
 * nueva al sitio, va acá: es el inventario que impide que el soft-404 vuelva
 * por una ruta que nadie miró.
 */
const RUTAS_DINAMICAS_PUBLICAS = [
  `/enciclopedia/tarot/${SLUG_INVENTADO}`,
  `/enciclopedia/guias/${SLUG_INVENTADO}`,
  `/enciclopedia/elementos/${SLUG_INVENTADO}`,
  `/enciclopedia/astrologia/signos/${SLUG_INVENTADO}`,
  `/enciclopedia/astrologia/casas/${SLUG_INVENTADO}`,
  `/enciclopedia/astrologia/planetas/${SLUG_INVENTADO}`,
  `/rituales/${SLUG_INVENTADO}`,
  `/servicios/${SLUG_INVENTADO}`,
  `/horoscopo/${SLUG_INVENTADO}`,
  `/horoscopo-chino/${SLUG_INVENTADO}`,
  // El id llega como string: `/tarotistas/abc` no debe salir a la API con NaN.
  '/tarotistas/abc',
];

/**
 * URLs que existen y deben seguir respondiendo 200. Sin esto, "todo 404" pasaría
 * la suite entera.
 */
const RUTAS_VALIDAS = ['/horoscopo/aries', '/horoscopo-chino/rat', '/rituales', '/servicios'];

test.describe('T-SEO-006 — las rutas dinámicas devuelven 404 real', () => {
  for (const ruta of RUTAS_DINAMICAS_PUBLICAS) {
    test(`${ruta} responde 404`, async ({ request }) => {
      const respuesta = await request.get(ruta);

      expect(respuesta.status()).toBe(404);
    });
  }

  test('una ruta que no matchea ningún patrón sigue devolviendo 404', async ({ request }) => {
    const respuesta = await request.get(`/${SLUG_INVENTADO}`);

    expect(respuesta.status()).toBe(404);
  });

  for (const ruta of RUTAS_VALIDAS) {
    test(`${ruta} sigue respondiendo 200`, async ({ request }) => {
      const respuesta = await request.get(ruta);

      expect(respuesta.status()).toBe(200);
    });
  }
});
