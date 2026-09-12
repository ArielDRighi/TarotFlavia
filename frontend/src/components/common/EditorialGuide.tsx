// 1. React & Next.js
import Link from 'next/link';
// 6. Utils & types
import { cn } from '@/lib/utils';

/**
 * Piezas compartidas por las notas de uso de las herramientas (T-SEO-015).
 *
 * Cada nota tiene una **estructura interna distinta** a propósito (listas de
 * preguntas, tabla de números, glosario del trío, fases lunares…): 78 fichas
 * con los mismos encabezados ya son una señal de "producido en volumen". Lo
 * que sí comparten es el cascarón —título `h2` con la línea dorada y la bajada,
 * los párrafos y el pie "Seguir leyendo"—, que vivía repetido en seis
 * componentes. Sin `'use client'`: es texto que tiene que llegar al crawler.
 */

/** `h2` + línea de acento + bajada. El `h1` es el de la página. */
export function GuideHeader({
  title,
  lead,
  className,
}: {
  title: string;
  lead: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="text-text-primary mb-3 font-serif text-3xl font-light md:text-4xl">{title}</h2>
      <div className="bg-secondary mb-5 h-px w-16 opacity-60" aria-hidden="true" />
      <p className="text-text-muted mb-8 font-sans leading-relaxed">{lead}</p>
    </div>
  );
}

/**
 * Párrafos de cuerpo. La clave es el índice y no el texto a propósito: dos
 * párrafos iguales (una ficha de la API puede traerlos) no deben chocar.
 */
export function GuideParagraphs({
  paragraphs,
  className,
}: {
  paragraphs: readonly string[];
  className?: string;
}) {
  return (
    <div className="space-y-3">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className={cn('text-text-primary font-sans leading-relaxed', className)}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}

/** `h3` + párrafos: el bloque más común de las notas. */
export function GuideBlock({
  heading,
  paragraphs,
}: {
  heading: string;
  paragraphs: readonly string[];
}) {
  return (
    <div>
      <h3 className="text-text-primary mb-2 font-serif text-xl font-semibold">{heading}</h3>
      <GuideParagraphs paragraphs={paragraphs} />
    </div>
  );
}

/** Pie "Seguir leyendo": enlaces internos para que el crawler siga recorriendo. */
export function GuideLinks({ links }: { links: ReadonlyArray<{ label: string; href: string }> }) {
  return (
    <nav
      aria-label="Seguir leyendo"
      className="border-border mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t pt-4"
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-secondary text-sm font-medium underline-offset-4 hover:underline"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
