import { EnciclopediaHubContent } from '@/components/features/encyclopedia/EnciclopediaHubContent';

/**
 * Enciclopedia Hub Page
 *
 * Route: /enciclopedia
 * Hub principal que muestra las 3 secciones: Tarot, Astrología, Guías.
 * All business logic is delegated to EnciclopediaHubContent component.
 */
export default function EnciclopediaPage() {
  return <EnciclopediaHubContent />;
}
