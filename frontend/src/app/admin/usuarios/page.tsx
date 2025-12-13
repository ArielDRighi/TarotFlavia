/**
 * Admin Usuarios Page
 *
 * Gestión de usuarios con búsqueda, filtros y acciones de administración
 */

'use client';

import { UsersManagementContent } from '@/components/features/admin/UsersManagementContent';

export default function AdminUsuariosPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">Gestión de Usuarios</h1>
        <p className="text-muted-foreground mt-2">Administra usuarios, planes y permisos</p>
      </div>

      <UsersManagementContent />
    </div>
  );
}
