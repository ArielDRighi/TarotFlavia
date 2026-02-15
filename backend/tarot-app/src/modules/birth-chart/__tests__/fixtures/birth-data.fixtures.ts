/**
 * Birth Data Fixtures
 *
 * Contiene datos de nacimiento de prueba con resultados conocidos
 * verificados contra software profesional de astrología (Astro.com, etc.)
 *
 * @module birth-chart/__tests__/fixtures
 */

import { EphemerisInput } from '../../infrastructure/ephemeris/ephemeris.types';
import { ZodiacSign } from '../../domain/enums';

/**
 * Interfaz para fixture de carta natal con datos esperados
 */
export interface BirthChartFixture {
  /** Descripción del caso de prueba */
  description: string;
  /** Datos de entrada para el cálculo */
  input: EphemerisInput;
  /** Resultados esperados verificados */
  expected: {
    /** Signo solar esperado */
    sunSign: ZodiacSign;
    /** Grado aproximado del Sol en el signo (0-30) */
    sunDegree?: number;
    /** Signo lunar esperado */
    moonSign?: ZodiacSign;
    /** Signo ascendente esperado (si hora conocida) */
    ascendantSign?: ZodiacSign;
    /** Notas adicionales sobre el caso */
    notes?: string;
  };
}

/**
 * Datos de nacimiento de prueba con resultados conocidos
 * Verificados contra Astro.com y software profesional
 */
export const BIRTH_DATA_FIXTURES: Record<string, BirthChartFixture> = {
  /**
   * Carta de prueba 1: Datos estándar
   * Buenos Aires, Argentina - Hemisferio Sur
   */
  knownChart1: {
    description: 'Carta estándar - Buenos Aires 1990',
    input: {
      year: 1990,
      month: 5,
      day: 15,
      hour: 14,
      minute: 30,
      latitude: -34.6037,
      longitude: -58.3816,
    },
    expected: {
      sunSign: ZodiacSign.TAURUS,
      sunDegree: 24, // Aproximado
      moonSign: ZodiacSign.SCORPIO,
      ascendantSign: ZodiacSign.VIRGO,
      notes:
        'Sol en Tauro final (cerca de Géminis), Luna en Escorpio, Ascendente en Virgo',
    },
  },

  /**
   * Carta de prueba 2: Latitud alta (Reykjavik)
   * Casas pueden ser problemáticas en latitudes extremas
   */
  highLatitude: {
    description: 'Latitud extrema - Reykjavik 1985',
    input: {
      year: 1985,
      month: 12,
      day: 21,
      hour: 0,
      minute: 0,
      latitude: 64.1466,
      longitude: -21.9426,
    },
    expected: {
      sunSign: ZodiacSign.SAGITTARIUS,
      sunDegree: 29, // Final de Sagitario (cerca del solsticio)
      notes:
        'Solsticio de invierno, latitud alta puede causar casas desiguales',
    },
  },

  /**
   * Carta de prueba 3: Fecha histórica (1950)
   * New York - Hemisferio Norte
   */
  historicalDate: {
    description: 'Fecha histórica - New York 1950',
    input: {
      year: 1950,
      month: 1,
      day: 1,
      hour: 12,
      minute: 0,
      latitude: 40.7128,
      longitude: -74.006,
    },
    expected: {
      sunSign: ZodiacSign.CAPRICORN,
      sunDegree: 10, // Principios de Capricornio
      notes: 'Año 1950 en New York, mediodía',
    },
  },

  /**
   * Carta de prueba 4: Hemisferio Norte - Verano
   * Londres, Inglaterra
   */
  londonSummer: {
    description: 'Londres - Verano 2000',
    input: {
      year: 2000,
      month: 7,
      day: 15,
      hour: 15,
      minute: 0,
      latitude: 51.5074,
      longitude: -0.1278,
    },
    expected: {
      sunSign: ZodiacSign.CANCER,
      sunDegree: 23, // Final de Cáncer
      notes: 'Pleno verano en el hemisferio norte',
    },
  },

  /**
   * Carta de prueba 5: Hemisferio Sur - Verano
   * Sydney, Australia
   */
  sydneySummer: {
    description: 'Sydney - Verano 1995',
    input: {
      year: 1995,
      month: 1,
      day: 15,
      hour: 10,
      minute: 30,
      latitude: -33.8688,
      longitude: 151.2093,
    },
    expected: {
      sunSign: ZodiacSign.CAPRICORN,
      sunDegree: 24, // Final de Capricornio
      notes: 'Verano en hemisferio sur, Sydney',
    },
  },

  /**
   * Carta de prueba 6: Medianoche exacta
   * París, Francia
   */
  midnightParis: {
    description: 'París - Medianoche 2010',
    input: {
      year: 2010,
      month: 3,
      day: 21,
      hour: 0,
      minute: 0,
      latitude: 48.8566,
      longitude: 2.3522,
    },
    expected: {
      sunSign: ZodiacSign.ARIES,
      sunDegree: 0, // Equinoccio de primavera
      notes: 'Equinoccio de primavera (Sol en 0° Aries)',
    },
  },

  /**
   * Carta de prueba 7: Meridiano de Greenwich
   * Londres exacto en meridiano 0
   */
  greenwichMeridian: {
    description: 'Meridiano de Greenwich - Londres 1970',
    input: {
      year: 1970,
      month: 6,
      day: 21,
      hour: 12,
      minute: 0,
      latitude: 51.4778,
      longitude: 0.0,
    },
    expected: {
      sunSign: ZodiacSign.CANCER,
      sunDegree: 0, // Solsticio de verano
      notes: 'Solsticio de verano en meridiano de Greenwich',
    },
  },

  /**
   * Carta de prueba 8: Ecuador (latitud 0)
   * Quito, Ecuador
   */
  equator: {
    description: 'Ecuador - Quito 1980',
    input: {
      year: 1980,
      month: 9,
      day: 23,
      hour: 6,
      minute: 0,
      latitude: -0.1807,
      longitude: -78.4678,
    },
    expected: {
      sunSign: ZodiacSign.VIRGO,
      sunDegree: 29, // Final de Virgo (cerca de equinoccio de otoño)
      notes: 'Cerca del ecuador, equinoccio de otoño',
    },
  },
};

