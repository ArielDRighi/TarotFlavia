/**
 * SecurityEventsTab Component
 *
 * Tab content for Security Events monitoring
 * Shows security events with filtering and pagination
 */

'use client';

import { useState } from 'react';
import { useSecurityEvents } from '@/hooks/api/useAdminSecurity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from './Pagination';
import type {
  SecurityEventFilters,
  SecurityEventSeverity,
  SecurityEventType,
} from '@/types/admin-security.types';

const SEVERITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
} as const;

export function SecurityEventsTab() {
  const [filters, setFilters] = useState<SecurityEventFilters>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useSecurityEvents(filters);

  const handleFilterChange = (key: keyof SecurityEventFilters, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1, // Reset page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 10 });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="eventType">Tipo de Evento</Label>
              <Select
                value={filters.eventType || ''}
                onValueChange={(value) =>
                  handleFilterChange('eventType', value as SecurityEventType)
                }
              >
                <SelectTrigger id="eventType">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="login_failed">Login Fallido</SelectItem>
                  <SelectItem value="suspicious_activity">Actividad Sospechosa</SelectItem>
                  <SelectItem value="rate_limit_violation">Violación Rate Limit</SelectItem>
                  <SelectItem value="unauthorized_access">Acceso No Autorizado</SelectItem>
                  <SelectItem value="brute_force_attempt">Intento Fuerza Bruta</SelectItem>
                  <SelectItem value="account_locked">Cuenta Bloqueada</SelectItem>
                  <SelectItem value="ip_blocked">IP Bloqueada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severidad</Label>
              <Select
                value={filters.severity || ''}
                onValueChange={(value) =>
                  handleFilterChange('severity', value as SecurityEventSeverity)
                }
              >
                <SelectTrigger id="severity">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha Inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha Fin</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Buscar por ID de usuario..."
              type="number"
              value={filters.userId || ''}
              onChange={(e) => handleFilterChange('userId', parseInt(e.target.value) || '')}
              className="max-w-xs"
            />
            <Button variant="outline" onClick={clearFilters}>
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Eventos */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos de Seguridad</CardTitle>
        </CardHeader>
        <CardContent>
          {!data || data.data.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No se encontraron eventos de seguridad
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Tipo de Evento</TableHead>
                    <TableHead>Severidad</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Descripción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(event.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>{event.eventType.replace(/_/g, ' ')}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={SEVERITY_COLORS[event.severity]}>
                          {event.severity.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{event.userId || '-'}</TableCell>
                      <TableCell className="font-mono">{event.ip}</TableCell>
                      <TableCell>{event.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginación */}
              {data.meta.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={data.meta.page}
                    totalPages={data.meta.totalPages}
                    totalItems={data.meta.totalItems}
                    limit={data.meta.limit}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
