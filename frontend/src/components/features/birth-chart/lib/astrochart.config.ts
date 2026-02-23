/**
 * Configuración de @astrodraw/astrochart con colores de branding de Auguria
 * @module astrochart.config
 */

/**
 * Colores de branding de Auguria
 */
export const AUGURIA_COLORS = {
  primary: '#6366F1', // Índigo - Color principal de Auguria
  secondary: '#8B5CF6', // Violeta - Color secundario
  accent: '#EC4899', // Rosa - Color de acento
  background: '#0F172A', // Azul oscuro - Fondo principal
  backgroundLight: '#1E293B', // Azul oscuro claro - Fondo secundario
  text: '#F1F5F9', // Gris claro - Texto principal
  textMuted: '#94A3B8', // Gris medio - Texto secundario
  border: '#334155', // Gris oscuro - Bordes

  // Colores para elementos zodiacales
  fire: '#F59E0B', // Naranja - Fuego (Aries, Leo, Sagitario)
  earth: '#10B981', // Verde - Tierra (Tauro, Virgo, Capricornio)
  air: '#3B82F6', // Azul - Aire (Géminis, Libra, Acuario)
  water: '#06B6D4', // Cian - Agua (Cáncer, Escorpio, Piscis)

  // Colores para aspectos
  conjunction: '#6366F1', // Conjunción (0°)
  opposition: '#EF4444', // Oposición (180°)
  trine: '#10B981', // Trígono (120°)
  square: '#F59E0B', // Cuadratura (90°)
  sextile: '#3B82F6', // Sextil (60°)
  minor: '#94A3B8', // Aspectos menores
} as const;

/**
 * Configuración por defecto de astrochart con colores de Auguria
 * Modo oscuro para la aplicación web
 */
export const CHART_SETTINGS = {
  // Colores de fondo
  BGCOLOR: AUGURIA_COLORS.background,
  STROKE_ONLY: false,

  // Círculos y estructura
  CIRCLE_COLOR: AUGURIA_COLORS.border,
  CIRCLE_STRONG: AUGURIA_COLORS.primary,

  // Líneas de aspectos
  LINE_COLOR: AUGURIA_COLORS.textMuted,
  CONJUNCTION_COLOR: AUGURIA_COLORS.conjunction,
  OPPOSITION_COLOR: AUGURIA_COLORS.opposition,
  SQUARE_COLOR: AUGURIA_COLORS.square,
  TRINE_COLOR: AUGURIA_COLORS.trine,
  SEXTILE_COLOR: AUGURIA_COLORS.sextile,
  QUINCUNX_COLOR: AUGURIA_COLORS.minor,
  QUINTILE_COLOR: AUGURIA_COLORS.minor,
  SEPTILE_COLOR: AUGURIA_COLORS.minor,

  // Símbolos y texto
  SYMBOL_SCALE: 0.8,
  COLOR_ARIES: AUGURIA_COLORS.fire,
  COLOR_TAURUS: AUGURIA_COLORS.earth,
  COLOR_GEMINI: AUGURIA_COLORS.air,
  COLOR_CANCER: AUGURIA_COLORS.water,
  COLOR_LEO: AUGURIA_COLORS.fire,
  COLOR_VIRGO: AUGURIA_COLORS.earth,
  COLOR_LIBRA: AUGURIA_COLORS.air,
  COLOR_SCORPIO: AUGURIA_COLORS.water,
  COLOR_SAGITTARIUS: AUGURIA_COLORS.fire,
  COLOR_CAPRICORN: AUGURIA_COLORS.earth,
  COLOR_AQUARIUS: AUGURIA_COLORS.air,
  COLOR_PISCES: AUGURIA_COLORS.water,

  // Colores de planetas (usando colores de Auguria)
  COLOR_SUN: AUGURIA_COLORS.fire,
  COLOR_MOON: AUGURIA_COLORS.water,
  COLOR_MERCURY: AUGURIA_COLORS.air,
  COLOR_VENUS: AUGURIA_COLORS.earth,
  COLOR_MARS: AUGURIA_COLORS.fire,
  COLOR_JUPITER: AUGURIA_COLORS.fire,
  COLOR_SATURN: AUGURIA_COLORS.earth,
  COLOR_URANUS: AUGURIA_COLORS.air,
  COLOR_NEPTUNE: AUGURIA_COLORS.water,
  COLOR_PLUTO: AUGURIA_COLORS.water,
  COLOR_CHIRON: AUGURIA_COLORS.minor,
  COLOR_LILITH: AUGURIA_COLORS.minor,
  COLOR_NNODE: AUGURIA_COLORS.accent,

  // Puntos y casas
  CUSPS_FONT_COLOR: AUGURIA_COLORS.text,
  POINTS_FONT_COLOR: AUGURIA_COLORS.text,

  // Tamaños
  MARGIN: 30,
  PADDING: 12,

  // Aspectos visibles
  ASPECTS: {
    conjunction: true,
    opposition: true,
    trine: true,
    square: true,
    sextile: true,
    quincunx: false,
    quintile: false,
    septile: false,
  },
} as const;

