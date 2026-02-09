import { registerAs } from '@nestjs/config';

export default registerAs('ephemeris', () => {
  const DEFAULT_PRECISION = 1;
  const rawPrecision = process.env.EPHEMERIS_PRECISION;
  const parsedPrecision = rawPrecision
    ? Number(rawPrecision)
    : DEFAULT_PRECISION;

  return {
    // House system: Placidus (most common)
    houseSystem: process.env.EPHEMERIS_HOUSE_SYSTEM || 'placidus',

    // Planets to calculate
    planets: [
      'sun',
      'moon',
      'mercury',
      'venus',
      'mars',
      'jupiter',
      'saturn',
      'uranus',
      'neptune',
      'pluto',
    ],

    // Calculation precision (arc minutes)
    precision: Number.isFinite(parsedPrecision)
      ? parsedPrecision
      : DEFAULT_PRECISION,
  };
});
