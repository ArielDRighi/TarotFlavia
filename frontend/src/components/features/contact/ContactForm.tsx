'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, MessageSquare, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { contactFormSchema, type ContactFormData } from '@/lib/validations/contact.schemas';

/**
 * ContactForm component
 *
 * A complete contact form with name, email, subject, and message fields.
 * Uses React Hook Form with Zod validation.
 *
 * Features:
 * - Client-side validation with Zod schema
 * - Inline error messages for each field
 * - Loading state during submission
 * - Success/error feedback after submission
 * - Form reset after successful submission
 *
 * TODO: Implement backend endpoint for email sending
 */
export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

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

  const onSubmit = async () => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // TODO: Implementar envío real al backend
      // await sendContactMessage(data);

      // Simulación de envío
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitStatus('success');
      reset(); // Limpiar formulario

      // Reset status después de 5 segundos
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } catch {
      setSubmitStatus('error');

      // Reset error status después de 5 segundos
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
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
          disabled={isSubmitting}
          {...register('name')}
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
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
          disabled={isSubmitting}
          {...register('email')}
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
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
          disabled={isSubmitting}
          {...register('subject')}
        />
        {errors.subject && <p className="text-sm text-red-600">{errors.subject.message}</p>}
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message">Mensaje</Label>
        <Textarea
          id="message"
          placeholder="Escribe tu mensaje aquí..."
          rows={6}
          disabled={isSubmitting}
          {...register('message')}
        />
        {errors.message && <p className="text-sm text-red-600">{errors.message.message}</p>}
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
        {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
      </Button>

      {/* Success Message */}
      {submitStatus === 'success' && (
        <div
          className="rounded-lg bg-green-50 p-4 dark:bg-green-950/20"
          role="alert"
          aria-live="polite"
        >
          <p className="text-sm text-green-800 dark:text-green-200">
            ¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.
          </p>
        </div>
      )}

      {/* Error Message */}
      {submitStatus === 'error' && (
        <div
          className="rounded-lg bg-red-50 p-4 dark:bg-red-950/20"
          role="alert"
          aria-live="polite"
        >
          <p className="text-sm text-red-800 dark:text-red-200">
            Hubo un error al enviar tu mensaje. Por favor, intenta nuevamente.
          </p>
        </div>
      )}
    </form>
  );
}
