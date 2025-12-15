/**
 * Platform Metrics Page
 *
 * Página con métricas agregadas de toda la plataforma (revenue, sesiones, performance).
 */

import { PlatformMetricsContent } from '@/components/features/admin/PlatformMetricsContent';

export default function PlatformMetricsPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">Métricas de Plataforma</h1>
      </div>

      <PlatformMetricsContent />
    </div>
  );
}
