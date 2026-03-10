/**
 * Relaciones entre artículos de la Enciclopedia Mística
 * Los valores son arrays de slugs de artículos relacionados
 *
 * Fuente: Análisis de correspondencias astrológicas y esotéricas
 */

export const ARTICLE_RELATIONS: Record<string, string[]> = {
  // --- SIGNOS ZODIACALES (Regente, Elemento, Modalidad, Casa, Afines) ---
  aries: [
    'marte',
    'elemento-fuego',
    'modalidad-cardinal',
    'casa-1',
    'leo',
    'sagitario',
  ],
  tauro: [
    'venus',
    'elemento-tierra',
    'modalidad-fija',
    'casa-2',
    'virgo',
    'capricornio',
  ],
  geminis: [
    'mercurio',
    'elemento-aire',
    'modalidad-mutable',
    'casa-3',
    'libra',
    'acuario',
  ],
  cancer: [
    'luna',
    'elemento-agua',
    'modalidad-cardinal',
    'casa-4',
    'escorpio',
    'piscis',
  ],
  leo: [
    'sol',
    'elemento-fuego',
    'modalidad-fija',
    'casa-5',
    'aries',
    'sagitario',
  ],
  virgo: [
    'mercurio',
    'elemento-tierra',
    'modalidad-mutable',
    'casa-6',
    'tauro',
    'capricornio',
  ],
  libra: [
    'venus',
    'elemento-aire',
    'modalidad-cardinal',
    'casa-7',
    'geminis',
    'acuario',
  ],
  escorpio: [
    'pluton',
    'elemento-agua',
    'modalidad-fija',
    'casa-8',
    'cancer',
    'piscis',
  ],
  sagitario: [
    'jupiter',
    'elemento-fuego',
    'modalidad-mutable',
    'casa-9',
    'aries',
    'leo',
  ],
  capricornio: [
    'saturno',
    'elemento-tierra',
    'modalidad-cardinal',
    'casa-10',
    'tauro',
    'virgo',
  ],
  acuario: [
    'urano',
    'elemento-aire',
    'modalidad-fija',
    'casa-11',
    'geminis',
    'libra',
  ],
  piscis: [
    'neptuno',
    'elemento-agua',
    'modalidad-mutable',
    'casa-12',
    'cancer',
    'escorpio',
  ],

  // --- PLANETAS (Signos que rigen, dignidades elementales, y herramientas) ---
  sol: [
    'leo',
    'elemento-fuego',
    'casa-5',
    'guia-carta-astral',
    'guia-horoscopo-occidental',
  ],
  luna: [
    'cancer',
    'elemento-agua',
    'casa-4',
    'guia-carta-astral',
    'guia-rituales',
  ],
  mercurio: [
    'geminis',
    'virgo',
    'elemento-aire',
    'elemento-tierra',
    'guia-carta-astral',
  ],
  venus: [
    'tauro',
    'libra',
    'elemento-tierra',
    'elemento-aire',
    'guia-carta-astral',
  ],
  marte: ['aries', 'escorpio', 'elemento-fuego', 'guia-carta-astral'],
  jupiter: ['sagitario', 'piscis', 'elemento-fuego', 'guia-carta-astral'],
  saturno: ['capricornio', 'acuario', 'elemento-tierra', 'guia-carta-astral'],
  urano: ['acuario', 'elemento-aire', 'guia-carta-astral'],
  neptuno: ['piscis', 'elemento-agua', 'guia-carta-astral'],
  pluton: ['escorpio', 'elemento-agua', 'guia-carta-astral'],

  // --- CASAS ASTROLÓGICAS (Signo natural, planeta natural, modalidades, guías) ---
  'casa-1': ['aries', 'marte', 'modalidad-cardinal', 'guia-carta-astral'],
  'casa-2': ['tauro', 'venus', 'modalidad-fija', 'guia-carta-astral'],
  'casa-3': ['geminis', 'mercurio', 'modalidad-mutable', 'guia-carta-astral'],
  'casa-4': ['cancer', 'luna', 'modalidad-cardinal', 'guia-carta-astral'],
  'casa-5': ['leo', 'sol', 'modalidad-fija', 'guia-carta-astral'],
  'casa-6': ['virgo', 'mercurio', 'modalidad-mutable', 'guia-carta-astral'],
  'casa-7': ['libra', 'venus', 'modalidad-cardinal', 'guia-carta-astral'],
  'casa-8': ['escorpio', 'pluton', 'modalidad-fija', 'guia-carta-astral'],
  'casa-9': ['sagitario', 'jupiter', 'modalidad-mutable', 'guia-carta-astral'],
  'casa-10': [
    'capricornio',
    'saturno',
    'modalidad-cardinal',
    'guia-carta-astral',
  ],
  'casa-11': ['acuario', 'urano', 'modalidad-fija', 'guia-carta-astral'],
  'casa-12': ['piscis', 'neptuno', 'modalidad-mutable', 'guia-carta-astral'],

  // --- ELEMENTOS (Signos que los componen y resonancia esotérica) ---
  'elemento-fuego': ['aries', 'leo', 'sagitario', 'marte', 'sol'],
  'elemento-tierra': ['tauro', 'virgo', 'capricornio', 'venus', 'saturno'],
  'elemento-aire': ['geminis', 'libra', 'acuario', 'mercurio', 'urano'],
  'elemento-agua': ['cancer', 'escorpio', 'piscis', 'luna', 'neptuno'],

  // --- MODALIDADES (Signos que comparten ritmo energético) ---
  'modalidad-cardinal': ['aries', 'cancer', 'libra', 'capricornio'],
  'modalidad-fija': ['tauro', 'leo', 'escorpio', 'acuario'],
  'modalidad-mutable': ['geminis', 'virgo', 'sagitario', 'piscis'],

  // --- GUÍAS PRÁCTICAS Y ESOTÉRICAS (Interconexiones temáticas) ---
  'guia-tarot': [
    'guia-carta-astral',
    'guia-numerologia',
    'guia-rituales',
    'guia-horoscopo-occidental',
  ],
  'guia-numerologia': [
    'guia-carta-astral',
    'sol',
    'luna',
    'saturno',
    'guia-horoscopo-occidental',
  ],
  'guia-pendulo': ['guia-rituales', 'elemento-agua', 'luna', 'neptuno'],
  'guia-carta-astral': [
    'sol',
    'luna',
    'casa-1',
    'guia-horoscopo-occidental',
    'guia-tarot',
  ],
  'guia-rituales': [
    'luna',
    'elemento-fuego',
    'elemento-agua',
    'guia-pendulo',
    'guia-tarot',
  ],
  'guia-horoscopo-occidental': [
    'sol',
    'guia-carta-astral',
    'guia-horoscopo-chino',
    'aries',
    'piscis',
  ],
  'guia-horoscopo-chino': [
    'guia-horoscopo-occidental',
    'jupiter',
    'luna',
    'elemento-tierra',
  ],
};

/**
 * Obtiene las relaciones de un artículo por su slug
 */
export function getArticleRelations(slug: string): string[] | null {
  return ARTICLE_RELATIONS[slug] ?? null;
}
