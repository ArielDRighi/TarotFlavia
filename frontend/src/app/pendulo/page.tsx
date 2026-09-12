import type { Metadata } from 'next';

import { PendulumConsultation } from '@/components/features/pendulum/PendulumConsultation';
import { PendulumUsageGuide } from '@/components/features/pendulum/PendulumUsageGuide';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';

export const metadata: Metadata = STATIC_PAGE_METADATA.pendulo;

/**
 * Péndulo digital (`/pendulo`): la herramienta arriba, usable sin registro, y
 * debajo la nota de uso en el HTML (T-SEO-015).
 */
export default function PenduloPage() {
  return (
    <>
      <PendulumConsultation />
      <PendulumUsageGuide />
    </>
  );
}
