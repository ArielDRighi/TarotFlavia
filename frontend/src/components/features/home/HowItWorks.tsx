import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/lib/constants/routes';
import { HelpCircle, Layers, Sparkles } from 'lucide-react';

interface Step {
  number: string;
  icon: typeof HelpCircle;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: '1',
    icon: HelpCircle,
    title: 'Elige tu pregunta',
    description: 'Elige una categoría y selecciona tu pregunta o crea una personalizada.',
  },
  {
    number: '2',
    icon: Layers,
    title: 'Selecciona tus cartas',
    description: 'Elige el tipo de tirada según tu plan y selecciona tus cartas.',
  },
  {
    number: '3',
    icon: Sparkles,
    title: 'Recibe tu lectura',
    description: 'Obtén tu interpretación personalizada según tu plan.',
  },
];

export function HowItWorks() {
  return (
    <section className="container mx-auto px-4 py-12 md:py-20">
      {/* Section Header */}
      <div className="mb-12 text-center">
        <h2 className="mb-4 font-serif text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl dark:text-white">
          ¿Cómo funciona?
        </h2>
        <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
          Obtén tu lectura de tarot en 3 simples pasos
        </p>
      </div>

      {/* Steps Grid */}
      <div className="mb-12 grid gap-8 md:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <Card key={step.number} className="text-center">
              <CardContent className="flex flex-col items-center gap-4 p-6">
                {/* Step Number */}
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {step.number}
                  </span>
                </div>

                {/* Icon */}
                <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                  <Icon className="h-8 w-8 text-gray-700 dark:text-gray-300" />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-semibold text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CTA */}
      <div className="text-center">
        <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
          <Link href={ROUTES.REGISTER}>Comienza tu viaje</Link>
        </Button>
      </div>
    </section>
  );
}
