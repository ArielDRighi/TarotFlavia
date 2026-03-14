/**
 * Servicio Holístico - Detail Page
 *
 * Public page showing details and purchase CTA for a specific holistic service.
 */
import { ServiceDetailPage } from '@/components/features/holistic-services';

interface Props {
  params: { slug: string };
}

export default function ServicioDetailRoute({ params }: Props) {
  return <ServiceDetailPage slug={params.slug} />;
}
