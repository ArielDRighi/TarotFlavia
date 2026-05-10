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
 * Componente dedicado para banners de upsell con gradiente intencional.
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
        'flex items-start gap-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-3',
        className
      )}
    >
      {icon ?? <Zap className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" aria-hidden="true" />}
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-sm font-medium text-gray-900">{title}</p>
        <p className="mb-2 text-xs text-gray-600">{description}</p>
        <Button
          asChild
          size="sm"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Link href={href}>{ctaLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
