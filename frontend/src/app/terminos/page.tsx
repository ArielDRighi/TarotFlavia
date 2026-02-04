'use client';

/**
 * Página de Términos y Condiciones
 *
 * Muestra los términos de servicio de Auguria.
 * TODO: Reemplazar con contenido legal real revisado por abogados.
 */
export default function TerminosPage() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-text-primary font-serif text-4xl font-bold">
            Términos y Condiciones
          </h1>
          <p className="text-text-muted text-sm">
            Última actualización: {new Date().toLocaleDateString('es-ES')}
          </p>
        </div>

        {/* Content */}
        <div className="rounded-lg border p-6">
          <div className="prose prose-purple dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="font-serif text-2xl font-semibold">1. Aceptación de Términos</h2>
              <p className="text-text-secondary">
                Al acceder y utilizar Auguria, aceptas estar sujeto a estos términos y condiciones.
                Si no estás de acuerdo con alguno de estos términos, no debes utilizar nuestros
                servicios.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold">2. Descripción del Servicio</h2>
              <p className="text-text-secondary">
                Auguria proporciona servicios de lectura de tarot, horóscopo, rituales y otras
                prácticas esotéricas con fines de entretenimiento y orientación personal. Nuestros
                servicios no sustituyen el asesoramiento profesional médico, legal o financiero.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold">3. Cuenta de Usuario</h2>
              <p className="text-text-secondary">
                Para acceder a ciertas funcionalidades, debes crear una cuenta. Eres responsable de
                mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran
                bajo tu cuenta.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold">4. Planes y Suscripciones</h2>
              <p className="text-text-secondary">
                Auguria ofrece planes gratuitos y premium. Los detalles de cada plan, incluidas las
                características y precios, se encuentran disponibles en nuestra página de
                suscripción. Nos reservamos el derecho de modificar los precios con previo aviso.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold">5. Propiedad Intelectual</h2>
              <p className="text-text-secondary">
                Todo el contenido de Auguria, incluyendo textos, imágenes, gráficos y software, está
                protegido por derechos de autor y otras leyes de propiedad intelectual. No puedes
                reproducir, distribuir o modificar nuestro contenido sin autorización.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold">
                6. Limitación de Responsabilidad
              </h2>
              <p className="text-text-secondary">
                Las lecturas y servicios proporcionados por Auguria son para fines de
                entretenimiento y orientación personal. No nos hacemos responsables de las
                decisiones que tomes basándote en nuestros servicios. Siempre consulta con
                profesionales calificados para asuntos importantes.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold">7. Modificaciones del Servicio</h2>
              <p className="text-text-secondary">
                Nos reservamos el derecho de modificar o descontinuar el servicio en cualquier
                momento, temporal o permanentemente, con o sin previo aviso.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold">8. Terminación</h2>
              <p className="text-text-secondary">
                Podemos suspender o terminar tu acceso a Auguria si violas estos términos o si tu
                conducta es perjudicial para otros usuarios o para nuestros servicios.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold">9. Ley Aplicable</h2>
              <p className="text-text-secondary">
                Estos términos se rigen por las leyes aplicables. Cualquier disputa relacionada con
                estos términos será resuelta en los tribunales competentes.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold">10. Contacto</h2>
              <p className="text-text-secondary">
                Si tienes preguntas sobre estos términos, por favor contáctanos a través de nuestra
                página de contacto.
              </p>
            </section>

            <div className="mt-8 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-950/20">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Nota:</strong> Este es un contenido placeholder. El contenido legal real
                debe ser revisado y aprobado por profesionales legales antes de su uso en
                producción.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
