/**
 * Admin Audit Logs Page
 *
 * Audit trail of all administrative actions
 */

'use client';

import React, { useState } from 'react';
import { useAuditLogs } from '@/hooks/api/useAuditLogs';
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
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Pagination } from '@/components/features/admin/Pagination';
import type { AuditLogFilters, AuditActionType, AuditEntityType } from '@/types/admin-audit.types';

const ACTION_COLORS: Record<string, string> = {
  USER_BANNED: 'bg-red-100 text-red-800',
  USER_UNBANNED: 'bg-green-100 text-green-800',
  PLAN_CHANGED: 'bg-blue-100 text-blue-800',
  ROLE_ADDED: 'bg-green-100 text-green-800',
  ROLE_REMOVED: 'bg-orange-100 text-orange-800',
  TAROTISTA_APPROVED: 'bg-green-100 text-green-800',
  TAROTISTA_REJECTED: 'bg-red-100 text-red-800',
  TAROTISTA_DEACTIVATED: 'bg-orange-100 text-orange-800',
  TAROTISTA_REACTIVATED: 'bg-green-100 text-green-800',
  IP_BLOCKED: 'bg-red-100 text-red-800',
  IP_UNBLOCKED: 'bg-green-100 text-green-800',
  PLAN_CONFIG_UPDATED: 'bg-blue-100 text-blue-800',
  USER_CREATED: 'bg-green-100 text-green-800',
  USER_UPDATED: 'bg-blue-100 text-blue-800',
  USER_DELETED: 'bg-red-100 text-red-800',
};

export default function AuditLogsPage() {
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 20,
  });

  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const { data, isLoading } = useAuditLogs(filters);

  const handleFilterChange = (key: keyof AuditLogFilters, value: string | number) => {
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
    setFilters({ page: 1, limit: 20 });
  };

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold">Registro de Auditoría</h1>
          <p className="text-muted-foreground mt-2">
            Historial de todas las acciones administrativas
          </p>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48" data-testid="skeleton-filters" />
          <Skeleton className="h-96" data-testid="skeleton-table" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">Registro de Auditoría</h1>
        <p className="text-muted-foreground mt-2">
          Historial de todas las acciones administrativas
        </p>
      </div>

      <div className="space-y-6">
        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="userId">Usuario (ID Admin)</Label>
                <Input
                  id="userId"
                  type="number"
                  placeholder="ID del admin..."
                  value={filters.userId || ''}
                  onChange={(e) =>
                    handleFilterChange('userId', e.target.value ? parseInt(e.target.value) : '')
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="action">Tipo de Acción</Label>
                <Select
                  value={filters.action || ''}
                  onValueChange={(value) => handleFilterChange('action', value as AuditActionType)}
                >
                  <SelectTrigger id="action">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="USER_BANNED">USER_BANNED</SelectItem>
                    <SelectItem value="USER_UNBANNED">USER_UNBANNED</SelectItem>
                    <SelectItem value="PLAN_CHANGED">PLAN_CHANGED</SelectItem>
                    <SelectItem value="ROLE_ADDED">ROLE_ADDED</SelectItem>
                    <SelectItem value="ROLE_REMOVED">ROLE_REMOVED</SelectItem>
                    <SelectItem value="TAROTISTA_APPROVED">TAROTISTA_APPROVED</SelectItem>
                    <SelectItem value="TAROTISTA_REJECTED">TAROTISTA_REJECTED</SelectItem>
                    <SelectItem value="TAROTISTA_DEACTIVATED">TAROTISTA_DEACTIVATED</SelectItem>
                    <SelectItem value="TAROTISTA_REACTIVATED">TAROTISTA_REACTIVATED</SelectItem>
                    <SelectItem value="IP_BLOCKED">IP_BLOCKED</SelectItem>
                    <SelectItem value="IP_UNBLOCKED">IP_UNBLOCKED</SelectItem>
                    <SelectItem value="PLAN_CONFIG_UPDATED">PLAN_CONFIG_UPDATED</SelectItem>
                    <SelectItem value="USER_CREATED">USER_CREATED</SelectItem>
                    <SelectItem value="USER_UPDATED">USER_UPDATED</SelectItem>
                    <SelectItem value="USER_DELETED">USER_DELETED</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entityType">Entidad</Label>
                <Select
                  value={filters.entityType || ''}
                  onValueChange={(value) =>
                    handleFilterChange('entityType', value as AuditEntityType)
                  }
                >
                  <SelectTrigger id="entityType">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Tarotista">Tarotista</SelectItem>
                    <SelectItem value="Reading">Reading</SelectItem>
                    <SelectItem value="Session">Session</SelectItem>
                    <SelectItem value="PlanConfig">PlanConfig</SelectItem>
                    <SelectItem value="IP">IP</SelectItem>
                    <SelectItem value="Application">Application</SelectItem>
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
            </div>

            <div className="mt-4 flex gap-2">
              <Input
                id="endDate"
                type="date"
                placeholder="Fecha fin..."
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="max-w-xs"
              />
              <Button variant="outline" onClick={clearFilters}>
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Logs de Auditoría</CardTitle>
          </CardHeader>
          <CardContent>
            {!data || data.data.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">
                No se encontraron logs de auditoría
              </p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Fecha/Hora</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Acción</TableHead>
                      <TableHead>Entidad</TableHead>
                      <TableHead>IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((log) => {
                      const isExpanded = expandedRows.has(log.id);
                      return (
                        <React.Fragment key={log.id}>
                          <TableRow>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRow(log.id)}
                                className="p-0"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleString()}
                            </TableCell>
                            <TableCell>{log.userName}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800'}
                              >
                                {log.action}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {log.entityType} #{log.entityId}
                            </TableCell>
                            <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow>
                              <TableCell colSpan={6} className="bg-muted/50 p-4">
                                <div className="space-y-2">
                                  <div>
                                    <strong>User Agent:</strong>
                                    <p className="font-mono text-sm">{log.userAgent}</p>
                                  </div>
                                  {log.oldValue && (
                                    <div>
                                      <strong>Valor Anterior:</strong>
                                      <pre className="mt-1 rounded bg-gray-100 p-2 text-xs">
                                        {JSON.stringify(log.oldValue, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                  {log.newValue && (
                                    <div>
                                      <strong>Valor Nuevo:</strong>
                                      <pre className="mt-1 rounded bg-gray-100 p-2 text-xs">
                                        {JSON.stringify(log.newValue, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
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
    </div>
  );
}
