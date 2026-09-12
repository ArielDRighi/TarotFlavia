// 1. React & Next.js
import Link from 'next/link';
// 6. Utils & types
import { BIRTH_CHART_GUIDE } from '@/lib/constants/birth-chart-guide.data';

/**
 * Nota de uso de `/carta-astral` (T-SEO-015): cómo leer tu carta natal. Va
 * debajo del formulario (`BirthChartPageContent`, cliente). Sin `'use client'`:
 * es el texto que tiene que llegar al crawler. Contenido en
 * `birth-chart-guide.data.ts`, con guardarraíl de palabras.
 *
 * Reemplaza a la tarjeta `ServiceIntro` de plantilla; el enlace a la
 * enciclopedia apunta a la guía de la carta astral y a signos, planetas y casas.
 */
function Paragraphs({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="space-y-3">
      {paragraphs.map((paragraph) => (
        <p key={paragraph} className="text-text-primary font-sans leading-relaxed">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function Block({ heading, paragraphs }: { heading: string; paragraphs: string[] }) {
  return (
    <div>
      <h3 className="text-text-primary mb-2 font-serif text-xl font-semibold">{heading}</h3>
      <Paragraphs paragraphs={paragraphs} />
    </div>
  );
}

export function BirthChartGuide() {
  const { title, lead, requirements, trio, order, example, mistakes, limits, links } =
    BIRTH_CHART_GUIDE;

  return (
    <section data-testid="birth-chart-guide" className="container mx-auto max-w-3xl px-4 pb-12">
      <h2 className="text-text-primary mb-3 font-serif text-3xl font-light md:text-4xl">{title}</h2>
      <div className="bg-secondary mb-5 h-px w-16 opacity-60" aria-hidden="true" />
      <p className="text-text-muted mb-8 font-sans leading-relaxed">{lead}</p>

      <div className="space-y-10">
        <Block heading={requirements.heading} paragraphs={requirements.paragraphs} />

        <div>
          <h3 className="text-text-primary mb-2 font-serif text-xl font-semibold">
            {trio.heading}
          </h3>
          <p className="text-text-muted mb-4 font-sans leading-relaxed">{trio.intro}</p>
          <dl data-testid="birth-chart-trio" className="grid gap-4 sm:grid-cols-3">
            {trio.items.map((item) => (
              <div key={item.term} className="border-border bg-card rounded-xl border p-4">
                <dt className="text-text-primary font-serif text-lg font-semibold">
                  {item.term}
                  <span className="text-text-muted mt-1 block font-sans text-sm font-normal italic">
                    {item.question}
                  </span>
                </dt>
                <dd className="text-text-muted mt-2 font-sans text-sm leading-relaxed">
                  {item.body}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <Block heading={order.heading} paragraphs={order.paragraphs} />

        <div className="border-secondary/60 bg-bg-main rounded-lg border-l-4 p-5">
          <Block heading={example.heading} paragraphs={example.paragraphs} />
        </div>

        <div>
          <h3 className="text-text-primary mb-2 font-serif text-xl font-semibold">
            {mistakes.heading}
          </h3>
          <p className="text-text-muted mb-3 font-sans leading-relaxed">{mistakes.intro}</p>
          <ol
            data-testid="birth-chart-mistakes"
            className="text-text-primary list-decimal space-y-2 pl-6 font-sans leading-relaxed"
          >
            {mistakes.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>

        <Block heading={limits.heading} paragraphs={limits.paragraphs} />
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
