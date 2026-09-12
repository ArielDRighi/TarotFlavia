// 1. React & Next.js
import Link from 'next/link';
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

export function NumerologyGuide({ className }: { className?: string }) {
  const { title, lead, calculation, numbers, reading, faq, limits, links } = NUMEROLOGY_GUIDE;

  return (
    <section data-testid="numerology-guide" className={className}>
      <h2 className="text-text-primary mb-3 font-serif text-3xl font-light md:text-4xl">{title}</h2>
      <div className="bg-secondary mb-5 h-px w-16 opacity-60" aria-hidden="true" />
      <p className="text-text-muted mb-8 font-sans leading-relaxed">{lead}</p>

      <div className="space-y-10">
        <div>
          <h3 className="text-text-primary mb-2 font-serif text-xl font-semibold">
            {calculation.heading}
          </h3>
          <Paragraphs paragraphs={calculation.paragraphs} />
        </div>

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

        <div>
          <h3 className="text-text-primary mb-2 font-serif text-xl font-semibold">
            {reading.heading}
          </h3>
          <Paragraphs paragraphs={reading.paragraphs} />
        </div>

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

        <div>
          <h3 className="text-text-primary mb-2 font-serif text-xl font-semibold">
            {limits.heading}
          </h3>
          <Paragraphs paragraphs={limits.paragraphs} />
        </div>
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
