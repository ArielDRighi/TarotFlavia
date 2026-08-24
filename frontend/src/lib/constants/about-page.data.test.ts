import { describe, it, expect } from 'vitest';

import {
  ABOUT_PAGE,
  MIN_ABOUT_PAGE_WORDS,
  getAboutPageWordCount,
} from '@/lib/constants/about-page.data';
import { LISTING_INTROS } from '@/lib/constants/listing-intros.data';

/**
 * Guardarraíl de contenido de `/sobre-nosotros` (T-SEO-011).
 *
 * Mismo criterio que `listing-intros.data.test.ts` y
 * `chinese-zodiac-profiles.data.test.ts`: si alguien recorta la página por
 * debajo del piso, se entera acá y no en el próximo rechazo de AdSense.
 *
 * La página es la señal de autoría del sitio (E-E-A-T), así que además de las
 * palabras se verifica que estén las piezas que un revisor humano busca: quiénes
 * somos, cómo se produce el contenido, y los límites de lo que ofrecemos.
 */

/** Todos los párrafos propios de la página, en un solo array. */
function allParagraphs(): string[] {
  return [
    ABOUT_PAGE.lead,
    ...ABOUT_PAGE.sections.flatMap((section) => section.paragraphs),
    ...ABOUT_PAGE.principles.map((principle) => principle.description),
    ABOUT_PAGE.closing,
  ];
}

describe('ABOUT_PAGE', () => {
  it(`aporta al menos ${MIN_ABOUT_PAGE_WORDS} palabras propias`, () => {
    expect(getAboutPageWordCount()).toBeGreaterThanOrEqual(MIN_ABOUT_PAGE_WORDS);
  });

  it('el mínimo declarado cubre el criterio de aceptación de T-SEO-011 (600 palabras)', () => {
    expect(MIN_ABOUT_PAGE_WORDS).toBeGreaterThanOrEqual(600);
  });

  it('tiene título, lead y al menos cuatro secciones', () => {
    expect(ABOUT_PAGE.title.trim().length).toBeGreaterThan(0);
    expect(ABOUT_PAGE.lead.trim().length).toBeGreaterThan(0);
    expect(ABOUT_PAGE.sections.length).toBeGreaterThanOrEqual(4);
  });

  it('cada sección tiene encabezado y párrafos con cuerpo real', () => {
    ABOUT_PAGE.sections.forEach((section) => {
      expect(section.heading.trim().length).toBeGreaterThan(0);
      expect(section.paragraphs.length).toBeGreaterThanOrEqual(1);
      section.paragraphs.forEach((paragraph) => {
        expect(paragraph.trim().length).toBeGreaterThan(80);
      });
    });
  });

  it('cada principio editorial tiene término y descripción', () => {
    expect(ABOUT_PAGE.principles.length).toBeGreaterThanOrEqual(3);
    ABOUT_PAGE.principles.forEach((principle) => {
      expect(principle.term.trim().length).toBeGreaterThan(0);
      expect(principle.description.trim().length).toBeGreaterThan(40);
    });
  });

  it('enlaza internamente para que el crawler siga recorriendo', () => {
    expect(ABOUT_PAGE.links.length).toBeGreaterThanOrEqual(3);
    ABOUT_PAGE.links.forEach((link) => {
      expect(link.label.trim().length).toBeGreaterThan(0);
      expect(link.href.startsWith('/')).toBe(true);
    });
  });

  it('⚠️ no repite ningún párrafo dentro de la página', () => {
    const paragraphs = allParagraphs();

    expect(new Set(paragraphs).size).toBe(paragraphs.length);
  });

  /**
   * `AboutContent` usa estos campos como `key` de React. Si una edición futura
   * repite uno, React colisiona las keys en silencio.
   */
  it('⚠️ no repite encabezados, términos ni hrefs: se usan como key de React', () => {
    const headings = ABOUT_PAGE.sections.map((section) => section.heading);
    const terms = ABOUT_PAGE.principles.map((principle) => principle.term);
    const hrefs = ABOUT_PAGE.links.map((link) => link.href);

    expect(new Set(headings).size).toBe(headings.length);
    expect(new Set(terms).size).toBe(terms.length);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('declara el encabezado del bloque de principios como dato, no en el JSX', () => {
    expect(ABOUT_PAGE.principlesHeading.trim().length).toBeGreaterThan(0);
  });

  it('declara la última revisión editorial en formato YYYY-MM', () => {
    expect(ABOUT_PAGE.lastReviewed).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
  });

  it('⚠️ no reusa texto de las introducciones de listado: sería contenido duplicado', () => {
    const listingParagraphs = new Set(
      Object.values(LISTING_INTROS).flatMap((intro) => [
        intro.lead,
        ...intro.sections.map((section) => section.body),
      ])
    );

    allParagraphs().forEach((paragraph) => {
      expect(listingParagraphs.has(paragraph)).toBe(false);
    });
  });
});

describe('señales de autoría (E-E-A-T)', () => {
  const fullText = allParagraphs().join(' ').toLowerCase();

  it('declara la trayectoria del equipo', () => {
    expect(fullText).toMatch(/década|años de práctica/);
  });

  it('explica cómo se produce el contenido de la enciclopedia', () => {
    expect(fullText).toMatch(/enciclopedia/);
    expect(fullText).toMatch(/fuentes|tradición/);
  });

  it('deja explícito el límite: no sustituye asesoramiento profesional', () => {
    expect(fullText).toMatch(/no sustituy|no reemplaza/);
  });

  it('⚠️ no nombra personas: el sitio se presenta como equipo', () => {
    expect(fullText).not.toMatch(/flavia/);
  });

  /**
   * Estas dos aserciones existen por el hallazgo de la revisión de T-SEO-011: el
   * texto afirmaba cosas que el producto no cumplía —una baraja que el sitio no
   * tiene sembrada, y que la enciclopedia señala las discrepancias entre fuentes
   * (no lo hace: no hay una sola cita en el corpus)—. En una página de confianza
   * eso es peor que no tenerla, porque un revisor lo refuta en dos clics.
   */
  it('⚠️ no nombra el Tarot de Marsella: el único mazo sembrado es Rider-Waite', () => {
    expect(fullText).not.toMatch(/marsella/);
  });

  it('⚠️ no promete citar fuentes ni señalar discrepancias entre ellas', () => {
    expect(fullText).not.toMatch(/lo decimos en el texto|se aclara en lugar de/);
  });
});
