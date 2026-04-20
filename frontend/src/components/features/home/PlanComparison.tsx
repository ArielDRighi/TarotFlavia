import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';
import { Check, X, Star } from 'lucide-react';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  priceNote?: string;
  description: string;
  features: PlanFeature[];
  cta: { text: string; href: string };
  recommended?: boolean;
}

const plans: Plan[] = [
  {
    name: 'Visitante',
    price: 'Sin registro',
    description: 'Prueba el tarot sin compromiso',
    features: [
      { text: 'Carta del día (1 vez al día)', included: true },
      { text: 'Horóscopos (occidental y chino)', included: true },
      { text: 'Numerología', included: true },
      { text: 'Rituales (acceso básico)', included: true },
      { text: 'Enciclopedia mística', included: true },
      { text: '1 consulta de péndulo', included: true },
      { text: '1 carta astral', included: true },
      { text: 'Lecturas de tarot', included: false },
      { text: 'Interpretación personalizada', included: false },
    ],
    cta: { text: 'Probar carta del día', href: ROUTES.CARTA_DEL_DIA },
  },
  {
    name: 'Free',
    price: 'Gratis',
    description: 'Empieza tu viaje espiritual',
    features: [
      { text: 'Carta del día', included: true },
      { text: '1 lectura de tarot / día (1–3 cartas)', included: true },
      { text: 'Horóscopos con widget personalizado', included: true },
      { text: 'Numerología con widget personalizado', included: true },
      { text: 'Rituales (ventajas adicionales)', included: true },
      { text: 'Enciclopedia mística', included: true },
      { text: 'Carta astral ilimitada', included: true },
      { text: '1 consulta péndulo / día', included: true },
      { text: 'Compartir lecturas', included: true },
      { text: 'Interpretación personalizada', included: false },
    ],
    cta: { text: 'Registrarse gratis', href: ROUTES.REGISTER },
  },
  {
    name: 'Premium',
    price: '$7.000',
    priceNote: 'por mes',
    description: 'Desbloquea todo el potencial',
    features: [
      { text: 'Carta del día', included: true },
      { text: '3 lecturas de tarot / día — todas las tiradas', included: true },
      { text: 'Interpretación personalizada y profunda', included: true },
      { text: 'Preguntas personalizadas', included: true },
      { text: 'Carta astral ilimitada y detallada', included: true },
      { text: 'Horóscopos y numerología con widget', included: true },
      { text: 'Rituales (acceso completo)', included: true },
      { text: 'Enciclopedia mística', included: true },
      { text: '3 consultas péndulo / día', included: true },
      { text: 'Compartir lecturas e historial completo', included: true },
    ],
    cta: { text: 'Comenzar Premium', href: ROUTES.PREMIUM },
    recommended: true,
  },
];

export function PlanComparison() {
  return (
    <section className="px-4 py-16 md:py-24" style={{ background: '#f2eef9' }}>
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-14 text-center">
          <h2 className="text-text-primary font-serif text-4xl font-light md:text-5xl lg:text-6xl">
            ¿Qué plan se adapta a ti?
          </h2>
          <div className="bg-secondary mx-auto mt-4 h-px w-24 opacity-60" />
          <p className="text-text-muted mx-auto mt-6 max-w-xl font-sans text-lg">
            Desde pruebas sin registro hasta acceso completo con interpretaciones personalizadas
          </p>
        </div>

        {/* Cards */}
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3 md:items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="relative flex flex-col overflow-hidden rounded-2xl shadow-md transition-shadow hover:shadow-xl"
              style={
                plan.recommended
                  ? {
                      background: 'linear-gradient(160deg, #2d1b69 0%, #1a0a2e 100%)',
                      border: '1px solid rgba(214, 158, 46, 0.4)',
                      boxShadow: '0 0 40px rgba(128, 90, 213, 0.2)',
                    }
                  : {
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                    }
              }
            >
              {/* Recommended badge */}
              {plan.recommended && (
                <div
                  className="flex items-center justify-center gap-1.5 py-2 text-center text-xs font-semibold tracking-widest uppercase"
                  style={{ background: '#d69e2e', color: '#1a0a2e' }}
                >
                  <Star className="h-3 w-3 fill-current" />
                  Recomendado
                  <Star className="h-3 w-3 fill-current" />
                </div>
              )}

              <div className="flex flex-1 flex-col p-6">
                {/* Plan name & price */}
                <div className="mb-6 text-center">
                  <h3
                    className="mb-3 font-serif text-2xl font-semibold"
                    style={{ color: plan.recommended ? '#f9f7f2' : '#2d3748' }}
                  >
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span
                      className="font-serif text-4xl font-bold"
                      style={{ color: plan.recommended ? '#d69e2e' : '#805ad5' }}
                    >
                      {plan.price}
                    </span>
                    {plan.priceNote && (
                      <span
                        className="font-sans text-sm"
                        style={{ color: plan.recommended ? 'rgba(249,247,242,0.6)' : '#718096' }}
                      >
                        {plan.priceNote}
                      </span>
                    )}
                  </div>
                  <p
                    className="mt-2 font-sans text-sm"
                    style={{ color: plan.recommended ? 'rgba(249,247,242,0.65)' : '#718096' }}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* Divider */}
                <div
                  className="mb-6 h-px w-full"
                  style={{
                    background: plan.recommended
                      ? 'rgba(214, 158, 46, 0.2)'
                      : 'rgba(128, 90, 213, 0.12)',
                  }}
                />

                {/* Features */}
                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-2.5">
                      {feature.included ? (
                        <Check
                          className="h-4 w-4 flex-shrink-0"
                          style={{ color: plan.recommended ? '#d69e2e' : '#48bb78' }}
                        />
                      ) : (
                        <X
                          className="h-4 w-4 flex-shrink-0"
                          style={{ color: 'rgba(113, 128, 150, 0.5)' }}
                        />
                      )}
                      <span
                        className="font-sans text-sm"
                        style={{
                          color: feature.included
                            ? plan.recommended
                              ? '#f9f7f2'
                              : '#2d3748'
                            : 'rgba(113, 128, 150, 0.6)',
                          textDecoration: feature.included ? 'none' : 'line-through',
                        }}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  asChild
                  size="lg"
                  className="w-full font-medium transition-all hover:scale-105"
                  style={
                    plan.recommended
                      ? {
                          background: 'linear-gradient(135deg, #d69e2e, #f6d860)',
                          color: '#1a0a2e',
                          border: 'none',
                        }
                      : {}
                  }
                  variant={plan.recommended ? 'default' : 'outline'}
                >
                  <Link href={plan.cta.href}>{plan.cta.text}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
