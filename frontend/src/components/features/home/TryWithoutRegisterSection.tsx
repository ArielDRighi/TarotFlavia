import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export function TryWithoutRegisterSection() {
  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:border-purple-800 dark:from-purple-950/20 dark:to-pink-950/20">
        <CardContent className="flex flex-col items-center p-8 text-center md:p-12">
          {/* Icon */}
          <div
            data-testid="try-without-register-icon"
            className="mb-6 rounded-full bg-purple-100 p-4 dark:bg-purple-900/30"
          >
            <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>

          {/* Title */}
          <h2 className="mb-4 font-serif text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
            Prueba sin compromiso
          </h2>

          {/* Description */}
          <p className="mb-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            1 carta aleatoria sin necesidad de registrarte. Experimenta la magia del tarot de forma
            inmediata.
          </p>

          {/* CTA Button */}
          <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
            <Link href="/carta-del-dia">Carta del Día Gratis</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
