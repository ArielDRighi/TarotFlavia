/**
 * Admin Tarotistas Page
 *
 * Gestión de tarotistas con tabs para activos y aplicaciones pendientes
 */

'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TarotistasTable } from '@/components/features/admin/TarotistasTable';
import { ApplicationCard } from '@/components/features/admin/ApplicationCard';
import { Pagination } from '@/components/features/admin/Pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminTarotistas, useTarotistaApplications } from '@/hooks/api/useAdminTarotistas';
import {
  useDeactivateTarotista,
  useReactivateTarotista,
  useApproveApplication,
  useRejectApplication,
} from '@/hooks/api/useAdminTarotistaActions';
import type { AdminTarotista, TarotistaApplication } from '@/types/admin-tarotistas.types';
import { toast } from 'sonner';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function AdminTarotistasPage() {
  // State para tabs
  const [activeTab, setActiveTab] = useState('activos');

  // State para tarotistas
  const [tarotistasPage, setTarotistasPage] = useState(1);
  const { data: tarotistasData, isLoading: tarotistasLoading } = useAdminTarotistas({
    page: tarotistasPage,
    limit: 10,
  });

  // State para aplicaciones
  const [applicationsPage, setApplicationsPage] = useState(1);
  const { data: applicationsData, isLoading: applicationsLoading } = useTarotistaApplications({
    page: applicationsPage,
    limit: 10,
    status: 'pending',
  });

  // Mutations
  const deactivateMutation = useDeactivateTarotista();
  const reactivateMutation = useReactivateTarotista();
  const approveMutation = useApproveApplication();
  const rejectMutation = useRejectApplication();

  // State para modales
  const [selectedTarotista, setSelectedTarotista] = useState<AdminTarotista | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<TarotistaApplication | null>(null);
  const [actionType, setActionType] = useState<
    'deactivate' | 'reactivate' | 'approve' | 'reject' | null
  >(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approveNotes, setApproveNotes] = useState('');

  const handleTarotistaAction = (action: string, tarotista: AdminTarotista) => {
    setSelectedTarotista(tarotista);

    switch (action) {
      case 'deactivate':
        setActionType('deactivate');
        break;
      case 'reactivate':
        setActionType('reactivate');
        break;
      case 'view-profile':
        toast.info('Vista de perfil: próximamente');
        setSelectedTarotista(null);
        break;
      case 'edit-config':
        toast.info('Edición de configuración IA: próximamente');
        setSelectedTarotista(null);
        break;
      case 'view-metrics':
        toast.info('Vista de métricas: próximamente');
        setSelectedTarotista(null);
        break;
      default:
        break;
    }
  };

  const handleApproveClick = (application: TarotistaApplication) => {
    setSelectedApplication(application);
    setActionType('approve');
    setApproveNotes('');
  };

  const handleRejectClick = (application: TarotistaApplication) => {
    setSelectedApplication(application);
    setActionType('reject');
    setRejectReason('');
  };

  const handleConfirmAction = () => {
    if (actionType === 'deactivate' && selectedTarotista) {
      deactivateMutation.mutate(selectedTarotista.id, {
        onSuccess: () => {
          toast.success('Tarotista desactivado correctamente');
          closeDialog();
        },
        onError: (error) => {
          toast.error(`Error al desactivar: ${error.message}`);
        },
      });
    } else if (actionType === 'reactivate' && selectedTarotista) {
      reactivateMutation.mutate(selectedTarotista.id, {
        onSuccess: () => {
          toast.success('Tarotista reactivado correctamente');
          closeDialog();
        },
        onError: (error) => {
          toast.error(`Error al reactivar: ${error.message}`);
        },
      });
    } else if (actionType === 'approve' && selectedApplication) {
      approveMutation.mutate(
        {
          id: selectedApplication.id,
          adminNotes: approveNotes || undefined,
        },
        {
          onSuccess: () => {
            toast.success('Aplicación aprobada correctamente');
            closeDialog();
          },
          onError: (error) => {
            toast.error(`Error al aprobar: ${error.message}`);
          },
        }
      );
    } else if (actionType === 'reject' && selectedApplication) {
      if (!rejectReason.trim() || rejectReason.trim().length < 10) {
        toast.error('La razón de rechazo debe tener al menos 10 caracteres');
        return;
      }

      rejectMutation.mutate(
        {
          id: selectedApplication.id,
          adminNotes: rejectReason,
        },
        {
          onSuccess: () => {
            toast.success('Aplicación rechazada correctamente');
            closeDialog();
          },
          onError: (error) => {
            toast.error(`Error al rechazar: ${error.message}`);
          },
        }
      );
    }
  };

  const closeDialog = () => {
    setActionType(null);
    setSelectedTarotista(null);
    setSelectedApplication(null);
    setRejectReason('');
    setApproveNotes('');
  };

  const isPending =
    deactivateMutation.isPending ||
    reactivateMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending;

  return (
    <div className="bg-bg-main min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 font-serif text-3xl">Gestión de Tarotistas</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="activos">Tarotistas Activos</TabsTrigger>
            <TabsTrigger value="aplicaciones">
              Aplicaciones Pendientes
              {applicationsData && applicationsData.meta.totalItems > 0 && (
                <span className="bg-primary ml-2 rounded-full px-2 py-0.5 text-xs text-white">
                  {applicationsData.meta.totalItems}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: TAROTISTAS ACTIVOS */}
          <TabsContent value="activos">
            {tarotistasLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : tarotistasData && tarotistasData.data.length > 0 ? (
              <>
                <TarotistasTable
                  tarotistas={tarotistasData.data}
                  onAction={handleTarotistaAction}
                />
                {tarotistasData.meta.totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={tarotistasData.meta.page}
                      totalPages={tarotistasData.meta.totalPages}
                      totalItems={tarotistasData.meta.totalItems}
                      limit={tarotistasData.meta.limit}
                      onPageChange={setTarotistasPage}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="border-border bg-bg-main rounded-lg border p-8 text-center">
                <p className="text-muted-foreground">No hay tarotistas registrados</p>
              </div>
            )}
          </TabsContent>

          {/* TAB 2: APLICACIONES PENDIENTES */}
          <TabsContent value="aplicaciones">
            {applicationsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : applicationsData && applicationsData.data.length > 0 ? (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  {applicationsData.data.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      onApprove={handleApproveClick}
                      onReject={handleRejectClick}
                      isLoading={isPending}
                    />
                  ))}
                </div>
                {applicationsData.meta.totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={applicationsData.meta.page}
                      totalPages={applicationsData.meta.totalPages}
                      totalItems={applicationsData.meta.totalItems}
                      limit={applicationsData.meta.limit}
                      onPageChange={setApplicationsPage}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="border-border bg-bg-main rounded-lg border p-8 text-center">
                <p className="text-muted-foreground">No hay aplicaciones pendientes</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* MODAL DEACTIVATE/REACTIVATE */}
      <AlertDialog
        open={actionType === 'deactivate' || actionType === 'reactivate'}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'deactivate' ? 'Desactivar Tarotista' : 'Reactivar Tarotista'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'deactivate'
                ? `¿Estás seguro de desactivar a ${selectedTarotista?.nombrePublico}? El tarotista ya no aparecerá en el marketplace.`
                : `¿Estás seguro de reactivar a ${selectedTarotista?.nombrePublico}? El tarotista volverá a aparecer en el marketplace.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction} disabled={isPending}>
              {isPending ? 'Procesando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* MODAL APPROVE */}
      <AlertDialog open={actionType === 'approve'} onOpenChange={(open) => !open && closeDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aprobar Aplicación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Aprobar la aplicación de {selectedApplication?.nombrePublico}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="approve-notes">Notas (opcional)</Label>
            <Textarea
              id="approve-notes"
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              placeholder="Agregar notas sobre la aprobación..."
              className="mt-2"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction} disabled={isPending}>
              {isPending ? 'Procesando...' : 'Aprobar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* MODAL REJECT */}
      <AlertDialog open={actionType === 'reject'} onOpenChange={(open) => !open && closeDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rechazar Aplicación</AlertDialogTitle>
            <AlertDialogDescription>
              Rechazar la aplicación de {selectedApplication?.nombrePublico}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reject-reason">
              Razón del rechazo <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explica por qué se rechaza la aplicación (mínimo 10 caracteres)..."
              className="mt-2"
              rows={4}
              required
            />
            {rejectReason.trim().length > 0 && rejectReason.trim().length < 10 && (
              <p className="mt-1 text-sm text-red-600">Mínimo 10 caracteres</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={isPending || rejectReason.trim().length < 10}
            >
              {isPending ? 'Procesando...' : 'Rechazar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
