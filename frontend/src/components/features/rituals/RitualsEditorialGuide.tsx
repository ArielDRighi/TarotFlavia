// 1. React & Next.js
import Link from 'next/link';
// 6. Utils & types
import { RITUALS_HUB_GUIDE } from '@/lib/constants/rituals-hub.data';

/**
 * Índice editorial de `/rituales` (T-SEO-015): cómo elegir un ritual y cuándo
 * hacerlo. Va debajo de `RitualsPage` (la grilla, cliente, sembrada desde el
 * servidor). Sin `'use client'`: es el texto que tiene que llegar al crawler.
 * Contenido en `rituals-hub.data.ts`, con guardarraíl de palabras.
 */
export function RitualsEditorialGuide() {
  const { title, lead, phases, categories, sections, links } = RITUALS_HUB_GUIDE;

  return (
    <section
      data-testid="rituals-editorial-guide"
      className="container mx-auto max-w-4xl px-4 pb-12"
    >
      <h2 className="text-text-primary mb-3 font-serif text-3xl font-light md:text-4xl">{title}</h2>
      <div className="bg-secondary mb-5 h-px w-16 opacity-60" aria-hidden="true" />
      <p className="text-text-muted mb-8 max-w-3xl font-sans leading-relaxed">{lead}</p>

      <div className="space-y-10">
        <div>
          <h3 className="text-text-primary mb-2 font-serif text-xl font-semibold">
            {phases.heading}
          </h3>
          <p className="text-text-muted mb-4 max-w-3xl font-sans leading-relaxed">{phases.intro}</p>
          <dl data-testid="rituals-lunar-phases" className="grid gap-4 sm:grid-cols-2">
            {phases.items.map((item) => (
              <div key={item.phase} className="border-border bg-card rounded-xl border p-4">
                <dt className="text-text-primary font-serif text-lg font-semibold">
                  {item.phase}
                  <span className="text-secondary ml-2 font-sans text-sm font-medium">
                    {item.purpose}
                  </span>
                </dt>
                <dd className="text-text-muted mt-2 font-sans text-sm leading-relaxed">
                  {item.body}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h3 className="text-text-primary mb-2 font-serif text-xl font-semibold">
            {categories.heading}
          </h3>
          <p className="text-text-muted mb-4 max-w-3xl font-sans leading-relaxed">
            {categories.intro}
          </p>
          <ul data-testid="rituals-categories" className="space-y-3">
            {categories.items.map((item) => (
              <li key={item.name} className="border-secondary/60 border-l-2 pl-3">
                <p className="text-text-primary font-sans font-semibold">{item.name}</p>
                <p className="text-text-muted font-sans text-sm leading-relaxed">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>

        {sections.map((section) => (
          <div key={section.heading}>
            <h3 className="text-text-primary mb-2 font-serif text-xl font-semibold">
              {section.heading}
            </h3>
            <div className="max-w-3xl space-y-3">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-text-primary font-sans leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

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
    </section>
  );
}
