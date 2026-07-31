/**
 * Servicios Holísticos - Catalog Page
 *
 * Public page listing all available holistic services.
 */
import type { Metadata } from 'next';

import { ServiciosPage } from '@/components/features/holistic-services';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';

export const metadata: Metadata = STATIC_PAGE_METADATA.servicios;

export default function ServiciosRoute() {
  return <ServiciosPage />;
}
