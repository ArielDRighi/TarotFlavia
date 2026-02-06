/**
 * Enum de planetas utilizados en carta astral
 *
 * Representa los 10 planetas principales utilizados en astrología occidental:
 * - Planetas personales: Sol, Luna, Mercurio, Venus, Marte
 * - Planetas sociales: Júpiter, Saturno
 * - Planetas transpersonales: Urano, Neptuno, Plutón
 */
export enum Planet {
  SUN = 'sun',
  MOON = 'moon',
  MERCURY = 'mercury',
  VENUS = 'venus',
  MARS = 'mars',
  JUPITER = 'jupiter',
  SATURN = 'saturn',
  URANUS = 'uranus',
  NEPTUNE = 'neptune',
  PLUTO = 'pluto',
}

/**
 * Metadata de planetas para UI y cálculos astronómicos
 *
 * Contiene información descriptiva de cada planeta:
 * - name: Nombre en español para textos user-facing
 * - symbol: Símbolo visual del planeta (HTML/SVG)
 * - unicode: Código Unicode del símbolo astrológico
 */
export const PlanetMetadata: Record<
  Planet,
  {
    name: string;
    symbol: string;
    unicode: string;
  }
> = {
  [Planet.SUN]: {
    name: 'Sol',
    symbol: '☉',
    unicode: '\u2609',
  },
  [Planet.MOON]: {
    name: 'Luna',
    symbol: '☽',
    unicode: '\u263D',
  },
  [Planet.MERCURY]: {
    name: 'Mercurio',
    symbol: '☿',
    unicode: '\u263F',
  },
  [Planet.VENUS]: {
    name: 'Venus',
    symbol: '♀',
    unicode: '\u2640',
  },
  [Planet.MARS]: {
    name: 'Marte',
    symbol: '♂',
    unicode: '\u2642',
  },
  [Planet.JUPITER]: {
    name: 'Júpiter',
    symbol: '♃',
    unicode: '\u2643',
  },
  [Planet.SATURN]: {
    name: 'Saturno',
    symbol: '♄',
    unicode: '\u2644',
  },
  [Planet.URANUS]: {
    name: 'Urano',
    symbol: '♅',
    unicode: '\u2645',
  },
  [Planet.NEPTUNE]: {
    name: 'Neptuno',
    symbol: '♆',
    unicode: '\u2646',
  },
  [Planet.PLUTO]: {
    name: 'Plutón',
    symbol: '♇',
    unicode: '\u2647',
  },
};
