/**
 * Servicio Holístico - Detail Page
 *
 * Public page showing details and purchase CTA for a specific holistic service.
 */
import { ServiceDetailPage } from '@/components/features/holistic-services';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ServicioDetailRoute({ params }: Props) {
  const { slug } = await params;
  return <ServiceDetailPage slug={slug} />;
}
