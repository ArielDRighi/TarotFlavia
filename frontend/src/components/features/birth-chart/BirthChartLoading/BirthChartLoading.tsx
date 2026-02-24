'use client';

/**
 * BirthChartLoading
 *
 * Pantalla de carga animada mientras se genera la carta astral.
 * Muestra un mensaje rotativo para acompañar al usuario durante el proceso.
 */

import { Star } from 'lucide-react';

interface BirthChartLoadingProps {
  message: string;
}

export function BirthChartLoading({ message }: BirthChartLoadingProps) {
  return (
    <div
      data-testid="birth-chart-loading"
      className="flex min-h-[60vh] flex-col items-center justify-center"
    >
      {/* Ícono con animación de pulso */}
      <div className="relative mb-8">
        <div className="bg-primary/20 absolute inset-0 animate-ping rounded-full" />
        <div className="bg-primary/10 relative flex h-24 w-24 items-center justify-center rounded-full">
          <Star className="text-primary h-12 w-12 animate-pulse" />
        </div>
      </div>

      {/* Mensaje rotativo */}
      <p className="mb-4 font-serif text-xl">{message}</p>

      {/* Barra de progreso */}
      <div className="h-2 w-64 overflow-hidden rounded-full bg-gray-200">
        <div className="bg-primary animate-progress h-full rounded-full" />
      </div>
    </div>
  );
}
