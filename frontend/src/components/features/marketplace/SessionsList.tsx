'use client';

import { useState } from 'react';
import { parseISO } from 'date-fns';
import { toast } from 'sonner';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SessionCard } from './SessionCard';
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
import { useMySessions, useCancelSession } from '@/hooks/api/useSessions';
import type { SessionDetail } from '@/types/session.types';

/**
 * Type definition for tab values
 */
type TabValue = 'upcoming' | 'completed' | 'cancelled' | 'all';

/**
 * Filter sessions by tab selection
 */
function filterSessionsByTab(sessions: SessionDetail[], tab: TabValue): SessionDetail[] {
  switch (tab) {
    case 'upcoming':
      return sessions.filter((s) => s.status === 'pending' || s.status === 'confirmed');
    case 'completed':
      return sessions.filter((s) => s.status === 'completed');
    case 'cancelled':
      return sessions.filter(
        (s) => s.status === 'cancelled_by_user' || s.status === 'cancelled_by_tarotist'
      );
    case 'all':
    default:
      return sessions;
  }
}

/**
 * Sort sessions by date ascending (upcoming first)
 */
function sortSessionsByDate(sessions: SessionDetail[]): SessionDetail[] {
  return [...sessions].sort((a, b) => {
    const dateA = parseISO(`${a.sessionDate}T${a.sessionTime}`);
    const dateB = parseISO(`${b.sessionDate}T${b.sessionTime}`);
    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Get empty state message based on active tab
 */
function getEmptyStateMessage(tab: TabValue): string {
  switch (tab) {
    case 'upcoming':
      return 'No tienes sesiones programadas';
    case 'completed':
      return 'Aún no has tenido sesiones';
    case 'cancelled':
      return 'No tienes sesiones canceladas';
    case 'all':
    default:
      return 'No tienes sesiones';
  }
}

/**
 * SessionsList Component
 *
 * Displays user's sessions with tab filters and actions.
 *
 * Features:
 * - Tab filters: Próximas, Completadas, Canceladas, Todas
 * - Sessions sorted by date (upcoming first)
 * - Cancel action with confirmation modal
 * - Join action opens Google Meet in new tab
 * - Loading and error states
 * - Empty states per tab
 */
export function SessionsList() {
  const [activeTab, setActiveTab] = useState<TabValue>('upcoming');
  const [sessionToCancel, setSessionToCancel] = useState<number | null>(null);

  // Fetch all sessions (filtering happens client-side)
  const { data: sessions, isLoading, error } = useMySessions();
  const { mutate: cancelSession, isPending: isCancelling } = useCancelSession();

  /**
   * Handle cancel button click - shows confirmation modal
   */
  const handleCancelClick = (id: number) => {
    setSessionToCancel(id);
  };

  /**
   * Handle cancel confirmation
   */
  const handleConfirmCancel = () => {
    if (sessionToCancel === null) return;

    cancelSession(
      { id: sessionToCancel, reason: 'Cancelado por el usuario' },
      {
        onSuccess: () => {
          toast.success('Sesión cancelada correctamente');
          setSessionToCancel(null);
        },
        onError: (error) => {
          toast.error(`Error al cancelar: ${error.message}`);
        },
      }
    );
  };

  /**
   * Handle join button click - opens Google Meet in new tab
   */
  const handleJoinClick = (meetLink: string) => {
    window.open(meetLink, '_blank');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} data-testid={`skeleton-${i}`} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="border-destructive bg-destructive/10 rounded-lg border p-8 text-center">
        <p className="text-destructive">Error al cargar las sesiones</p>
        <p className="text-muted-foreground mt-2 text-sm">{error.message}</p>
      </div>
    );
  }

  // Filter and sort sessions
  const filteredSessions = filterSessionsByTab(sessions || [], activeTab);
  const sortedSessions = sortSessionsByDate(filteredSessions);

  return (
    <>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
        <TabsList>
          <TabsTrigger value="upcoming">Próximas</TabsTrigger>
          <TabsTrigger value="completed">Completadas</TabsTrigger>
          <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
          <TabsTrigger value="all">Todas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {sortedSessions.length === 0 ? (
            <div className="bg-muted/50 rounded-lg p-12 text-center">
              <p className="text-muted-foreground">{getEmptyStateMessage(activeTab)}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onCancel={handleCancelClick}
                  onJoin={handleJoinClick}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Confirmation Modal */}
      <AlertDialog open={sessionToCancel !== null} onOpenChange={() => setSessionToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cancelará tu sesión. Si la sesión está confirmada y es dentro de las
              próximas 24 horas, es posible que no puedas cancelarla.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} disabled={isCancelling}>
              {isCancelling ? 'Cancelando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
