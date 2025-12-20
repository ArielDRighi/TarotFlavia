/**
 * FavoriteTarotistaButton Component
 *
 * Button to set/display favorite tarotista for FREE users
 * Shows different states based on subscription status
 */
'use client';

import { useState, useMemo } from 'react';
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
  // Computed Values
  // ============================================================================

  // Calculate days until change if cooldown is active
  const daysUntilChange = useMemo(() => {
    if (!subscription?.canChangeAt) return 0;

    const now = new Date();
    const changeDate = new Date(subscription.canChangeAt);
    const diffTime = changeDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }, [subscription]);

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
  if (isLoadingSubscription) {
    return null;
  }

  // If no subscription, user can set favorite
  if (!subscription) {
    return (
      <>
        <Button
          onClick={() => setShowConfirmDialog(true)}
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
                ¿Establecer a {tarotistaName} como tu tarotista favorito? Solo podrás cambiarlo en
                30 días.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setFavorite(tarotistaId);
                  setShowConfirmDialog(false);
                }}
                disabled={isPending}
              >
                {isPending ? 'Confirmando...' : 'Confirmar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // ============================================================================
  // State Checks (with subscription)
  // ============================================================================

  const isFavorite = subscription.tarotistaId === tarotistaId;
  const canChange = subscription.canChange;

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
        onClick={() => setShowConfirmDialog(true)}
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
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setFavorite(tarotistaId);
                setShowConfirmDialog(false);
              }}
              disabled={isPending}
            >
              {isPending ? 'Confirmando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
