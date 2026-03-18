/**
 * TransactionsTable Component
 *
 * Read-only historial de transacciones de servicios holísticos para el admin.
 * Muestra: servicio, usuario, monto, estado MP, ID de pago MP, fecha de pago, fecha del turno.
 * Incluye filtros por estado, por servicio.
 * No tiene acciones de aprobación — toda la aprobación es automática vía Mercado Pago.
 */

'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatTimestampLocalized } from '@/lib/utils/date';
import type { ServicePurchase, PurchaseStatus } from '@/types';

// ============================================================================
// Constants
// ============================================================================

const STATUS_LABELS: Record<PurchaseStatus, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

const STATUS_VARIANTS: Record<PurchaseStatus, 'default' | 'secondary' | 'destructive' | 'outline'> =
  {
    pending: 'outline',
    paid: 'default',
    cancelled: 'destructive',
    refunded: 'secondary',
  };

// ============================================================================
// Helpers
// ============================================================================

function formatPriceArs(amount: number): string {
  return `$${amount.toLocaleString('es-AR')}`;
}

function formatDate(dateString: string): string {
  return formatTimestampLocalized(dateString, 'es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateOnly(dateString: string): string {
  // dateString is YYYY-MM-DD — parse as local noon to avoid timezone shift
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getUniqueServices(purchases: ServicePurchase[]): Array<{ id: number; name: string }> {
  const seen = new Set<number>();
  const services: Array<{ id: number; name: string }> = [];
  for (const p of purchases) {
    if (p.holisticService && !seen.has(p.holisticServiceId)) {
      seen.add(p.holisticServiceId);
      services.push({ id: p.holisticServiceId, name: p.holisticService.name });
    }
  }
  return services;
}

// ============================================================================
// Props
// ============================================================================

interface TransactionsTableProps {
  purchases: ServicePurchase[];
}

// ============================================================================
// Component
// ============================================================================

export function TransactionsTable({ purchases }: TransactionsTableProps) {
  // ---- Filter state ----
  const [statusFilter, setStatusFilter] = useState<PurchaseStatus | 'all'>('all');
  const [serviceFilter, setServiceFilter] = useState<number | 'all'>('all');

  // ---- Derived state ----
  const uniqueServices = getUniqueServices(purchases);

  const filtered = purchases.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.paymentStatus === statusFilter;
    const matchesService = serviceFilter === 'all' || p.holisticServiceId === serviceFilter;
    return matchesStatus && matchesService;
  });

  // ---- Empty state ----
  if (purchases.length === 0) {
    return (
      <div
        data-testid="transactions-table"
        className="border-border bg-bg-main rounded-lg border p-8 text-center"
      >
        <p className="text-muted-foreground">No hay transacciones registradas</p>
      </div>
    );
  }

  // ---- Render ----
  return (
    <div data-testid="transactions-table" className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-status" className="text-muted-foreground text-xs font-medium">
            Estado
          </label>
          <select
            id="filter-status"
            data-testid="filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PurchaseStatus | 'all')}
            className="border-border bg-background rounded-md border px-3 py-1.5 text-sm"
          >
            <option value="all">Todos</option>
            <option value="paid">Pagado</option>
            <option value="pending">Pendiente</option>
            <option value="cancelled">Cancelado</option>
            <option value="refunded">Reembolsado</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="filter-service" className="text-muted-foreground text-xs font-medium">
            Servicio
          </label>
          <select
            id="filter-service"
            data-testid="filter-service"
            value={serviceFilter}
            onChange={(e) => {
              const val = e.target.value;
              setServiceFilter(val === 'all' ? 'all' : Number(val));
            }}
            className="border-border bg-background rounded-md border px-3 py-1.5 text-sm"
          >
            <option value="all">Todos</option>
            {uniqueServices.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div className="border-border rounded-lg border p-6 text-center">
          <p className="text-muted-foreground text-sm">
            No hay transacciones que coincidan con los filtros
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado MP</TableHead>
              <TableHead>ID Pago MP</TableHead>
              <TableHead>Fecha de Pago</TableHead>
              <TableHead>Fecha del Turno</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>#{purchase.id}</TableCell>
                <TableCell className="font-medium">
                  {purchase.holisticService?.name ?? '—'}
                </TableCell>
                <TableCell>Usuario #{purchase.userId}</TableCell>
                <TableCell>{formatPriceArs(purchase.amountArs)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANTS[purchase.paymentStatus]}>
                    {STATUS_LABELS[purchase.paymentStatus]}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {purchase.mercadoPagoPaymentId ?? '—'}
                </TableCell>
                <TableCell>{purchase.paidAt ? formatDate(purchase.paidAt) : '—'}</TableCell>
                <TableCell>
                  {purchase.selectedDate ? formatDateOnly(purchase.selectedDate) : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
