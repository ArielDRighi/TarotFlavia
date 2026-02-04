import { ContactForm } from '@/components/features/contact/ContactForm';

/**
 * Página de Contacto
 *
 * Layout para el formulario de contacto.
 * La lógica del formulario está en ContactForm component siguiendo arquitectura feature-based.
 *
 * TODO: Implementar envío real de correo o integración con backend.
 */
export default function ContactoPage() {
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
          <ContactForm />
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
