// 5. Components
import { GuideBlock, GuideHeader, GuideLinks } from '@/components/common/EditorialGuide';
// 6. Utils & types
import { PENDULUM_GUIDE } from '@/lib/constants/pendulum-guide.data';

/**
 * Nota de uso de `/pendulo` (T-SEO-015): cómo consultar el péndulo acá.
 *
 * Va debajo de `PendulumConsultation`, que sigue siendo la herramienta (cliente,
 * usable sin registro). Sin `'use client'`: es el texto que tiene que llegar al
 * crawler. El contenido vive en `pendulum-guide.data.ts`, donde el guardarraíl
 * mide el piso de palabras.
 *
 * Reemplaza a la tarjeta `ServiceIntro` de plantilla (emoji + 3 bullets +
 * "Ver más en la Enciclopedia"): el enlace a la enciclopedia se queda, pero
 * apunta a la entrada del péndulo, no al índice.
 */
export function PendulumUsageGuide() {
  const { title, lead, goodQuestions, badQuestions, movements, sections, links } = PENDULUM_GUIDE;

  return (
    <section data-testid="pendulum-usage-guide" className="container mx-auto max-w-3xl px-4 pb-12">
      <GuideHeader title={title} lead={lead} />

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-text-primary mb-2 font-serif text-xl font-semibold">
            {goodQuestions.heading}
          </h3>
          <p className="text-text-muted mb-3 font-sans text-sm leading-relaxed">
            {goodQuestions.intro}
          </p>
          <ul data-testid="pendulum-good-questions" className="space-y-3">
            {goodQuestions.items.map((item) => (
              <li key={item.question} className="border-secondary/60 border-l-2 pl-3">
                <p className="text-text-primary font-sans text-sm font-medium">«{item.question}»</p>
                <p className="text-text-muted font-sans text-sm leading-relaxed">{item.why}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-text-primary mb-2 font-serif text-xl font-semibold">
            {badQuestions.heading}
          </h3>
          <p className="text-text-muted mb-3 font-sans text-sm leading-relaxed">
            {badQuestions.intro}
          </p>
          <ul data-testid="pendulum-bad-questions" className="space-y-3">
            {badQuestions.items.map((item) => (
              <li key={item.question} className="border-border border-l-2 pl-3">
                <p className="text-text-primary font-sans text-sm font-medium">«{item.question}»</p>
                <p className="text-text-muted font-sans text-sm leading-relaxed">{item.why}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-text-primary mb-2 font-serif text-xl font-semibold">
          {movements.heading}
        </h3>
        <p className="text-text-muted mb-4 font-sans leading-relaxed">{movements.intro}</p>
        <dl data-testid="pendulum-movements" className="grid gap-4 sm:grid-cols-3">
          {movements.items.map((item) => (
            <div key={item.movement} className="border-border bg-card rounded-xl border p-4">
              <dt className="text-text-primary font-serif text-lg font-semibold">
                {item.movement}{' '}
                <span className="text-secondary font-sans text-sm font-medium">
                  → {item.answer}
                </span>
              </dt>
              <dd className="text-text-muted mt-2 font-sans text-sm leading-relaxed">
                {item.body}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <GuideBlock
            key={section.heading}
            heading={section.heading}
            paragraphs={section.paragraphs}
          />
        ))}
      </div>

      <GuideLinks links={links} />
    </section>
  );
}
