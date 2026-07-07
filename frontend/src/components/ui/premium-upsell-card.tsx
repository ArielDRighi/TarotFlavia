import * as React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PremiumUpsellCardProps {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  icon?: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

/**
 * PremiumUpsellCard — CTA de conversión a plan Premium.
 *
 * Base común del sistema de upsell. Usa los tokens de marca dorados
 * (`secondary`) alineados con el rediseño del circuito premium (T-PREM-007):
 * borde y fondo `secondary`, icono `text-secondary` y CTA con foco dorado.
 * NO usar <Alert> aquí ya que es una CTA de conversión, no una notificación.
 */
export function PremiumUpsellCard({
  title,
  description,
  href,
  ctaLabel,
  icon,
  className,
  'data-testid': testId,
}: PremiumUpsellCardProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        'border-secondary/40 bg-secondary/10 flex items-start gap-3 rounded-lg border p-3',
        className
      )}
    >
      {icon ?? <Zap className="text-secondary mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />}
      <div className="min-w-0 flex-1">
        <p className="text-foreground mb-1 text-sm font-medium">{title}</p>
        <p className="text-muted-foreground mb-2 text-xs">{description}</p>
        <Button asChild size="sm" className="focus-visible:ring-secondary/50">
          <Link href={href}>{ctaLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
