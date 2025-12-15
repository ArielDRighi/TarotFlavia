'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

/**
 * Página 404 personalizada con temática mística.
 * Muestra un mensaje de error cuando se accede a una ruta inexistente.
 */
export default function NotFound() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="bg-bg-main flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        {/* Ícono de carta boca abajo */}
        <div data-testid="card-icon" className="mx-auto mb-8">
          <svg
            width="120"
            height="180"
            viewBox="0 0 120 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto drop-shadow-lg"
            aria-hidden="true"
          >
            {/* Borde de la carta con colores místicos */}
            <rect
              x="2"
              y="2"
              width="116"
              height="176"
              rx="12"
              fill="#805AD5"
              fillOpacity="0.1"
              stroke="#D69E2E"
              strokeWidth="2"
            />
            {/* Flecha hacia arriba (carta boca abajo) */}
            <path
              d="M40 70L60 50L80 70M60 50V130"
              stroke="#D69E2E"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Título principal con tipografía serif */}
        <h1 className="text-text-primary mb-4 font-serif text-4xl font-bold md:text-5xl">
          404 - Camino no encontrado
        </h1>

        {/* Mensaje místico */}
        <p className="text-text-muted mb-8 text-lg md:text-xl">
          Los astros no reconocen este destino
        </p>

        {/* Botón para volver al inicio */}
        <Button onClick={handleGoHome} variant="default" size="lg">
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
