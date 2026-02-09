import { registerAs } from '@nestjs/config';

export default registerAs('ephemeris', () => ({
  // House system: Placidus (most common)
  houseSystem: process.env.EPHEMERIS_HOUSE_SYSTEM || 'placidus',

  // Zodiac: Tropical (western) vs Sidereal (vedic)
  zodiacType: process.env.EPHEMERIS_ZODIAC_TYPE || 'tropical',

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
  precision: parseInt(process.env.EPHEMERIS_PRECISION || '1', 10),
}));
