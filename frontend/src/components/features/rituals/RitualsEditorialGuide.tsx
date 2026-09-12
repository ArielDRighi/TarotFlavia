// 5. Components
import { GuideBlock, GuideHeader, GuideLinks } from '@/components/common/EditorialGuide';
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
      <GuideHeader title={title} lead={lead} className="max-w-3xl" />

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
          <div key={section.heading} className="max-w-3xl">
            <GuideBlock heading={section.heading} paragraphs={section.paragraphs} />
          </div>
        ))}
      </div>

      <GuideLinks links={links} />
    </section>
  );
}