/**
 * Tipo para las configuraciones de astrochart
 * Define la estructura base que deben seguir todas las configuraciones
 */
export type AstrochartSettings = {
  BGCOLOR: string;
  STROKE_ONLY: boolean;
  CIRCLE_COLOR: string;
  CIRCLE_STRONG: string;
  LINE_COLOR: string;
  CONJUNCTION_COLOR: string;
  OPPOSITION_COLOR: string;
  SQUARE_COLOR: string;
  TRINE_COLOR: string;
  SEXTILE_COLOR: string;
  QUINCUNX_COLOR: string;
  QUINTILE_COLOR: string;
  SEPTILE_COLOR: string;
  SYMBOL_SCALE: number;
  COLOR_ARIES: string;
  COLOR_TAURUS: string;
  COLOR_GEMINI: string;
  COLOR_CANCER: string;
  COLOR_LEO: string;
  COLOR_VIRGO: string;
  COLOR_LIBRA: string;
  COLOR_SCORPIO: string;
  COLOR_SAGITTARIUS: string;
  COLOR_CAPRICORN: string;
  COLOR_AQUARIUS: string;
  COLOR_PISCES: string;
  COLOR_SUN: string;
  COLOR_MOON: string;
  COLOR_MERCURY: string;
  COLOR_VENUS: string;
  COLOR_MARS: string;
  COLOR_JUPITER: string;
  COLOR_SATURN: string;
  COLOR_URANUS: string;
  COLOR_NEPTUNE: string;
  COLOR_PLUTO: string;
  COLOR_CHIRON: string;
  COLOR_LILITH: string;
  COLOR_NNODE: string;
  CUSPS_FONT_COLOR: string;
  POINTS_FONT_COLOR: string;
  MARGIN: number;
  PADDING: number;
  ASPECTS: {
    conjunction: boolean;
    opposition: boolean;
    trine: boolean;
    square: boolean;
    sextile: boolean;
    quincunx: boolean;
    quintile: boolean;
    septile: boolean;
  };
};

/**
 * Configuración para modo claro (opcional, por si se implementa toggle)
 */
export const CHART_SETTINGS_LIGHT: AstrochartSettings = {
  ...CHART_SETTINGS,
  BGCOLOR: '#FFFFFF',
  CIRCLE_COLOR: '#E2E8F0',
  CIRCLE_STRONG: AUGURIA_COLORS.primary,
  LINE_COLOR: '#64748B',
  CUSPS_FONT_COLOR: '#0F172A',
  POINTS_FONT_COLOR: '#0F172A',
};

/**
 * Configuración para exportación a PDF
 * Sin transparencia y con colores optimizados para impresión
 */
export const CHART_SETTINGS_PDF: AstrochartSettings = {
  ...CHART_SETTINGS,
  BGCOLOR: '#FFFFFF',
  STROKE_ONLY: false,
  CIRCLE_COLOR: '#334155',
  CIRCLE_STRONG: '#1E293B',
  LINE_COLOR: '#475569',
  CUSPS_FONT_COLOR: '#0F172A',
  POINTS_FONT_COLOR: '#0F172A',

  // Colores de aspectos más visibles para impresión
  OPPOSITION_COLOR: '#DC2626',
  SQUARE_COLOR: '#EA580C',
  TRINE_COLOR: '#059669',
  SEXTILE_COLOR: '#2563EB',
  CONJUNCTION_COLOR: '#4F46E5',

  // Símbolos más grandes para legibilidad en PDF
  SYMBOL_SCALE: 1.4,
};

/**
 * Configuración por defecto según el contexto
 */
export const getChartSettings = (mode: 'dark' | 'light' | 'pdf' = 'dark'): AstrochartSettings => {
  switch (mode) {
    case 'light':
      return CHART_SETTINGS_LIGHT;
    case 'pdf':
      return CHART_SETTINGS_PDF;
    case 'dark':
    default:
      return CHART_SETTINGS;
  }
};
