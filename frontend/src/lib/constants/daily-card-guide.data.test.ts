import { describe, it, expect } from 'vitest';

import {
  DAILY_CARD_GUIDE,
  MIN_DAILY_CARD_GUIDE_WORDS,
  getDailyCardGuideWordCount,
} from './daily-card-guide.data';

/**
 * Guardarraíl de la guía de `/carta-del-dia` (T-SEO-015). Si alguien recorta el
 * texto, se entera acá y no en el próximo rechazo de AdSense.
 */
describe('DAILY_CARD_GUIDE', () => {
  it('⚠️ T-SEO-015: la guía permanente aporta al menos 800 palabras propias', () => {
    expect(MIN_DAILY_CARD_GUIDE_WORDS).toBe(800);
    expect(getDailyCardGuideWordCount()).toBeGreaterThanOrEqual(MIN_DAILY_CARD_GUIDE_WORDS);
  });

  it('tiene título, lead y al menos cinco pasos con texto', () => {
    expect(DAILY_CARD_GUIDE.title.trim().length).toBeGreaterThan(0);
    expect(DAILY_CARD_GUIDE.lead.trim().length).toBeGreaterThan(0);
    expect(DAILY_CARD_GUIDE.steps.length).toBeGreaterThanOrEqual(5);
    DAILY_CARD_GUIDE.steps.forEach((step) => {
      expect(step.heading.trim().length).toBeGreaterThan(0);
      expect(step.paragraphs.length).toBeGreaterThan(0);
      step.paragraphs.forEach((paragraph) => expect(paragraph.trim().length).toBeGreaterThan(0));
    });
  });

  it('no repite encabezados ni párrafos', () => {
    const headings = DAILY_CARD_GUIDE.steps.map((step) => step.heading);
    const paragraphs = DAILY_CARD_GUIDE.steps.flatMap((step) => step.paragraphs);

    expect(new Set(headings).size).toBe(headings.length);
    expect(new Set(paragraphs).size).toBe(paragraphs.length);
  });

  it('⚠️ T-SEO-013 / T-SEO-018: sin "salud" ni lenguaje de promesa en el texto visible', () => {
    const texto = [
      DAILY_CARD_GUIDE.lead,
      ...DAILY_CARD_GUIDE.steps.flatMap((step) => [step.heading, ...step.paragraphs]),
    ].join(' ');

    expect(texto).not.toMatch(/\bsalud\b/i);
    expect(texto).not.toMatch(/garantiza|100 ?%|predicción exacta/i);
  });

  it('enlaza a la enciclopedia, que es donde vive la teoría', () => {
    expect(DAILY_CARD_GUIDE.links.some((link) => link.href.startsWith('/enciclopedia'))).toBe(true);
    DAILY_CARD_GUIDE.links.forEach((link) => expect(link.href.startsWith('/')).toBe(true));
  });
});
