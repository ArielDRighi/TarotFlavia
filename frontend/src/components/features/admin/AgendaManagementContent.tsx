/**
 * AgendaManagementContent Component
 *
 * Main container for admin management of tarotista weekly schedule
 * and blocked dates. Uses tabs to switch between the two sections.
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { WeeklyScheduleGrid } from './WeeklyScheduleGrid';
import { BlockedDatesList } from './BlockedDatesList';
import { AddBlockedDateForm } from './AddBlockedDateForm';
import {
  useAdminWeeklyAvailability,
  useAdminBlockedDates,
  useSetWeeklyAvailability,
  useRemoveWeeklyAvailability,
  useAddBlockedDate,
  useRemoveBlockedDate,
} from '@/hooks/api/useAdminScheduling';
import {
  setWeeklyAvailabilitySchema,
  type SetWeeklyAvailabilityForm,
  type AddBlockedDateForm as AddBlockedDateFormData,
} from '@/lib/validations/scheduling-admin.schemas';
import { DayOfWeek, DAY_LABELS } from '@/types';

// ============================================================================
// Constants
// ============================================================================

/** Flavia's fixed tarotista ID (single-tarotista MVP) */
const FLAVIA_TAROTISTA_ID = 1;

// ============================================================================
// WeeklyAvailabilityForm (inline)
// ============================================================================

interface WeeklyAvailabilityFormProps {
  selectedDay: DayOfWeek;
  onSubmit: (data: SetWeeklyAvailabilityForm) => void;
  onCancel: () => void;
  isPending: boolean;
}

