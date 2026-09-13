// 1. React & Next.js
import Image from 'next/image';
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
 *
 * T-SEO-022: una miniatura pequeña de la carta astral a la izquierda de la
 * línea (`birth-chart-promo.webp`, ya en el repo). Sigue siendo una línea, no
 * una tarjeta de venta.
 */
export function ServicesStrip() {
  const { text, links } = HOME_EDITORIAL.services;

  return (
    <aside
      data-testid="home-services"
      className="border-border bg-card border-t px-4 py-8"
      aria-label="Servicios"
    >
      <div className="container mx-auto flex max-w-6xl items-center gap-5">
        <Image
          data-testid="home-services-thumbnail"
          src="/images/birth-chart-promo.webp"
          alt=""
          width={112}
          height={72}
          className="h-[72px] w-28 shrink-0 rounded-lg object-cover shadow-md ring-1 ring-black/5"
          aria-hidden="true"
        />
        <p className="text-text-muted font-sans text-sm leading-relaxed">
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
      </div>
    </aside>
  );
}
