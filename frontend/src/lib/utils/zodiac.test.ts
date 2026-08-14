/**
 * Tests for Zodiac Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  getHarmonicSigns,
  getOppositeSign,
  getZodiacDateRange,
  getZodiacEncyclopediaSlug,
  getZodiacModality,
  getZodiacSignFromDate,
  getZodiacSignInfo,
  isZodiacSign,
  ZODIAC_ELEMENT_LABELS,
  ZODIAC_SIGNS_INFO,
} from '@/lib/utils/zodiac';
import {
  ZODIAC_SIGNS,
  ZODIAC_SIGN_ENCYCLOPEDIA_SLUGS,
  ZodiacSign as BirthChartZodiacSign,
} from '@/types/birth-chart.enums';
import { ZodiacSign } from '@/types/horoscope.types';

/** Meses en español, para reconstruir el rango que formatea `getZodiacDateRange`. */
const MESES_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

describe('zodiac utilities', () => {
  describe('getZodiacSignFromDate', () => {
    // Test todos los signos zodiacales
    it('should return ARIES for March 21 - April 19', () => {
      expect(getZodiacSignFromDate(new Date('1990-03-21'))).toBe(ZodiacSign.ARIES);
      expect(getZodiacSignFromDate(new Date('1990-04-10'))).toBe(ZodiacSign.ARIES);
      expect(getZodiacSignFromDate(new Date('1990-04-19'))).toBe(ZodiacSign.ARIES);
    });

    it('should return TAURUS for April 20 - May 20', () => {
      expect(getZodiacSignFromDate(new Date('1990-04-20'))).toBe(ZodiacSign.TAURUS);
      expect(getZodiacSignFromDate(new Date('1990-05-10'))).toBe(ZodiacSign.TAURUS);
      expect(getZodiacSignFromDate(new Date('1990-05-20'))).toBe(ZodiacSign.TAURUS);
    });

    it('should return GEMINI for May 21 - June 20', () => {
      expect(getZodiacSignFromDate(new Date('1990-05-21'))).toBe(ZodiacSign.GEMINI);
      expect(getZodiacSignFromDate(new Date('1990-06-10'))).toBe(ZodiacSign.GEMINI);
      expect(getZodiacSignFromDate(new Date('1990-06-20'))).toBe(ZodiacSign.GEMINI);
    });

    it('should return CANCER for June 21 - July 22', () => {
      expect(getZodiacSignFromDate(new Date('1990-06-21'))).toBe(ZodiacSign.CANCER);
      expect(getZodiacSignFromDate(new Date('1990-07-10'))).toBe(ZodiacSign.CANCER);
      expect(getZodiacSignFromDate(new Date('1990-07-22'))).toBe(ZodiacSign.CANCER);
    });

    it('should return LEO for July 23 - August 22', () => {
      expect(getZodiacSignFromDate(new Date('1990-07-23'))).toBe(ZodiacSign.LEO);
      expect(getZodiacSignFromDate(new Date('1990-08-10'))).toBe(ZodiacSign.LEO);
      expect(getZodiacSignFromDate(new Date('1990-08-22'))).toBe(ZodiacSign.LEO);
    });

    it('should return VIRGO for August 23 - September 22', () => {
      expect(getZodiacSignFromDate(new Date('1990-08-23'))).toBe(ZodiacSign.VIRGO);
      expect(getZodiacSignFromDate(new Date('1990-09-10'))).toBe(ZodiacSign.VIRGO);
      expect(getZodiacSignFromDate(new Date('1990-09-22'))).toBe(ZodiacSign.VIRGO);
    });

    it('should return LIBRA for September 23 - October 22', () => {
      expect(getZodiacSignFromDate(new Date('1990-09-23'))).toBe(ZodiacSign.LIBRA);
      expect(getZodiacSignFromDate(new Date('1990-10-10'))).toBe(ZodiacSign.LIBRA);
      expect(getZodiacSignFromDate(new Date('1990-10-22'))).toBe(ZodiacSign.LIBRA);
    });

    it('should return SCORPIO for October 23 - November 21', () => {
      expect(getZodiacSignFromDate(new Date('1990-10-23'))).toBe(ZodiacSign.SCORPIO);
      expect(getZodiacSignFromDate(new Date('1990-11-10'))).toBe(ZodiacSign.SCORPIO);
      expect(getZodiacSignFromDate(new Date('1990-11-21'))).toBe(ZodiacSign.SCORPIO);
    });

    it('should return SAGITTARIUS for November 22 - December 21', () => {
      expect(getZodiacSignFromDate(new Date('1990-11-22'))).toBe(ZodiacSign.SAGITTARIUS);
      expect(getZodiacSignFromDate(new Date('1990-12-10'))).toBe(ZodiacSign.SAGITTARIUS);
      expect(getZodiacSignFromDate(new Date('1990-12-21'))).toBe(ZodiacSign.SAGITTARIUS);
    });

    // CASO ESPECIAL: Capricornio cruza el año (Dec 22 - Jan 19)
    it('should return CAPRICORN for December 22 - January 19 (crosses year boundary)', () => {
      // Diciembre
      expect(getZodiacSignFromDate(new Date('1990-12-22'))).toBe(ZodiacSign.CAPRICORN);
      expect(getZodiacSignFromDate(new Date('1990-12-25'))).toBe(ZodiacSign.CAPRICORN);
      expect(getZodiacSignFromDate(new Date('1990-12-31'))).toBe(ZodiacSign.CAPRICORN);

      // Enero
      expect(getZodiacSignFromDate(new Date('1991-01-01'))).toBe(ZodiacSign.CAPRICORN);
      expect(getZodiacSignFromDate(new Date('1991-01-10'))).toBe(ZodiacSign.CAPRICORN);
      expect(getZodiacSignFromDate(new Date('1991-01-19'))).toBe(ZodiacSign.CAPRICORN);
    });

    it('should return AQUARIUS for January 20 - February 18', () => {
      expect(getZodiacSignFromDate(new Date('1990-01-20'))).toBe(ZodiacSign.AQUARIUS);
      expect(getZodiacSignFromDate(new Date('1990-02-10'))).toBe(ZodiacSign.AQUARIUS);
      expect(getZodiacSignFromDate(new Date('1990-02-18'))).toBe(ZodiacSign.AQUARIUS);
    });

    it('should return PISCES for February 19 - March 20', () => {
      expect(getZodiacSignFromDate(new Date('1990-02-19'))).toBe(ZodiacSign.PISCES);
      expect(getZodiacSignFromDate(new Date('1990-03-10'))).toBe(ZodiacSign.PISCES);
      expect(getZodiacSignFromDate(new Date('1990-03-20'))).toBe(ZodiacSign.PISCES);
    });

    // Test límites de signos (boundary testing)
    it('should correctly handle sign boundaries', () => {
      // Límite Aries/Tauro
      expect(getZodiacSignFromDate(new Date('1990-04-19'))).toBe(ZodiacSign.ARIES);
      expect(getZodiacSignFromDate(new Date('1990-04-20'))).toBe(ZodiacSign.TAURUS);

      // Límite Sagitario/Capricornio
      expect(getZodiacSignFromDate(new Date('1990-12-21'))).toBe(ZodiacSign.SAGITTARIUS);
      expect(getZodiacSignFromDate(new Date('1990-12-22'))).toBe(ZodiacSign.CAPRICORN);

      // Límite Capricornio/Acuario (cruza año)
      expect(getZodiacSignFromDate(new Date('1990-01-19'))).toBe(ZodiacSign.CAPRICORN);
      expect(getZodiacSignFromDate(new Date('1990-01-20'))).toBe(ZodiacSign.AQUARIUS);
    });
  });

  describe('getZodiacSignInfo', () => {
    it('should return correct info for ARIES', () => {
      const info = getZodiacSignInfo(ZodiacSign.ARIES);
      expect(info.sign).toBe(ZodiacSign.ARIES);
      expect(info.nameEs).toBe('Aries');
      expect(info.nameEn).toBe('Aries');
      expect(info.symbol).toBe('♈');
      expect(info.element).toBe('fire');
    });

    it('should return correct info for TAURUS', () => {
      const info = getZodiacSignInfo(ZodiacSign.TAURUS);
      expect(info.sign).toBe(ZodiacSign.TAURUS);
      expect(info.nameEs).toBe('Tauro');
      expect(info.nameEn).toBe('Taurus');
      expect(info.symbol).toBe('♉');
      expect(info.element).toBe('earth');
    });

    it('should return correct info for CAPRICORN', () => {
      const info = getZodiacSignInfo(ZodiacSign.CAPRICORN);
      expect(info.sign).toBe(ZodiacSign.CAPRICORN);
      expect(info.nameEs).toBe('Capricornio');
      expect(info.nameEn).toBe('Capricorn');
      expect(info.symbol).toBe('♑');
      expect(info.element).toBe('earth');
    });

    it('should return info for all zodiac signs', () => {
      const allSigns = Object.values(ZodiacSign);
      expect(allSigns).toHaveLength(12);

      allSigns.forEach((sign) => {
        const info = getZodiacSignInfo(sign);
        expect(info).toBeDefined();
        expect(info.sign).toBe(sign);
        expect(info.nameEs).toBeTruthy();
        expect(info.nameEn).toBeTruthy();
        expect(info.symbol).toBeTruthy();
        expect(['fire', 'earth', 'air', 'water']).toContain(info.element);
      });
    });
  });

  describe('ZODIAC_SIGNS_INFO constant', () => {
    it('should have info for all 12 zodiac signs', () => {
      const signs = Object.keys(ZODIAC_SIGNS_INFO);
      expect(signs).toHaveLength(12);
    });

    it('should have correct elements distribution', () => {
      const elements = Object.values(ZODIAC_SIGNS_INFO).map((info) => info.element);

      // Contar elementos (cada elemento tiene 3 signos)
      const fireCount = elements.filter((el) => el === 'fire').length;
      const earthCount = elements.filter((el) => el === 'earth').length;
      const airCount = elements.filter((el) => el === 'air').length;
      const waterCount = elements.filter((el) => el === 'water').length;

      expect(fireCount).toBe(3); // Aries, Leo, Sagitario
      expect(earthCount).toBe(3); // Tauro, Virgo, Capricornio
      expect(airCount).toBe(3); // Géminis, Libra, Acuario
      expect(waterCount).toBe(3); // Cáncer, Escorpio, Piscis
    });
  });
});

