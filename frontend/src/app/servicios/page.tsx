/**
 * Servicios Holísticos - Catalog Page
 *
 * Public page listing all available holistic services.
 *
 * Servía 5 palabras propias: el catálogo llegaba por el cliente, así que el
 * crawler veía el título y seis esqueletos (T-SEO-003). Ahora la ruta resuelve
 * los servicios en el servidor y `ServiciosPage` siembra React Query con ellos.
 */
import type { Metadata } from 'next';

import { ListingIntro } from '@/components/common/ListingIntro';
import { ServiciosPage } from '@/components/features/holistic-services';
import { getHolisticServices } from '@/lib/api/holistic-services-api';
import { LISTING_INTROS } from '@/lib/constants/listing-intros.data';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';
import { resolveListingData } from '@/lib/metadata/route-data';

export const metadata: Metadata = STATIC_PAGE_METADATA.servicios;

/** El catálogo y los precios se editan desde el admin: una hora de ISR. */
export const revalidate = 3600;

export default async function ServiciosRoute() {
  const initialServices = await resolveListingData(getHolisticServices);

  return (
    <>
      <ServiciosPage initialServices={initialServices} />
      <ListingIntro intro={LISTING_INTROS.servicios} />
    </>
  );
}
