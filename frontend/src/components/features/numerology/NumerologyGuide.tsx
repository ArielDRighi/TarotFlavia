// 5. Components
import { GuideBlock, GuideHeader, GuideLinks } from '@/components/common/EditorialGuide';
// 6. Utils & types
import { NUMEROLOGY_GUIDE } from '@/lib/constants/numerology-guide.data';

/**
 * Nota de uso de `/numerologia` (T-SEO-015): qué muestra el informe y cómo
 * leerlo. Va debajo de la calculadora (`NumerologyPage`, cliente). Sin
 * `'use client'`: es el texto que tiene que llegar al crawler. Contenido en
 * `numerology-guide.data.ts`, con guardarraíl de palabras.
 *
 * Reemplaza a `NumerologyIntro` (la tarjeta `ServiceIntro` de plantilla).
 */
export function NumerologyGuide({ className }: { className?: string }) {
  const { title, lead, calculation, numbers, reading, faq, limits, links } = NUMEROLOGY_GUIDE;

  return (
    <section data-testid="numerology-guide" className={className}>
      <GuideHeader title={title} lead={lead} />

      <div className="space-y-10">
        <GuideBlock heading={calculation.heading} paragraphs={calculation.paragraphs} />

        <div>
          <h3 className="text-text-primary mb-2 font-serif text-xl font-semibold">
            {numbers.heading}
          </h3>
          <p className="text-text-muted mb-4 font-sans leading-relaxed">{numbers.intro}</p>
          <div className="border-border overflow-x-auto rounded-xl border">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-4 py-2 font-semibold">
                    Número
                  </th>
                  <th scope="col" className="px-4 py-2 font-semibold">
                    Tema
                  </th>
                  <th scope="col" className="px-4 py-2 font-semibold">
                    En pocas palabras
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {numbers.rows.map((row) => (
                  <tr key={row.number}>
                    <th scope="row" className="text-secondary px-4 py-2 font-serif text-lg">
                      {row.number}
                    </th>
                    <td className="text-text-primary px-4 py-2 font-medium">{row.theme}</td>
                    <td className="text-text-muted px-4 py-2">{row.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <GuideBlock heading={reading.heading} paragraphs={reading.paragraphs} />

        <div>
          <h3 className="text-text-primary mb-3 font-serif text-xl font-semibold">{faq.heading}</h3>
          <dl data-testid="numerology-faq" className="space-y-4">
            {faq.items.map((item) => (
              <div key={item.question} className="border-border bg-card rounded-xl border p-4">
                <dt className="text-text-primary font-sans font-semibold">{item.question}</dt>
                <dd className="text-text-muted mt-2 font-sans text-sm leading-relaxed">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <GuideBlock heading={limits.heading} paragraphs={limits.paragraphs} />
      </div>

      <GuideLinks links={links} />
    </section>
  );
}
