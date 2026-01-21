'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NumberCard } from '@/components/features/numerology';
import { ROUTES } from '@/lib/constants/routes';
import type { NumerologyResponseDto } from '@/types/numerology.types';

/**
 * Resultado de Numerología Page
 *
 * Muestra los resultados del cálculo numerológico.
 * Los datos se obtienen de sessionStorage y se muestran en un formato organizado.
 */
export default function ResultadoPage() {
  const router = useRouter();
  const [result] = useState<NumerologyResponseDto | null>(() => {
    // Initialize state from sessionStorage during render
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('numerologyResult');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  useEffect(() => {
    // Only check and redirect if no result
    if (!result && typeof window !== 'undefined') {
      router.push(ROUTES.NUMEROLOGIA);
    }
  }, [result, router]);

  if (!result) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" data-testid="resultado-page">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.NUMEROLOGIA)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Nueva consulta
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.NUMEROLOGIA)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Recalcular
          </Button>
        </div>

        <div className="mb-8 text-center">
          <h1 className="mb-2 font-serif text-3xl">Tu Perfil Numerológico</h1>
          <p className="text-muted-foreground">
            Fecha: {result.birthDate}
            {result.fullName && ` • ${result.fullName}`}
          </p>
        </div>

        {/* Número principal: Camino de Vida */}
        <NumberCard number={result.lifePath} context="lifePath" variant="full" className="mb-8" />

        {/* Grid de números */}
        <h2 className="mb-4 font-serif text-xl">Tus Números</h2>
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <NumberCard number={result.birthday} context="birthday" />
          {result.expression && <NumberCard number={result.expression} context="expression" />}
          {result.soulUrge && <NumberCard number={result.soulUrge} context="soulUrge" />}
          {result.personality && <NumberCard number={result.personality} context="personality" />}
        </div>

        {/* Ciclos personales */}
        <h2 className="mb-4 font-serif text-xl">Tus Ciclos Actuales</h2>
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <Card className="p-4 text-center">
            <p className="text-muted-foreground text-xs">Año Personal {new Date().getFullYear()}</p>
            <p className="text-primary mt-2 text-4xl font-bold">{result.personalYear}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-muted-foreground text-xs">
              Mes Personal ({new Date().toLocaleDateString('es', { month: 'long' })})
            </p>
            <p className="text-primary mt-2 text-4xl font-bold">{result.personalMonth}</p>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4 text-sm">¿Quieres profundizar más?</p>
          <Button asChild>
            <a href="/ritual">Consulta el Tarot</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
