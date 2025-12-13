/**
 * RecentReadingsTable - Tabla de lecturas recientes para dashboard admin
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { RecentReading } from '@/types/admin.types';
import { cn } from '@/lib/utils/cn';

interface RecentReadingsTableProps {
  readings: RecentReading[];
}

/**
 * Formatea el tipo de tirada
 */
function formatSpreadType(spreadType: string): string {
  const spreadTypeMap: Record<string, string> = {
    SIMPLE: 'Simple',
    TRES_CARTAS: 'Tres Cartas',
    CRUZ_CELTA: 'Cruz Celta',
  };

  return spreadTypeMap[spreadType] || spreadType;
}

/**
 * Formatea la fecha
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Badge de status
 */
function StatusBadge({ status }: { status: RecentReading['status'] }) {
  const statusConfig = {
    completed: {
      label: 'Completada',
      className: 'bg-green-100 text-green-800',
    },
    pending: {
      label: 'Pendiente',
      className: 'bg-yellow-100 text-yellow-800',
    },
    failed: {
      label: 'Fallida',
      className: 'bg-red-100 text-red-800',
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant="secondary" className={cn(config.className)}>
      {config.label}
    </Badge>
  );
}

export function RecentReadingsTable({ readings }: RecentReadingsTableProps) {
  if (readings.length === 0) {
    return (
      <div className="text-muted-foreground rounded-lg border p-8 text-center">
        No hay lecturas recientes
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Tipo de Tirada</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {readings.map((reading) => (
            <TableRow key={reading.id}>
              <TableCell className="font-medium">{reading.userName}</TableCell>
              <TableCell>{formatDate(reading.date)}</TableCell>
              <TableCell>{formatSpreadType(reading.spreadType)}</TableCell>
              <TableCell>
                <StatusBadge status={reading.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
