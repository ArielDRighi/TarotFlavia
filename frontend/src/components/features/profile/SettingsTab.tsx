'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteAccount } from '@/hooks/api/useUser';
import { useAuth } from '@/hooks/useAuth';
import { deleteAccountSchema, type DeleteAccountFormData } from '@/lib/validations/profile.schemas';

/**
 * SettingsTab component
 *
 * Displays settings and dangerous actions like account deletion
 */
export function SettingsTab() {
  const { user } = useAuth();
  const { mutate: deleteAccount, isPending } = useDeleteAccount();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const deleteForm = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      confirmationText: '',
    },
  });

  const onDeleteSubmit = () => {
    if (!user) return;

    deleteAccount(user.id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Configuración de notificaciones disponible próximamente
          </p>
        </CardContent>
      </Card>

      {/* Privacy Section */}
      <Card>
        <CardHeader>
          <CardTitle>Privacidad</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Opciones de privacidad disponibles próximamente
          </p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Zona Peligrosa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm">
              Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate de estar
              completamente seguro.
            </p>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={isPending}
            >
              Eliminar Cuenta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás absolutamente seguro?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente tu cuenta y todos tus
              datos.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={deleteForm.handleSubmit(onDeleteSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="confirmationText" className="text-sm font-medium">
                Para confirmar, escribe: <strong>ELIMINAR MI CUENTA</strong>
              </label>
              <Input
                id="confirmationText"
                {...deleteForm.register('confirmationText')}
                disabled={isPending}
                placeholder="ELIMINAR MI CUENTA"
                aria-invalid={deleteForm.formState.errors.confirmationText ? 'true' : 'false'}
              />
              {deleteForm.formState.errors.confirmationText && (
                <p className="text-destructive text-sm">
                  {deleteForm.formState.errors.confirmationText.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  'Sí, eliminar mi cuenta'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
