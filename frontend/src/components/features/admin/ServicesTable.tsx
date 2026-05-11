/**
 * ServicesTable Component
 *
 * Table displaying holistic services with edit action for admin management.
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
import { Pencil, ShoppingBag } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import type { HolisticServiceAdmin } from '@/types';

// ============================================================================
// Helpers
// ============================================================================

function formatPriceArs(amount: number): string {
  return `$${amount.toLocaleString('es-AR')}`;
}

// ============================================================================
// Props
// ============================================================================

interface ServicesTableProps {
  services: HolisticServiceAdmin[];
  onEdit: (service: HolisticServiceAdmin) => void;
}

// ============================================================================
// Component
// ============================================================================

export function ServicesTable({ services, onEdit }: ServicesTableProps) {
  if (services.length === 0) {
    return (
      <EmptyState
        data-testid="services-table"
        icon={<ShoppingBag />}
        title="Sin servicios"
        message="No hay servicios registrados"
        className="rounded-lg border"
      />
    );
  }

  return (
    <div data-testid="services-table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Duración</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell className="font-medium">{service.name}</TableCell>
              <TableCell>{formatPriceArs(service.priceArs)}</TableCell>
              <TableCell>{service.durationMinutes} min</TableCell>
              <TableCell>
                {service.isActive ? (
                  <Badge variant="default">Activo</Badge>
                ) : (
                  <Badge variant="secondary">Inactivo</Badge>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(service)}
                  aria-label="Editar"
                >
                  <Pencil className="mr-1 h-4 w-4" />
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
