/**
 * BirthDataForm Component
 *
 * Formulario para ingresar datos de nacimiento para generar carta astral
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clock, User, Sparkles, Info } from 'lucide-react';

import { birthDataSchema, BirthDataFormValues } from './BirthDataForm.schema';
import { PlaceAutocomplete } from '../PlaceAutocomplete';
import type { GeocodedPlace } from '@/types/birth-chart-geocode.types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BirthDataFormProps {
  onSubmit: (data: BirthDataFormValues) => void;
  isLoading?: boolean;
  disabled?: boolean;
  showUsageWarning?: boolean;
  usageMessage?: string;
  defaultValues?: Partial<BirthDataFormValues>;
}

export function BirthDataForm({
  onSubmit,
  isLoading = false,
  disabled = false,
  showUsageWarning = false,
  usageMessage,
  defaultValues,
}: BirthDataFormProps) {
  const form = useForm<BirthDataFormValues>({
    resolver: zodResolver(birthDataSchema),
    defaultValues: {
      name: '',
      birthDate: '',
      birthTime: '',
      birthPlace: '',
      latitude: 0,
      longitude: 0,
      timezone: '',
      orbSystem: 'commercial',
      ...defaultValues,
    },
    mode: 'onChange', // Validación en cada cambio
  });

  // Manejar selección de lugar
  const handlePlaceSelect = (place: GeocodedPlace | null) => {
    if (place) {
      form.setValue('birthPlace', place.displayName, { shouldValidate: true });
      form.setValue('latitude', place.latitude, { shouldValidate: true });
      form.setValue('longitude', place.longitude, { shouldValidate: true });
      form.setValue('timezone', place.timezone, { shouldValidate: true });
    } else {
      form.setValue('birthPlace', '');
      form.setValue('latitude', 0);
      form.setValue('longitude', 0);
      form.setValue('timezone', '');
    }
  };

  // Obtener lugar actual del form para el autocomplete
  const [birthPlace, latitude, longitude, timezone] = form.watch([
    'birthPlace',
    'latitude',
    'longitude',
    'timezone',
  ]);

  const currentPlace: GeocodedPlace | null = birthPlace
    ? {
        placeId: '',
        displayName: birthPlace,
        city: '',
        country: '',
        latitude,
        longitude,
        timezone,
      }
    : null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Alerta de uso */}
        {showUsageWarning && usageMessage && (
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertDescription>{usageMessage}</AlertDescription>
          </Alert>
        )}

        {/* Nombre */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nombre <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    {...field}
                    placeholder="Ej: María García"
                    className="pl-10"
                    disabled={disabled}
                  />
                </div>
              </FormControl>
              <FormDescription>Nombre para identificar la carta astral</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fecha y Hora en fila */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Fecha de nacimiento */}
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Fecha de nacimiento <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    min="1900-01-01"
                    disabled={disabled}
                  />
                </FormControl>
                <FormDescription>
                  Selecciona tu fecha de nacimiento usando el selector de fecha.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Hora de nacimiento */}
          <FormField
            control={form.control}
            name="birthTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Hora de nacimiento <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Clock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input {...field} type="time" className="pl-10" disabled={disabled} />
                  </div>
                </FormControl>
                <FormDescription>
                  La hora exacta es crucial para calcular el Ascendente. Si no la conoces, usa
                  12:00.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Lugar de nacimiento (autocomplete) */}
        <FormField
          control={form.control}
          name="birthPlace"
          render={() => (
            <FormItem>
              <PlaceAutocomplete
                value={currentPlace}
                onChange={handlePlaceSelect}
                disabled={disabled}
                error={form.formState.errors.birthPlace?.message}
                required
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campos ocultos para lat/lon/tz */}
        <input type="hidden" {...form.register('latitude', { valueAsNumber: true })} />
        <input type="hidden" {...form.register('longitude', { valueAsNumber: true })} />
        <input type="hidden" {...form.register('timezone')} />

        {/* Sistema de orbes */}
        <FormField
          control={form.control}
          name="orbSystem"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Orbes estrictos</FormLabel>
                  <FormDescription className="text-xs">
                    Modo profesional: menos aspectos, mayor precisión
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value === 'strict'}
                    onCheckedChange={(checked) =>
                      field.onChange(checked ? 'strict' : 'commercial')
                    }
                    disabled={disabled}
                  />
                </FormControl>
              </div>

              {/* Info box con explicación del modo activo */}
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                {field.value === 'strict' ? (
                  <>
                    <p className="font-medium">Modo profesional activado</p>
                    <p className="text-muted-foreground mt-1">
                      Se detectan solo los aspectos más fuertes e importantes entre planetas
                      (ángulos de hasta 4°–8°). Ideal si quieres una lectura más precisa y depurada,
                      similar a la que haría un astrólogo tradicional.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">Modo estándar (recomendado)</p>
                    <p className="text-muted-foreground mt-1">
                      Se incluyen todos los aspectos relevantes entre planetas. Obtienes una carta
                      más completa, con más conexiones y matices para explorar. Ideal para la
                      mayoría de las personas.
                    </p>
                  </>
                )}
              </div>
            </FormItem>
          )}
        />

        {/* Botón de submit */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={disabled || isLoading || !form.formState.isValid}
        >
          {isLoading ? (
            <>
              <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
              Generando carta astral...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generar mi carta astral
            </>
          )}
        </Button>

        {/* Info adicional */}
        <p className="text-muted-foreground text-center text-xs">
          La precisión de la carta depende de la exactitud de los datos ingresados, especialmente la
          hora de nacimiento.
        </p>
      </form>
    </Form>
  );
}
