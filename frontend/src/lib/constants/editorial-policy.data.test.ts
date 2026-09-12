import { describe, expect, it } from 'vitest';

import { ABOUT_PAGE } from './about-page.data';
import {
  DAILY_HOROSCOPE_BASIS,
  DAILY_HOROSCOPE_METHOD,
  EDITORIAL_POLICY,
  MIN_EDITORIAL_POLICY_WORDS,
  getEditorialPolicyWordCount,
} from './editorial-policy.data';
import { ROUTES } from './routes';
import { countWords } from '@/lib/utils/text';

/**
 * Contenido de `/politica-editorial` (T-SEO-017).
 *
 * Es la página que explica cómo se produce, revisa y corrige el contenido del
 * sitio, y la que reencuadra los horóscopos diarios como "datos + borrador +
 * revisión editorial" sin poner un badge en cada página. El criterio de
 * aceptación pide 600+ palabras, linkeada desde el footer y en el sitemap.
 */

/** Todos los párrafos propios de la página, en un solo array. */
function allParagraphs(): string[] {
  return [
    EDITORIAL_POLICY.lead,
    ...EDITORIAL_POLICY.sections.flatMap((section) => section.paragraphs),
    EDITORIAL_POLICY.closing,
  ];
}

describe('EDITORIAL_POLICY', () => {
  it(`aporta al menos ${MIN_EDITORIAL_POLICY_WORDS} palabras propias`, () => {
    expect(getEditorialPolicyWordCount()).toBeGreaterThanOrEqual(MIN_EDITORIAL_POLICY_WORDS);
  });

  it('el mínimo declarado cubre el criterio de aceptación de T-SEO-017 (600 palabras)', () => {
    expect(MIN_EDITORIAL_POLICY_WORDS).toBeGreaterThanOrEqual(600);
  });

  it('el conteo mide el cuerpo, no los encabezados', () => {
    expect(getEditorialPolicyWordCount()).toBe(countWords(allParagraphs()));
  });

  it('tiene título, lead y al menos cinco secciones', () => {
    expect(EDITORIAL_POLICY.title.trim().length).toBeGreaterThan(0);
    expect(EDITORIAL_POLICY.lead.trim().length).toBeGreaterThan(0);
    expect(EDITORIAL_POLICY.sections.length).toBeGreaterThanOrEqual(5);
  });

  it('cada sección tiene encabezado y párrafos con cuerpo real', () => {
    EDITORIAL_POLICY.sections.forEach((section) => {
      expect(section.heading.trim().length).toBeGreaterThan(0);
      expect(section.paragraphs.length).toBeGreaterThanOrEqual(1);
      section.paragraphs.forEach((paragraph) => {
        expect(paragraph.trim().length).toBeGreaterThan(80);
      });
    });
  });

  it('no repite encabezados', () => {
    const headings = EDITORIAL_POLICY.sections.map((section) => section.heading);

    expect(new Set(headings).size).toBe(headings.length);
  });

  it('cubre lo que pide el backlog: fuentes, revisión, corrección, actualización y horóscopos', () => {
    const fullText = allParagraphs().join(' ').toLowerCase();

    expect(fullText).toMatch(/rider[- ]waite/);
    expect(fullText).toMatch(/efemérides|posiciones planetarias/);
    expect(fullText).toMatch(/revis/);
    expect(fullText).toMatch(/correg|corrección|correcciones/);
    expect(fullText).toMatch(/actualiz/);
    expect(fullText).toMatch(/horóscopo/);
  });

  /**
   * La fórmula para los horóscopos reencuadra el proceso sin badge: es la misma
   * línea que se muestra al pie de cada horóscopo diario, así que tiene que
   * aparecer literalmente en la política.
   */
  it('incluye la fórmula de producción de los horóscopos diarios, literal', () => {
    const fullText = allParagraphs().join(' ');

    expect(fullText).toContain(DAILY_HOROSCOPE_BASIS);
    expect(fullText).toContain(DAILY_HOROSCOPE_METHOD);
  });

  it('la fórmula habla de herramientas de lenguaje y revisión editorial', () => {
    expect(DAILY_HOROSCOPE_METHOD).toMatch(/herramientas de lenguaje/);
    expect(DAILY_HOROSCOPE_METHOD).toMatch(/revisión editorial/);
  });

  /**
   * ⚠️ El backend redacta por signo a partir de elemento, cualidad y planeta
   * regente (`horoscope.prompts.ts`); no calcula el cielo del día. La fórmula
   * describe eso, y no "posiciones planetarias del día" como decía el backlog:
   * una página de confianza no puede afirmar un proceso que no ocurre.
   */
  it('la base de la fórmula describe lo que el backend hace: elemento, cualidad y regente', () => {
    expect(DAILY_HOROSCOPE_BASIS).toMatch(/elemento/);
    expect(DAILY_HOROSCOPE_BASIS).toMatch(/cualidad/);
    expect(DAILY_HOROSCOPE_BASIS).toMatch(/planeta regente/);
    expect(DAILY_HOROSCOPE_BASIS).not.toMatch(/posiciones planetarias/);
  });

  /**
   * ⚠️ Revisión local: el horóscopo chino anual, las interpretaciones premium y
   * la síntesis de la carta astral también usan herramientas de lenguaje. La
   * política no puede decir que el diario es "el único lugar".
   */
  it('no dice que el horóscopo diario sea el único lugar con herramientas de lenguaje', () => {
    const fullText = allParagraphs().join(' ').toLowerCase();

    expect(fullText).not.toMatch(/único lugar donde intervienen/);
    expect(fullText).toMatch(/horóscopo chino/);
    expect(fullText).toMatch(/premium/);
  });

  /** El péndulo rechaza las preguntas médicas; no las responde. */
  it('describe el péndulo como lo que hace: rechaza, no responde', () => {
    const fullText = allParagraphs().join(' ').toLowerCase();

    expect(fullText).toMatch(/péndulo[^.]*rechaz/);
  });

  it('no atribuye el horóscopo diario a posiciones planetarias del día', () => {
    const horoscopeSection = EDITORIAL_POLICY.sections.find((section) =>
      /horóscopos diarios/i.test(section.heading)
    );

    expect(horoscopeSection).toBeDefined();
    expect(horoscopeSection?.paragraphs.join(' ')).not.toMatch(
      /horóscopo[^.]*posiciones planetarias del día/i
    );
  });

  /**
   * Regla del backlog: ninguna página dice "generado por IA" como badge. La
   * mención al proceso va reencuadrada ("herramientas de lenguaje"), y el
   * guardarraíl global de `no-ia-user-facing.test.ts` lo refuerza en todo `src/`.
   */
  it('⚠️ no usa "IA" ni "inteligencia artificial" ni "generado por"', () => {
    const fullText = allParagraphs().join(' ');

    expect(fullText).not.toMatch(/\bIA\b/);
    expect(fullText).not.toMatch(/inteligencia artificial/i);
    expect(fullText).not.toMatch(/generad[oa]s? por/i);
  });

  /**
   * Decisión de negocio (12-sep-2026): el sitio se sigue presentando como
   * equipo, sin nombrar personas. Igual que `/sobre-nosotros`.
   */
  it('⚠️ no nombra personas', () => {
    const fullText = allParagraphs().join(' ').toLowerCase();

    expect(fullText).not.toMatch(/flavia/);
  });

  it('⚠️ no usa la palabra "salud" en texto visible (T-SEO-013)', () => {
    const fullText = allParagraphs().join(' ').toLowerCase();

    expect(fullText).not.toMatch(/\bsalud\b/);
  });

  it('no repite párrafos de /sobre-nosotros (contenido duplicado)', () => {
    const aboutParagraphs = new Set([
      ABOUT_PAGE.lead,
      ...ABOUT_PAGE.sections.flatMap((section) => section.paragraphs),
      ABOUT_PAGE.closing,
    ]);

    allParagraphs().forEach((paragraph) => {
      expect(aboutParagraphs.has(paragraph)).toBe(false);
    });
  });

  it('declara la última revisión en formato YYYY-MM', () => {
    expect(EDITORIAL_POLICY.lastReviewed).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
  });

  it('enlaza a /sobre-nosotros y a /contacto', () => {
    const hrefs = EDITORIAL_POLICY.links.map((link) => link.href);

    expect(hrefs).toContain(ROUTES.SOBRE_NOSOTROS);
    expect(hrefs).toContain(ROUTES.CONTACTO);
    EDITORIAL_POLICY.links.forEach((link) => {
      expect(link.href.startsWith('/')).toBe(true);
      expect(link.label.trim().length).toBeGreaterThan(0);
    });
  });
});
