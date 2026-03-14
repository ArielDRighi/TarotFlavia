/**
 * HolisticServicesManagement Component
 *
 * Main container for admin management of holistic services and pending payments.
 * Uses tabs to switch between the services list and pending payment approvals.
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ServicesTable } from './ServicesTable';
import { EditServiceModal } from './EditServiceModal';
import { PendingPaymentsTable } from './PendingPaymentsTable';
import { ApprovePaymentDialog } from './ApprovePaymentDialog';
import {
  useAdminHolisticServices,
  usePendingPayments,
  useCreateHolisticService,
  useUpdateHolisticService,
  useApprovePayment,
} from '@/hooks/api/useAdminHolisticServices';
import type { HolisticServiceAdmin, ServicePurchase, ApprovePurchasePayload } from '@/types';
import type { CreateHolisticServiceForm } from '@/lib/validations/holistic-service.schemas';

// ============================================================================
// Component
// ============================================================================

export function HolisticServicesManagement() {
  // ---- Tab state ----
  const [activeTab, setActiveTab] = useState('servicios');

  // ---- Queries ----
  const {
    data: services,
    isLoading: servicesLoading,
    error: servicesError,
  } = useAdminHolisticServices();
  const {
    data: pendingPayments,
    isLoading: paymentsLoading,
    error: paymentsError,
  } = usePendingPayments();

  // ---- Mutations ----
  const createServiceMutation = useCreateHolisticService();
  const updateServiceMutation = useUpdateHolisticService();
  const approvePaymentMutation = useApprovePayment();

  // ---- Modal state ----
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<HolisticServiceAdmin | null>(null);

  // ---- Approve dialog state ----
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<ServicePurchase | null>(null);

  // ---- Handlers: services ----
  const handleNewService = () => {
    setSelectedService(null);
    setEditModalOpen(true);
  };

  const handleEditService = (service: HolisticServiceAdmin) => {
    setSelectedService(service);
    setEditModalOpen(true);
  };

  const handleServiceSubmit = (data: CreateHolisticServiceForm) => {
    if (selectedService) {
      updateServiceMutation.mutate(
        { id: selectedService.id, data },
        {
          onSuccess: () => {
            toast.success('Servicio actualizado correctamente');
            setEditModalOpen(false);
          },
          onError: (error) => {
            toast.error(`Error al actualizar servicio: ${error.message}`);
          },
        }
      );
    } else {
      createServiceMutation.mutate(data, {
        onSuccess: () => {
          toast.success('Servicio creado correctamente');
          setEditModalOpen(false);
        },
        onError: (error) => {
          toast.error(`Error al crear servicio: ${error.message}`);
        },
      });
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedService(null);
  };

  // ---- Handlers: payments ----
  const handleApproveClick = (purchase: ServicePurchase) => {
    setSelectedPurchase(purchase);
    setApproveDialogOpen(true);
  };

  const handleApproveConfirm = (data: ApprovePurchasePayload) => {
    if (!selectedPurchase) return;

    approvePaymentMutation.mutate(
      { id: selectedPurchase.id, data },
      {
        onSuccess: () => {
          toast.success('Pago aprobado correctamente');
          setApproveDialogOpen(false);
          setSelectedPurchase(null);
        },
        onError: (error) => {
          toast.error(`Error al aprobar pago: ${error.message}`);
        },
      }
    );
  };

  const handleCloseApproveDialog = () => {
    setApproveDialogOpen(false);
    setSelectedPurchase(null);
  };

  // ---- Derived state ----
  const pendingCount = pendingPayments?.length ?? 0;
  const isEditPending = createServiceMutation.isPending || updateServiceMutation.isPending;

  // ---- Render ----
  return (
    <div data-testid="holistic-services-management">
      {/* Tab buttons */}
      <div role="tablist" className="mb-6 flex gap-2">
        <button
          id="tab-servicios"
          role="tab"
          aria-selected={activeTab === 'servicios'}
          aria-controls="tabpanel-servicios"
          onClick={() => setActiveTab('servicios')}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'servicios'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          Servicios
        </button>
        <button
          id="tab-pagos-pendientes"
          role="tab"
          aria-selected={activeTab === 'pagos-pendientes'}
          aria-controls="tabpanel-pagos-pendientes"
          onClick={() => setActiveTab('pagos-pendientes')}
          className={cn(
            'flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'pagos-pendientes'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          Pagos Pendientes
          {pendingCount > 0 && (
            <span className="bg-primary ml-2 rounded-full px-2 py-0.5 text-xs text-white">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: SERVICIOS */}
      {activeTab === 'servicios' && (
        <div id="tabpanel-servicios" role="tabpanel" aria-labelledby="tab-servicios">
          <div className="mb-4 flex justify-end">
            <Button onClick={handleNewService}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Servicio
            </Button>
          </div>

          {servicesLoading ? (
            <div data-testid="services-loading" className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : servicesError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-red-700">
                Error al cargar servicios. Por favor, intenta de nuevo.
              </p>
            </div>
          ) : (
            <ServicesTable services={services ?? []} onEdit={handleEditService} />
          )}
        </div>
      )}

      {/* TAB 2: PAGOS PENDIENTES */}
      {activeTab === 'pagos-pendientes' && (
        <div id="tabpanel-pagos-pendientes" role="tabpanel" aria-labelledby="tab-pagos-pendientes">
          {paymentsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : paymentsError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-red-700">
                Error al cargar pagos pendientes. Por favor, intenta de nuevo.
              </p>
            </div>
          ) : (
            <PendingPaymentsTable
              purchases={pendingPayments ?? []}
              onApprove={handleApproveClick}
            />
          )}
        </div>
      )}

      {/* MODAL: CREAR/EDITAR SERVICIO */}
      <EditServiceModal
        service={selectedService}
        open={editModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleServiceSubmit}
        isPending={isEditPending}
      />

      {/* DIALOG: APROBAR PAGO */}
      {selectedPurchase && (
        <ApprovePaymentDialog
          purchase={selectedPurchase}
          open={approveDialogOpen}
          onClose={handleCloseApproveDialog}
          onConfirm={handleApproveConfirm}
          isPending={approvePaymentMutation.isPending}
        />
      )}
    </div>
  );
}
