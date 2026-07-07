'use client';

// 1. React & Next.js
import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
// 2. Components (ui → features)
import { Button } from '@/components/ui/button';
// 3. Utils & types
import { cn } from '@/lib/utils';

/**
 * WidgetEmptyState — estado vacío ilustrado y consistente para los widgets del home (T-DASH-005).
 *
 * Unifica la presentación de los estados sin datos del dashboard (hallazgo DASH-005),
 * que hoy caen en "solo texto". Estandariza una composición reutilizable:
 *
 * - **Ilustración** de marca (asset WebP de T-DASH-004) **o**, en su defecto, un
 *   **ícono Lucide con acento dorado** (`text-secondary`) cuando el widget no tiene
 *   ilustración dedicada.
 * - **Título** en `font-serif` (Cormorant) + **mensaje** atenuado.
 * - **CTA** opcional como enlace accesible (foco visible heredado de la primitiva
 *   `Button`), coherente con los demás widgets.
 *
 * No decide las condiciones de negocio (loading/error/empty): los widgets siguen
 * resolviéndolas y montan este sub-componente únicamente en su rama "vacía".
 *
 * @example
 * ```tsx
 * <WidgetEmptyState
 *   illustration={{ src: '/images/dashboard/empty-calendar.webp', alt: 'Rueda del año' }}
 *   title="Sin eventos próximos"
 *   message="No hay eventos próximos en el calendario sagrado."
 *   cta={{ label: 'Explorar rituales', href: '/rituales' }}
 * />
 * ```
 */
export interface WidgetEmptyStateIllustration {
  /** Ruta del asset (WebP en `public/images/dashboard/`). */
  src: string;
  /** Texto alternativo en español (a11y). */
  alt: string;
}

export interface WidgetEmptyStateCta {
  /** Texto del botón (español, user-facing). */
  label: string;
  /** Destino del enlace (usar `ROUTES` centralizadas). */
  href: string;
  /** Ícono opcional que precede al texto del CTA. */
  icon?: React.ReactNode;
}

export interface WidgetEmptyStateProps {
  /** Ilustración de marca; tiene prioridad sobre `icon` si se proveen ambos. */
  illustration?: WidgetEmptyStateIllustration;
  /** Ícono Lucide (sin clase de color: hereda el acento dorado). */
  icon?: React.ReactNode;
  /** Título del estado vacío (se renderiza con `font-serif`). */
  title: string;
  /** Mensaje descriptivo (atenuado). */
  message: string;
  /** Acción principal opcional, renderizada como enlace accesible. */
  cta?: WidgetEmptyStateCta;
  /** Clases adicionales para el contenedor. */
  className?: string;
  /** Identificador para tests. */
  'data-testid'?: string;
}

export function WidgetEmptyState({
  illustration,
  icon,
  title,
  message,
  cta,
  className,
  'data-testid': dataTestId,
}: WidgetEmptyStateProps) {
  return (
    <div
      data-testid={dataTestId}
      className={cn(
        'flex flex-col items-center justify-center gap-4 px-4 py-8 text-center',
        className
      )}
    >
      {illustration ? (
        <div className="ring-secondary/25 relative h-24 w-24 overflow-hidden rounded-full shadow-sm ring-1">
          <Image
            src={illustration.src}
            alt={illustration.alt}
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>
      ) : (
        icon && (
          <div
            data-testid="widget-empty-state-icon"
            className="bg-secondary/10 text-secondary flex h-16 w-16 items-center justify-center rounded-full [&>svg]:h-7 [&>svg]:w-7"
          >
            {icon}
          </div>
        )
      )}

      <div className="space-y-1.5">
        <h4 className="text-card-foreground font-serif text-lg font-semibold">{title}</h4>
        <p className="text-muted-foreground mx-auto max-w-xs text-sm">{message}</p>
      </div>

      {cta && (
        <Button asChild size="sm" className="mt-1">
          <Link href={cta.href}>
            {cta.icon}
            {cta.label}
          </Link>
        </Button>
      )}
    </div>
  );
}
