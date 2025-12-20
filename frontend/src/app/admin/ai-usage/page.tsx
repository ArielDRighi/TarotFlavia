'use client';

/**
 * AI Usage Page
 *
 * Admin page displaying AI usage statistics, costs, and alerts
 */

import { AIUsageContent } from '@/components/features/admin/AIUsageContent';

export default function AIUsagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Uso de Inteligencia Artificial</h1>
        <p className="text-muted-foreground">
          Monitoreo de uso, costos y rendimiento de proveedores de IA
        </p>
      </div>

      <AIUsageContent />
    </div>
  );
}
