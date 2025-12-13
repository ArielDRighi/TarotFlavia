/**
 * UsersManagementContent Component
 *
 * Main content component for admin users management page
 * Handles state and business logic
 */

'use client';

import { useState } from 'react';
import { UsersTable } from './UsersTable';
import { UsersFilters } from './UsersFilters';
import { Pagination } from './Pagination';
import { ChangePlanModal } from './ChangePlanModal';
import { BanUserModal } from './BanUserModal';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminUsers } from '@/hooks/api/useAdminUsers';
import { useBanUser, useUnbanUser, useUpdateUserPlan } from '@/hooks/api/useAdminUserActions';
import type { AdminUser, UserFilters } from '@/types/admin-users.types';
import type { UpdateUserPlanForm } from '@/lib/validations/admin-users.schemas';
import type { BanUserForm } from '@/lib/validations/admin-users.schemas';
import { toast } from 'sonner';

export function UsersManagementContent() {
  const [filters, setFilters] = useState<UserFilters>({ page: 1, limit: 10 });
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [modalOpen, setModalOpen] = useState<'plan' | 'ban' | null>(null);

  const { data, isLoading, error } = useAdminUsers(filters);
  const banUserMutation = useBanUser();
  const unbanUserMutation = useUnbanUser();
  const updatePlanMutation = useUpdateUserPlan();

  const handleFilterChange = (newFilters: Partial<UserFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleAction = (action: string, user: AdminUser) => {
    setSelectedUser(user);

    switch (action) {
      case 'change-plan':
        setModalOpen('plan');
        break;
      case 'ban':
        setModalOpen('ban');
        break;
      case 'unban':
        handleUnban(user);
        break;
      case 'manage-roles':
        // TODO: Implement ManageRolesModal in future task
        toast.info('Gestión de roles: próximamente');
        setSelectedUser(null);
        break;
      default:
        break;
    }
  };

  const handleChangePlan = (data: UpdateUserPlanForm) => {
    if (!selectedUser) return;

    updatePlanMutation.mutate(
      { userId: selectedUser.id, plan: data.plan },
      {
        onSuccess: () => {
          toast.success('Plan actualizado correctamente');
          setModalOpen(null);
          setSelectedUser(null);
        },
        onError: (error) => {
          toast.error(`Error al actualizar plan: ${error.message}`);
        },
      }
    );
  };

  const handleBan = (data: BanUserForm) => {
    if (!selectedUser) return;

    banUserMutation.mutate(
      { userId: selectedUser.id, reason: data.reason },
      {
        onSuccess: () => {
          toast.success('Usuario baneado correctamente');
          setModalOpen(null);
          setSelectedUser(null);
        },
        onError: (error) => {
          toast.error(`Error al banear usuario: ${error.message}`);
        },
      }
    );
  };

  const handleUnban = (user: AdminUser) => {
    unbanUserMutation.mutate(user.id, {
      onSuccess: () => {
        toast.success('Usuario desbaneado correctamente');
      },
      onError: (error) => {
        toast.error(`Error al desbanear usuario: ${error.message}`);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-800">
        Error al cargar usuarios. Por favor, intenta de nuevo.
      </div>
    );
  }

  return (
    <>
      {/* Filtros */}
      <div className="mb-6">
        <UsersFilters onFilterChange={handleFilterChange} />
      </div>

      {/* Tabla */}
      {data && (
        <>
          <UsersTable users={data.data} onAction={handleAction} />

          {/* Paginación */}
          {data.meta.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={data.meta.page}
                totalPages={data.meta.totalPages}
                totalItems={data.meta.totalItems}
                limit={data.meta.limit}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* Modales */}
      {selectedUser && (
        <>
          <ChangePlanModal
            user={selectedUser}
            open={modalOpen === 'plan'}
            onClose={() => {
              setModalOpen(null);
              setSelectedUser(null);
            }}
            onSubmit={handleChangePlan}
            isPending={updatePlanMutation.isPending}
          />

          <BanUserModal
            user={selectedUser}
            open={modalOpen === 'ban'}
            onClose={() => {
              setModalOpen(null);
              setSelectedUser(null);
            }}
            onSubmit={handleBan}
            isPending={banUserMutation.isPending}
          />
        </>
      )}
    </>
  );
}
