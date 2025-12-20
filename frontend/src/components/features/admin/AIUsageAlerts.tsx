/**
 * AIUsageAlerts Component
 *
 * Displays active alerts for AI usage statistics
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { AIUsageStats } from '@/types/admin.types';

interface AIUsageAlertsProps {
  stats: AIUsageStats;
}

export function AIUsageAlerts({ stats }: AIUsageAlertsProps) {
  const alerts = [];

  if (stats.groqRateLimitAlert) {
    alerts.push({
      id: 'groq-rate-limit',
      icon: '⚠️',
      title: 'Límite de Groq cercano',
      description: 'El número de llamadas a Groq está cerca del límite diario.',
      variant: 'default' as const,
    });
  }

  if (stats.highErrorRateAlert) {
    alerts.push({
      id: 'high-error-rate',
      icon: '🔴',
      title: 'Tasa de errores alta',
      description: 'La tasa de errores en las llamadas de IA es superior a lo normal.',
      variant: 'destructive' as const,
    });
  }

  if (stats.highFallbackRateAlert) {
    alerts.push({
      id: 'high-fallback-rate',
      icon: '⚠️',
      title: 'Muchos fallbacks a proveedores secundarios',
      description: 'Se están usando proveedores de respaldo con más frecuencia de lo normal.',
      variant: 'default' as const,
    });
  }

  if (stats.highDailyCostAlert) {
    alerts.push({
      id: 'high-daily-cost',
      icon: '💰',
      title: 'Costo diario alto',
      description: 'El costo diario de IA ha superado el umbral establecido.',
      variant: 'default' as const,
    });
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {alerts.map((alert) => (
        <Alert key={alert.id} variant={alert.variant} role="alert">
          <AlertTitle className="flex items-center gap-2">
            <span>{alert.icon}</span>
            {alert.title}
          </AlertTitle>
          <AlertDescription>{alert.description}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
