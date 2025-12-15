/**
 * AuditLogsContent Component
 *
 * Component with all audit logs logic and UI
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
import type { AuditLogFilters, AuditActionType } from '@/types/admin-audit.types';

const ACTION_COLORS: Record<string, string> = {
  user_banned: 'bg-red-100 text-red-800',
  user_unbanned: 'bg-green-100 text-green-800',
  plan_changed: 'bg-blue-100 text-blue-800',
  role_added: 'bg-green-100 text-green-800',
  role_removed: 'bg-orange-100 text-orange-800',
  reading_deleted: 'bg-red-100 text-red-800',
  reading_restored: 'bg-green-100 text-green-800',
  card_modified: 'bg-blue-100 text-blue-800',
  spread_modified: 'bg-blue-100 text-blue-800',
  config_changed: 'bg-blue-100 text-blue-800',
  user_created: 'bg-green-100 text-green-800',
  user_deleted: 'bg-red-100 text-red-800',
};

export function AuditLogsContent() {
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 20,
  });

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { data, isLoading } = useAuditLogs(filters);

  const handleFilterChange = (key: keyof AuditLogFilters, value: string | number) => {
    const finalValue = value === 'all' || !value ? undefined : value;
    setFilters((prev) => ({
      ...prev,
      [key]: finalValue,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 20 });
  };

  const toggleRow = (id: string) => {
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
      <div className="space-y-6">
        <Skeleton className="h-48" data-testid="skeleton-filters" />
        <Skeleton className="h-96" data-testid="skeleton-table" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                value={filters.action || 'all'}
                onValueChange={(value) => handleFilterChange('action', value as AuditActionType)}
              >
                <SelectTrigger id="action">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="user_created">user_created</SelectItem>
                  <SelectItem value="user_banned">user_banned</SelectItem>
                  <SelectItem value="user_unbanned">user_unbanned</SelectItem>
                  <SelectItem value="user_deleted">user_deleted</SelectItem>
                  <SelectItem value="role_added">role_added</SelectItem>
                  <SelectItem value="role_removed">role_removed</SelectItem>
                  <SelectItem value="plan_changed">plan_changed</SelectItem>
                  <SelectItem value="reading_deleted">reading_deleted</SelectItem>
                  <SelectItem value="reading_restored">reading_restored</SelectItem>
                  <SelectItem value="card_modified">card_modified</SelectItem>
                  <SelectItem value="spread_modified">spread_modified</SelectItem>
                  <SelectItem value="config_changed">config_changed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entityType">Entidad</Label>
              <Select
                value={filters.entityType || 'all'}
                onValueChange={(value) => handleFilterChange('entityType', value)}
              >
                <SelectTrigger id="entityType">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Reading">Reading</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Spread">Spread</SelectItem>
                  <SelectItem value="Config">Config</SelectItem>
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

      <Card>
        <CardHeader>
          <CardTitle>Logs de Auditoría</CardTitle>
        </CardHeader>
        <CardContent>
          {!data || data.logs.length === 0 ? (
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
                  {data.logs.map((log) => {
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
                          <TableCell>
                            {log.user ? log.user.name || log.user.email : `ID ${log.userId}`}
                          </TableCell>
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
                          <TableCell className="font-mono text-sm">
                            {log.ipAddress || 'N/A'}
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={6} className="bg-muted/50 p-4">
                              <div className="space-y-2">
                                {log.userAgent && (
                                  <div>
                                    <strong>User Agent:</strong>
                                    <p className="font-mono text-sm">{log.userAgent}</p>
                                  </div>
                                )}
                                {log.oldValue && (
                                  <div>
                                    <strong>Valor Anterior:</strong>
                                    <pre className="mt-1 rounded bg-gray-100 p-2 text-xs">
                                      {JSON.stringify(log.oldValue, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                <div>
                                  <strong>Valor Nuevo:</strong>
                                  <pre className="mt-1 rounded bg-gray-100 p-2 text-xs">
                                    {JSON.stringify(log.newValue, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>

              {data.meta.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={data.meta.currentPage}
                    totalPages={data.meta.totalPages}
                    totalItems={data.meta.totalItems}
                    limit={data.meta.itemsPerPage}
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
