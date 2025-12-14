/**
 * RateLimitingTab Component
 *
 * Tab content for Rate Limiting monitoring
 * Shows statistics, violations, and blocked IPs
 */

'use client';

import { useRateLimitViolations, useBlockedIPs, useUnblockIP } from '@/hooks/api/useAdminSecurity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import { BlockIPModal } from './BlockIPModal';
import type { RateLimitViolation } from '@/types/admin-security.types';

export function RateLimitingTab() {
  const { data: violations, isLoading: isLoadingViolations } = useRateLimitViolations();
  const { data: blockedIPs, isLoading: isLoadingBlocked } = useBlockedIPs();
  const { mutate: unblock, isPending: isUnblocking } = useUnblockIP();
  const [selectedViolation, setSelectedViolation] = useState<RateLimitViolation | null>(null);

  const handleUnblock = (ip: string) => {
    if (!confirm(`¿Estás seguro de desbloquear la IP ${ip}?`)) {
      return;
    }

    unblock(ip, {
      onSuccess: () => {
        toast.success('IP desbloqueada correctamente');
      },
      onError: (error) => {
        toast.error(`Error al desbloquear IP: ${error.message}`);
      },
    });
  };

  if (isLoadingViolations || isLoadingBlocked) {
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

  const totalViolations = violations?.reduce((sum, v) => sum + v.count, 0) || 0;
  const activeViolatingIps = violations?.length || 0;
  const blockedIpsCount = blockedIPs?.length || 0;

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
          {!violations || violations.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">No hay violaciones registradas</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP</TableHead>
                  <TableHead>Cantidad de Violaciones</TableHead>
                  <TableHead>Primera Violación</TableHead>
                  <TableHead>Última Violación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {violations.map((violation) => (
                  <TableRow key={violation.ip}>
                    <TableCell className="font-mono">{violation.ip}</TableCell>
                    <TableCell>{violation.count}</TableCell>
                    <TableCell>{new Date(violation.firstViolation).toLocaleString()}</TableCell>
                    <TableCell>{new Date(violation.lastViolation).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setSelectedViolation(violation)}
                      >
                        Bloquear IP
                      </Button>
                    </TableCell>
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
          {!blockedIPs || blockedIPs.length === 0 ? (
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
                {blockedIPs.map((blocked) => (
                  <TableRow key={blocked.ip}>
                    <TableCell className="font-mono">{blocked.ip}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        {blocked.reason}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(blocked.blockedAt).toLocaleString()}</TableCell>
                    <TableCell>{new Date(blocked.expiresAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnblock(blocked.ip)}
                        disabled={isUnblocking}
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

      {/* Modal para bloquear IP */}
      {selectedViolation && (
        <BlockIPModal
          violation={selectedViolation}
          open={!!selectedViolation}
          onClose={() => setSelectedViolation(null)}
        />
      )}
    </div>
  );
}
