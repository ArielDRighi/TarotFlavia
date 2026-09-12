// 1. React & Next.js
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
 */
export function EncyclopediaShowcase() {
  const copy = HOME_EDITORIAL.encyclopedia;

  return (
    <section data-testid="home-encyclopedia" className="bg-card px-4 py-14 md:py-20">
      <div className="container mx-auto max-w-6xl">
        <HomeSectionHeader copy={copy} />

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {copy.figures.map((figure) => (
            <li key={figure.href}>
              <Link
                href={figure.href}
                className="border-border bg-bg-main hover:border-secondary flex h-full flex-col gap-2 rounded-xl border p-5 transition-colors"
              >
                <span className="text-primary font-serif text-2xl font-semibold">
                  {figure.label}
                </span>
                <span className="text-text-muted font-sans text-sm leading-relaxed">
                  {figure.detail}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="text-text-muted mt-8 max-w-3xl font-sans leading-relaxed">{copy.body}</p>
      </div>
    </section>
  );
}
