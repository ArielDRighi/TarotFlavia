/**
 * Plans Configuration Container
 * Handles all business logic for admin plans configuration page
 */

'use client';

import { useState } from 'react';
import { usePlans, useUpdatePlan } from '@/hooks/queries/useAdminPlans';
import { PlanConfigCard } from './PlanConfigCard';
import { PlanComparisonTable } from './PlanComparisonTable';
import { ErrorDisplay } from '@/components/ui/error-display';
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
import { toast } from 'sonner';
import type { PlanType, UpdatePlanConfigDto } from '@/types/admin.types';

export function PlanesConfigContainer() {
  const { data: plans, isLoading, error, refetch } = usePlans();
  const { mutate: updatePlan, isPending } = useUpdatePlan();

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    planType: PlanType | null;
    data: UpdatePlanConfigDto | null;
  }>({
    open: false,
    planType: null,
    data: null,
  });

  const handleSavePlan = (planType: PlanType, data: UpdatePlanConfigDto) => {
    // Abrir modal de confirmación
    setConfirmDialog({
      open: true,
      planType,
      data,
    });
  };

  const handleConfirmSave = () => {
    if (!confirmDialog.planType || !confirmDialog.data) return;

    updatePlan(
      { planType: confirmDialog.planType, data: confirmDialog.data },
      {
        onSuccess: () => {
          toast.success('Configuración del plan actualizada correctamente');
          setConfirmDialog({ open: false, planType: null, data: null });
        },
        onError: (error: Error) => {
          toast.error(`Error al actualizar plan: ${error.message}`);
          setConfirmDialog({ open: false, planType: null, data: null });
        },
      }
    );
  };

  if (error) {
    return (
      <div className="container py-8">
        <ErrorDisplay title="Error al cargar planes" message={error.message} onRetry={refetch} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-6">
          <div>
            <Skeleton className="mb-2 h-10 w-80" data-testid="skeleton" />
            <Skeleton className="h-6 w-96" data-testid="skeleton" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-[600px]" data-testid="skeleton" />
            <Skeleton className="h-[600px]" data-testid="skeleton" />
            <Skeleton className="h-[600px]" data-testid="skeleton" />
          </div>
        </div>
      </div>
    );
  }

  // Filtrar anonymous plan para las cards editables
  const editablePlans = plans?.filter((p) => p.planType !== 'anonymous') || [];

  return (
    <div className="container py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl font-bold">Configuración de Planes</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona los límites y features de cada plan de suscripción
          </p>
        </div>

        {/* Grid de Cards de Configuración */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {editablePlans.map((plan) => (
            <PlanConfigCard
              key={`${plan.id}-${plan.planType}`}
              plan={plan}
              onSave={(data) => handleSavePlan(plan.planType, data)}
              isLoading={isPending}
            />
          ))}
        </div>

        {/* Tabla Comparativa */}
        <div className="mt-12">
          <h2 className="mb-4 font-serif text-2xl font-bold">Comparativa de Planes</h2>
          <PlanComparisonTable plans={plans || []} />
        </div>
      </div>

      {/* Modal de Confirmación */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ open, planType: null, data: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cambios</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres guardar los cambios en el plan{' '}
              <strong>{confirmDialog.planType?.toUpperCase()}</strong>?
              <br />
              <br />
              Estos cambios afectarán a todos los usuarios con este plan inmediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave} disabled={isPending}>
              {isPending ? 'Guardando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
