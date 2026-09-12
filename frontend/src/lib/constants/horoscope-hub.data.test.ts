import { describe, it, expect } from 'vitest';

import {
  HOROSCOPE_HUB_GUIDE,
  MIN_HOROSCOPE_HUB_GUIDE_WORDS,
  getHoroscopeHubGuideWordCount,
} from './horoscope-hub.data';

describe('HOROSCOPE_HUB_GUIDE (T-SEO-015)', () => {
  it('⚠️ aporta el piso propio del hub cuando la API no responde', () => {
    expect(getHoroscopeHubGuideWordCount()).toBeGreaterThanOrEqual(MIN_HOROSCOPE_HUB_GUIDE_WORDS);
  });

  it('explica de qué día es la predicción y qué no es', () => {
    const headings = HOROSCOPE_HUB_GUIDE.sections.map((s) => s.heading);
    expect(headings).toContain('De qué día es');
    expect(headings).toContain('Qué no es');
  });

  it('⚠️ T-SEO-013 / T-SEO-018: sin "salud" ni lenguaje de promesa', () => {
    const texto = HOROSCOPE_HUB_GUIDE.sections.map((s) => `${s.heading} ${s.body}`).join(' ');
    expect(texto).not.toMatch(/\bsalud\b/i);
    expect(texto).not.toMatch(/garantiza|100 ?%|predicción exacta/i);
  });
});
