import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-12 md:py-20">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Content */}
        <div className="space-y-6">
          <h1 className="font-serif text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
            Auguria: Descubre tu destino a través del Tarot
          </h1>

          <p className="text-lg text-gray-600 md:text-xl dark:text-gray-300">
            Lecturas de tarot personalizadas que iluminan tu camino. Desde consultas rápidas hasta
            interpretaciones profundas, encuentra las respuestas que buscas.
          </p>

          {/* CTAs */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href={ROUTES.CARTA_DEL_DIA}>Ver mi carta del día gratis</Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link href={ROUTES.REGISTER}>Crear cuenta gratis</Link>
            </Button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative aspect-square lg:aspect-auto lg:h-[500px]">
          <Image
            src="/images/hero-tarot-cards.webp"
            alt="Cartas de tarot místicas"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
}
