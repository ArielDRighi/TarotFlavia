/**
 * FavoriteTarotistaButton Component
 *
 * Button to set/display favorite tarotista for FREE users
 * Shows different states based on subscription status
 */
'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { useMySubscription, useSetFavoriteTarotista } from '@/hooks/api/useSubscriptions';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// ============================================================================
// Types
// ============================================================================

export interface FavoriteTarotistaButtonProps {
  /** Tarotista ID (numeric) */
  tarotistaId: number;
  /** Tarotista name for confirmation dialog */
  tarotistaName: string;
}

// ============================================================================
// Main Component
// ============================================================================

export function FavoriteTarotistaButton({
  tarotistaId,
  tarotistaName,
}: FavoriteTarotistaButtonProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Get auth user
  const user = useAuthStore((state) => state.user);

  // Get subscription data
  const { data: subscription, isLoading: isLoadingSubscription } = useMySubscription();

  // Set favorite mutation
  const { mutate: setFavorite, isPending } = useSetFavoriteTarotista();

  // ============================================================================
  // Guards
  // ============================================================================

  // Don't render if user is not logged in
  if (!user) {
    return null;
  }

  // Don't render if user is premium (has access to all tarotistas)
  if (user.plan === 'premium' || user.plan === 'professional') {
    return null;
  }

  // Don't render while loading
  if (isLoadingSubscription || !subscription) {
    return null;
  }

  // ============================================================================
  // State Checks
  // ============================================================================

  const isFavorite = subscription.favoriteTarotistaId === tarotistaId;
  const canChange = subscription.canChangeFavorite;
  const daysUntilChange = subscription.daysUntilChange;

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleSetFavorite = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    setFavorite(tarotistaId);
    setShowConfirmDialog(false);
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
  };

  // ============================================================================
  // Render States
  // ============================================================================

  // Already favorite - show golden badge
  if (isFavorite) {
    return (
      <Badge
        variant="outline"
        className="border-secondary bg-secondary/10 text-secondary flex items-center gap-2 px-4 py-2 text-sm font-semibold"
      >
        <Star className="fill-secondary h-5 w-5" />
        Tu tarotista favorito
      </Badge>
    );
  }

  // Has different favorite and cooldown active - show cooldown message
  if (!canChange && !isFavorite) {
    return (
      <p className="text-sm text-gray-600">
        Podrás cambiar en {daysUntilChange} {daysUntilChange === 1 ? 'día' : 'días'}
      </p>
    );
  }

  // Can set as favorite - show button
  return (
    <>
      <Button
        onClick={handleSetFavorite}
        variant="outline"
        className="border-secondary text-secondary hover:bg-secondary/10 flex items-center gap-2"
      >
        <Star className="h-5 w-5" />
        Elegir como favorito
      </Button>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Confirmar tarotista favorito?</DialogTitle>
            <DialogDescription>
              ¿Establecer a {tarotistaName} como tu tarotista favorito? Solo podrás cambiarlo en 30
              días.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={isPending}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={isPending}>
              {isPending ? 'Confirmando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
