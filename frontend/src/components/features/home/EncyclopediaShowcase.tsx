// 1. React & Next.js
import Image from 'next/image';
import Link from 'next/link';
// 5. Components
import { HomeSectionHeader } from './HomeSectionHeader';
// 6. Utils & types
import { HOME_EDITORIAL } from '@/lib/constants/home-editorial.data';

/**
 * "Explorá la enciclopedia" con los números a la vista (T-SEO-014).
 *
 * 78 cartas · 12 signos · 12 casas · 10 planetas · 12 signos chinos, cada cifra
 * enlazada a su índice. Le muestra profundidad al revisor antes del clic; las
 * cifras y su detalle viven en `home-editorial.data.ts`.
 *
 * T-SEO-022: es la sección cósmica oscura de la portada (el mismo degradé noche
 * del hub de la enciclopedia) y cada cifra va en serif dorado sobre su
 * ilustración del catálogo, como las tarjetas de hub. Las ilustraciones son
 * decorativas (`alt=""`): la cifra y su detalle siguen siendo el texto.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/** Mismo degradé noche que `EnciclopediaHubContent` / `ArticleHero`. */
const NIGHT_GRADIENT = 'linear-gradient(160deg, #1a0a2e 0%, #2d1b69 55%, #1a0a2e 100%)';
const CARD_OVERLAY =
  'linear-gradient(180deg, rgba(26, 10, 46, 0.2) 0%, rgba(26, 10, 46, 0.6) 55%, rgba(26, 10, 46, 0.92) 100%)';

// ─── Component ────────────────────────────────────────────────────────────────

export function EncyclopediaShowcase() {
  const copy = HOME_EDITORIAL.encyclopedia;

  return (
    <section
      data-testid="home-encyclopedia"
      data-tone="dark"
      className="relative overflow-hidden px-4 py-14 md:py-20"
      style={{ background: NIGHT_GRADIENT }}
    >
      <div className="relative container mx-auto max-w-6xl">
        <HomeSectionHeader copy={copy} tone="dark" />

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {copy.figures.map((figure) => (
            <li key={figure.href}>
              <Link
                href={figure.href}
                className="group focus-visible:ring-secondary relative flex h-full min-h-[14rem] flex-col justify-end overflow-hidden rounded-2xl border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-12px_rgba(214,158,46,0.45)] focus-visible:ring-2 focus-visible:outline-none"
              >
                <Image
                  data-testid="home-encyclopedia-figure-image"
                  src={figure.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 224px"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: CARD_OVERLAY }}
                  aria-hidden="true"
                />
                <div className="relative z-10 flex flex-col gap-1.5 p-5">
                  <span className="text-secondary font-serif text-3xl font-semibold">
                    {figure.label}
                  </span>
                  <span className="text-text-on-dark-muted font-sans text-sm leading-relaxed">
                    {figure.detail}
                  </span>
                </div>
                {/* Filete dorado inferior */}
                <div
                  className="absolute inset-x-0 bottom-0 h-0.5"
                  style={{
                    background: 'linear-gradient(90deg, transparent, #d69e2e, transparent)',
                  }}
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>

        <p className="text-text-on-dark-muted mt-8 max-w-3xl font-sans leading-relaxed">
          {copy.body}
        </p>
      </div>
    </section>
  );
}
