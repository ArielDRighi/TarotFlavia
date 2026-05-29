'use client';

/**
 * AIUsageContent Component
 *
 * Main content component for AI usage statistics page
 * Handles state and data fetching logic, including date range filtering
 */

import { useState } from 'react';
import { useAIUsageStats } from '@/hooks/queries/useAdminAIUsage';
import { AIUsageAlerts } from './AIUsageAlerts';
import { AIUsageMetricsCards } from './AIUsageMetricsCards';
import { AIProvidersTable } from './AIProvidersTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type DatePreset = 'today' | '7d' | '30d' | 'all';

interface DatePresetOption {
  label: string;
  value: DatePreset;
}

const DATE_PRESETS: DatePresetOption[] = [
  { label: 'Hoy', value: 'today' },
  { label: 'Últimos 7 días', value: '7d' },
  { label: 'Últimos 30 días', value: '30d' },
  { label: 'Todo el período', value: 'all' },
];

function getDateRange(preset: DatePreset): { startDate?: string; endDate?: string } {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  switch (preset) {
    case 'today': {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      return {
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString(),
      };
    }
    case '7d': {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return {
        startDate: start.toISOString(),
        endDate: endOfDay.toISOString(),
      };
    }
    case '30d': {
      const start = new Date(now);
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return {
        startDate: start.toISOString(),
        endDate: endOfDay.toISOString(),
      };
    }
    case 'all':
    default:
      return {};
  }
}

export function AIUsageContent() {
  const [selectedPreset, setSelectedPreset] = useState<DatePreset>('all');
  const { startDate, endDate } = getDateRange(selectedPreset);
  const { data: stats, isLoading, error } = useAIUsageStats(startDate, endDate);

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value as DatePreset);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error al cargar las estadísticas de IA. Por favor, intenta de nuevo más tarde.
        </AlertDescription>
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert>
        <AlertDescription>No hay datos disponibles.</AlertDescription>
      </Alert>
    );
  }

  const hasAlerts =
    stats.groqRateLimitAlert ||
    stats.highErrorRateAlert ||
    stats.highFallbackRateAlert ||
    stats.highDailyCostAlert;

  const selectedPresetLabel =
    DATE_PRESETS.find((p) => p.value === selectedPreset)?.label ?? 'Todo el período';

  return (
    <div className="space-y-6">
      {/* Filtro de período */}
      <div className="flex items-center gap-3">
        <label htmlFor="date-preset-select" className="text-sm font-medium">
          Período:
        </label>
        <Select value={selectedPreset} onValueChange={handlePresetChange}>
          <SelectTrigger
            id="date-preset-select"
            className="w-48"
            data-testid="date-preset-select"
            aria-label="Seleccionar período"
          >
            <SelectValue placeholder={selectedPresetLabel} />
          </SelectTrigger>
          <SelectContent>
            {DATE_PRESETS.map((preset) => (
              <SelectItem
                key={preset.value}
                value={preset.value}
                data-testid={`preset-option-${preset.value}`}
              >
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasAlerts && <AIUsageAlerts stats={stats} />}

      <AIUsageMetricsCards stats={stats} />

      <Card>
        <CardHeader>
          <CardTitle>Estadísticas por Proveedor</CardTitle>
        </CardHeader>
        <CardContent>
          <AIProvidersTable providers={stats.statistics} />
        </CardContent>
      </Card>
    </div>
  );
}
