// 1. React & Next.js
import Link from 'next/link';

// 6. Utils & types
import { EDITORIAL_POLICY } from '@/lib/constants/editorial-policy.data';
import { cn } from '@/lib/utils';
import { formatReviewMonth } from '@/lib/utils/date';

/**
 * EditorialPolicyContent
 *
 * Maqueta el contenido de `/politica-editorial` (T-SEO-017).
 *
 * Sin `'use client'` a propósito: es una página de confianza y nada de lo que
 * muestra depende de la API ni de la sesión, así que se renderiza entera en el
 * servidor y llega completa al crawler.
 *
 * El texto vive en `editorial-policy.data.ts`, no acá: así el guardarraíl de
 * palabras puede medirlo sin renderizar nada. Este componente solo decide la
 * jerarquía (`h1` → `h2`, sin saltos) y el ritmo de lectura, con la misma
 * maqueta que `AboutContent` para que las dos páginas se lean como un par.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EditorialPolicyContentProps {
  /** Clases CSS adicionales. */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EditorialPolicyContent({ className }: EditorialPolicyContentProps) {
  const { title, lead, sections, closing, links, lastReviewed } = EDITORIAL_POLICY;

  return (
    <article
      data-testid="editorial-policy-content"
      className={cn('container mx-auto px-4 py-10 sm:py-14', className)}
    >
      <div className="mx-auto max-w-3xl">
        {/* Cabecera: título + bajada */}
        <header className="space-y-5 text-center">
          <h1 className="text-foreground font-serif text-4xl font-bold sm:text-5xl">{title}</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">{lead}</p>
        </header>

        {/* Secciones */}
        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.heading} className="space-y-4">
              <h2 className="text-foreground font-serif text-2xl font-semibold">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-muted-foreground leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        {/* Cierre */}
        <p className="text-muted-foreground border-border mt-12 border-t pt-8 leading-relaxed">
          {closing}
        </p>

        {/* La política afirma que el contenido se revisa; sin una fecha a la
            vista, eso no lo puede verificar nadie. */}
        <p
          data-testid="editorial-policy-last-reviewed"
          className="text-muted-foreground mt-6 text-sm"
        >
          Última revisión editorial: {formatReviewMonth(lastReviewed)}
        </p>

        {/* Enlaces internos: el crawler sigue recorriendo desde acá */}
        <nav
          aria-label="Enlaces relacionados"
          className="border-border mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t pt-6"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-secondary focus-visible:ring-secondary rounded-sm text-sm font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </article>
  );
}