describe('isZodiacSign', () => {
  it('acepta los 12 signos válidos', () => {
    Object.values(ZodiacSign).forEach((sign) => {
      expect(isZodiacSign(sign)).toBe(true);
    });
  });

  it.each(['unicornio', 'Aries', '', 'toString', 'constructor'])(
    'rechaza %o como signo',
    (value) => {
      // `toString`/`constructor` verifican que no se consulte el prototipo:
      // un `in` ingenuo los daría por válidos y `/horoscopo/toString` pasaría.
      expect(isZodiacSign(value)).toBe(false);
    }
  );
});

/**
 * Helpers de la ficha estática del signo (T-SEO-004).
 *
 * Todos derivan del signo: nada de duplicar en datos lo que ya está en
 * `ZODIAC_DATE_RANGES` o en el orden de la rueda.
 */
describe('helpers de la ficha del signo (T-SEO-004)', () => {
  describe('getZodiacDateRange', () => {
    it('devuelve el rango de fechas en español', () => {
      expect(getZodiacDateRange(ZodiacSign.ARIES)).toBe('21 de marzo — 19 de abril');
    });

    it('resuelve el signo que cruza el año', () => {
      expect(getZodiacDateRange(ZodiacSign.CAPRICORN)).toBe('22 de diciembre — 19 de enero');
    });

    it.each(Object.values(ZodiacSign))('%s tiene rango de fechas', (sign) => {
      expect(getZodiacDateRange(sign)).toMatch(/^\d{1,2} de \w+ — \d{1,2} de \w+$/);
    });

    it('los 12 rangos son distintos entre sí', () => {
      const ranges = Object.values(ZodiacSign).map(getZodiacDateRange);

      expect(new Set(ranges).size).toBe(12);
    });
  });

  describe('getZodiacModality', () => {
    it.each([
      [ZodiacSign.ARIES, 'Cardinal'],
      [ZodiacSign.TAURUS, 'Fija'],
      [ZodiacSign.GEMINI, 'Mutable'],
      [ZodiacSign.CANCER, 'Cardinal'],
      [ZodiacSign.SCORPIO, 'Fija'],
      [ZodiacSign.PISCES, 'Mutable'],
    ] as const)('la modalidad de %s es %s', (sign, modality) => {
      expect(getZodiacModality(sign)).toBe(modality);
    });

    it('reparte 4 signos por modalidad', () => {
      const modalities = Object.values(ZodiacSign).map(getZodiacModality);

      expect(modalities.filter((m) => m === 'Cardinal')).toHaveLength(4);
      expect(modalities.filter((m) => m === 'Fija')).toHaveLength(4);
      expect(modalities.filter((m) => m === 'Mutable')).toHaveLength(4);
    });
  });

  describe('getOppositeSign', () => {
    it('el opuesto de Aries es Libra', () => {
      expect(getOppositeSign(ZodiacSign.ARIES)).toBe(ZodiacSign.LIBRA);
    });

    it.each(Object.values(ZodiacSign))('el opuesto del opuesto de %s es el mismo signo', (sign) => {
      expect(getOppositeSign(getOppositeSign(sign))).toBe(sign);
    });

    it.each(Object.values(ZodiacSign))('%s nunca es su propio opuesto', (sign) => {
      expect(getOppositeSign(sign)).not.toBe(sign);
    });
  });

  describe('getHarmonicSigns', () => {
    it('Aries sintoniza con los otros dos de fuego y con los de aire que no son su opuesto', () => {
      expect(getHarmonicSigns(ZodiacSign.ARIES)).toEqual([
        ZodiacSign.LEO,
        ZodiacSign.SAGITTARIUS,
        ZodiacSign.GEMINI,
        ZodiacSign.AQUARIUS,
      ]);
    });

    it('Cáncer sintoniza con agua y tierra, sin Capricornio', () => {
      expect(getHarmonicSigns(ZodiacSign.CANCER)).toEqual([
        ZodiacSign.SCORPIO,
        ZodiacSign.PISCES,
        ZodiacSign.TAURUS,
        ZodiacSign.VIRGO,
      ]);
    });

    it.each(Object.values(ZodiacSign))('%s no se lista a sí mismo', (sign) => {
      expect(getHarmonicSigns(sign)).not.toContain(sign);
    });

    it.each(Object.values(ZodiacSign))('%s no lista a su opuesto como afín', (sign) => {
      // El opuesto cae siempre en el elemento complementario (6 ≡ 2 en el ciclo
      // de cuatro elementos), pero es una oposición, no un sextil: la ficha lo
      // muestra aparte como eje opuesto y no puede aparecer dos veces.
      expect(getHarmonicSigns(sign)).not.toContain(getOppositeSign(sign));
    });

    it.each(Object.values(ZodiacSign))('la afinidad de %s es recíproca', (sign) => {
      getHarmonicSigns(sign).forEach((partner) => {
        expect(getHarmonicSigns(partner)).toContain(sign);
      });
    });

    it.each(Object.values(ZodiacSign))('%s sintoniza con 4 signos', (sign) => {
      expect(getHarmonicSigns(sign)).toHaveLength(4);
    });
  });

  describe('getZodiacEncyclopediaSlug', () => {
    // El artículo de la enciclopedia usa el nombre en español sin acentos como
    // slug, y no la clave en inglés del enum: `/enciclopedia/astrologia/signos/tauro`,
    // no `/taurus`. Los 12 valores se fijan acá para que un cambio en la
    // enciclopedia no deje la ficha enlazando a un 404 en silencio.
    it.each([
      [ZodiacSign.ARIES, 'aries'],
      [ZodiacSign.TAURUS, 'tauro'],
      [ZodiacSign.GEMINI, 'geminis'],
      [ZodiacSign.CANCER, 'cancer'],
      [ZodiacSign.LEO, 'leo'],
      [ZodiacSign.VIRGO, 'virgo'],
      [ZodiacSign.LIBRA, 'libra'],
      [ZodiacSign.SCORPIO, 'escorpio'],
      [ZodiacSign.SAGITTARIUS, 'sagitario'],
      [ZodiacSign.CAPRICORN, 'capricornio'],
      [ZodiacSign.AQUARIUS, 'acuario'],
      [ZodiacSign.PISCES, 'piscis'],
    ] as const)('el slug de %s es %s', (sign, slug) => {
      expect(getZodiacEncyclopediaSlug(sign)).toBe(slug);
    });
  });

  describe('ZODIAC_ELEMENT_LABELS', () => {
    it('traduce los cuatro elementos', () => {
      expect(ZODIAC_ELEMENT_LABELS.fire).toBe('Fuego');
      expect(ZODIAC_ELEMENT_LABELS.earth).toBe('Tierra');
      expect(ZODIAC_ELEMENT_LABELS.air).toBe('Aire');
      expect(ZODIAC_ELEMENT_LABELS.water).toBe('Agua');
    });
  });
});

