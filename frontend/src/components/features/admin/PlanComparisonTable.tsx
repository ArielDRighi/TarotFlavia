/**
 * PlanComparisonTable - Tabla comparativa de features entre planes
 */

'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import type { PlanConfig, PlanType } from '@/types/admin.types';
import { cn } from '@/lib/utils';

interface PlanComparisonTableProps {
  plans: PlanConfig[];
}

const planOrder: PlanType[] = ['anonymous', 'free', 'premium'];

const planColors = {
  anonymous: 'bg-gray-100 text-gray-800 border-gray-300',
  free: 'bg-blue-100 text-blue-800 border-blue-300',
  premium: 'bg-purple-100 text-purple-800 border-purple-300',
};

const planLabels = {
  anonymous: 'Anónimo',
  free: 'Gratuito',
  premium: 'Premium',
};

const features = [
  { key: 'name', label: 'Nombre', type: 'text' as const },
  { key: 'readingsLimit', label: 'Lecturas mensuales', type: 'number' as const },
  { key: 'aiQuotaMonthly', label: 'Cuota mensual de IA', type: 'number' as const },
  {
    key: 'allowCustomQuestions',
    label: 'Preguntas personalizadas',
    type: 'boolean' as const,
  },
  { key: 'allowSharing', label: 'Compartir lecturas', type: 'boolean' as const },
  { key: 'allowAdvancedSpreads', label: 'Tiradas avanzadas', type: 'boolean' as const },
  { key: 'price', label: 'Precio mensual (USD)', type: 'price' as const },
];

function formatValue(
  value: unknown,
  type: 'number' | 'boolean' | 'price' | 'text'
): React.ReactNode {
  if (type === 'text') {
    return String(value);
  }

  if (type === 'number') {
    const numValue = value as number;
    return numValue === -1 ? (
      <span className="font-medium text-green-600">Ilimitado</span>
    ) : (
      numValue
    );
  }

  if (type === 'price') {
    const priceValue = value as number;
    return priceValue === 0 ? 'Gratis' : `$${priceValue.toFixed(2)}`;
  }

  if (type === 'boolean') {
    const boolValue = value as boolean;
    return boolValue ? (
      <Check className="mx-auto h-5 w-5 text-green-600" />
    ) : (
      <X className="mx-auto h-5 w-5 text-red-500" />
    );
  }

  return String(value);
}

export function PlanComparisonTable({ plans }: PlanComparisonTableProps) {
  if (!plans || plans.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-gray-500">
        No hay planes disponibles para comparar
      </div>
    );
  }

  // Ordenar planes según el orden definido
  const sortedPlans = [...plans].sort((a, b) => {
    return planOrder.indexOf(a.planType) - planOrder.indexOf(b.planType);
  });

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px] font-bold">Feature</TableHead>
            {sortedPlans.map((plan) => (
              <TableHead key={plan.id} className="text-center">
                <Badge className={cn('border', planColors[plan.planType])}>
                  {planLabels[plan.planType]}
                </Badge>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.map((feature) => (
            <TableRow key={feature.key}>
              <TableCell className="font-medium">{feature.label}</TableCell>
              {sortedPlans.map((plan) => (
                <TableCell key={plan.id} className="text-center">
                  {formatValue(plan[feature.key as keyof PlanConfig], feature.type)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
