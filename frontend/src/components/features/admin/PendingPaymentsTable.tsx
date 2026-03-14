/**
 * PendingPaymentsTable Component
 *
 * Table displaying pending service payments awaiting admin approval.
 */

'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle } from 'lucide-react';
import { formatTimestampLocalized } from '@/lib/utils/date';
import type { ServicePurchase } from '@/types';

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

// ============================================================================
// Props
// ============================================================================

interface PendingPaymentsTableProps {
  purchases: ServicePurchase[];
  onApprove: (purchase: ServicePurchase) => void;
}

// ============================================================================
// Component
// ============================================================================

export function PendingPaymentsTable({ purchases, onApprove }: PendingPaymentsTableProps) {
  if (purchases.length === 0) {
    return (
      <div
        data-testid="pending-payments-table"
        className="border-border bg-bg-main rounded-lg border p-8 text-center"
      >
        <p className="text-muted-foreground">No hay pagos pendientes de aprobación</p>
      </div>
    );
  }

  return (
    <div data-testid="pending-payments-table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>Servicio</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((purchase) => (
            <TableRow key={purchase.id}>
              <TableCell>#{purchase.id}</TableCell>
              <TableCell>Usuario #{purchase.userId}</TableCell>
              <TableCell className="font-medium">{purchase.holisticService?.name ?? '—'}</TableCell>
              <TableCell>{formatPriceArs(purchase.amountArs)}</TableCell>
              <TableCell>
                <Badge variant="outline">Pendiente</Badge>
              </TableCell>
              <TableCell>{formatDate(purchase.createdAt)}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApprove(purchase)}
                  aria-label="Aprobar"
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Aprobar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
