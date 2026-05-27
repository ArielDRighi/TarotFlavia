/**
 * TarotistasTable Component
 *
 * Tabla responsiva para mostrar tarotistas en el panel admin
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
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Settings, Ban, RefreshCw, BarChart3, Users } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { AdminTarotista } from '@/types/admin-tarotistas.types';

// T-ADM-003 (Opción B — MVP single-tarotista): Las acciones "Ver perfil" y
// "Configuración" apuntan a rutas que no existen todavía (/admin/tarotistas/[id]).
// Se deshabilitan con tooltip hasta implementar el flujo multi-tarotista completo.
// Ver: docs/BACKLOG_ADMIN_AUDIT_2026_05.md#adm-003

interface TarotistasTableProps {
  tarotistas: AdminTarotista[];
  onAction: (action: string, tarotista: AdminTarotista) => void;
}

// Helper functions for formatting
const formatRevenue = (value: number | null) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const formatRating = (value: number | null) => {
  if (value === null || value === undefined) return 'N/A';
  return value.toFixed(1);
};

export function TarotistasTable({ tarotistas, onAction }: TarotistasTableProps) {
  if (tarotistas.length === 0) {
    return (
      <EmptyState
        icon={<Users />}
        title="Sin tarotistas"
        message="No hay tarotistas para mostrar"
        className="rounded-lg border"
      />
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Especialidades</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Sesiones</TableHead>
            <TableHead>Revenue</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tarotistas.map((tarotista) => (
            <TableRow key={tarotista.id}>
              <TableCell className="font-medium">
                <div>
                  <p className="font-semibold">{tarotista.nombrePublico}</p>
                  {tarotista.añosExperiencia && (
                    <p className="text-muted-foreground text-xs">
                      {tarotista.añosExperiencia} años exp.
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm">
                  {tarotista.especialidades.length > 0 ? tarotista.especialidades.join(', ') : '-'}
                </p>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span className="font-semibold">{formatRating(tarotista.ratingPromedio)}</span>
                  {tarotista.totalReviews > 0 && (
                    <span className="text-muted-foreground text-xs">
                      ({tarotista.totalReviews})
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-semibold">{tarotista.totalLecturas}</span>
              </TableCell>
              <TableCell>
                <span className="font-semibold">{formatRevenue(tarotista.totalIngresos)}</span>
              </TableCell>
              <TableCell>
                <Badge variant={tarotista.isActive ? 'default' : 'secondary'}>
                  {tarotista.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      data-testid={`actions-menu-trigger-${tarotista.id}`}
                    >
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {/* T-ADM-003: deshabilitado hasta implementar multi-tarotista */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <DropdownMenuItem
                              data-testid="action-view-profile"
                              disabled
                              className="cursor-not-allowed opacity-50"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ver perfil
                            </DropdownMenuItem>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>Disponible con multi-tarotista</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {/* T-ADM-003: deshabilitado hasta implementar multi-tarotista */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <DropdownMenuItem
                              data-testid="action-edit-config"
                              disabled
                              className="cursor-not-allowed opacity-50"
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              Editar configuración IA
                            </DropdownMenuItem>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>Disponible con multi-tarotista</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <DropdownMenuSeparator />
                    {tarotista.isActive ? (
                      <DropdownMenuItem
                        data-testid="action-deactivate"
                        onClick={() => onAction('deactivate', tarotista)}
                        className="text-orange-600"
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        Desactivar
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        data-testid="action-reactivate"
                        onClick={() => onAction('reactivate', tarotista)}
                        className="text-green-600"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reactivar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      data-testid="action-view-metrics"
                      onClick={() => onAction('view-metrics', tarotista)}
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Ver métricas
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
