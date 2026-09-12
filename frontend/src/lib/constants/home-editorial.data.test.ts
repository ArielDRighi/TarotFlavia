import { describe, it, expect } from 'vitest';

import {
  HOME_EDITORIAL,
  MIN_HOME_EDITORIAL_WORDS,
  getHomeEditorialWordCount,
} from './home-editorial.data';
import { ROUTES } from './routes';

/**
 * Guardarraíl del texto propio de la portada (T-SEO-014).
 *
 * La portada apunta a 900–1.200 palabras rastreables, pero el grueso —los 12
 * extractos del horóscopo, la carta del día, las guías— llega de la API. Este
 * bloque es el piso que no depende de nada: si alguien lo recorta, falla acá y
 * no en el próximo rechazo de AdSense.
 */
describe('HOME_EDITORIAL', () => {
  it(`aporta al menos ${MIN_HOME_EDITORIAL_WORDS} palabras propias`, () => {
    expect(getHomeEditorialWordCount()).toBeGreaterThanOrEqual(MIN_HOME_EDITORIAL_WORDS);
  });

  it('el hero es de publicación, no de producto', () => {
    expect(HOME_EDITORIAL.hero.title).toMatch(/tarot y astrología en español/i);
    expect(HOME_EDITORIAL.hero.title).not.toMatch(/cuenta|gratis|premium/i);
    expect(HOME_EDITORIAL.hero.lead).not.toMatch(/\$|precio|premium|crear cuenta/i);
  });

  it('⚠️ la home anónima no menciona precios ni planes en su texto propio', () => {
    const everything = JSON.stringify(HOME_EDITORIAL);
    expect(everything).not.toMatch(/\$\s?\d/);
    expect(everything).not.toMatch(/premium/i);
    expect(everything).not.toMatch(/3 (simples )?pasos/i);
  });

  it('⚠️ no usa la palabra "salud" en texto visible (T-SEO-013)', () => {
    expect(JSON.stringify(HOME_EDITORIAL)).not.toMatch(/\bsalud\b/i);
  });

  it('los números de la enciclopedia son los del sitio y enlazan a su índice', () => {
    const labels = HOME_EDITORIAL.encyclopedia.figures.map((figure) => figure.label);
    expect(labels).toEqual([
      '78 cartas',
      '12 signos',
      '12 casas',
      '10 planetas',
      '12 signos chinos',
    ]);

    const hrefs = HOME_EDITORIAL.encyclopedia.figures.map((figure) => figure.href);
    expect(hrefs).toEqual([
      ROUTES.ENCICLOPEDIA_TAROT,
      ROUTES.ENCICLOPEDIA_ASTROLOGIA_SIGNOS,
      ROUTES.ENCICLOPEDIA_ASTROLOGIA_CASAS,
      ROUTES.ENCICLOPEDIA_ASTROLOGIA_PLANETAS,
      ROUTES.HOROSCOPO_CHINO,
    ]);
  });

  it('cada sección lleva un enlace interno hacia su página completa', () => {
    expect(HOME_EDITORIAL.horoscope.href).toBe(ROUTES.HOROSCOPO);
    expect(HOME_EDITORIAL.dailyCard.href).toBe(ROUTES.CARTA_DEL_DIA);
    expect(HOME_EDITORIAL.guides.href).toBe(ROUTES.ENCICLOPEDIA_GUIAS);
    expect(HOME_EDITORIAL.encyclopedia.href).toBe(ROUTES.ENCICLOPEDIA);
    expect(HOME_EDITORIAL.about.href).toBe(ROUTES.SOBRE_NOSOTROS);
    expect(HOME_EDITORIAL.services.links.map((link) => link.href)).toEqual([
      ROUTES.SERVICIOS,
      ROUTES.CARTA_ASTRAL,
    ]);
  });

  it('la franja de servicios es una línea, no una tabla', () => {
    expect(HOME_EDITORIAL.services.text.split(/[.!?]/).filter(Boolean).length).toBeLessThanOrEqual(
      2
    );
  });
});
