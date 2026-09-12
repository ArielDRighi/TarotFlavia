/**
 * horoscope-server - Tests (T-SEO-016)
 *
 * Resolución server-side del horóscopo del día contra la zona horaria canónica
 * del sitio (Buenos Aires), con fallback al día anterior. Es lo que ponen en el
 * HTML `/horoscopo/[sign]` y, más adelante, la portada (T-SEO-014) y el hub
 * `/horoscopo` (T-SEO-015).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { getCanonicalDailyHoroscopes, getCanonicalHoroscopeForSign } from './horoscope-server';
import { ZodiacSign } from '@/types/horoscope.types';
import type { DailyHoroscope } from '@/types/horoscope.types';

const mockGetHoroscopeByDate = vi.fn();

vi.mock('./horoscope-api', () => ({
  getHoroscopeByDate: (date: string) => mockGetHoroscopeByDate(date),
}));

// 12:00 UTC del 12 = 09:00 en Buenos Aires: día canónico 2026-09-12.
const NOW = new Date('2026-09-12T12:00:00.000Z');
const TODAY = '2026-09-12';
const YESTERDAY = '2026-09-11';

function buildHoroscope(sign: ZodiacSign, date: string, id = 1): DailyHoroscope {
  return {
    id,
    zodiacSign: sign,
    horoscopeDate: date,
    generalContent: `Predicción de ${sign} para ${date}`,
    areas: {
      love: { content: 'Amor', score: 7 },
      wellness: { content: 'Bienestar', score: 6 },
      money: { content: 'Dinero', score: 5 },
    },
    luckyNumber: 3,
    luckyColor: 'Azul',
    luckyTime: 'Tarde',
  };
}

function buildAllSigns(date: string): DailyHoroscope[] {
  return Object.values(ZodiacSign).map((sign, index) => buildHoroscope(sign, date, index + 1));
}

describe('getCanonicalDailyHoroscopes', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    mockGetHoroscopeByDate.mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('devuelve los 12 horóscopos del día canónico (Buenos Aires)', async () => {
    mockGetHoroscopeByDate.mockResolvedValueOnce(buildAllSigns(TODAY));

    const result = await getCanonicalDailyHoroscopes();

    expect(mockGetHoroscopeByDate).toHaveBeenCalledTimes(1);
    expect(mockGetHoroscopeByDate).toHaveBeenCalledWith(TODAY);
    expect(result).toBeDefined();
    expect(result?.canonicalDate).toBe(TODAY);
    expect(result?.horoscopes).toHaveLength(12);
    expect(result?.isShowingPreviousDay).toBe(false);
  });

  it('cae al día anterior si el canónico todavía no fue generado', async () => {
    // El backend responde `[]` (no 404) cuando no hay horóscopos de esa fecha.
    mockGetHoroscopeByDate
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(buildAllSigns(YESTERDAY));

    const result = await getCanonicalDailyHoroscopes();

    expect(mockGetHoroscopeByDate).toHaveBeenNthCalledWith(1, TODAY);
    expect(mockGetHoroscopeByDate).toHaveBeenNthCalledWith(2, YESTERDAY);
    expect(result?.canonicalDate).toBe(TODAY);
    expect(result?.horoscopes[0]?.horoscopeDate).toBe(YESTERDAY);
    expect(result?.isShowingPreviousDay).toBe(true);
  });

  it('devuelve una lista vacía sin marcar "día anterior" si tampoco hay de ayer', async () => {
    mockGetHoroscopeByDate.mockResolvedValue([]);

    const result = await getCanonicalDailyHoroscopes();

    expect(result?.horoscopes).toEqual([]);
    expect(result?.isShowingPreviousDay).toBe(false);
  });

  it('degrada a undefined (y avisa) si la API falla: la ficha del signo se sirve igual', async () => {
    mockGetHoroscopeByDate.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const result = await getCanonicalDailyHoroscopes();

    expect(result).toBeUndefined();
    expect(console.warn).toHaveBeenCalled();
  });

  it('degrada a undefined si falla el fallback a ayer', async () => {
    mockGetHoroscopeByDate.mockResolvedValueOnce([]).mockRejectedValueOnce(new Error('timeout'));

    const result = await getCanonicalDailyHoroscopes();

    expect(result).toBeUndefined();
  });
});

describe('getCanonicalHoroscopeForSign', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    mockGetHoroscopeByDate.mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('extrae el horóscopo del signo pedido de la lista del día', async () => {
    mockGetHoroscopeByDate.mockResolvedValueOnce(buildAllSigns(TODAY));

    const result = await getCanonicalHoroscopeForSign(ZodiacSign.LEO);

    expect(result?.horoscope.zodiacSign).toBe(ZodiacSign.LEO);
    expect(result?.canonicalDate).toBe(TODAY);
    expect(result?.isShowingPreviousDay).toBe(false);
  });

  it('propaga la marca de "día anterior" cuando se sirvió el fallback', async () => {
    mockGetHoroscopeByDate
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(buildAllSigns(YESTERDAY));

    const result = await getCanonicalHoroscopeForSign(ZodiacSign.ARIES);

    expect(result?.horoscope.horoscopeDate).toBe(YESTERDAY);
    expect(result?.isShowingPreviousDay).toBe(true);
  });

  it('devuelve undefined si el signo no está en la lista (generación parcial)', async () => {
    mockGetHoroscopeByDate.mockResolvedValueOnce([buildHoroscope(ZodiacSign.ARIES, TODAY)]);

    const result = await getCanonicalHoroscopeForSign(ZodiacSign.PISCES);

    expect(result).toBeUndefined();
  });

  it('devuelve undefined si la API falló', async () => {
    mockGetHoroscopeByDate.mockRejectedValueOnce(new Error('500'));

    const result = await getCanonicalHoroscopeForSign(ZodiacSign.ARIES);

    expect(result).toBeUndefined();
  });
});
