import type { Metadata } from 'next';
import { Clock, Mail, MapPin, Sparkles, UserRound } from 'lucide-react';

import { ListingIntro } from '@/components/common/ListingIntro';
import { Reveal } from '@/components/common/Reveal';
import { ContactForm } from '@/components/features/contact/ContactForm';
import { CONFIG } from '@/lib/constants';
import { LISTING_INTROS } from '@/lib/constants/listing-intros.data';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';

export const metadata: Metadata = STATIC_PAGE_METADATA.contacto;

/**
 * Página de Contacto
 *
 * Layout místico (canon premium) para el formulario de contacto:
 * cabecera con acento dorado + Cormorant, tarjeta de formulario y la nota de
 * contacto como callout dorado de marca. La lógica del formulario vive en
 * `ContactForm` siguiendo la arquitectura feature-based.
 *
 * El envío es real desde T-PROD-014 (`POST /contact`): ya no hay disclaimer de
 * "envío no implementado".
 *
 * Servía 34 palabras propias —el formulario es todo `input`, y un `input` no es
 * texto para el crawler—, así que abajo va contenido propio sobre qué se
 * responde por acá y qué no (T-SEO-003).
 *
 * Desde T-SEO-015 es una **página de confianza** y sigue indexable: además del
 * formulario publica el correo del dominio propio, desde dónde se responde,
 * el horario de respuesta y quién responde. Está en el footer, así que el
 * guardarraíl le exige 500 palabras propias: las pone `LISTING_INTROS.contacto`.
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

        {/* Datos de contacto — callout dorado de marca (página de confianza, T-SEO-015) */}
        <Reveal index={2}>
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
                  {CONFIG.CONTACT_LOCATION}. Respondemos en hora de Argentina (UTC−3); si escribís
                  desde otro país, tenelo en cuenta para el plazo.
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 font-semibold">
                  <Clock className="text-secondary h-3.5 w-3.5" aria-hidden="true" />
                  Horario de respuesta
                </dt>
                <dd className="text-muted-foreground mt-1">
                  Respondemos todos los mensajes en un plazo de {CONFIG.CONTACT_RESPONSE_WINDOW}, de
                  lunes a viernes. Lo que llega el fin de semana se contesta el lunes.
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 font-semibold">
                  <UserRound className="text-secondary h-3.5 w-3.5" aria-hidden="true" />
                  Quién responde
                </dt>
                <dd className="text-muted-foreground mt-1">
                  El equipo editorial de Auguria, las mismas personas que revisan la enciclopedia y
                  las guías. Los mensajes sobre pagos los atiende quien administra el sitio.
                </dd>
              </div>
            </dl>
          </div>
        </Reveal>

        <Reveal index={3}>
          <ListingIntro intro={LISTING_INTROS.contacto} className="p-0" />
        </Reveal>
      </div>
    </div>
  );
}
