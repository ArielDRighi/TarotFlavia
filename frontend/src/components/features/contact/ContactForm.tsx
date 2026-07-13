'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, MessageSquare, User } from 'lucide-react';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';

import { useSendContactMessage } from '@/hooks/api/useSendContactMessage';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { contactFormSchema, type ContactFormData } from '@/lib/validations/contact.schemas';

const GENERIC_ERROR = 'Hubo un error al enviar tu mensaje. Por favor, intenta nuevamente.';
const RATE_LIMIT_ERROR =
  'Demasiados mensajes enviados. Esperá una hora antes de volver a escribirnos.';

/** El backend limita el endpoint público a 3 mensajes/hora por IP: pasado el límite, 429. */
function getErrorMessage(error: unknown): string {
  if (isAxiosError(error) && error.response?.status === 429) {
    return RATE_LIMIT_ERROR;
  }
  return GENERIC_ERROR;
}

/**
 * ContactForm component
 *
 * Formulario de contacto (nombre, email, asunto y mensaje) con React Hook Form + Zod.
 *
 * El envío es real (T-PROD-014): `useSendContactMessage` lo manda a `POST /contact`, que
 * lo hace llegar por email al buzón de Auguria con el remitente como Reply-To. Hasta esa
 * tarea el `onSubmit` era un `setTimeout` que fingía el envío y perdía el mensaje.
 */
export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const { mutate, isPending, error, isError } = useSendContactMessage();

  const onSubmit = (data: ContactFormData) => {
    mutate(data, {
      onSuccess: () => {
        toast.success('¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.');
        reset();
      },
      // Sin onError: el mensaje de error sale de `error` y el formulario NO se limpia,
      // para que el usuario pueda reintentar sin volver a escribir todo.
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Nombre
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Tu nombre completo"
          disabled={isPending}
          {...register('name')}
        />
        {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Correo electrónico
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          disabled={isPending}
          {...register('email')}
        />
        {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <Label htmlFor="subject" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Asunto
        </Label>
        <Input
          id="subject"
          type="text"
          placeholder="¿Sobre qué quieres contactarnos?"
          disabled={isPending}
          {...register('subject')}
        />
        {errors.subject && <p className="text-destructive text-sm">{errors.subject.message}</p>}
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message">Mensaje</Label>
        <Textarea
          id="message"
          placeholder="Escribe tu mensaje aquí..."
          rows={6}
          disabled={isPending}
          {...register('message')}
        />
        {errors.message && <p className="text-destructive text-sm">{errors.message.message}</p>}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="focus-visible:ring-secondary/50 w-full"
        disabled={isPending}
        size="lg"
      >
        {isPending ? 'Enviando...' : 'Enviar Mensaje'}
      </Button>

      {/* Error Message */}
      {isError && (
        <Alert variant="destructive" role="alert" aria-live="polite" data-testid="contact-error">
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
