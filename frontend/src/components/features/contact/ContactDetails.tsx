// 2. Icons
import { Clock, Mail, MapPin, UserRound } from 'lucide-react';
// 6. Utils & types
import { CONFIG } from '@/lib/constants';

/**
 * Datos de contacto de la página de confianza `/contacto` (T-SEO-015): correo
 * del dominio propio, desde dónde se responde, horario de respuesta y quién
 * responde. Sin `'use client'`: es texto que tiene que llegar al crawler.
 * Callout dorado de marca, como el resto de la página.
 */
export function ContactDetails() {
  return (
    <div
      className="border-secondary/40 bg-secondary/10 rounded-lg border p-6"
      data-testid="contact-callout"
    >
      <h2 className="text-foreground mb-4 flex items-center gap-2 font-semibold">
        <Mail className="text-secondary h-4 w-4" aria-hidden="true" />
        Otras formas de contacto
      </h2>
      <dl
        className="text-foreground grid gap-4 text-sm sm:grid-cols-2"
        data-testid="contact-details"
      >
        <div>
          <dt className="flex items-center gap-1.5 font-semibold">
            <Mail className="text-secondary h-3.5 w-3.5" aria-hidden="true" />
            Correo
          </dt>
          <dd className="mt-1">
            <a
              href={`mailto:${CONFIG.CONTACT_EMAIL}`}
              className="text-primary underline-offset-4 hover:underline"
              data-testid="contact-email-link"
            >
              {CONFIG.CONTACT_EMAIL}
            </a>
            <span className="text-muted-foreground block">
              Casilla del dominio propio del sitio; es la misma a la que llega el formulario.
            </span>
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 font-semibold">
            <MapPin className="text-secondary h-3.5 w-3.5" aria-hidden="true" />
            Dónde estamos
          </dt>
          <dd className="text-muted-foreground mt-1">
            {CONFIG.CONTACT_LOCATION}. Respondemos en hora de Argentina (UTC−3); si escribís desde
            otro país, tenelo en cuenta para el plazo.
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 font-semibold">
            <Clock className="text-secondary h-3.5 w-3.5" aria-hidden="true" />
            Horario de respuesta
          </dt>
          <dd className="text-muted-foreground mt-1">
            Respondemos todos los mensajes en un plazo de {CONFIG.CONTACT_RESPONSE_WINDOW}, de lunes
            a viernes. Lo que llega el fin de semana se contesta el lunes.
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 font-semibold">
            <UserRound className="text-secondary h-3.5 w-3.5" aria-hidden="true" />
            Quién responde
          </dt>
          <dd className="text-muted-foreground mt-1">
            El equipo editorial de Auguria, las mismas personas que revisan la enciclopedia y las
            guías. Los mensajes sobre pagos los atiende quien administra el sitio.
          </dd>
        </div>
      </dl>
    </div>
  );
}
