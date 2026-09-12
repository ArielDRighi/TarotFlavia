// 1. React & Next.js
import Link from 'next/link';
// 2. Icons
import { ArrowRight } from 'lucide-react';
// 6. Utils & types
import { cn } from '@/lib/utils';
import type { HomeSectionCopy } from '@/lib/constants/home-editorial.data';

/**
 * Encabezado de una sección de la portada editorial (T-SEO-014).
 *
 * `h2` + bajada + enlace a la página completa. Lo comparten las secciones que
 * traen datos del día (horóscopo, carta, guías) y las estáticas (enciclopedia,
 * quiénes somos), así el ritmo visual de la portada es el mismo de arriba a
 * abajo. Sin `'use client'`: es texto que tiene que llegar al crawler.
 */
export interface HomeSectionHeaderProps {
  copy: HomeSectionCopy;
  /** Dónde se renderiza el enlace: en el encabezado (default) o lo omite el padre. */
  withLink?: boolean;
  className?: string;
}

export function HomeSectionHeader({ copy, withLink = true, className }: HomeSectionHeaderProps) {
  return (
    <header className={cn('mb-8', className)}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h2 className="text-text-primary font-serif text-3xl font-light md:text-4xl">
          {copy.heading}
        </h2>
        {withLink && <HomeSectionLink href={copy.href} label={copy.linkLabel} />}
      </div>
      <div className="bg-secondary mt-3 h-px w-16 opacity-60" aria-hidden="true" />
      <p className="text-text-muted mt-4 max-w-3xl font-sans leading-relaxed">{copy.lead}</p>
    </header>
  );
}

/** Enlace "ver más" de la portada, con la flecha que lo distingue del texto. */
export function HomeSectionLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'text-primary inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline',
        className
      )}
    >
      {label}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}
