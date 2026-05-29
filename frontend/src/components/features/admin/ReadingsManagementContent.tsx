'use client';

import { useState } from 'react';
import { BookOpen, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useAdminReadings,
  useSoftDeleteReading,
  useRestoreReading,
} from '@/hooks/api/useAdminReadings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { AdminReadingListItem } from '@/types/admin-readings.types';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ReadingsTableSkeleton() {
  return (
    <div className="space-y-4" data-testid="readings-management-loading">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

interface ReadingRowProps {
  reading: AdminReadingListItem;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  isDeletePending: boolean;
  isRestorePending: boolean;
}

function ReadingRow({
  reading,
  onDelete,
  onRestore,
  isDeletePending,
  isRestorePending,
}: ReadingRowProps) {
  const isDeleted = Boolean(reading.deletedAt);

  return (
    <TableRow className={isDeleted ? 'opacity-60' : ''}>
      <TableCell className="text-muted-foreground font-mono text-xs">{reading.id}</TableCell>
      <TableCell className="max-w-[300px]">
        <span className="line-clamp-2 text-sm">{reading.question}</span>
      </TableCell>
      <TableCell className="text-sm">{reading.spreadName}</TableCell>
      <TableCell className="text-center text-sm">{reading.cardsCount}</TableCell>
      <TableCell className="text-sm">{formatDate(reading.createdAt)}</TableCell>
      <TableCell>
        {isDeleted ? (
          <Badge variant="destructive" data-testid="reading-deleted-badge">
            Eliminada
          </Badge>
        ) : (
          <Badge variant="secondary">Activa</Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {isDeleted ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={isRestorePending}>
                  <RefreshCw className="mr-1 size-3" />
                  Restaurar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Restaurar lectura?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción restaurará la lectura y la hará visible nuevamente para el usuario.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onRestore(reading.id)}>
                    Restaurar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeletePending}>
                  <Trash2 className="mr-1 size-3" />
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar lectura?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará la lectura de forma lógica. Podrá restaurarla
                    posteriormente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(reading.id)}>
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ReadingsManagementContent() {
  const [includeDeleted, setIncludeDeleted] = useState(false);

  const { data, isLoading, isError } = useAdminReadings({ includeDeleted });
  const { mutate: softDelete, isPending: isDeletePending } = useSoftDeleteReading();
  const { mutate: restore, isPending: isRestorePending } = useRestoreReading();

  const handleDelete = (id: number) => {
    softDelete(id, {
      onSuccess: () => toast.success('Lectura eliminada correctamente'),
      onError: () => toast.error('Error al eliminar la lectura'),
    });
  };

  const handleRestore = (id: number) => {
    restore(id, {
      onSuccess: () => toast.success('Lectura restaurada correctamente'),
      onError: () => toast.error('Error al restaurar la lectura'),
    });
  };

  if (isLoading) {
    return <ReadingsTableSkeleton />;
  }

  if (isError) {
    return (
      <Alert variant="destructive" data-testid="readings-management-error">
        <AlertDescription>
          Error al cargar las lecturas. Por favor, intentá nuevamente.
        </AlertDescription>
      </Alert>
    );
  }

  const readings = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6" data-testid="readings-management-content">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="text-muted-foreground size-6" />
          <h1 className="font-serif text-2xl font-bold">Lecturas</h1>
          {meta && (
            <Badge variant="outline" data-testid="readings-total-count">
              {meta.totalItems} lecturas
            </Badge>
          )}
        </div>

        {/* Toggle incluir eliminadas */}
        <div className="flex items-center gap-2">
          <Switch
            id="include-deleted"
            checked={includeDeleted}
            onCheckedChange={setIncludeDeleted}
            data-testid="toggle-include-deleted"
          />
          <Label htmlFor="include-deleted" className="text-sm">
            Incluir eliminadas
          </Label>
        </div>
      </div>

      {/* Empty state */}
      {readings.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-testid="readings-management-empty"
        >
          <BookOpen className="text-muted-foreground mb-4 size-12" />
          <p className="text-muted-foreground">No hay lecturas para mostrar.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Pregunta</TableHead>
                <TableHead>Tirada</TableHead>
                <TableHead className="text-center">Cartas</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readings.map((reading) => (
                <ReadingRow
                  key={reading.id}
                  reading={reading}
                  onDelete={handleDelete}
                  onRestore={handleRestore}
                  isDeletePending={isDeletePending}
                  isRestorePending={isRestorePending}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Meta info */}
      {meta && (
        <p className="text-muted-foreground text-xs">
          Mostrando {readings.length} de {meta.totalItems} lecturas
        </p>
      )}
    </div>
  );
}
