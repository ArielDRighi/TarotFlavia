/**
 * BanUserModal Component
 *
 * Modal para banear un usuario con razón obligatoria
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { banUserSchema } from '@/lib/validations/admin-users.schemas';
import type { BanUserForm } from '@/lib/validations/admin-users.schemas';
import type { AdminUser } from '@/types/admin-users.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface BanUserModalProps {
  user: AdminUser;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BanUserForm) => void;
  isPending: boolean;
}

export function BanUserModal({ user, open, onClose, isPending, onSubmit }: BanUserModalProps) {
  const form = useForm<BanUserForm>({
    resolver: zodResolver(banUserSchema),
    defaultValues: {
      reason: '',
    },
  });

  const handleSubmit = (data: BanUserForm) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Banear Usuario</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de banear a <span className="font-semibold">{user.name}</span> (
            {user.email})? Esta acción impedirá el acceso del usuario a la plataforma.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razón del baneo</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe la razón del baneo (mínimo 10 caracteres)"
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending ? 'Baneando...' : 'Banear Usuario'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
