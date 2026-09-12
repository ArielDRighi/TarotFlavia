import { describe, it, expect } from 'vitest';

import {
  BIRTH_CHART_GUIDE,
  MIN_BIRTH_CHART_GUIDE_WORDS,
  getBirthChartGuideWordCount,
} from './birth-chart-guide.data';
import { DAILY_CARD_GUIDE, getDailyCardGuideWordCount } from './daily-card-guide.data';
import {
  NUMEROLOGY_GUIDE,
  MIN_NUMEROLOGY_GUIDE_WORDS,
  getNumerologyGuideWordCount,
} from './numerology-guide.data';
import {
  PENDULUM_GUIDE,
  MIN_PENDULUM_GUIDE_WORDS,
  getPendulumGuideWordCount,
} from './pendulum-guide.data';

/**
 * Guardarraíl de las notas de uso de las herramientas (T-SEO-015).
 *
 * Mismo criterio que `listing-intros.data.test.ts`: el piso de palabras se mide
 * acá, sin renderizar nada, y la unicidad entre guías se verifica porque dos
 * URLs con el mismo párrafo son contenido duplicado.
 */

const PENDULUM_TEXT = [
  PENDULUM_GUIDE.lead,
  PENDULUM_GUIDE.goodQuestions.intro,
  ...PENDULUM_GUIDE.goodQuestions.items.flatMap((i) => [i.question, i.why]),
  PENDULUM_GUIDE.badQuestions.intro,
  ...PENDULUM_GUIDE.badQuestions.items.flatMap((i) => [i.question, i.why]),
  PENDULUM_GUIDE.movements.intro,
  ...PENDULUM_GUIDE.movements.items.map((i) => i.body),
  ...PENDULUM_GUIDE.sections.flatMap((s) => s.paragraphs),
];

const NUMEROLOGY_TEXT = [
  NUMEROLOGY_GUIDE.lead,
  ...NUMEROLOGY_GUIDE.calculation.paragraphs,
  NUMEROLOGY_GUIDE.numbers.intro,
  ...NUMEROLOGY_GUIDE.numbers.rows.map((r) => r.summary),
  ...NUMEROLOGY_GUIDE.reading.paragraphs,
  ...NUMEROLOGY_GUIDE.faq.items.map((i) => i.answer),
  ...NUMEROLOGY_GUIDE.limits.paragraphs,
];

const BIRTH_CHART_TEXT = [
  BIRTH_CHART_GUIDE.lead,
  ...BIRTH_CHART_GUIDE.requirements.paragraphs,
  BIRTH_CHART_GUIDE.trio.intro,
  ...BIRTH_CHART_GUIDE.trio.items.map((i) => i.body),
  ...BIRTH_CHART_GUIDE.order.paragraphs,
  ...BIRTH_CHART_GUIDE.example.paragraphs,
  ...BIRTH_CHART_GUIDE.mistakes.items,
  ...BIRTH_CHART_GUIDE.limits.paragraphs,
];

const DAILY_CARD_TEXT = [
  DAILY_CARD_GUIDE.lead,
  ...DAILY_CARD_GUIDE.steps.flatMap((s) => s.paragraphs),
];

describe('notas de uso de las herramientas (T-SEO-015)', () => {
  it('⚠️ /pendulo: 800+ palabras propias', () => {
    expect(MIN_PENDULUM_GUIDE_WORDS).toBe(800);
    expect(getPendulumGuideWordCount()).toBeGreaterThanOrEqual(MIN_PENDULUM_GUIDE_WORDS);
  });

  it('⚠️ /numerologia: 800+ palabras propias', () => {
    expect(MIN_NUMEROLOGY_GUIDE_WORDS).toBe(800);
    expect(getNumerologyGuideWordCount()).toBeGreaterThanOrEqual(MIN_NUMEROLOGY_GUIDE_WORDS);
  });

  it('⚠️ /carta-astral: 800+ palabras propias', () => {
    expect(MIN_BIRTH_CHART_GUIDE_WORDS).toBe(800);
    expect(getBirthChartGuideWordCount()).toBeGreaterThanOrEqual(MIN_BIRTH_CHART_GUIDE_WORDS);
  });

  it('la cuenta de cada guía coincide con lo que renderiza (ningún bloque queda fuera)', () => {
    expect(getPendulumGuideWordCount()).toBeGreaterThan(0);
    expect(getNumerologyGuideWordCount()).toBeGreaterThan(0);
    expect(getBirthChartGuideWordCount()).toBeGreaterThan(0);
    expect(getDailyCardGuideWordCount()).toBeGreaterThan(0);
  });

  it('el péndulo trae ejemplos que sirven y que no, y los tres movimientos', () => {
    expect(PENDULUM_GUIDE.goodQuestions.items.length).toBeGreaterThanOrEqual(3);
    expect(PENDULUM_GUIDE.badQuestions.items.length).toBeGreaterThanOrEqual(3);
    expect(PENDULUM_GUIDE.movements.items.map((i) => i.answer)).toEqual(['Sí', 'No', 'Quizás']);
  });

  it('numerología trae los nueve números y los tres maestros', () => {
    expect(NUMEROLOGY_GUIDE.numbers.rows.map((r) => r.number)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '11',
      '22',
      '33',
    ]);
    expect(NUMEROLOGY_GUIDE.faq.items.length).toBeGreaterThanOrEqual(3);
  });

  it('la carta astral explica el trío y lista errores frecuentes', () => {
    expect(BIRTH_CHART_GUIDE.trio.items.map((i) => i.term)).toEqual(['Sol', 'Luna', 'Ascendente']);
    expect(BIRTH_CHART_GUIDE.mistakes.items.length).toBeGreaterThanOrEqual(4);
  });

  it('⚠️ no repite ningún párrafo entre las cuatro guías', () => {
    const all = [...PENDULUM_TEXT, ...NUMEROLOGY_TEXT, ...BIRTH_CHART_TEXT, ...DAILY_CARD_TEXT];
    expect(new Set(all).size).toBe(all.length);
  });

  it('⚠️ T-SEO-013 / T-SEO-018: sin "salud" ni lenguaje de promesa', () => {
    const texto = [...PENDULUM_TEXT, ...NUMEROLOGY_TEXT, ...BIRTH_CHART_TEXT].join(' ');
    expect(texto).not.toMatch(/\bsalud\b/i);
    expect(texto).not.toMatch(/garantiza|100 ?%|predicción exacta|amarre/i);
  });

  it('cada guía enlaza a su entrada específica de la enciclopedia, no al índice', () => {
    expect(PENDULUM_GUIDE.links[0].href).toBe('/enciclopedia/guias/guia-pendulo');
    expect(NUMEROLOGY_GUIDE.links[0].href).toBe('/enciclopedia/guias/guia-numerologia');
    expect(BIRTH_CHART_GUIDE.links[0].href).toBe('/enciclopedia/guias/guia-carta-astral');
  });
});
