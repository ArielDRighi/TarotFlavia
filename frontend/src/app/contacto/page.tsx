import type { Metadata } from 'next';
import { Sparkles } from 'lucide-react';

import { ListingIntro } from '@/components/common/ListingIntro';
import { Reveal } from '@/components/common/Reveal';
import { ContactDetails } from '@/components/features/contact/ContactDetails';
import { ContactForm } from '@/components/features/contact/ContactForm';
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
              ¿Tenés preguntas o sugerencias? Nos encantaría escucharte
            </p>
          </div>
        </Reveal>

        {/* Form */}
        <Reveal index={1}>
          <div className="bg-card rounded-lg border p-6">
            <ContactForm />
          </div>
        </Reveal>

        {/* Datos de contacto (página de confianza, T-SEO-015) */}
        <Reveal index={2}>
          <ContactDetails />
        </Reveal>

        <Reveal index={3}>
          <ListingIntro intro={LISTING_INTROS.contacto} className="p-0" />
        </Reveal>
      </div>
    </div>
  );
}