/**
 * Coherencia con la tabla de signos de carta astral (`birth-chart.enums.ts`).
 *
 * Ese módulo ya declara fechas, modalidad y slug de enciclopedia para los mismos
 * 12 signos, con su propio enum. Los helpers de acá los derivan en vez de
 * repetirlos, así que las dos tablas pueden divergir sin que nada falle: estos
 * tests son el puente. Si alguna vez difieren, la ficha del horóscopo estaría
 * mostrando un dato distinto del que muestra la carta astral para el mismo signo.
 */
describe('coherencia con birth-chart.enums.ts', () => {
  const SLUGS_POR_VALOR: Record<string, string> = ZODIAC_SIGN_ENCYCLOPEDIA_SLUGS;
  const SIGNOS_POR_VALOR: Record<string, (typeof ZODIAC_SIGNS)[BirthChartZodiacSign]> =
    ZODIAC_SIGNS;

  const MODALIDAD_ES: Record<string, string> = {
    cardinal: 'Cardinal',
    fixed: 'Fija',
    mutable: 'Mutable',
  };

  it.each(Object.values(ZodiacSign))('el slug de enciclopedia de %s coincide', (sign) => {
    expect(getZodiacEncyclopediaSlug(sign)).toBe(SLUGS_POR_VALOR[sign]);
  });

  it.each(Object.values(ZodiacSign))('la modalidad de %s coincide', (sign) => {
    expect(getZodiacModality(sign)).toBe(MODALIDAD_ES[SIGNOS_POR_VALOR[sign].modality]);
  });

  it.each(Object.values(ZodiacSign))('el rango de fechas de %s coincide', (sign) => {
    const { startDate, endDate } = SIGNOS_POR_VALOR[sign];
    const rango = getZodiacDateRange(sign);

    expect(rango.startsWith(`${startDate.day} de `)).toBe(true);
    expect(rango.endsWith(` ${endDate.day} de ${MESES_ES[endDate.month - 1]}`)).toBe(true);
    expect(rango).toContain(MESES_ES[startDate.month - 1]);
  });

  it.each(Object.values(ZodiacSign))('el elemento de %s coincide', (sign) => {
    expect(ZODIAC_SIGNS_INFO[sign].element).toBe(SIGNOS_POR_VALOR[sign].element);
  });
});
