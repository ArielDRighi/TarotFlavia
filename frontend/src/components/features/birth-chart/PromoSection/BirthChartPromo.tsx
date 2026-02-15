/**
 * BirthChartPromo - Componente Promocional de Carta Astral
 *
 * Componente con 3 variantes para promocionar el módulo de carta astral:
 * - hero: Grande, para landing principal (grid 2 columnas, visual animado)
 * - section: Estándar, para páginas internas (centrado, sin grid)
 * - card: Compacta, para grids de servicios
 */

'use client';

import Link from 'next/link';
import { Star, Sparkles, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';

interface BirthChartPromoProps {
  variant?: 'hero' | 'section' | 'card';
  className?: string;
}

export function BirthChartPromo({ variant = 'section', className }: BirthChartPromoProps) {
  // Variante HERO: Grande, para landing principal
  if (variant === 'hero') {
    return (
      <section
        data-testid="birth-chart-promo-hero"
        className={cn('container mx-auto px-4 py-12 md:py-20', className)}
      >
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                <Sparkles className="mr-1 h-3 w-3" />
                Nuevo
              </Badge>

              <h2 className="font-serif text-4xl font-bold text-gray-900 md:text-5xl dark:text-white">
                Carta Astral Personalizada
              </h2>

              <p className="text-lg text-gray-600 md:text-xl dark:text-gray-300">
                Descubre el mapa del cielo en el momento exacto de tu nacimiento. Conoce tus
                posiciones planetarias, aspectos y cómo influyen en tu personalidad.
              </p>
            </div>

            {/* Features list */}
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Check className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  Posiciones planetarias exactas al momento de tu nacimiento
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  Interpretación de aspectos y su influencia en tu vida
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  Síntesis personalizada con IA para usuarios Premium
                </span>
              </li>
            </ul>

            {/* CTA */}
            <div>
              <Button asChild size="lg">
                <Link href={ROUTES.CARTA_ASTRAL}>Generar mi carta astral</Link>
              </Button>
            </div>
          </div>

          {/* Visual decorativo */}
          <div className="bg-primary/5 relative flex items-center justify-center rounded-3xl p-12 lg:h-[400px]">
            <div className="relative">
              {/* Icono central grande */}
              <div className="bg-primary/10 mx-auto flex h-32 w-32 items-center justify-center rounded-full">
                <Star className="text-primary h-16 w-16" />
              </div>

              {/* Iconos orbitales decorativos */}
              <div className="absolute top-0 -left-8 animate-pulse">
                <Sparkles className="text-primary/60 h-8 w-8" />
              </div>
              <div className="absolute -right-8 bottom-0 animate-pulse delay-300">
                <Sparkles className="text-primary/60 h-8 w-8" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Variante SECTION: Estándar, para páginas internas
  if (variant === 'section') {
    return (
      <section
        data-testid="birth-chart-promo-section"
        className={cn('container mx-auto px-4 py-12', className)}
      >
        <Card className="from-primary/5 to-primary/10 border-primary/20 bg-gradient-to-br">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex w-fit items-center gap-2">
              <Star className="text-primary h-6 w-6" />
              <Badge variant="secondary">
                <Sparkles className="mr-1 h-3 w-3" />
                Nuevo
              </Badge>
            </div>
            <CardTitle className="text-2xl md:text-3xl">Carta Astral</CardTitle>
            <CardDescription className="text-base">
              Descubre el mapa del cielo en el momento de tu nacimiento y conoce las posiciones
              planetarias que influyen en tu personalidad.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild size="lg">
              <Link href={ROUTES.CARTA_ASTRAL}>Generar carta astral</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Variante CARD: Compacta, para grids de servicios
  return (
    <Card
      data-testid="birth-chart-promo-card"
      className={cn('hover:border-primary/50 relative transition-colors', className)}
    >
      <CardHeader>
        <div className="mb-2 flex items-start justify-between">
          <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
            <Star className="text-primary h-6 w-6" />
          </div>
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="mr-1 h-3 w-3" />
            Nuevo
          </Badge>
        </div>
        <CardTitle className="text-xl">Carta Astral</CardTitle>
        <CardDescription>Mapa del cielo en tu nacimiento</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline" className="w-full">
          <Link href={ROUTES.CARTA_ASTRAL}>Generar</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
