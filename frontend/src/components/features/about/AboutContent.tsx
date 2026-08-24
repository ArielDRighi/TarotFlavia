// 1. React & Next.js
import Image from 'next/image';
import Link from 'next/link';

// 6. Utils & types
import { ABOUT_PAGE } from '@/lib/constants/about-page.data';
import { LOGO } from '@/lib/constants/branding';
import { cn } from '@/lib/utils';

/**
 * AboutContent
 *
 * Maqueta el contenido de `/sobre-nosotros` (T-SEO-011).
 *
 * Sin `'use client'` a propósito: es la página de señales de autoría del sitio y
 * nada de lo que muestra depende de la API ni de la sesión, así que se renderiza
 * entera en el servidor y llega completa al crawler.
 *
 * El texto vive en `about-page.data.ts`, no acá: así el guardarraíl de palabras
 * puede medirlo sin renderizar nada. Este componente solo decide la jerarquía
 * (`h1` → `h2`, sin saltos) y el ritmo de lectura.
 *
 * **No lleva foto de personas.** El equipo no se presenta con nombres propios, y
 * una imagen de stock haciendo de "nuestro equipo" es peor señal que ninguna:
 * la identidad visual la aporta la marca.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * El logo es apaisado (655×386). Declararlo cuadrado lo dibujaba letterboxed
 * dentro de una caja de 80×80 —y con un `rounded-full` que no recortaba nada—,
 * así que la única imagen de la página se veía bastante más chica de lo que el
 * código sugería.
 */
const LOGO_ALT = 'Auguria';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Nombres de mes en español, para no depender del locale del runtime. */
const MONTH_NAMES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/**
 * Formatea `YYYY-MM` como "agosto de 2026".
 *
 * Sin construir un `Date`: un `new Date('2026-08')` es medianoche UTC y en
 * UTC-3 retrocede al mes anterior — el mismo bug de zona horaria que ya mordió
 * dos veces con las fechas de nacimiento.
 */
function formatReviewDate(isoMonth: string): string {
  const [year, month] = isoMonth.split('-');
  const monthName = MONTH_NAMES[Number(month) - 1];

  return monthName ? `${monthName} de ${year}` : year;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AboutContentProps {
  /** Clases CSS adicionales. */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AboutContent({ className }: AboutContentProps) {
  const { title, lead, sections, principlesHeading, principles, closing, links } = ABOUT_PAGE;

  return (
    <article
      data-testid="about-content"
      className={cn('container mx-auto px-4 py-10 sm:py-14', className)}
    >
      <div className="mx-auto max-w-3xl">
        {/* Cabecera: marca + título + bajada */}
        <header className="space-y-5 text-center">
          <Image
            src={LOGO.path}
            alt={LOGO_ALT}
            width={LOGO.width}
            height={LOGO.height}
            className="mx-auto h-20 w-auto"
            priority
          />
          <h1 className="text-foreground font-serif text-4xl font-bold sm:text-5xl">{title}</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">{lead}</p>
        </header>

        {/* Secciones editoriales */}
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

        {/* Principios editoriales */}
        <section data-testid="about-principles" className="border-border mt-12 border-t pt-10">
          <h2 className="text-foreground font-serif text-2xl font-semibold">{principlesHeading}</h2>
          <dl className="mt-6 space-y-5">
            {principles.map((principle) => (
              <div key={principle.term} className="border-border bg-card rounded-xl border p-5">
                <dt className="text-card-foreground font-semibold">{principle.term}</dt>
                <dd className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {principle.description}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Cierre */}
        <p className="text-muted-foreground mt-10 leading-relaxed">{closing}</p>

        {/* La página afirma que el contenido se revisa periódicamente; sin una
            fecha a la vista, eso no lo puede verificar nadie. */}
        <p data-testid="about-last-reviewed" className="text-muted-foreground mt-6 text-sm">
          Última revisión editorial: {formatReviewDate(ABOUT_PAGE.lastReviewed)}
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
