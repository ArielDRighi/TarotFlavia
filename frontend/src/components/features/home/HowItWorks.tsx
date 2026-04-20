import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
    description:
      'Selecciona una categoría y elige la pregunta que refleja lo que tu corazón necesita explorar.',
  },
  {
    number: '2',
    icon: Layers,
    title: 'Selecciona tus cartas',
    description:
      'Elige el tipo de tirada según tu plan y deja que la intuición guíe tu mano al elegir cada carta.',
  },
  {
    number: '3',
    icon: Sparkles,
    title: 'Recibe tu lectura',
    description:
      'Obtén una interpretación personalizada que conecta las cartas con tu situación particular.',
  },
];

export function HowItWorks() {
  return (
    <section className="bg-bg-main px-4 py-16 md:py-24">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="text-text-primary font-serif text-4xl font-light md:text-5xl lg:text-6xl">
            ¿Cómo funciona?
          </h2>
          <div className="bg-secondary mx-auto mt-4 h-px w-24 opacity-60" />
          <p className="text-text-muted mx-auto mt-6 max-w-xl font-sans text-lg">
            Tu lectura de tarot en 3 simples pasos
          </p>
        </div>

        {/* Steps */}
        <div className="relative mb-16 grid gap-8 md:grid-cols-3">
          {/* Connector line (desktop only) */}
          <div
            className="absolute top-8 right-[16.66%] left-[16.66%] hidden h-px md:block"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(214, 158, 46, 0.4), rgba(214, 158, 46, 0.4), transparent)',
            }}
            aria-hidden="true"
          />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                {/* Number badge */}
                <div
                  className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 shadow-lg"
                  style={{
                    borderColor: '#d69e2e',
                    background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 100%)',
                    boxShadow: '0 0 20px rgba(214, 158, 46, 0.2)',
                  }}
                >
                  <span className="font-serif text-2xl font-bold" style={{ color: '#d69e2e' }}>
                    {step.number}
                  </span>
                </div>

                {/* Icon */}
                <div
                  className="mb-4 rounded-xl p-3"
                  style={{ background: 'rgba(128, 90, 213, 0.08)' }}
                >
                  <Icon className="text-primary h-7 w-7" />
                </div>

                {/* Text */}
                <h3 className="text-text-primary mb-2 font-serif text-xl font-semibold">
                  {step.title}
                </h3>
                <p className="text-text-muted max-w-xs font-sans text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 px-8 font-medium text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
          >
            <Link href={ROUTES.REGISTER}>Comienza tu viaje</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
