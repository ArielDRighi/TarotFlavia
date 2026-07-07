'use client';

// 1. React & Next.js
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

// 4. Custom hooks
import { useReducedMotion } from '@/hooks/utils/useReducedMotion';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Incremento de retardo por posición (ms) para el efecto escalonado. */
const STAGGER_STEP_MS = 70;
/** Tope de posiciones consideradas, para que los últimos ítems no tarden de más. */
const MAX_STAGGER_INDEX = 8;

// ─── Types ────────────────────────────────────────────────────────────────────

interface RevealProps {
  /** Contenido a revelar. */
  children: ReactNode;
  /** Posición dentro de un grupo; define el retardo escalonado. */
  index?: number;
  /** Clases adicionales para el contenedor. */
  className?: string;
  /** `data-testid` opcional para pruebas. */
  'data-testid'?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Reveal
 *
 * Envoltorio que aplica un fade-up sutil cuando el elemento entra en el viewport,
 * con un retardo escalonado según `index`. El estilo vive en `globals.css`
 * (`[data-reveal]`), que toma el control del estado vía `data-revealed`.
 *
 * Accesibilidad/robustez:
 * - Respeta `prefers-reduced-motion`: con movimiento reducido aparece visible de
 *   inmediato (derivado en el render, sin desfase de hidratación).
 * - Si `IntersectionObserver` no está disponible (navegadores antiguos), el
 *   contenido se revela en el siguiente frame para no quedar nunca oculto.
 */
export function Reveal({ children, index = 0, className, 'data-testid': dataTestId }: RevealProps) {
  const [intersected, setIntersected] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    // Navegadores sin IntersectionObserver: revelar en el próximo frame (fuera
    // del cuerpo del efecto) para no dejar el contenido oculto permanentemente.
    if (typeof IntersectionObserver === 'undefined') {
      const frame = requestAnimationFrame(() => setIntersected(true));
      return () => cancelAnimationFrame(frame);
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIntersected(true);
          observer.disconnect();
        }
      },
      // Sin margen inferior negativo: un margen negativo dejaría permanentemente
      // oculto cualquier elemento que aterrice en la franja inferior de una
      // página que ya no puede scrollear (p. ej. el CTA al final de una guía
      // corta o las tarjetas del hub que entran justas en pantallas altas).
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  // Con movimiento reducido aparece visible de inmediato; en el resto de casos
  // se revela cuando entra en viewport (o en el fallback sin IO).
  const revealed = intersected || prefersReducedMotion;
  const delayMs = Math.min(index, MAX_STAGGER_INDEX) * STAGGER_STEP_MS;

  return (
    <div
      ref={ref}
      data-reveal
      data-revealed={revealed}
      data-testid={dataTestId}
      style={{ '--reveal-delay': `${delayMs}ms` } as CSSProperties}
      className={className}
    >
      {children}
    </div>
  );
}
