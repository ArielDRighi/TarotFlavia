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
import Image from 'next/image';
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
                <Sparkles className="mr-1 h-3 w-3" aria-hidden="true" />
                Nuevo
              </Badge>

              <h2 className="text-text-primary font-serif text-4xl font-bold md:text-5xl">
                Carta Astral Personalizada
              </h2>

              <p className="text-text-muted text-lg md:text-xl">
                Descubre el mapa del cielo en el momento exacto de tu nacimiento. Conoce tus
                posiciones planetarias, aspectos y cómo influyen en tu personalidad.
              </p>
            </div>

            {/* Features list */}
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Check className="text-primary mt-1 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span className="text-text-primary">
                  Posiciones planetarias exactas al momento de tu nacimiento
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="text-primary mt-1 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span className="text-text-primary">
                  Interpretación de aspectos y su influencia en tu vida
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="text-primary mt-1 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span className="text-text-primary">
                  Síntesis personalizada y detallada para usuarios Premium
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
          <div className="relative overflow-hidden rounded-3xl lg:h-[400px]">
            <Image
              src="/images/birth-chart-promo.webp"
              alt="Carta astral con constelaciones y símbolos astrológicos"
              fill
              className="object-cover"
            />
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
              <Star className="text-primary h-6 w-6" aria-hidden="true" />
              <Badge variant="secondary">
                <Sparkles className="mr-1 h-3 w-3" aria-hidden="true" />
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
            <Star className="text-primary h-6 w-6" aria-hidden="true" />
          </div>
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="mr-1 h-3 w-3" aria-hidden="true" />
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
