import * as React from 'react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * WidgetCard — contenedor común para los widgets del dashboard (T-DASH-003).
 *
 * Unifica el "tratamiento de tarjeta" de todos los widgets del home para que se
 * lean como un sistema y no como piezas sueltas (hallazgo DASH-003):
 *
 * - Tarjeta de marca: primitiva `Card` de shadcn con padding `p-6`.
 * - Encabezado estandarizado: slot de ícono con **acento dorado** (`text-secondary`),
 *   título en `font-serif` (Cormorant) y una acción opcional a la derecha
 *   ("Ver más" / "Ver todo").
 * - Solo tokens de marca; sin grises hardcodeados ni clases `dark:`.
 *
 * El ícono se recibe sin clase de color (ej. `<CalendarHeart className="h-5 w-5" />`);
 * el propio `WidgetCard` le aplica el acento dorado a través del slot contenedor.
 *
 * @example
 * ```tsx
 * <WidgetCard
 *   title="Calendario Sagrado"
 *   icon={<CalendarHeart className="h-5 w-5" />}
 *   action={<Link href="/rituales">Ver todo</Link>}
 *   data-testid="sacred-events-widget"
 * >
 *   {content}
 * </WidgetCard>
 * ```
 */
export interface WidgetCardProps {
  /** Título del widget (se renderiza con `font-serif`). */
  title: string;
  /** Ícono opcional del encabezado (sin clase de color: hereda el acento dorado). */
  icon?: React.ReactNode;
  /** Acción opcional a la derecha del encabezado (ej. enlace "Ver más"). */
  action?: React.ReactNode;
  /** Nivel semántico del título. Por defecto `h2`. */
  titleAs?: 'h2' | 'h3';
  /** Clases adicionales para el contenedor `Card`. */
  className?: string;
  /** Clases adicionales para el contenedor del cuerpo. */
  contentClassName?: string;
  /** Identificador para tests, reenviado al contenedor `Card`. */
  'data-testid'?: string;
  /** Contenido del widget. */
  children: React.ReactNode;
}

export function WidgetCard({
  title,
  icon,
  action,
  titleAs: TitleTag = 'h2',
  className,
  contentClassName,
  'data-testid': dataTestId,
  children,
}: WidgetCardProps) {
  return (
    <Card className={cn('p-6', className)} data-testid={dataTestId}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-secondary flex items-center">{icon}</span>}
          <TitleTag className="text-card-foreground font-serif text-xl">{title}</TitleTag>
        </div>
        {action}
      </div>
      <div className={contentClassName}>{children}</div>
    </Card>
  );
}
