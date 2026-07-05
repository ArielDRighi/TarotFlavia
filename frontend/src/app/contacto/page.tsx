import { Mail, Sparkles } from 'lucide-react';

import { DisclaimerBanner } from '@/components/ui/disclaimer-banner';
import { Reveal } from '@/components/common/Reveal';
import { ContactForm } from '@/components/features/contact/ContactForm';

/**
 * Página de Contacto
 *
 * Layout místico (canon premium) para el formulario de contacto:
 * cabecera con acento dorado + Cormorant, tarjeta de formulario y la nota de
 * contacto como callout dorado de marca. La lógica del formulario vive en
 * `ContactForm` siguiendo la arquitectura feature-based.
 *
 * TODO: Implementar envío real de correo o integración con backend.
 */
export default function ContactoPage() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <Reveal index={0}>
          <div className="space-y-2 text-center">
            <Sparkles
              className="text-secondary mx-auto h-8 w-8"
              aria-hidden="true"
              data-testid="contact-accent"
            />
            <h1 className="text-primary font-serif text-4xl font-bold">Contacto</h1>
            <p className="text-muted-foreground text-lg">
              ¿Tienes preguntas o sugerencias? Nos encantaría escucharte
            </p>
          </div>
        </Reveal>

        {/* Form */}
        <Reveal index={1}>
          <div className="bg-card rounded-lg border p-6">
            <ContactForm />
          </div>
        </Reveal>

        {/* Alternative Contact Info — callout dorado de marca */}
        <Reveal index={2}>
          <div className="border-secondary/40 bg-secondary/10 rounded-lg border p-6">
            <h2 className="text-foreground mb-3 flex items-center gap-2 font-semibold">
              <Mail className="text-secondary h-4 w-4" aria-hidden="true" />
              Otras formas de contacto
            </h2>
            <div className="text-foreground space-y-2 text-sm">
              <p>
                <strong>Email:</strong> contacto@auguria.com
              </p>
              <p className="text-muted-foreground">
                Respondemos todos los mensajes en un plazo de 24-48 horas.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Disclaimer */}
        <DisclaimerBanner message="Este formulario es funcional pero el envío de correos aún no está implementado. Los mensajes se muestran en la consola del navegador." />
      </div>
    </div>
  );
}
