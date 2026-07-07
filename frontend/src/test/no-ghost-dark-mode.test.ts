import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Contrato de "Modo Oscuro Fantasma" (T-PREM-001, hallazgos PREM-001 / PREM-008).
 *
 * La app es light-only (globals.css: "Mode: Light only (NO dark mode)"). Sin una
 * estrategia de dark mode configurada, las variantes Tailwind `dark:` se ligan a
 * `@media (prefers-color-scheme: dark)` y se activan cuando el SO está en modo oscuro,
 * produciendo texto claro sobre fondo claro (bug de contraste reportado).
 *
 * Este contrato fija dos garantías:
 *  1. globals.css declara el neutralizador global (@custom-variant dark por clase),
 *     que vuelve inertes TODAS las `dark:` (estrategia B), incluidas las de los
 *     primitivos de `components/ui/` (shadcn) que no se deben modificar.
 *  2. Los archivos de features tocados quedan sin variantes `dark:` (estrategia A).
 */

const FRONTEND_ROOT = join(__dirname, '..', '..');
const SRC = join(FRONTEND_ROOT, 'src');

// Variante Tailwind `dark:` seguida de una utilidad (letra o `[` de valor arbitrario).
// No matchea nombres de token CSS (`--color-...-dark:` va seguido de espacio) ni
// texto en comentarios (p.ej. "sin clases `dark:`." va seguido de backtick).
const DARK_VARIANT = /dark:[a-zA-Z[]/;

// Archivos de features purgados en T-PREM-001 (inventario del backlog).
const PURGED_FILES = [
  'components/features/premium/PremiumPage.tsx',
  'components/features/premium/PremiumHero.tsx',
  'components/features/premium/ActivationPage.tsx',
  'app/registro/page.tsx',
  'components/features/auth/RegisterPage.tsx',
  'components/features/auth/RegisterForm.tsx',
  'components/features/auth/LoginForm.tsx',
  'components/features/notifications/NotificationItem.tsx',
  'components/features/notifications/NotificationDropdown.tsx',
  'components/features/horoscope/HoroscopeAreaCard.tsx',
  'components/features/onboarding/WelcomeModal.tsx',
  'components/features/conversion/PremiumUpgradePrompt.tsx',
  'components/features/conversion/LimitReachedModal.tsx',
  'components/features/daily-reading/DailyReadingCard.tsx',
  'components/features/birth-chart/AISynthesis/AISynthesis.tsx',
];

describe('Contrato: erradicación del modo oscuro fantasma', () => {
  it('globals.css declara el neutralizador global de dark mode (@custom-variant dark por clase)', () => {
    const css = readFileSync(join(SRC, 'app', 'globals.css'), 'utf-8');
    expect(css).toMatch(/@custom-variant\s+dark\s+\(&:where\(\.dark, \.dark \*\)\);?/);
  });

  it.each(PURGED_FILES)('no quedan variantes `dark:` en %s', (relPath) => {
    const content = readFileSync(join(SRC, relPath), 'utf-8');
    const offending = content
      .split('\n')
      .map((line, index) => ({ line: line.trim(), number: index + 1 }))
      .filter(({ line }) => DARK_VARIANT.test(line));

    expect(
      offending,
      `Variantes dark: encontradas en ${relPath}:\n` +
        offending.map((o) => `  L${o.number}: ${o.line}`).join('\n')
    ).toEqual([]);
  });
});
