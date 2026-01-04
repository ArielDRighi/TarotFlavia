import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/lib/constants/routes';
import { Sparkles, Layers, MessageSquare, BarChart3, ShieldOff } from 'lucide-react';

const benefits = [
  {
    icon: Sparkles,
    title: 'Interpretaciones personalizadas y profundas',
    description: 'Análisis profundos adaptados a tu situación',
  },
  {
    icon: Layers,
    title: 'Todas las tiradas disponibles',
    description: 'Acceso a tiradas complejas y especializadas',
  },
  {
    icon: MessageSquare,
    title: 'Preguntas personalizadas',
    description: 'Formula tus propias consultas específicas',
  },
  {
    icon: BarChart3,
    title: 'Estadísticas avanzadas',
    description: 'Seguimiento de tus lecturas y patrones',
  },
  {
    icon: ShieldOff,
    title: 'Sin publicidad',
    description: 'Experiencia ininterrumpida y enfocada',
  },
];

export function PremiumBenefitsSection() {
  return (
    <section className="container mx-auto px-4 py-12 md:py-20">
      <div className="mb-12 text-center">
        <h2 className="mb-4 font-serif text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl dark:text-white">
          ¿Por qué elegir Premium?
        </h2>
        <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
          Desbloquea todo el potencial del tarot con funcionalidades avanzadas
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;

          return (
            <Card
              key={benefit.title}
              data-testid="benefit-item"
              className="transition-shadow hover:shadow-lg"
            >
              <CardContent className="p-6">
                <div className="mb-4 w-fit rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                  <Icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pricing and CTA */}
      <div className="text-center">
        <div className="mb-6">
          <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">$9.99/mes</span>
        </div>

        <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
          <Link href={ROUTES.REGISTER}>Actualizar a Premium</Link>
        </Button>
      </div>
    </section>
  );
}
