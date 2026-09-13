/**
 * Registro de iconos de marca (T-UI-12).
 *
 * La iconografía de dominio del sitio (signos, animales, elementos, palos,
 * áreas del horóscopo, fases lunares, categorías de rituales, arquetipos
 * numerológicos y hubs) se sirve como imágenes locales generadas con la línea
 * de diseño (line-art dorado con brillo, ver `DESIGN_HAND-OFF.md` →
 * "Iconografía") en lugar de emojis del sistema, que se ven distintos en cada
 * SO/navegador.
 *
 * Este registro es el **contrato** entre el código y los assets:
 *  - `familia/slug` = ruta del archivo `public/images/icons/<familia>/<slug>.webp`.
 *  - `alt` = etiqueta accesible en español que usa `<BrandIcon>`.
 *
 * Los slugs son los que ya usa el código (`ZodiacSign`, `ChineseZodiacAnimal`,
 * `LunarPhase`, `Suit`…) para que el consumidor no tenga que mapear. Las
 * excepciones son los elementos chinos (`fire-cn`, `water-cn`, `earth-cn`), que
 * conviven con los occidentales en la misma familia, y las categorías de ritual
 * `cleansing → energy` y `healing → wellbeing` (glosario sin términos de salud).
 *
 * Se consume vía `<BrandIcon family name />` (`components/ui/brand-icon.tsx`).
 * `brand-icons.test.ts` verifica que cada familia presente en `public/` esté
 * completa y sin archivos huérfanos.
 */

/** Carpeta pública donde viven los assets (sin barra final). */
export const BRAND_ICONS_PUBLIC_DIR = '/images/icons';

export interface BrandIconDef {
  /** Ruta pública del WebP (512×512 con alfa). */
  src: string;
  /** Etiqueta accesible en español. */
  alt: string;
}

/** Inventario `familia → slug → alt`. Los `src` se derivan de acá. */
const BRAND_ICON_ALTS = {
  zodiac: {
    aries: 'Aries',
    taurus: 'Tauro',
    gemini: 'Géminis',
    cancer: 'Cáncer',
    leo: 'Leo',
    virgo: 'Virgo',
    libra: 'Libra',
    scorpio: 'Escorpio',
    sagittarius: 'Sagitario',
    capricorn: 'Capricornio',
    aquarius: 'Acuario',
    pisces: 'Piscis',
  },
  chinese: {
    rat: 'Rata',
    ox: 'Buey',
    tiger: 'Tigre',
    rabbit: 'Conejo',
    dragon: 'Dragón',
    snake: 'Serpiente',
    horse: 'Caballo',
    goat: 'Cabra',
    monkey: 'Mono',
    rooster: 'Gallo',
    dog: 'Perro',
    pig: 'Cerdo',
  },
  elements: {
    fire: 'Fuego',
    water: 'Agua',
    air: 'Aire',
    earth: 'Tierra',
    spirit: 'Espíritu',
    wood: 'Madera',
    'fire-cn': 'Fuego (Wu Xing)',
    'earth-cn': 'Tierra (Wu Xing)',
    metal: 'Metal',
    'water-cn': 'Agua (Wu Xing)',
  },
  suits: {
    wands: 'Bastos',
    cups: 'Copas',
    swords: 'Espadas',
    pentacles: 'Oros',
  },
  areas: {
    love: 'Amor',
    work: 'Trabajo',
    wellbeing: 'Bienestar',
    money: 'Dinero',
  },
  moon: {
    new_moon: 'Luna nueva',
    waxing_crescent: 'Luna creciente',
    first_quarter: 'Cuarto creciente',
    waxing_gibbous: 'Gibosa creciente',
    full_moon: 'Luna llena',
    waning_gibbous: 'Gibosa menguante',
    last_quarter: 'Cuarto menguante',
    waning_crescent: 'Luna menguante',
  },
  rituals: {
    tarot: 'Ritual de tarot',
    lunar: 'Ritual lunar',
    energy: 'Ritual de limpieza energética',
    meditation: 'Meditación',
    protection: 'Ritual de protección',
    abundance: 'Ritual de abundancia',
    love: 'Ritual de amor',
    wellbeing: 'Ritual de bienestar',
  },
  numerology: {
    '1': 'El Líder',
    '2': 'El Diplomático',
    '3': 'El Creativo',
    '4': 'El Constructor',
    '5': 'El Aventurero',
    '6': 'El Protector',
    '7': 'El Buscador',
    '8': 'El Exitoso',
    '9': 'El Humanitario',
    '11': 'El Visionario',
    '22': 'El Constructor Maestro',
    '33': 'El Maestro Compasivo',
  },
  hubs: {
    tarot: 'Tarot',
    horoscope: 'Horóscopo',
    chinese: 'Horóscopo chino',
    numerology: 'Numerología',
    pendulum: 'Péndulo',
    'birth-chart': 'Carta natal',
    rituals: 'Rituales',
    planets: 'Planetas',
    houses: 'Casas astrológicas',
  },
} as const;

export type BrandIconFamily = keyof typeof BRAND_ICON_ALTS;

/** Slugs válidos de una familia (p. ej. `BrandIconName<'zodiac'>` = `'aries' | …`). */
export type BrandIconName<F extends BrandIconFamily> = keyof (typeof BRAND_ICON_ALTS)[F] & string;

export const BRAND_ICON_FAMILIES = Object.keys(BRAND_ICON_ALTS) as readonly BrandIconFamily[];

/** Ruta pública del asset de un icono. */
export function getBrandIconSrc<F extends BrandIconFamily>(
  family: F,
  name: BrandIconName<F>
): string {
  return `${BRAND_ICONS_PUBLIC_DIR}/${family}/${name}.webp`;
}

type BrandIconRegistry = {
  readonly [F in BrandIconFamily]: { readonly [N in BrandIconName<F>]: BrandIconDef };
};

function buildRegistry(): BrandIconRegistry {
  const registry: Partial<Record<BrandIconFamily, Record<string, BrandIconDef>>> = {};
  for (const family of BRAND_ICON_FAMILIES) {
    const entries: Record<string, BrandIconDef> = {};
    for (const [name, alt] of Object.entries<string>(BRAND_ICON_ALTS[family])) {
      entries[name] = { src: `${BRAND_ICONS_PUBLIC_DIR}/${family}/${name}.webp`, alt };
    }
    registry[family] = entries;
  }
  return registry as BrandIconRegistry;
}

/** `BRAND_ICONS[familia][slug] = { src, alt }`. */
export const BRAND_ICONS: BrandIconRegistry = buildRegistry();

/** Definición (`src` + `alt`) de un icono del registro. */
export function getBrandIcon<F extends BrandIconFamily>(
  family: F,
  name: BrandIconName<F>
): BrandIconDef {
  return BRAND_ICONS[family][name];
}
