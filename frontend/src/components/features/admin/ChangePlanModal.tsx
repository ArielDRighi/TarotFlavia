/**
 * ChangePlanModal Component
 *
 * Modal para cambiar el plan de un usuario
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateUserPlanSchema } from '@/lib/validations/admin-users.schemas';
import type { UpdateUserPlanForm } from '@/lib/validations/admin-users.schemas';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';

interface ChangePlanModalProps {
  user: AdminUser;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateUserPlanForm) => void;
  isPending: boolean;
}

const PLANS = [
  { value: 'anonymous', label: 'Anónimo' },
  { value: 'free', label: 'Gratuito' },
  { value: 'premium', label: 'Premium' },
] as const;

export function ChangePlanModal({
  user,
  open,
  onClose,
  onSubmit,
  isPending,
}: ChangePlanModalProps) {
  const form = useForm<UpdateUserPlanForm>({
    resolver: zodResolver(updateUserPlanSchema),
    defaultValues: {
      plan: user.plan,
    },
  });

  const handleSubmit = (data: UpdateUserPlanForm) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar Plan de Usuario</DialogTitle>
          <DialogDescription>
            Cambiando plan de <span className="font-semibold">{user.name}</span> ({user.email})
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="plan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nuevo Plan</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PLANS.map((plan) => (
                        <SelectItem key={plan.value} value={plan.value}>
                          {plan.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Confirmando...' : 'Confirmar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
