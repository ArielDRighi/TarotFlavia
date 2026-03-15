/**
 * AddBlockedDateForm Component
 *
 * Form to add a blocked date or custom-hours exception for a tarotista (admin).
 * Uses React Hook Form + Zod for validation.
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  addBlockedDateSchema,
  type AddBlockedDateForm as AddBlockedDateFormData,
} from '@/lib/validations/scheduling-admin.schemas';
import { ExceptionType } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface Props {
  onSubmit: (data: AddBlockedDateFormData) => void;
  onCancel: () => void;
  isPending: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function AddBlockedDateForm({ onSubmit, onCancel, isPending }: Props) {
  const form = useForm<AddBlockedDateFormData>({
    resolver: zodResolver(addBlockedDateSchema),
    defaultValues: {
      exceptionDate: '',
      exceptionType: ExceptionType.BLOCKED,
      startTime: undefined,
      endTime: undefined,
      reason: '',
    },
  });

  const watchedType = form.watch('exceptionType');
  const isCustomHours = watchedType === ExceptionType.CUSTOM_HOURS;

  return (
    <Form {...form}>
      <form
        data-testid="add-blocked-date-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {/* Date */}
        <FormField
          control={form.control}
          name="exceptionDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="exceptionDate">Fecha</FormLabel>
              <FormControl>
                <Input
                  id="exceptionDate"
                  type="date"
                  {...field}
                  onChange={(e) => {
                    // Convert input date (YYYY-MM-DD) directly
                    field.onChange(e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type */}
        <FormField
          control={form.control}
          name="exceptionType"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="exceptionType">Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger id="exceptionType" aria-label="Tipo">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ExceptionType.BLOCKED}>Bloqueado</SelectItem>
                  <SelectItem value={ExceptionType.CUSTOM_HOURS}>Horario personalizado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Custom hours: start + end times */}
        {isCustomHours && (
          <>
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="startTime">Hora de inicio</FormLabel>
                  <FormControl>
                    <Input id="startTime" type="time" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="endTime">Hora de fin</FormLabel>
                  <FormControl>
                    <Input id="endTime" type="time" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* Reason */}
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="reason">Motivo (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  id="reason"
                  placeholder="Ej: Feriado nacional, vacaciones..."
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            Guardar
          </Button>
        </div>
      </form>
    </Form>
  );
}
