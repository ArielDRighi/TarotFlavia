import { cache } from 'react';
import type { Metadata } from 'next';

import { ServiceDetailPage } from '@/components/features/holistic-services';
import { getHolisticServiceDetail, getHolisticServices } from '@/lib/api/holistic-services-api';
import { getServiceDetailMetadata } from '@/lib/metadata/page-metadata';
import { resolveRouteResource, safeStaticParams } from '@/lib/metadata/route-data';

/**
 * Servicio Holístico - Detail Page
 *
 * Public page showing details and purchase CTA for a specific holistic service.
 */

/** Sin esto la metadata quedaría congelada al build: los servicios se editan. */
export const revalidate = 86400;

interface Props {
  params: Promise<{ slug: string }>;
}

/** `generateMetadata` y la página piden el mismo servicio; `cache()` evita el doble fetch. */
const getServiceCached = cache((slug: string) =>
  resolveRouteResource(() => getHolisticServiceDetail(slug))
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  return getServiceDetailMetadata(await getServiceCached(slug));
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return safeStaticParams(getHolisticServices, (service) => ({ slug: service.slug }));
}

export default async function ServicioDetailRoute({ params }: Props) {
  const { slug } = await params;

  return <ServiceDetailPage slug={slug} initialService={await getServiceCached(slug)} />;
}
