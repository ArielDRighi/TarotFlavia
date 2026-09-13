import type { BrandIconName } from '@/lib/constants/brand-icons';

/**
 * Áreas del horóscopo (occidental y chino) → icono de marca de `areas/` (T-UI-12).
 *
 * El backend nombra las áreas distinto según el horóscopo (`career`/`finance`
 * en el chino, `money` en el occidental); los assets son cuatro. Reemplaza los
 * emojis ❤️ 💼 ✨ 💰 que usaban los widgets y el detalle.
 */
export const HOROSCOPE_AREA_ICON = {
  love: 'love',
  career: 'work',
  wellness: 'wellbeing',
  finance: 'money',
  money: 'money',
} as const satisfies Record<string, BrandIconName<'areas'>>;

export type HoroscopeAreaKey = keyof typeof HOROSCOPE_AREA_ICON;
