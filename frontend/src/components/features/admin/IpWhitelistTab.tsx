'use client';

import { useState } from 'react';
import { Shield, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  useIpWhitelist,
  useAddIpToWhitelist,
  useRemoveIpFromWhitelist,
} from '@/hooks/api/useAdminIpWhitelist';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { WhitelistActionResponse } from '@/types/admin-security.types';

export function IpWhitelistTab() {
  const [newIp, setNewIp] = useState('');
  const [ipToRemove, setIpToRemove] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useIpWhitelist();
  const { mutate: addIp, isPending: isAdding } = useAddIpToWhitelist();
  const { mutate: removeIp, isPending: isRemoving } = useRemoveIpFromWhitelist();

  const handleAdd = () => {
    const trimmed = newIp.trim();
    if (!trimmed) return;

    addIp(
      { ip: trimmed },
      {
        onSuccess: (result: WhitelistActionResponse) => {
          toast.success(result.message ?? `IP ${trimmed} agregada a la whitelist`);
          setNewIp('');
        },
        onError: () => {
          toast.error(`Error al agregar la IP ${trimmed} a la whitelist`);
        },
      }
    );
  };

  const handleRemoveConfirm = () => {
    if (!ipToRemove) return;

    removeIp(
      { ip: ipToRemove },
      {
        onSuccess: (result: WhitelistActionResponse) => {
          toast.success(result.message ?? `IP ${ipToRemove} eliminada de la whitelist`);
          setIpToRemove(null);
        },
        onError: () => {
          toast.error(`Error al eliminar la IP ${ipToRemove} de la whitelist`);
          setIpToRemove(null);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="skeleton-whitelist">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-destructive" data-testid="error-whitelist">
        <p>Error al cargar la IP whitelist.</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => void refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  const ips = data?.ips ?? [];

  return (
    <div className="space-y-6" data-testid="ip-whitelist-tab">
      {/* Header con conteo */}
      <div className="flex items-center gap-2">
        <Shield className="text-muted-foreground h-5 w-5" />
        <h3 className="text-lg font-semibold">IPs en Whitelist</h3>
        <Badge variant="secondary" data-testid="whitelist-count">
          {data?.count ?? 0}
        </Badge>
      </div>

      {/* Formulario para agregar IP */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agregar IP</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              data-testid="add-ip-input"
              placeholder="Ej: 203.0.113.45 o 2001:db8::1"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
              disabled={isAdding}
            />
            <Button
              data-testid="add-ip-button"
              onClick={handleAdd}
              disabled={isAdding || !newIp.trim()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de IPs */}
      {ips.length === 0 ? (
        <div
          className="text-muted-foreground rounded-lg border border-dashed p-8 text-center"
          data-testid="empty-whitelist"
        >
          No hay IPs en la whitelist. Las IPs agregadas aquí no serán bloqueadas por rate limiting.
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dirección IP</TableHead>
                <TableHead className="w-24 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ips.map((ip) => (
                <TableRow key={ip}>
                  <TableCell className="font-mono">{ip}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid={`remove-ip-${ip}`}
                      onClick={() => setIpToRemove(ip)}
                      disabled={isRemoving}
                    >
                      <Trash2 className="text-destructive h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* AlertDialog de confirmación para eliminar */}
      <AlertDialog open={!!ipToRemove} onOpenChange={(open) => !open && setIpToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar IP de la whitelist?</AlertDialogTitle>
            <AlertDialogDescription>
              La IP <span className="font-mono font-semibold">{ipToRemove}</span> será removida de
              la whitelist y quedará sujeta a las reglas de rate limiting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveConfirm} disabled={isRemoving}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
