import { describe, it, expect } from 'vitest';

import {
  MIN_RITUALS_HUB_GUIDE_WORDS,
  RITUALS_HUB_GUIDE,
  getRitualsHubGuideWordCount,
} from './rituals-hub.data';

describe('RITUALS_HUB_GUIDE (T-SEO-015)', () => {
  it('⚠️ el índice editorial de /rituales aporta al menos 600 palabras propias', () => {
    expect(MIN_RITUALS_HUB_GUIDE_WORDS).toBe(600);
    expect(getRitualsHubGuideWordCount()).toBeGreaterThanOrEqual(MIN_RITUALS_HUB_GUIDE_WORDS);
  });

  it('cubre las cuatro fases lunares y al menos cinco categorías', () => {
    expect(RITUALS_HUB_GUIDE.phases.items.map((item) => item.phase)).toEqual([
      'Luna nueva',
      'Luna creciente',
      'Luna llena',
      'Luna menguante',
    ]);
    expect(RITUALS_HUB_GUIDE.categories.items.length).toBeGreaterThanOrEqual(5);
  });

  it('⚠️ T-SEO-013 / T-SEO-018: sin "salud", "sanación" ni lenguaje de promesa', () => {
    const texto = [
      RITUALS_HUB_GUIDE.lead,
      RITUALS_HUB_GUIDE.phases.intro,
      ...RITUALS_HUB_GUIDE.phases.items.flatMap((item) => [item.phase, item.body]),
      RITUALS_HUB_GUIDE.categories.intro,
      ...RITUALS_HUB_GUIDE.categories.items.flatMap((item) => [item.name, item.body]),
      ...RITUALS_HUB_GUIDE.sections.flatMap((section) => [section.heading, ...section.paragraphs]),
    ].join(' ');

    expect(texto).not.toMatch(/\bsalud\b|sanaci[oó]n|\bsana\b|\bcura\b/i);
    expect(texto).not.toMatch(/garantiza|100 ?%|amarre|endulzamiento/i);
  });
});
