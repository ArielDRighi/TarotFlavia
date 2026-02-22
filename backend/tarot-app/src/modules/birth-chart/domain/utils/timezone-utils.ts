import { DateTime } from 'luxon';

export interface LocalBirthDateTime {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number; // 0-23 (local)
  minute: number; // 0-59 (local)
}

export interface UtcDateTime {
  year: number;
  month: number;
  day: number;
  hour: number; // 0-23 (UTC)
  minute: number; // 0-59 (UTC)
}

/**
 * Convierte fecha/hora local a componentes UTC respetando DST histórico (base IANA).
 * Swiss Ephemeris requiere UT como entrada (ver sweph.calc_ut / sweph.julday).
 */
export function localToUtc(
  local: LocalBirthDateTime,
  ianaTimezone: string,
): UtcDateTime {
  const localDt = DateTime.fromObject(
    {
      year: local.year,
      month: local.month,
      day: local.day,
      hour: local.hour,
      minute: local.minute,
      second: 0,
    },
    { zone: ianaTimezone },
  );

  if (!localDt.isValid) {
    throw new Error(
      `Cannot resolve timezone "${ianaTimezone}" for date ` +
        `${local.year}-${local.month}-${local.day}: ${localDt.invalidExplanation ?? 'unknown error'}`,
    );
  }

  const utcDt = localDt.toUTC();
  return {
    year: utcDt.year,
    month: utcDt.month,
    day: utcDt.day,
    hour: utcDt.hour,
    minute: utcDt.minute,
  };
}
