// 5. Components
import { EditorialCard } from '@/components/common/EditorialCard';
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
 * La tarjeta la dibuja `EditorialCard`, que comparte con `ListingIntro`; lo
 * propio de este componente es el envoltorio, el bloque de preguntas frecuentes
 * y el aviso YMYL del pie.
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
    <EditorialCard
      testId="service-editorial"
      title={title}
      lead={lead}
      sections={sections}
      className={cn('bg-bg-main px-4 pb-12 md:px-8', className)}
    >
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
    </EditorialCard>
  );
}
