/**
 * ApprovePaymentDialog Component
 *
 * Confirmation dialog for approving a service payment with optional payment reference.
 */

'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ServicePurchase, ApprovePurchasePayload } from '@/types';

// ============================================================================
// Helpers
// ============================================================================

function formatPriceArs(amount: number): string {
  return `$${amount.toLocaleString('es-AR')}`;
}

// ============================================================================
// Props
// ============================================================================

interface ApprovePaymentDialogProps {
  purchase: ServicePurchase;
  open: boolean;
  onClose: () => void;
  onConfirm: (data: ApprovePurchasePayload) => void;
  isPending: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function ApprovePaymentDialog({
  purchase,
  open,
  onClose,
  onConfirm,
  isPending,
}: ApprovePaymentDialogProps) {
  const [paymentReference, setPaymentReference] = useState('');

  const handleConfirm = () => {
    onConfirm({
      paymentReference: paymentReference.trim() || undefined,
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Aprobar Pago</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Confirmar la aprobación del pago de{' '}
            <span className="font-semibold">{purchase.holisticService?.name}</span> por{' '}
            <span className="font-semibold">{formatPriceArs(purchase.amountArs)}</span>?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <Label htmlFor="payment-reference">Referencia de pago (opcional)</Label>
          <Input
            id="payment-reference"
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
            placeholder="Referencia de pago (ej: MP-123456)"
            className="mt-2"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
            {isPending ? 'Aprobando...' : 'Aprobar Pago'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