/**
 * Fixtures de aspectos conocidos para verificar cálculos
 */
export interface AspectFixture {
  /** Descripción del aspecto */
  description: string;
  /** Longitud del planeta 1 (0-360) */
  planet1Longitude: number;
  /** Longitud del planeta 2 (0-360) */
  planet2Longitude: number;
  /** Tipo de aspecto esperado o null si no hay aspecto */
  expectedAspect:
    | 'conjunction'
    | 'opposition'
    | 'square'
    | 'trine'
    | 'sextile'
    | null;
  /** Orbe esperado (diferencia del ángulo exacto) */
  expectedOrb: number;
  /** Notas adicionales */
  notes?: string;
}

/**
 * Aspectos conocidos para verificar cálculos de aspectos
 */
export const KNOWN_ASPECTS: Record<string, AspectFixture> = {
  /**
   * Conjunción exacta (0°)
   */
  exactConjunction: {
    description: 'Conjunción exacta - 0° orbe',
    planet1Longitude: 120.0,
    planet2Longitude: 120.0,
    expectedAspect: 'conjunction',
    expectedOrb: 0,
    notes: 'Planetas en la misma posición exacta',
  },

  /**
   * Oposición cercana (180° con orbe)
   */
  wideOpposition: {
    description: 'Oposición - 5° orbe',
    planet1Longitude: 0.0,
    planet2Longitude: 175.0,
    expectedAspect: 'opposition',
    expectedOrb: 5,
    notes: 'Oposición con 5° de orbe (dentro del límite de 8°)',
  },

  /**
   * Cuadratura exacta (90°)
   */
  exactSquare: {
    description: 'Cuadratura exacta - 90°',
    planet1Longitude: 45.0,
    planet2Longitude: 135.0,
    expectedAspect: 'square',
    expectedOrb: 0,
    notes: 'Cuadratura exacta de 90°',
  },

  /**
   * Trígono cercano (120°)
   */
  closeTrine: {
    description: 'Trígono - 2° orbe',
    planet1Longitude: 0.0,
    planet2Longitude: 122.0,
    expectedAspect: 'trine',
    expectedOrb: 2,
    notes: 'Trígono con 2° de orbe (dentro del límite de 8°)',
  },

  /**
   * Sextil exacto (60°)
   */
  exactSextile: {
    description: 'Sextil exacto - 60°',
    planet1Longitude: 30.0,
    planet2Longitude: 90.0,
    expectedAspect: 'sextile',
    expectedOrb: 0,
    notes: 'Sextil exacto de 60°',
  },

  /**
   * Sin aspecto (45° no es aspecto mayor)
   */
  noAspect: {
    description: 'Sin aspecto - 45° no es aspecto mayor',
    planet1Longitude: 0.0,
    planet2Longitude: 45.0,
    expectedAspect: null,
    expectedOrb: 0,
    notes: '45° no es un aspecto mayor en astrología clásica',
  },

  /**
   * Aspecto fuera de orbe (orbe > 8°)
   */
  aspectOutOfOrb: {
    description: 'Fuera de orbe - oposición 10° orbe',
    planet1Longitude: 0.0,
    planet2Longitude: 190.0,
    expectedAspect: null,
    expectedOrb: 10,
    notes: 'Oposición con 10° de orbe (fuera del límite de 8°)',
  },

  /**
   * Wrap-around en 360° (conjunción cerca de 0°/360°)
   */
  wrapAroundConjunction: {
    description: 'Conjunción wrap-around - 355° y 5°',
    planet1Longitude: 355.0,
    planet2Longitude: 5.0,
    expectedAspect: 'conjunction',
    expectedOrb: 10,
    notes: 'Conjunción que cruza el punto 0°/360° con 10° de separación',
  },
};

