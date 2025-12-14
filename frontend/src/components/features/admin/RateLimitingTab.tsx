/**
 * RateLimitingTab Component
 *
 * Tab content for Rate Limiting monitoring
 * Shows statistics, violations, and blocked IPs
 */

'use client';

import { useRateLimitData } from '@/hooks/api/useAdminSecurity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export function RateLimitingTab() {
  const { data, isLoading } = useRateLimitData();
  const [unblockIPAddress, setUnblockIPAddress] = useState<string | null>(null);

  const handleUnblockClick = (ip: string) => {
    setUnblockIPAddress(ip);
  };

  const handleUnblockConfirm = () => {
    if (!unblockIPAddress) return;

    // TODO: Implementar cuando el backend tenga el endpoint DELETE /admin/security/block-ip/:ip
    toast.info('Función de desbloqueo pendiente de implementación en backend');
    setUnblockIPAddress(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton data-testid="skeleton-stat-1" className="h-32" />
          <Skeleton data-testid="skeleton-stat-2" className="h-32" />
          <Skeleton data-testid="skeleton-stat-3" className="h-32" />
        </div>
        <Skeleton data-testid="skeleton-table" className="h-64" />
      </div>
    );
  }

  const totalViolations = data?.violations.reduce((sum, v) => sum + v.count, 0) || 0;
  const activeViolatingIps = data?.violations.length || 0;
  const blockedIpsCount = data?.blockedIPs.length || 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Violaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViolations}</div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="text-sm font-medium">IPs con Violaciones Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeViolatingIps}</div>
          </CardContent>
        </Card>

        <Card className={blockedIpsCount > 0 ? 'border-red-200 bg-red-50' : 'border-gray-200'}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">IPs Bloqueadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blockedIpsCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Violaciones de Rate Limiting */}
      <Card>
        <CardHeader>
          <CardTitle>IPs con Violaciones</CardTitle>
        </CardHeader>
        <CardContent>
          {!data?.violations || data.violations.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">No hay violaciones registradas</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP</TableHead>
                  <TableHead>Cantidad de Violaciones</TableHead>
                  <TableHead>Primera Violación</TableHead>
                  <TableHead>Última Violación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.violations.map((violation) => (
                  <TableRow key={violation.ipAddress}>
                    <TableCell className="font-mono">{violation.ipAddress}</TableCell>
                    <TableCell>{violation.count}</TableCell>
                    <TableCell>{new Date(violation.firstViolation).toLocaleString()}</TableCell>
                    <TableCell>{new Date(violation.lastViolation).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* IPs Bloqueadas */}
      <Card>
        <CardHeader>
          <CardTitle>IPs Bloqueadas</CardTitle>
        </CardHeader>
        <CardContent>
          {!data?.blockedIPs || data.blockedIPs.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">No hay IPs bloqueadas</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP</TableHead>
                  <TableHead>Razón del Bloqueo</TableHead>
                  <TableHead>Bloqueada Desde</TableHead>
                  <TableHead>Expira En</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.blockedIPs.map((blocked) => (
                  <TableRow key={blocked.ipAddress}>
                    <TableCell className="font-mono">{blocked.ipAddress}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        {blocked.reason}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(blocked.blockedAt).toLocaleString()}</TableCell>
                    <TableCell>
                      {blocked.expiresAt ? new Date(blocked.expiresAt).toLocaleString() : 'Nunca'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnblockClick(blocked.ipAddress)}
                      >
                        Desbloquear
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* AlertDialog para confirmar desbloqueo */}
      <AlertDialog open={!!unblockIPAddress} onOpenChange={() => setUnblockIPAddress(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Desbloqueo</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas desbloquear la IP{' '}
              <code className="font-mono">{unblockIPAddress}</code>? Esta acción permitirá que la IP
              vuelva a acceder al sistema inmediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnblockConfirm}>Desbloquear IP</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
