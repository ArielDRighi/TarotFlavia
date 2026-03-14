/**
 * ServiceCard Component
 *
 * Displays a holistic service in the catalog grid.
 * Shows name, short description, price in ARS, duration, and a "Ver más" link.
 */
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';
import type { HolisticService } from '@/types';

interface ServiceCardProps {
  service: HolisticService;
}

/**
 * Format a number as ARS currency with period thousands separator
 * e.g. 15000 → "15.000"
 */
function formatArs(amount: number): string {
  return amount.toLocaleString('es-AR');
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Card data-testid="service-card" className="flex flex-col transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="font-serif text-lg">{service.name}</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <p className="text-text-secondary text-sm">{service.shortDescription}</p>

        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium">
            {formatArs(service.priceArs)}{' '}
            <span className="text-text-secondary font-normal">ARS</span>
          </span>
          <span className="text-text-secondary">•</span>
          <span>
            {service.durationMinutes} <span className="text-text-secondary">min</span>
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={ROUTES.SERVICIO_DETAIL(service.slug)}>Ver más</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
