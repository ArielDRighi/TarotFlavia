import { describe, it, expect } from 'vitest';

import {
  CHINESE_HOROSCOPE_GUIDE,
  MIN_CHINESE_HOROSCOPE_GUIDE_WORDS,
  getChineseHoroscopeGuideWordCount,
} from './chinese-horoscope-guide.data';

describe('CHINESE_HOROSCOPE_GUIDE (T-SEO-015)', () => {
  it('⚠️ aporta el piso que lleva a /horoscopo-chino por encima de las 500 palabras del menú', () => {
    expect(getChineseHoroscopeGuideWordCount()).toBeGreaterThanOrEqual(
      MIN_CHINESE_HOROSCOPE_GUIDE_WORDS
    );
  });

  it('explica el Año Nuevo chino, el elemento y cómo leer la predicción', () => {
    const headings = CHINESE_HOROSCOPE_GUIDE.sections.map((s) => s.heading).join(' ');
    expect(headings).toMatch(/enero o febrero/i);
    expect(headings).toMatch(/elemento/i);
    expect(headings).toMatch(/predicción anual/i);
  });

  it('⚠️ T-SEO-013 / T-SEO-018: sin "salud" ni lenguaje de promesa', () => {
    const texto = [
      CHINESE_HOROSCOPE_GUIDE.lead,
      ...CHINESE_HOROSCOPE_GUIDE.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
    ].join(' ');
    expect(texto).not.toMatch(/\bsalud\b/i);
    expect(texto).not.toMatch(/garantiza|100 ?%|predicción exacta/i);
  });
});
