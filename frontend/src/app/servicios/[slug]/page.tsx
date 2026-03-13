/**
 * Servicio Holístico - Detail Page
 *
 * Public page showing details and purchase CTA for a specific holistic service.
 * Business logic will be delegated to HolisticServiceDetail component (future task).
 */
interface Props {
  params: { slug: string };
}

export default function ServicioDetailPage({ params }: Props) {
  return (
    <div className="bg-bg-main min-h-screen px-4 py-8 md:px-8" data-testid="servicio-detail-page">
      <p className="sr-only">Slug: {params.slug}</p>
      {/* TODO T-SF-F02: Implementar HolisticServiceDetail */}
    </div>
  );
}
