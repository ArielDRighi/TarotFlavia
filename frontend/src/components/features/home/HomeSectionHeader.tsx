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
 *
 * Desde T-SEO-022 abre con el ornamento `✦` de los artículos (por CSS, ver
 * `.editorial-ornament` en `globals.css`) y admite `tone="dark"` para la
 * sección cósmica de la enciclopedia: mismo encabezado, texto en crema.
 */
export type HomeSectionTone = 'light' | 'dark';

export interface HomeSectionHeaderProps {
  copy: HomeSectionCopy;
  /** Dónde se renderiza el enlace: en el encabezado (default) o lo omite el padre. */
  withLink?: boolean;
  /** Sobre fondo claro (default) o sobre la sección oscura. */
  tone?: HomeSectionTone;
  className?: string;
}

export function HomeSectionHeader({
  copy,
  withLink = true,
  tone = 'light',
  className,
}: HomeSectionHeaderProps) {
  const isDark = tone === 'dark';

  return (
    <header data-testid="home-section-header" data-tone={tone} className={cn('mb-8', className)}>
      <div
        data-testid="home-section-ornament"
        className="editorial-ornament mb-5"
        aria-hidden="true"
      >
        <span />
      </div>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h2
          className={cn(
            'font-serif text-3xl font-light md:text-4xl',
            isDark ? 'text-text-on-dark' : 'text-text-primary'
          )}
        >
          {copy.heading}
        </h2>
        {withLink && <HomeSectionLink href={copy.href} label={copy.linkLabel} tone={tone} />}
      </div>
      <div className="bg-secondary mt-3 h-px w-16 opacity-60" aria-hidden="true" />
      <p
        className={cn(
          'mt-4 max-w-3xl font-sans leading-relaxed',
          isDark ? 'text-text-on-dark-muted' : 'text-text-muted'
        )}
      >
        {copy.lead}
      </p>
    </header>
  );
}

/** Enlace "ver más" de la portada, con la flecha que lo distingue del texto. */
export function HomeSectionLink({
  href,
  label,
  tone = 'light',
  className,
}: {
  href: string;
  label: string;
  tone?: HomeSectionTone;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline',
        tone === 'dark' ? 'text-secondary' : 'text-primary',
        className
      )}
    >
      {label}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}
