/**
 * Admin Usuarios Page
 *
 * Gestión de usuarios con búsqueda, filtros y acciones de administración
 */

'use client';

import { useState } from 'react';
import { UsersTable } from '@/components/features/admin/UsersTable';
import { UsersFilters } from '@/components/features/admin/UsersFilters';
import { Pagination } from '@/components/features/admin/Pagination';
import { ChangePlanModal } from '@/components/features/admin/ChangePlanModal';
import { BanUserModal } from '@/components/features/admin/BanUserModal';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminUsers } from '@/hooks/api/useAdminUsers';
import { useBanUser, useUnbanUser, useUpdateUserPlan } from '@/hooks/api/useAdminUserActions';
import type { AdminUser, UserFilters } from '@/types/admin-users.types';
import type { UpdateUserPlanForm } from '@/lib/validations/admin-users.schemas';
import type { BanUserForm } from '@/lib/validations/admin-users.schemas';
import { toast } from 'sonner';

export default function AdminUsuariosPage() {
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
      <div className="container py-8">
        <h1 className="mb-8 font-serif text-3xl font-bold">Gestión de Usuarios</h1>
        <div className="space-y-4">
          <Skeleton className="h-12" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <h1 className="mb-8 font-serif text-3xl font-bold">Gestión de Usuarios</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-800">
          Error al cargar usuarios. Por favor, intenta de nuevo.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">Gestión de Usuarios</h1>
        <p className="text-muted-foreground mt-2">Administra usuarios, planes y permisos</p>
      </div>

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
    </div>
  );
}
