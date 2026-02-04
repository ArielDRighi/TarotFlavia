'use client';

/**
 * Página de Política de Privacidad
 *
 * Muestra la política de privacidad de Auguria.
 * TODO: Reemplazar con contenido legal real revisado por abogados.
 */
export default function PrivacidadPage() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-text-primary font-serif text-4xl font-bold">
            Política de Privacidad
          </h1>
          <p className="text-text-muted text-sm">
            Última actualización: {new Date().toLocaleDateString('es-ES')}
          </p>
        </div>

        {/* Content */}
        <div className="rounded-lg border p-6">
          <div className="prose prose-purple dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="font-serif text-2xl font-semibold">1. Introducción</h2>
              <p className="text-text-secondary">
                En Auguria, respetamos tu privacidad y nos comprometemos a proteger tus datos
                personales. Esta política de privacidad explica cómo recopilamos, usamos y
                protegemos tu información cuando utilizas nuestros servicios.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold">2. Información que Recopilamos</h2>
              <div className="space-y-3">
                <h3 className="text-text-primary font-semibold">2.1 Información de Cuenta</h3>
                <p className="text-text-secondary">
                  Cuando creas una cuenta, recopilamos tu nombre, dirección de correo electrónico y
                  contraseña cifrada.
                </p>

                <h3 className="text-text-primary font-semibold">2.2 Datos de Uso</h3>
                <p className="text-text-secondary">
                  Registramos información sobre cómo utilizas nuestros servicios, incluyendo
                  lecturas realizadas, rituales completados y preferencias de configuración.
                </p>

                <h3 className="text-text-primary font-semibold">2.3 Información Técnica</h3>
                <p className="text-text-secondary">
                  Recopilamos información técnica como dirección IP, tipo de navegador, sistema
                  operativo y datos de cookies para mejorar nuestros servicios.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold">3. Cómo Usamos tu Información</h2>
              <ul className="text-text-secondary list-disc space-y-2 pl-6">
                <li>Proporcionar y mantener nuestros servicios</li>
                <li>Personalizar tu experiencia en Auguria</li>
                <li>Procesar tus transacciones y suscripciones</li>
                <li>Enviarte notificaciones importantes sobre tu cuenta</li>
                <li>Mejorar nuestros servicios mediante análisis de uso</li>
                <li>Proteger contra fraudes y actividades maliciosas</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold">4. Compartir Información</h2>
              <p className="text-text-secondary">
                No vendemos ni alquilamos tu información personal a terceros. Podemos compartir
                información en las siguientes circunstancias:
              </p>
              <ul className="text-text-secondary list-disc space-y-2 pl-6">
                <li>Con proveedores de servicios que nos ayudan a operar nuestra plataforma</li>
                <li>Cuando sea requerido por ley o proceso legal</li>
                <li>Para proteger nuestros derechos y seguridad</li>
                <li>Con tu consentimiento explícito</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold">5. Seguridad de Datos</h2>
              <p className="text-text-secondary">
                Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos
                personales. Esto incluye cifrado de datos en tránsito y en reposo, controles de
                acceso, y monitoreo regular de seguridad.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold">
                6. Cookies y Tecnologías Similares
              </h2>
              <p className="text-text-secondary">
                Utilizamos cookies y tecnologías similares para mejorar tu experiencia, analizar el
                uso del sitio y personalizar el contenido. Puedes configurar tu navegador para
                rechazar cookies, aunque esto puede afectar algunas funcionalidades.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold">7. Tus Derechos</h2>
              <p className="text-text-secondary">Tienes derecho a:</p>
              <ul className="text-text-secondary list-disc space-y-2 pl-6">
                <li>Acceder a tus datos personales</li>
                <li>Corregir información inexacta</li>
                <li>Solicitar la eliminación de tus datos</li>
                <li>Oponerte al procesamiento de tus datos</li>
                <li>Exportar tus datos en formato portable</li>
                <li>Retirar tu consentimiento en cualquier momento</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold">8. Retención de Datos</h2>
              <p className="text-text-secondary">
                Retenemos tus datos personales mientras tu cuenta esté activa o según sea necesario
                para proporcionar servicios. Puedes solicitar la eliminación de tu cuenta en
                cualquier momento desde la configuración de tu perfil.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold">9. Privacidad de Menores</h2>
              <p className="text-text-secondary">
                Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos
                intencionalmente información personal de menores. Si descubrimos que hemos
                recopilado datos de un menor, los eliminaremos de inmediato.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold">10. Cambios a esta Política</h2>
              <p className="text-text-secondary">
                Podemos actualizar esta política de privacidad periódicamente. Te notificaremos
                sobre cambios significativos publicando la nueva política en esta página y
                actualizando la fecha de última modificación.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold">11. Contacto</h2>
              <p className="text-text-secondary">
                Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos tus
                datos, por favor contáctanos a través de nuestra página de contacto.
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
