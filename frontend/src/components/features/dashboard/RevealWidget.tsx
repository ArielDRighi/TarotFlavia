import type { ReactNode } from 'react';

import { Reveal } from '@/components/common';

// ─── Constants ──────────────────────────────────────────────────────────────

/**
 * Hover de marca para las tarjetas del dashboard: elevación sutil + glow dorado.
 * Mismo patrón que `SectionCard` del hub de la Enciclopedia, para que ambos
 * módulos se lean como un mismo sistema visual (hallazgo DASH-006). El radio
 * (`rounded-xl`) coincide con el de la primitiva `Card` para que el glow calce.
 */
const WIDGET_HOVER_CLASS =
  'rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-12px_rgba(214,158,46,0.45)]';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RevealWidgetProps {
  /** Posición del widget en el grid; define el retardo del fade-up escalonado. */
  index: number;
  /** Contenido del widget (tarjeta). */
  children: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * RevealWidget
 *
 * Envuelve un widget del dashboard con dos micro-interacciones coherentes con la
 * marca (hallazgo DASH-006):
 *
 * - **Reveal fade-up escalonado** al entrar en viewport (vía `Reveal` + `index`),
 *   respetando `prefers-reduced-motion` (aparición inmediata, sin animación).
 * - **Hover de marca** (elevación + glow dorado) igual al de `SectionCard` del hub.
 *
 * La animación de entrada (opacity/transform) vive en el contenedor `Reveal`; el
 * hover vive en un contenedor interno para que ambas transformaciones no compitan
 * por la misma propiedad `transform`.
 */
export function RevealWidget({ index, children }: RevealWidgetProps) {
  return (
    <Reveal index={index}>
      <div className={WIDGET_HOVER_CLASS}>{children}</div>
    </Reveal>
  );
}
