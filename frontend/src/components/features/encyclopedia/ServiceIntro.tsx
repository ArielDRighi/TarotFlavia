'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ServiceIntroData, ServiceIntroSection } from '@/lib/constants/service-intros.data';

/**
 * ServiceIntro Component Props
 */
export interface ServiceIntroProps {
  /** Datos del servicio a mostrar (título, intro, secciones, nota, href). */
  data: ServiceIntroData;
  /** Clases CSS adicionales. */
  className?: string;
}

const ACCENT_CLASSES = {
  purple: { heading: 'text-purple-800', bullet: 'text-purple-600' },
  indigo: { heading: 'text-indigo-800', bullet: 'text-indigo-600' },
} as const;

/**
 * Resuelve el color de acento de una sección. Si no se especifica,
 * alterna automáticamente (par → púrpura, impar → índigo).
 */
function resolveAccent(section: ServiceIntroSection, index: number) {
  const accent = section.accent ?? (index % 2 === 0 ? 'purple' : 'indigo');
  return ACCENT_CLASSES[accent];
}

/**
 * ServiceIntro Component
 *
 * Tarjeta informativa rica y reutilizable para las páginas de servicio.
 * Replica el diseño de la tarjeta de Numerología (intro + secciones con
 * bullets explicativos + nota opcional + botón a la enciclopedia) a partir
 * de una estructura de datos tipada y centralizada.
 *
 * @example
 * ```tsx
 * import { SERVICE_INTROS } from '@/lib/constants/service-intros.data';
 *
 * <ServiceIntro data={SERVICE_INTROS.tarot} className="mb-6" />
 * ```
 */
export function ServiceIntro({ data, className }: ServiceIntroProps) {
  const { testId, title, intro, sections, note, href } = data;

  return (
    <Card
      className={cn('border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50', className)}
      data-testid={testId}
    >
      <CardContent className="space-y-4 p-6">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-purple-900">{title}</h2>
          <p className="text-gray-700">{intro}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section, index) => {
            const accent = resolveAccent(section, index);

            return (
              <div key={section.heading} className="space-y-2">
                <h3 className={cn('flex items-center gap-2 text-lg font-semibold', accent.heading)}>
                  {section.heading}
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {section.items.map((item) => (
                    <li key={item.term} className="flex items-start gap-2">
                      <span className={accent.bullet}>•</span>
                      <span>
                        <strong className="text-gray-700">{item.term}:</strong> {item.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {note && (
          <div className="rounded-lg border border-purple-200 bg-purple-100 p-3">
            <p className="text-sm text-purple-900">
              <strong>Nota:</strong> {note}
            </p>
          </div>
        )}

        <Button asChild variant="outline" size="sm">
          <Link href={href}>
            <BookOpen className="mr-2 h-4 w-4" />
            Ver más en la Enciclopedia
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
