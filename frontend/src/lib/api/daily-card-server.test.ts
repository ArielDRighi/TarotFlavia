/**
 * daily-card-server - Tests (T-SEO-014)
 *
 * La carta del día de la portada es una sola para todo el sitio, elegida de
 * forma determinista para el día canónico (Buenos Aires). No usa el sorteo por
 * visitante de `/carta-del-dia`: el HTML cacheado por ISR tiene que mostrar la
 * misma carta a todos y no consumir el cupo anónimo de nadie.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { getCanonicalDailyCard, pickDailyCardIndex } from './daily-card-server';
import { ArcanaType } from '@/types/encyclopedia.types';
import type { CardDetail, CardSummary } from '@/types/encyclopedia.types';

const mockGetCards = vi.fn();
const mockGetCardBySlug = vi.fn();

vi.mock('./encyclopedia-api', () => ({
  getCards: () => mockGetCards(),
  getCardBySlug: (slug: string) => mockGetCardBySlug(slug),
}));

// 12:00 UTC del 12 = 09:00 en Buenos Aires: día canónico 2026-09-12.
const NOW = new Date('2026-09-12T12:00:00.000Z');
const TODAY = '2026-09-12';

function buildSummary(id: number): CardSummary {
  return {
    id,
    slug: `carta-${id}`,
    nameEs: `Carta ${id}`,
    arcanaType: ArcanaType.MAJOR,
    number: id,
    suit: null,
    thumbnailUrl: `/images/tarot/carta-${id}.webp`,
  };
}

function buildDetail(id: number): CardDetail {
  return {
    ...buildSummary(id),
    nameEn: `Card ${id}`,
    romanNumeral: null,
    courtRank: null,
    element: null,
    planet: null,
    zodiacSign: null,
    meaningUpright: 'Significado al derecho',
    meaningReversed: 'Significado invertido',
    description: null,
    keywords: { upright: [], reversed: [] },
    imageUrl: `/images/tarot/carta-${id}.webp`,
    relatedCards: null,
  };
}

describe('pickDailyCardIndex', () => {
  it('es determinista: la misma fecha siempre da el mismo índice', () => {
    expect(pickDailyCardIndex('2026-09-12', 78)).toBe(pickDailyCardIndex('2026-09-12', 78));
  });

  it('cae dentro del rango del mazo', () => {
    for (let day = 1; day <= 28; day += 1) {
      const index = pickDailyCardIndex(`2026-02-${String(day).padStart(2, '0')}`, 78);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(78);
    }
  });

  it('reparte: días consecutivos no caen siempre en la misma carta', () => {
    const indexes = new Set(
      Array.from({ length: 30 }, (_, day) =>
        pickDailyCardIndex(`2026-09-${String(day + 1).padStart(2, '0')}`, 78)
      )
    );
    expect(indexes.size).toBeGreaterThan(20);
  });

  it('devuelve 0 con un mazo vacío en vez de NaN', () => {
    expect(pickDailyCardIndex('2026-09-12', 0)).toBe(0);
  });
});

describe('getCanonicalDailyCard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    mockGetCards.mockReset();
    mockGetCardBySlug.mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('elige una carta del mazo por el día canónico y trae su ficha completa', async () => {
    const deck = [buildSummary(3), buildSummary(1), buildSummary(2)];
    mockGetCards.mockResolvedValue(deck);
    mockGetCardBySlug.mockImplementation(async (slug: string) =>
      buildDetail(Number(slug.replace('carta-', '')))
    );

    const result = await getCanonicalDailyCard();

    expect(result?.canonicalDate).toBe(TODAY);
    // El mazo se ordena por id antes de elegir: el orden de la API no cambia la carta.
    const expectedId = [1, 2, 3][pickDailyCardIndex(TODAY, 3)];
    expect(result?.card.id).toBe(expectedId);
    expect(mockGetCardBySlug).toHaveBeenCalledWith(`carta-${expectedId}`);
  });

  it('degrada a undefined si el listado falla, sin tirar el render', async () => {
    mockGetCards.mockRejectedValue(new Error('API caída'));

    await expect(getCanonicalDailyCard()).resolves.toBeUndefined();
    expect(console.warn).toHaveBeenCalled();
  });

  it('degrada a undefined si la ficha falla', async () => {
    mockGetCards.mockResolvedValue([buildSummary(1)]);
    mockGetCardBySlug.mockRejectedValue(new Error('API caída'));

    await expect(getCanonicalDailyCard()).resolves.toBeUndefined();
  });

  it('degrada a undefined si el mazo viene vacío', async () => {
    mockGetCards.mockResolvedValue([]);

    await expect(getCanonicalDailyCard()).resolves.toBeUndefined();
    expect(mockGetCardBySlug).not.toHaveBeenCalled();
  });
});
