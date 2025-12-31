import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

export function WhatIsTarotSection() {
  return (
    <section className="container mx-auto bg-gray-50 px-4 py-12 md:py-20 dark:bg-gray-900/50">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-8 text-center font-serif text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl dark:text-white">
          ¿Qué es el Tarot?
        </h2>

        <div className="grid items-center gap-8 md:grid-cols-2">
          {/* Content */}
          <div className="space-y-6">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              El tarot es un sistema de cartas milenario utilizado como herramienta de
              autoconocimiento, reflexión y guía espiritual. Compuesto por 78 cartas divididas en
              dos grupos principales.
            </p>

            <Card>
              <CardContent className="space-y-4 p-6">
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-purple-600 dark:text-purple-400">
                    Arcanos Mayores (22 cartas)
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Representan los grandes arquetipos y experiencias fundamentales de la vida
                    humana, desde El Loco hasta El Mundo.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-semibold text-purple-600 dark:text-purple-400">
                    Arcanos Menores (56 cartas)
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Divididos en cuatro palos (Copas, Bastos, Espadas y Oros), reflejan situaciones
                    cotidianas y aspectos específicos de nuestra vida.
                  </p>
                </div>
              </CardContent>
            </Card>

            <p className="text-gray-700 dark:text-gray-300">
              En TarotFlavia, combinamos la sabiduría tradicional del tarot con inteligencia
              artificial para ofrecerte interpretaciones personalizadas que te ayuden en tu camino
              de autoconocimiento y reflexión.
            </p>
          </div>

          {/* Illustration */}
          <div data-testid="tarot-cards-illustration" className="relative aspect-square">
            <Image
              src="/images/tarot-cards-spread.webp"
              alt="Distribución de cartas de tarot"
              fill
              className="rounded-lg object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
