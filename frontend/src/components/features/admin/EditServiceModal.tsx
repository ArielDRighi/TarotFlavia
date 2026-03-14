/**
 * EditServiceModal Component
 *
 * Modal for creating or editing a holistic service (admin).
 * Uses React Hook Form + Zod for form validation.
 */

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  createHolisticServiceSchema,
  type CreateHolisticServiceForm,
} from '@/lib/validations/holistic-service.schemas';
import type { HolisticServiceAdmin } from '@/types';

// ============================================================================
// Props
// ============================================================================

interface EditServiceModalProps {
  service: HolisticServiceAdmin | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateHolisticServiceForm) => void;
  isPending: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function EditServiceModal({
  service,
  open,
  onClose,
  onSubmit,
  isPending,
}: EditServiceModalProps) {
  const isEditing = service !== null;

  const form = useForm<CreateHolisticServiceForm>({
    resolver: zodResolver(createHolisticServiceSchema),
    defaultValues: {
      name: '',
      slug: '',
      shortDescription: '',
      longDescription: '',
      priceArs: 0,
      durationMinutes: 60,
      sessionType: 'family_tree',
      whatsappNumber: '',
      mercadoPagoLink: '',
      imageUrl: '',
      displayOrder: 0,
      isActive: true,
    },
  });

  // Sync form values when service changes
  useEffect(() => {
    if (service) {
      form.reset({
        name: service.name,
        slug: service.slug,
        shortDescription: service.shortDescription,
        longDescription: service.longDescription,
        priceArs: service.priceArs,
        durationMinutes: service.durationMinutes,
        sessionType: service.sessionType,
        whatsappNumber: service.whatsappNumber,
        mercadoPagoLink: service.mercadoPagoLink,
        imageUrl: service.imageUrl ?? '',
        displayOrder: service.displayOrder,
        isActive: service.isActive,
      });
    } else {
      form.reset({
        name: '',
        slug: '',
        shortDescription: '',
        longDescription: '',
        priceArs: 0,
        durationMinutes: 60,
        sessionType: 'family_tree',
        whatsappNumber: '',
        mercadoPagoLink: '',
        imageUrl: '',
        displayOrder: 0,
        isActive: true,
      });
    }
  }, [service, form]);

  const handleSubmit = (data: CreateHolisticServiceForm) => {
    onSubmit(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Modificar los datos del servicio "${service.name}"`
              : 'Completar los datos para crear un servicio holístico'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Nombre */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del servicio" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Slug */}
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (URL)</FormLabel>
                  <FormControl>
                    <Input placeholder="arbol-genealogico" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo de sesión */}
            <FormField
              control={form.control}
              name="sessionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de sesión</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm"
                    >
                      <option value="family_tree">Árbol Genealógico Familiar</option>
                      <option value="energy_cleaning">Limpieza Energética</option>
                      <option value="hebrew_pendulum">Péndulo Hebreo</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción corta */}
            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción corta</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Breve descripción del servicio" {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción larga */}
            <FormField
              control={form.control}
              name="longDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción larga</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción detallada del servicio"
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Precio y Duración */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priceArs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio (ARS)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="15000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración (minutos)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="60"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* WhatsApp */}
            <FormField
              control={form.control}
              name="whatsappNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de WhatsApp</FormLabel>
                  <FormControl>
                    <Input placeholder="+54911234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Link MercadoPago */}
            <FormField
              control={form.control}
              name="mercadoPagoLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link de MercadoPago</FormLabel>
                  <FormControl>
                    <Input placeholder="https://mpago.la/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* URL de imagen */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de imagen (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Orden de display y Estado activo */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="displayOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orden de display</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <FormLabel>Activo</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
