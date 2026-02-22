import { localToUtc } from './timezone-utils';

describe('localToUtc', () => {
  it('CASO DEL BUG: convierte 01:07 Argentina (UTC-3) → 04:07 UTC', () => {
    const result = localToUtc(
      { year: 2011, month: 10, day: 18, hour: 1, minute: 7 },
      'America/Argentina/Cordoba',
    );
    expect(result).toEqual({
      year: 2011,
      month: 10,
      day: 18,
      hour: 4,
      minute: 7,
    });
  });

  it('convierte hora local UTC-3 (mismo día)', () => {
    const result = localToUtc(
      { year: 2023, month: 6, day: 15, hour: 10, minute: 30 },
      'America/Argentina/Buenos_Aires',
    );
    expect(result).toEqual({
      year: 2023,
      month: 6,
      day: 15,
      hour: 13,
      minute: 30,
    });
  });

  it('maneja cruce de medianoche: 22:30 UTC-3 → 01:30 UTC día siguiente', () => {
    const result = localToUtc(
      { year: 2023, month: 3, day: 20, hour: 22, minute: 30 },
      'America/Argentina/Buenos_Aires',
    );
    expect(result).toEqual({
      year: 2023,
      month: 3,
      day: 21,
      hour: 1,
      minute: 30,
    });
  });

  it('maneja cruce de año: 31 dic 23:00 UTC-3 → 1 ene 02:00 UTC', () => {
    const result = localToUtc(
      { year: 2022, month: 12, day: 31, hour: 23, minute: 0 },
      'America/Argentina/Buenos_Aires',
    );
    expect(result).toEqual({
      year: 2023,
      month: 1,
      day: 1,
      hour: 2,
      minute: 0,
    });
  });

  it('no modifica la hora si la zona es UTC', () => {
    const result = localToUtc(
      { year: 2020, month: 7, day: 4, hour: 12, minute: 0 },
      'UTC',
    );
    expect(result).toEqual({
      year: 2020,
      month: 7,
      day: 4,
      hour: 12,
      minute: 0,
    });
  });

  it('convierte zona UTC+5:30 correctamente (India, 14:30 → 09:00 UTC)', () => {
    const result = localToUtc(
      { year: 1990, month: 8, day: 15, hour: 14, minute: 30 },
      'Asia/Kolkata',
    );
    expect(result).toEqual({
      year: 1990,
      month: 8,
      day: 15,
      hour: 9,
      minute: 0,
    });
  });

  it('maneja DST histórico de Europa: verano CEST (UTC+2)', () => {
    // En julio 2005, España está en CEST = UTC+2
    const result = localToUtc(
      { year: 2005, month: 7, day: 10, hour: 12, minute: 0 },
      'Europe/Madrid',
    );
    expect(result).toEqual({
      year: 2005,
      month: 7,
      day: 10,
      hour: 10,
      minute: 0,
    });
  });

  it('maneja DST histórico de Europa: invierno CET (UTC+1)', () => {
    // En enero 2005, España está en CET = UTC+1
    const result = localToUtc(
      { year: 2005, month: 1, day: 10, hour: 12, minute: 0 },
      'Europe/Madrid',
    );
    expect(result).toEqual({
      year: 2005,
      month: 1,
      day: 10,
      hour: 11,
      minute: 0,
    });
  });

  it('lanza Error si el timezone IANA no es válido', () => {
    expect(() =>
      localToUtc(
        { year: 2023, month: 6, day: 15, hour: 10, minute: 30 },
        'Invalid/Timezone',
      ),
    ).toThrow();
  });
});
