import type { Metadata } from 'next';

import { PendulumConsultation } from '@/components/features/pendulum/PendulumConsultation';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';

export const metadata: Metadata = STATIC_PAGE_METADATA.pendulo;

export default function PenduloPage() {
  return <PendulumConsultation />;
}
