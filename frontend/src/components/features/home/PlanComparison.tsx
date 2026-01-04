import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/constants/routes';
import { Check, X } from 'lucide-react';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  description: string;
  features: PlanFeature[];
  cta: {
    text: string;
    href: string;
  };
  recommended?: boolean;
}

const plans: Plan[] = [
  {
    name: 'Visitante',
    price: 'Sin registro',
    description: 'Prueba el tarot sin compromiso',
    features: [
      { text: 'Carta del día (1 vez al día)', included: true },
      { text: 'Lecturas de tarot', included: false },
      { text: 'Interpretación personalizada', included: false },
      { text: 'Todas las tiradas', included: false },
    ],
    cta: {
      text: 'Probar carta del día',
      href: ROUTES.CARTA_DEL_DIA,
    },
  },
  {
    name: 'Free',
    price: 'Gratis',
    description: 'Empieza tu viaje espiritual',
    features: [
      { text: 'Carta del día', included: true },
      { text: '1 lectura diaria', included: true },
      { text: 'Tiradas de 1-3 cartas', included: true },
      { text: 'Sin interpretación IA', included: false },
      { text: 'Preguntas predefinidas', included: true },
    ],
    cta: {
      text: 'Registrarse gratis',
      href: ROUTES.REGISTER,
    },
  },
  {
    name: 'Premium',
    price: '$9.99/mes',
    description: 'Desbloquea todo el potencial',
    features: [
      { text: 'Lecturas ilimitadas', included: true },
      { text: 'Todas las tiradas', included: true },
      { text: 'Interpretación personalizada', included: true },
      { text: 'Preguntas personalizadas', included: true },
      { text: 'Historial completo', included: true },
    ],
    cta: {
      text: 'Comenzar Premium',
      href: ROUTES.REGISTER,
    },
    recommended: true,
  },
];

export function PlanComparison() {
  return (
    <section className="container mx-auto px-4 py-12 md:py-20">
      {/* Section Header */}
      <div className="mb-12 text-center">
        <h2 className="mb-4 font-serif text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl dark:text-white">
          ¿Qué plan se adapta a ti?
        </h2>
        <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
          Desde pruebas sin registro hasta acceso completo con interpretaciones personalizadas
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={
              plan.recommended
                ? 'relative border-purple-300 shadow-lg dark:border-purple-700'
                : 'border-gray-200 dark:border-gray-700'
            }
          >
            {plan.recommended && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 transform bg-purple-600 px-4 py-1">
                Recomendado
              </Badge>
            )}

            <CardHeader className="text-center">
              <h3 className="mb-2 font-serif text-2xl font-bold text-gray-900 dark:text-white">
                {plan.name}
              </h3>
              <p className="mb-4 text-4xl font-bold text-purple-600 dark:text-purple-400">
                {plan.price}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Features List */}
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                    ) : (
                      <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-600" />
                    )}
                    <span
                      className={
                        feature.included
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-500 line-through dark:text-gray-500'
                      }
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                asChild
                variant={plan.recommended ? 'default' : 'outline'}
                className="w-full"
                size="lg"
              >
                <Link href={plan.cta.href}>{plan.cta.text}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
