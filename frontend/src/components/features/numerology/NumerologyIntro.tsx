'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
}

export function NumerologyIntro({ className }: Props) {
  return (
    <Card
      className={cn('border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50', className)}
      data-testid="numerology-intro"
    >
      <CardContent className="space-y-4 p-6">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-purple-900">¿Qué es la Numerología?</h2>
          <p className="text-gray-700">
            La numerología es un sistema ancestral que revela tu propósito de vida, talentos y
            desafíos a través de los números derivados de tu fecha de nacimiento y nombre completo.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-purple-800">
              📅 Desde tu Fecha de Nacimiento
            </h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>
                  <strong className="text-gray-700">Camino de Vida:</strong> Tu misión principal en
                  esta vida
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>
                  <strong className="text-gray-700">Número del Día:</strong> Influencias diarias
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>
                  <strong className="text-gray-700">Año Personal:</strong> Ciclos anuales de energía
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-indigo-800">
              ✍️ Desde tu Nombre Completo
            </h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">•</span>
                <span>
                  <strong className="text-gray-700">Número de Expresión:</strong> Tus talentos
                  naturales
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">•</span>
                <span>
                  <strong className="text-gray-700">Número del Alma:</strong> Tus deseos profundos
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">•</span>
                <span>
                  <strong className="text-gray-700">Personalidad:</strong> Cómo te ven los demás
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-purple-200 bg-purple-100 p-3">
          <p className="text-sm text-purple-900">
            <strong>Nota:</strong> Los números maestros (11, 22, 33) poseen una vibración especial y
            no se reducen a un solo dígito.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
