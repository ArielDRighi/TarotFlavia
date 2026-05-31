'use client';

import { SERVICE_INTROS } from '@/lib/constants/service-intros.data';
import { ServiceIntro } from '@/components/features/encyclopedia/ServiceIntro';

interface Props {
  className?: string;
}

/**
 * NumerologyIntro Component
 *
 * Tarjeta informativa de la página de Numerología. Es una instancia del
 * componente genérico `ServiceIntro` con los datos del servicio de numerología.
 */
export function NumerologyIntro({ className }: Props) {
  return <ServiceIntro data={SERVICE_INTROS.numerology} className={className} />;
}
