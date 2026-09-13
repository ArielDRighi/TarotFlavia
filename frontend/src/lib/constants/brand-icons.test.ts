import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect } from 'vitest';

import {
  BRAND_ICONS,
  BRAND_ICON_FAMILIES,
  BRAND_ICONS_PUBLIC_DIR,
  getBrandIcon,
  getBrandIconSrc,
} from './brand-icons';

/**
 * Registro de iconos de marca (T-UI-12, Fase 1).
 *
 * El registro es el contrato entre el código y los assets que se generan con
 * Nano Banana: los slugs de acá son los nombres de archivo que espera
 * `public/images/icons/<familia>/<slug>.webp`.
 */

const PUBLIC_ICONS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../public',
  BRAND_ICONS_PUBLIC_DIR.replace(/^\//, '')
);

/** Tamaño de cada familia según el inventario del backlog (79 en total). */
const EXPECTED_FAMILY_SIZES = {
  zodiac: 12,
  chinese: 12,
  elements: 10,
  suits: 4,
  areas: 4,
  moon: 8,
  rituals: 8,
  numerology: 12,
  hubs: 9,
} as const;

const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0E}\u{FE0F}]/u;

describe('BRAND_ICONS (registro de iconos de marca)', () => {
  it('declara exactamente las 9 familias del inventario', () => {
    expect([...BRAND_ICON_FAMILIES].sort()).toEqual(Object.keys(EXPECTED_FAMILY_SIZES).sort());
    expect(Object.keys(BRAND_ICONS).sort()).toEqual([...BRAND_ICON_FAMILIES].sort());
  });

  it.each(Object.entries(EXPECTED_FAMILY_SIZES))(
    'la familia %s tiene %i iconos',
    (family, size) => {
      const entries = BRAND_ICONS[family as keyof typeof BRAND_ICONS];
      expect(Object.keys(entries)).toHaveLength(size);
    }
  );

  it('usa los slugs que ya usa el código para signos, animales, fases y palos', () => {
    expect(Object.keys(BRAND_ICONS.zodiac)).toEqual([
      'aries',
      'taurus',
      'gemini',
      'cancer',
      'leo',
      'virgo',
      'libra',
      'scorpio',
      'sagittarius',
      'capricorn',
      'aquarius',
      'pisces',
    ]);
    expect(Object.keys(BRAND_ICONS.chinese)).toEqual([
      'rat',
      'ox',
      'tiger',
      'rabbit',
      'dragon',
      'snake',
      'horse',
      'goat',
      'monkey',
      'rooster',
      'dog',
      'pig',
    ]);
    expect(Object.keys(BRAND_ICONS.moon)).toEqual([
      'new_moon',
      'waxing_crescent',
      'first_quarter',
      'waxing_gibbous',
      'full_moon',
      'waning_gibbous',
      'last_quarter',
      'waning_crescent',
    ]);
    expect(Object.keys(BRAND_ICONS.suits)).toEqual(['wands', 'cups', 'swords', 'pentacles']);
    expect(Object.keys(BRAND_ICONS.numerology)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '11',
      '22',
      '33',
    ]);
  });

  it('cada entrada tiene slug válido, alt en español sin emojis y src bajo /images/icons', () => {
    for (const family of BRAND_ICON_FAMILIES) {
      for (const [slug, icon] of Object.entries(BRAND_ICONS[family])) {
        expect(slug, `${family}/${slug}`).toMatch(/^[a-z0-9][a-z0-9_-]*$/);
        expect(icon.alt.trim().length, `${family}/${slug} alt vacío`).toBeGreaterThan(0);
        expect(icon.alt, `${family}/${slug} alt con emoji`).not.toMatch(EMOJI);
        expect(icon.src).toBe(`${BRAND_ICONS_PUBLIC_DIR}/${family}/${slug}.webp`);
      }
    }
  });

  it('getBrandIconSrc y getBrandIcon resuelven contra el registro', () => {
    expect(getBrandIconSrc('zodiac', 'aries')).toBe('/images/icons/zodiac/aries.webp');
    expect(getBrandIcon('chinese', 'dragon')).toEqual({
      src: '/images/icons/chinese/dragon.webp',
      alt: 'Dragón',
    });
  });

  /**
   * Sincronía con el disco. Las familias llegan de a una (Fase 0 es manual, con
   * Nano Banana): una familia cuyo directorio existe en `public/` tiene que
   * estar COMPLETA y sin archivos huérfanos; una que todavía no existe no se
   * exige. Así el test es verde hoy y se vuelve estricto a medida que llegan
   * los assets.
   */
  describe('sincronía con public/images/icons', () => {
    for (const family of BRAND_ICON_FAMILIES) {
      const dir = path.join(PUBLIC_ICONS_DIR, family);
      const exists = fs.existsSync(dir);

      it(`${family}: ${exists ? 'completa y sin huérfanos' : 'todavía sin assets (pendiente de Fase 0)'}`, () => {
        if (!exists) return;
        const files = fs.readdirSync(dir);
        // Todo lo que no sea <slug>.webp (un .png sin procesar, un Aries.webp) es huérfano.
        expect(files.filter((f) => !/^[a-z0-9][a-z0-9_-]*\.webp$/.test(f))).toEqual([]);
        const onDisk = files.map((f) => f.replace(/\.webp$/, '')).sort();
        expect(onDisk).toEqual(Object.keys(BRAND_ICONS[family]).sort());
      });
    }
  });
});
