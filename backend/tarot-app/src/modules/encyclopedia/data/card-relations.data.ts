/**
 * Relaciones entre cartas del Tarot (IDs de base de datos)
 *
 * IDs 1-22: Arcanos Mayores (the-fool=1 ... the-world=22)
 * IDs 23-36: Bastos (ace-of-wands=23 ... king-of-wands=36)
 * IDs 37-50: Copas (ace-of-cups=37 ... king-of-cups=50)
 * IDs 51-64: Espadas (ace-of-swords=51 ... king-of-swords=64)
 * IDs 65-78: Oros (ace-of-pentacles=65 ... king-of-pentacles=78)
 *
 * Fuente: Análisis de relaciones temáticas y simbólicas del Tarot Rider-Waite
 */

// --- ARCANOS MAYORES ---
export const MAJOR_ARCANA_RELATIONS: Record<string, number[]> = {
  'the-fool': [2, 13, 17, 22],
  'the-magician': [1, 3, 6, 22],
  'the-high-priestess': [2, 4, 6, 19],
  'the-empress': [3, 5, 18, 20],
  'the-emperor': [4, 6, 8, 17],
  'the-hierophant': [2, 3, 5, 16],
  'the-lovers': [8, 15, 16, 20],
  'the-chariot': [5, 7, 9, 11, 17],
  strength: [8, 10, 12, 16],
  'the-hermit': [9, 11, 19, 21],
  'wheel-of-fortune': [8, 10, 12, 22],
  justice: [9, 11, 15, 21],
  'the-hanged-man': [1, 14, 15, 21],
  death: [13, 15, 16, 17],
  temperance: [7, 12, 13, 14, 18],
  'the-devil': [6, 7, 9, 14, 17],
  'the-tower': [1, 5, 8, 14, 16],
  'the-star': [4, 15, 19, 20],
  'the-moon': [3, 10, 18, 20],
  'the-sun': [4, 7, 18, 19, 22],
  judgement: [10, 12, 13, 22],
  'the-world': [1, 2, 11, 20, 21],
};

// --- ARCANOS MENORES ---
export const MINOR_ARCANA_RELATIONS: Record<string, number[]> = {
  // --- BASTOS (Fuego / Voluntad / Acción) ---
  'ace-of-wands': [24, 37, 2, 20],
  'two-of-wands': [25, 66, 3, 22],
  'three-of-wands': [26, 53, 4, 8],
  'four-of-wands': [27, 68, 6, 20],
  'five-of-wands': [28, 55, 16, 17],
  'six-of-wands': [29, 70, 7, 8],
  'seven-of-wands': [30, 57, 8, 10],
  'eight-of-wands': [31, 58, 1, 11],
  'nine-of-wands': [32, 59, 10, 17],
  'ten-of-wands': [33, 60, 11, 16],
  'page-of-wands': [34, 47, 1, 20],
  'knight-of-wands': [35, 62, 8, 17],
  'queen-of-wands': [36, 49, 4, 9],
  'king-of-wands': [23, 50, 5, 20],

  // --- COPAS (Agua / Emoción / Psique) ---
  'ace-of-cups': [38, 23, 2, 19],
  'two-of-cups': [39, 24, 7, 15],
  'three-of-cups': [40, 67, 4, 20],
  'four-of-cups': [41, 54, 10, 13],
  'five-of-cups': [42, 55, 14, 19],
  'six-of-cups': [43, 70, 20, 18],
  'seven-of-cups': [44, 57, 19, 16],
  'eight-of-cups': [45, 58, 10, 19],
  'nine-of-cups': [46, 73, 20, 11],
  'ten-of-cups': [47, 74, 22, 20],
  'page-of-cups': [48, 33, 19, 13],
  'knight-of-cups': [49, 62, 7, 12],
  'queen-of-cups': [50, 35, 3, 19],
  'king-of-cups': [37, 36, 5, 15],

  // --- ESPADAS (Aire / Intelecto / Conflicto) ---
  'ace-of-swords': [52, 23, 2, 12],
  'two-of-swords': [53, 38, 3, 12],
  'three-of-swords': [54, 41, 17, 14],
  'four-of-swords': [55, 40, 10, 13],
  'five-of-swords': [56, 27, 16, 17],
  'six-of-swords': [57, 42, 18, 14],
  'seven-of-swords': [58, 29, 2, 19],
  'eight-of-swords': [59, 44, 16, 13],
  'nine-of-swords': [60, 31, 19, 16],
  'ten-of-swords': [61, 32, 14, 17],
  'page-of-swords': [62, 33, 12, 1],
  'knight-of-swords': [63, 48, 8, 17],
  'queen-of-swords': [64, 49, 12, 3],
  'king-of-swords': [51, 36, 5, 12],

  // --- OROS (Tierra / Materia / Cuerpo) ---
  'ace-of-pentacles': [66, 37, 2, 22],
  'two-of-pentacles': [67, 24, 11, 15],
  'three-of-pentacles': [68, 39, 6, 4],
  'four-of-pentacles': [69, 26, 5, 16],
  'five-of-pentacles': [70, 41, 6, 10],
  'six-of-pentacles': [71, 28, 12, 7],
  'seven-of-pentacles': [72, 43, 10, 13],
  'eight-of-pentacles': [73, 30, 2, 9],
  'nine-of-pentacles': [74, 31, 4, 18],
  'ten-of-pentacles': [75, 32, 22, 6],
  'page-of-pentacles': [76, 47, 22, 4],
  'knight-of-pentacles': [77, 34, 10, 5],
  'queen-of-pentacles': [78, 35, 4, 11],
  'king-of-pentacles': [65, 50, 5, 22],
};

/**
 * Obtiene las relaciones de una carta por su slug
 */
export function getCardRelations(slug: string): number[] | null {
  return MAJOR_ARCANA_RELATIONS[slug] ?? MINOR_ARCANA_RELATIONS[slug] ?? null;
}