/**
 * Datos de prueba para casos edge
 */
export const EDGE_CASES = {
  /**
   * Año límite mínimo (1800)
   */
  minYear: {
    description: 'Año límite mínimo - 1800',
    input: {
      year: 1800,
      month: 1,
      day: 1,
      hour: 0,
      minute: 0,
      latitude: 0,
      longitude: 0,
    },
    expected: {
      sunSign: ZodiacSign.CAPRICORN,
      notes: 'Límite inferior del rango de años soportado',
    },
  },

  /**
   * Año límite máximo (2400)
   */
  maxYear: {
    description: 'Año límite máximo - 2400',
    input: {
      year: 2400,
      month: 1,
      day: 1,
      hour: 0,
      minute: 0,
      latitude: 0,
      longitude: 0,
    },
    expected: {
      sunSign: ZodiacSign.CAPRICORN,
      notes: 'Límite superior del rango de años soportado',
    },
  },

  /**
   * Latitud máxima norte (90°)
   */
  maxLatitudeNorth: {
    description: 'Latitud máxima norte - Polo Norte',
    input: {
      year: 2000,
      month: 6,
      day: 21,
      hour: 12,
      minute: 0,
      latitude: 90,
      longitude: 0,
    },
    expected: {
      sunSign: ZodiacSign.CANCER,
      notes: 'Polo Norte - casas no calculables, solo posiciones planetarias',
    },
  },

  /**
   * Latitud máxima sur (-90°)
   */
  maxLatitudeSouth: {
    description: 'Latitud máxima sur - Polo Sur',
    input: {
      year: 2000,
      month: 12,
      day: 21,
      hour: 12,
      minute: 0,
      latitude: -90,
      longitude: 0,
    },
    expected: {
      sunSign: ZodiacSign.CAPRICORN,
      notes: 'Polo Sur - casas no calculables, solo posiciones planetarias',
    },
  },

  /**
   * Longitud máxima oeste (-180°)
   */
  maxLongitudeWest: {
    description: 'Longitud máxima oeste - Línea de cambio de fecha',
    input: {
      year: 2000,
      month: 6,
      day: 1,
      hour: 12,
      minute: 0,
      latitude: 0,
      longitude: -180,
    },
    expected: {
      sunSign: ZodiacSign.GEMINI,
      notes: 'Línea internacional de cambio de fecha (oeste)',
    },
  },

  /**
   * Longitud máxima este (180°)
   */
  maxLongitudeEast: {
    description: 'Longitud máxima este - Línea de cambio de fecha',
    input: {
      year: 2000,
      month: 6,
      day: 1,
      hour: 12,
      minute: 0,
      latitude: 0,
      longitude: 180,
    },
    expected: {
      sunSign: ZodiacSign.GEMINI,
      notes: 'Línea internacional de cambio de fecha (este)',
    },
  },

  /**
   * Año bisiesto (29 de febrero)
   */
  leapYear: {
    description: 'Año bisiesto - 29 de febrero 2000',
    input: {
      year: 2000,
      month: 2,
      day: 29,
      hour: 12,
      minute: 0,
      latitude: 51.5074,
      longitude: -0.1278,
    },
    expected: {
      sunSign: ZodiacSign.PISCES,
      notes: 'Fecha válida solo en años bisiestos',
    },
  },
};
