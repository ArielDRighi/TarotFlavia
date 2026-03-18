/**
 * HolisticServicesManagement Component
 *
 * Main container for admin management of holistic services and transaction history.
 * Uses tabs to switch between the services list and the read-only transaction history.
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
import { TransactionsTable } from './TransactionsTable';
import {
  useAdminHolisticServices,
  useAllPurchases,
  useCreateHolisticService,
  useUpdateHolisticService,
} from '@/hooks/api/useAdminHolisticServices';
import type { HolisticServiceAdmin } from '@/types';
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
    data: allPurchases,
    isLoading: purchasesLoading,
    error: purchasesError,
  } = useAllPurchases();

  // ---- Mutations ----
  const createServiceMutation = useCreateHolisticService();
  const updateServiceMutation = useUpdateHolisticService();

  // ---- Modal state ----
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<HolisticServiceAdmin | null>(null);

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
          onError: (error: Error) => {
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
        onError: (error: Error) => {
          toast.error(`Error al crear servicio: ${error.message}`);
        },
      });
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedService(null);
  };

  // ---- Derived state ----
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
          id="tab-historial"
          role="tab"
          aria-selected={activeTab === 'historial'}
          aria-controls="tabpanel-historial"
          onClick={() => setActiveTab('historial')}
          className={cn(
            'flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'historial'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          Historial de Transacciones
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

      {/* TAB 2: HISTORIAL DE TRANSACCIONES */}
      {activeTab === 'historial' && (
        <div id="tabpanel-historial" role="tabpanel" aria-labelledby="tab-historial">
          {purchasesLoading ? (
            <div data-testid="transactions-loading" className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : purchasesError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-red-700">
                Error al cargar historial de transacciones. Por favor, intenta de nuevo.
              </p>
            </div>
          ) : (
            <TransactionsTable purchases={allPurchases ?? []} />
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
    </div>
  );
}
