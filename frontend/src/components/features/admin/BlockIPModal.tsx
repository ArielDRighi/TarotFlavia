/**
 * BlockIPModal Component
 *
 * Modal for blocking an IP address with a reason
 */

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useBlockIP } from '@/hooks/api/useAdminSecurity';
import { toast } from 'sonner';
import type { RateLimitViolation } from '@/types/admin-security.types';

interface BlockIPModalProps {
  violation: RateLimitViolation;
  open: boolean;
  onClose: () => void;
}

export function BlockIPModal({ violation, open, onClose }: BlockIPModalProps) {
  const [reason, setReason] = useState('');
  const { mutate: blockIP, isPending } = useBlockIP();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast.error('Debes proporcionar una razón para el bloqueo');
      return;
    }

    blockIP(
      {
        ip: violation.ip,
        reason: reason.trim(),
      },
      {
        onSuccess: () => {
          toast.success(`IP ${violation.ip} bloqueada correctamente`);
          onClose();
        },
        onError: (error) => {
          toast.error(`Error al bloquear IP: ${error.message}`);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bloquear IP: {violation.ip}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-muted-foreground mb-4 text-sm">
              Esta IP ha tenido <strong>{violation.count}</strong> violaciones de rate limiting.
            </p>

            <div className="space-y-2">
              <Label htmlFor="reason">Razón del Bloqueo</Label>
              <Textarea
                id="reason"
                placeholder="Ej: Múltiples violaciones de rate limiting"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? 'Bloqueando...' : 'Bloquear IP'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
