import type { Metadata } from 'next';

import { ServiceDetailPage } from '@/components/features/holistic-services';
import { getHolisticServiceDetail, getHolisticServices } from '@/lib/api/holistic-services-api';
import { getServiceDetailMetadata } from '@/lib/metadata/page-metadata';

/**
 * Servicio Holístico - Detail Page
 *
 * Public page showing details and purchase CTA for a specific holistic service.
 */

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const service = await getHolisticServiceDetail(slug);
    return getServiceDetailMetadata(service);
  } catch {
    return {};
  }
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const services = await getHolisticServices();
    return services.map((service) => ({ slug: service.slug }));
  } catch {
    return [];
  }
}

export default async function ServicioDetailRoute({ params }: Props) {
  const { slug } = await params;
  return <ServiceDetailPage slug={slug} />;
}
