/**
 * ManageRolesModal Component
 *
 * Modal para gestionar roles de un usuario admin.
 * Muestra checkboxes para CONSUMER/TAROTIST/ADMIN con lógica de diff.
 * Pide confirmación adicional al remover el rol ADMIN.
 */

'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { AdminUser } from '@/types/admin-users.types';
import type { UserRole } from '@/types/user.types';

interface RoleDiff {
  toAdd: UserRole[];
  toRemove: UserRole[];
}

interface ManageRolesModalProps {
  user: AdminUser;
  open: boolean;
  onClose: () => void;
  onSave: (diff: RoleDiff) => void;
  isPending: boolean;
}

const AVAILABLE_ROLES: { role: UserRole; label: string; description: string }[] = [
  {
    role: 'consumer',
    label: 'Consumidor',
    description: 'Acceso básico a la plataforma',
  },
  {
    role: 'tarotist',
    label: 'Tarotista',
    description: 'Puede gestionar lecturas de tarot',
  },
  {
    role: 'admin',
    label: 'Administrador',
    description: 'Acceso completo al panel de administración',
  },
];

function computeDiff(original: UserRole[], current: UserRole[]): RoleDiff {
  const originalSet = new Set(original);
  const currentSet = new Set(current);

  const toAdd = current.filter((r) => !originalSet.has(r));
  const toRemove = original.filter((r) => !currentSet.has(r));

  return { toAdd, toRemove };
}

interface ManageRolesModalInnerProps extends ManageRolesModalProps {
  initialRoles: UserRole[];
}

function ManageRolesModalInner({
  user,
  open,
  onClose,
  onSave,
  isPending,
  initialRoles,
}: ManageRolesModalInnerProps) {
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(initialRoles);
  const [showAdminConfirm, setShowAdminConfirm] = useState(false);
  const [pendingDiff, setPendingDiff] = useState<RoleDiff | null>(null);

  const toggleRole = (role: UserRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSave = () => {
    const diff = computeDiff(user.roles, selectedRoles);

    // No changes
    if (diff.toAdd.length === 0 && diff.toRemove.length === 0) {
      return;
    }

    // Warn before removing admin role
    if (diff.toRemove.includes('admin')) {
      setPendingDiff(diff);
      setShowAdminConfirm(true);
      return;
    }

    onSave(diff);
  };

  const handleConfirmAdminRemoval = () => {
    setShowAdminConfirm(false);
    if (pendingDiff) {
      onSave(pendingDiff);
      setPendingDiff(null);
    }
  };

  const handleCancelAdminConfirm = () => {
    setShowAdminConfirm(false);
    setPendingDiff(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent data-testid="manage-roles-modal">
          <DialogHeader>
            <DialogTitle>Gestionar Roles</DialogTitle>
            <DialogDescription>
              Modificando roles de <span className="font-semibold">{user.name}</span> ({user.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {AVAILABLE_ROLES.map(({ role, label, description }) => (
              <div key={role} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id={`role-${role}`}
                  data-testid={`role-checkbox-${role}`}
                  checked={selectedRoles.includes(role)}
                  onChange={() => toggleRole(role)}
                  disabled={isPending}
                  className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300"
                />
                <div className="grid gap-0.5">
                  <Label htmlFor={`role-${role}`} className="cursor-pointer font-medium">
                    {label}
                  </Label>
                  <p className="text-muted-foreground text-sm">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmación al remover rol ADMIN */}
      <AlertDialog open={showAdminConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive size-5" />
              Confirmar remoción de rol Admin
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esto removerá el acceso al panel admin de{' '}
              <span className="font-semibold">{user.name}</span>. ¿Continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelAdminConfirm}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAdminRemoval}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Wrapper público que garantiza reset de estado al abrir/cerrar el modal
 * usando la prop key para forzar remontado del componente interno
 */
export function ManageRolesModal(props: ManageRolesModalProps) {
  return (
    <ManageRolesModalInner
      key={props.open ? `open-${props.user.id}` : 'closed'}
      {...props}
      initialRoles={props.user.roles}
    />
  );
}
