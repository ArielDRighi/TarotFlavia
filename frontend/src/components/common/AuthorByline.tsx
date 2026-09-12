// 1. React & Next.js
import Link from 'next/link';

// 6. Utils & types
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';

/**
 * AuthorByline
 *
 * Firma de autoría del contenido editorial (T-SEO-011 / T-SEO-017).
 *
 * Las guías de la enciclopedia son las piezas más extensas del sitio y llegaban
 * sin dueño: para las guías de calidad de Google, contenido de consejo personal
 * sin autor identificable es una señal negativa (E-E-A-T). La firma no nombra
 * personas —el sitio se presenta como equipo, decisión de negocio del
 * 12-sep-2026— pero enlaza a `/sobre-nosotros`, donde se explica quién escribe,
 * y a `/politica-editorial`, donde se explica cómo se produce y revisa.
 *
 * Desde T-SEO-017 la llevan también los rituales y las fichas de servicio,
 * además de las cartas y las guías.
 *
 * Sin `'use client'` propio: no tiene estado ni handlers. Varios consumidores
 * (`ArticleDetailView`, `CardDetailView`, `RitualDetailPage`) son client
 * components, así que la firma viaja en su bundle — llega igual al HTML inicial
 * porque Next SSR-ea los client components, pero el componente no depende de
 * eso; `ServiceEditorialContent` la renderiza en el servidor.
 *
 * @example
 * ```tsx
 * <AuthorByline className="mt-10" />
 * ```
 */
export interface AuthorBylineProps {
  /** Clases CSS adicionales. */
  className?: string;
}

export function AuthorByline({ className }: AuthorBylineProps) {
  return (
    <aside
      data-testid="author-byline"
      className={cn('border-border text-muted-foreground border-t pt-5 text-sm', className)}
    >
      <p className="leading-relaxed">
        Escrito y revisado por el{' '}
        <Link
          href={ROUTES.SOBRE_NOSOTROS}
          className="text-secondary focus-visible:ring-secondary rounded-sm font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          equipo editorial de Auguria
        </Link>
        , con más de una década de práctica acumulada en tarot, astrología, numerología y péndulo.
        El contenido se revisa de forma periódica y se corrige cuando hace falta, según nuestra{' '}
        <Link
          href={ROUTES.POLITICA_EDITORIAL}
          className="text-secondary focus-visible:ring-secondary rounded-sm font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          política editorial
        </Link>
        .
      </p>
    </aside>
  );
}
