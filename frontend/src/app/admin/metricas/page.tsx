/**
 * Platform Metrics Page
 *
 * Página con métricas agregadas de toda la plataforma (revenue, sesiones, performance).
 */

'use client';

import { PlatformMetricsContent } from '@/components/features/admin/PlatformMetricsContent';

export default function PlatformMetricsPage() {
  return (
    <div className="container py-8">
      <PlatformMetricsContent />
    </div>
  );
}
