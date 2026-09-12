// 5. Components
import { GuideBlock, GuideHeader, GuideLinks } from '@/components/common/EditorialGuide';
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
export function BirthChartGuide() {
  const { title, lead, requirements, trio, order, example, mistakes, limits, links } =
    BIRTH_CHART_GUIDE;

  return (
    <section data-testid="birth-chart-guide" className="container mx-auto max-w-3xl px-4 pb-12">
      <GuideHeader title={title} lead={lead} />

      <div className="space-y-10">
        <GuideBlock heading={requirements.heading} paragraphs={requirements.paragraphs} />

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

        <GuideBlock heading={order.heading} paragraphs={order.paragraphs} />

        <div className="border-secondary/60 bg-bg-main rounded-lg border-l-4 p-5">
          <GuideBlock heading={example.heading} paragraphs={example.paragraphs} />
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

        <GuideBlock heading={limits.heading} paragraphs={limits.paragraphs} />
      </div>

      <GuideLinks links={links} />
    </section>
  );
}
