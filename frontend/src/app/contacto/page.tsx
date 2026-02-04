'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, MessageSquare, User } from 'lucide-react';

/**
 * Página de Contacto
 *
 * Formulario de contacto básico para que los usuarios envíen mensajes.
 * TODO: Implementar envío real de correo o integración con backend.
 */
export default function ContactoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // TODO: Implementar envío real al backend
    // Simulación de envío
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log('Form data:', formData);

    setIsSubmitting(false);
    setSubmitStatus('success');

    // Limpiar formulario
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
    });

    // Reset status después de 5 segundos
    setTimeout(() => {
      setSubmitStatus('idle');
    }, 5000);
  };

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-text-primary font-serif text-4xl font-bold">Contacto</h1>
          <p className="text-text-muted text-lg">
            ¿Tienes preguntas o sugerencias? Nos encantaría escucharte
          </p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-lg border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nombre
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Tu nombre completo"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Correo electrónico
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Asunto
              </Label>
              <Input
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                placeholder="¿Sobre qué quieres contactarnos?"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Escribe tu mensaje aquí..."
                rows={6}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
              {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
            </Button>

            {/* Success Message */}
            {submitStatus === 'success' && (
              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/20">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.
                </p>
              </div>
            )}

            {/* Error Message */}
            {submitStatus === 'error' && (
              <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Hubo un error al enviar tu mensaje. Por favor, intenta nuevamente.
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Alternative Contact Info */}
        <div className="rounded-lg bg-purple-50 p-6 dark:bg-purple-950/20">
          <h2 className="text-text-primary mb-3 font-semibold">Otras formas de contacto</h2>
          <div className="text-text-secondary space-y-2 text-sm">
            <p>
              <strong>Email:</strong> contacto@auguria.com
            </p>
            <p className="text-text-muted">
              Respondemos todos los mensajes en un plazo de 24-48 horas.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-950/20">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Nota:</strong> Este formulario es funcional pero el envío de correos aún no está
            implementado. Los mensajes se muestran en la consola del navegador.
          </p>
        </div>
      </div>
    </div>
  );
}
