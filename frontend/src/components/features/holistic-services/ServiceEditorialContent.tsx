// 6. Utils & types
import { cn } from '@/lib/utils';
import type { ServiceDetailContent } from '@/lib/constants/service-details.data';

/**
 * ServiceEditorialContent
 *
 * Bloque editorial de una ficha de servicio holístico (T-SEO-012): en qué
 * consiste la sesión, cómo se prepara la persona, qué pasa durante y después,
 * para quién es y para quién no, y las preguntas frecuentes.
 *
 * Sin `'use client'` a propósito, igual que `ListingIntro`: es el contenido que
 * tiene que llegar al crawler aunque la API no responda y aunque
 * `ServiceDetailPage` se quede en su esqueleto o en su estado de error.
 *
 * El texto vive en `service-details.data.ts`, no acá: así el guardarraíl de
 * palabras, de unicidad y de vocabulario YMYL puede verificarlo sin renderizar.
 *
 * @example
 * ```tsx
 * import { SERVICE_DETAILS } from '@/lib/constants/service-details.data';
 *
 * <ServiceEditorialContent content={SERVICE_DETAILS['pendulo-hebreo']} />
 * ```
 */
export interface ServiceEditorialContentProps {
  /** Contenido a renderizar. */
  content: ServiceDetailContent;
  /** Clases CSS adicionales. */
  className?: string;
}

export function ServiceEditorialContent({ content, className }: ServiceEditorialContentProps) {
  const { title, lead, sections, faq, disclaimer } = content;

  return (
    <section
      data-testid="service-editorial"
      className={cn('bg-bg-main px-4 pb-12 md:px-8', className)}
    >
      <div className="border-border bg-card mx-auto max-w-3xl rounded-2xl border p-6 sm:p-8">
        <h2 className="text-card-foreground font-serif text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground mt-3 leading-relaxed">{lead}</p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {sections.map((section) => (
            <div key={section.heading}>
              <h3 className="text-card-foreground font-semibold">{section.heading}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        {faq.length > 0 && (
          <div data-testid="service-editorial-faq" className="border-border mt-8 border-t pt-6">
            <h3 className="text-card-foreground font-serif text-xl font-semibold">
              Preguntas frecuentes
            </h3>
            <dl className="mt-4 space-y-4">
              {faq.map((item) => (
                <div key={item.question}>
                  <dt className="text-card-foreground text-sm font-semibold">{item.question}</dt>
                  <dd className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {item.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <p
          data-testid="service-editorial-disclaimer"
          className="text-muted-foreground border-border mt-8 border-t pt-4 text-xs leading-relaxed"
        >
          {disclaimer}
        </p>
      </div>
    </section>
  );
}