function WeeklyAvailabilityForm({
  selectedDay,
  onSubmit,
  onCancel,
  isPending,
}: WeeklyAvailabilityFormProps) {
  const form = useForm<SetWeeklyAvailabilityForm>({
    resolver: zodResolver(setWeeklyAvailabilitySchema),
    defaultValues: {
      dayOfWeek: selectedDay,
      startTime: '',
      endTime: '',
    },
  });

  return (
    <Form {...form}>
      <form
        data-testid="weekly-availability-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="border-border bg-card space-y-4 rounded-lg border p-4"
      >
        <p className="text-sm font-medium">
          Agregar disponibilidad para el {DAY_LABELS[selectedDay]}
        </p>

        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel htmlFor="startTime">Hora inicio</FormLabel>
                <FormControl>
                  <Input id="startTime" type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel htmlFor="endTime">Hora fin</FormLabel>
                <FormControl>
                  <Input id="endTime" type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={isPending}>
            Guardar
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ============================================================================
// AgendaManagementContent
// ============================================================================

export function AgendaManagementContent() {
  // ---- Tab state ----
  const [activeTab, setActiveTab] = useState<'disponibilidad' | 'fechas-bloqueadas'>(
    'disponibilidad'
  );

  // ---- Add availability form state ----
  const [addAvailabilityDay, setAddAvailabilityDay] = useState<DayOfWeek | null>(null);

  // ---- Add blocked date form state ----
  const [showAddBlockedDate, setShowAddBlockedDate] = useState(false);

  // ---- Queries ----
  const {
    data: availability,
    isLoading: availabilityLoading,
    error: availabilityError,
  } = useAdminWeeklyAvailability(FLAVIA_TAROTISTA_ID);

  const {
    data: exceptions,
    isLoading: exceptionsLoading,
    error: exceptionsError,
  } = useAdminBlockedDates(FLAVIA_TAROTISTA_ID);

  // ---- Mutations ----
  const setAvailabilityMutation = useSetWeeklyAvailability(FLAVIA_TAROTISTA_ID);
  const removeAvailabilityMutation = useRemoveWeeklyAvailability(FLAVIA_TAROTISTA_ID);
  const addBlockedDateMutation = useAddBlockedDate(FLAVIA_TAROTISTA_ID);
  const removeBlockedDateMutation = useRemoveBlockedDate(FLAVIA_TAROTISTA_ID);

  // ---- Handlers: availability ----
  const handleAddAvailability = (day: DayOfWeek) => {
    setAddAvailabilityDay(day);
  };

  const handleAvailabilityFormSubmit = (data: SetWeeklyAvailabilityForm) => {
    setAvailabilityMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Disponibilidad guardada');
        setAddAvailabilityDay(null);
      },
      onError: (error) => {
        toast.error(`Error al guardar: ${error.message}`);
      },
    });
  };

  const handleRemoveAvailability = (availabilityId: number) => {
    removeAvailabilityMutation.mutate(availabilityId, {
      onSuccess: () => {
        toast.success('Disponibilidad eliminada');
      },
      onError: (error) => {
        toast.error(`Error al eliminar: ${error.message}`);
      },
    });
  };

  // ---- Handlers: blocked dates ----
  const handleAddBlockedDateSubmit = (data: AddBlockedDateFormData) => {
    addBlockedDateMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Fecha bloqueada agregada');
        setShowAddBlockedDate(false);
      },
      onError: (error) => {
        toast.error(`Error al agregar: ${error.message}`);
      },
    });
  };

  const handleRemoveBlockedDate = (dateId: number) => {
    removeBlockedDateMutation.mutate(dateId, {
      onSuccess: () => {
        toast.success('Fecha bloqueada eliminada');
      },
      onError: (error) => {
        toast.error(`Error al eliminar: ${error.message}`);
      },
    });
  };

  // ---- Render ----
  return (
    <div data-testid="agenda-management-content">
      {/* Tab buttons */}
      <div role="tablist" className="mb-6 flex gap-2">
        <button
          role="tab"
          aria-selected={activeTab === 'disponibilidad'}
          aria-controls="tabpanel-disponibilidad"
          onClick={() => setActiveTab('disponibilidad')}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'disponibilidad'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          Disponibilidad Semanal
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'fechas-bloqueadas'}
          aria-controls="tabpanel-fechas-bloqueadas"
          onClick={() => setActiveTab('fechas-bloqueadas')}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'fechas-bloqueadas'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          Fechas Bloqueadas
        </button>
      </div>

      {/* TAB 1: DISPONIBILIDAD SEMANAL */}
      {activeTab === 'disponibilidad' && (
        <div id="tabpanel-disponibilidad" role="tabpanel">
          {availabilityLoading ? (
            <div data-testid="availability-loading" className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : availabilityError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-red-700">
                Error al cargar la disponibilidad. Por favor, intenta de nuevo.
              </p>
            </div>
          ) : (
            <>
              <WeeklyScheduleGrid
                availability={availability ?? []}
                onAdd={handleAddAvailability}
                onRemove={handleRemoveAvailability}
              />

              {/* Inline form to add availability for selected day */}
              {addAvailabilityDay !== null && (
                <div className="mt-4">
                  <WeeklyAvailabilityForm
                    selectedDay={addAvailabilityDay}
                    onSubmit={handleAvailabilityFormSubmit}
                    onCancel={() => setAddAvailabilityDay(null)}
                    isPending={setAvailabilityMutation.isPending}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB 2: FECHAS BLOQUEADAS */}
      {activeTab === 'fechas-bloqueadas' && (
        <div id="tabpanel-fechas-bloqueadas" role="tabpanel">
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setShowAddBlockedDate(true)} disabled={showAddBlockedDate}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Fecha Bloqueada
            </Button>
          </div>

          {/* Inline form to add blocked date */}
          {showAddBlockedDate && (
            <div className="mb-4">
              <AddBlockedDateForm
                onSubmit={handleAddBlockedDateSubmit}
                onCancel={() => setShowAddBlockedDate(false)}
                isPending={addBlockedDateMutation.isPending}
              />
            </div>
          )}

          {exceptionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : exceptionsError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-red-700">
                Error al cargar las fechas bloqueadas. Por favor, intenta de nuevo.
              </p>
            </div>
          ) : (
            <BlockedDatesList exceptions={exceptions ?? []} onRemove={handleRemoveBlockedDate} />
          )}
        </div>
      )}
    </div>
  );
}
