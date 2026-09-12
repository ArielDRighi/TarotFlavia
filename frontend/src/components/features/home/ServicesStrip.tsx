// 1. React & Next.js
import Link from 'next/link';
// 6. Utils & types
import { HOME_EDITORIAL } from '@/lib/constants/home-editorial.data';

/**
 * Franja discreta de servicios (T-SEO-014).
 *
 * Una línea con dos enlaces. Sin tabla, sin precios, sin lista de features: el
 * modelo de negocio no desaparece de la home, se muda a `/premium` y al
 * dashboard del usuario logueado. Es `<aside>` porque es lo único de la
 * portada que no es contenido editorial.
 */
export function ServicesStrip() {
  const { text, links } = HOME_EDITORIAL.services;

  return (
    <aside
      data-testid="home-services"
      className="border-border bg-card border-t px-4 py-8"
      aria-label="Servicios"
    >
      <p className="text-text-muted container mx-auto max-w-6xl font-sans text-sm leading-relaxed">
        {text}{' '}
        {links.map((link, index) => (
          <span key={link.href}>
            {index > 0 && <span aria-hidden="true"> · </span>}
            <Link href={link.href} className="text-primary underline-offset-4 hover:underline">
              {link.label}
            </Link>
          </span>
        ))}
        <span aria-hidden="true"> →</span>
      </p>
    </aside>
  );
}
