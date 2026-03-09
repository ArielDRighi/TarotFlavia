'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants/routes';

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
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>
                  <strong className="text-gray-700">Camino de Vida:</strong> El número más
                  importante. Revela tu propósito de vida, las lecciones que debes aprender y el
                  camino que seguirás para alcanzar tu máximo potencial.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>
                  <strong className="text-gray-700">Número de Cumpleaños:</strong> Derivado del día
                  en que naciste, revela talentos específicos y habilidades naturales que puedes
                  desarrollar a lo largo de tu vida.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>
                  <strong className="text-gray-700">Año Personal:</strong> Un ciclo de 9 años que
                  indica las oportunidades y desafíos del año actual. Cada número (1-9) trae
                  diferentes energías: inicios, relaciones, creatividad, trabajo, cambios, hogar,
                  introspección, poder o culminación.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>
                  <strong className="text-gray-700">Mes Personal:</strong> Combina tu Año Personal
                  con el mes actual, refinando las energías anuales para darte orientación más
                  específica sobre las influencias y oportunidades de cada mes.
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-indigo-800">
              ✍️ Desde tu Nombre Completo
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">•</span>
                <span>
                  <strong className="text-gray-700">Número de Expresión:</strong> Calculado con
                  todas las letras de tu nombre. Representa tus talentos innatos, habilidades y el
                  potencial que puedes desarrollar en esta vida.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">•</span>
                <span>
                  <strong className="text-gray-700">Número del Alma:</strong> Derivado solo de las
                  vocales de tu nombre. Revela tus deseos más profundos, lo que realmente te motiva
                  y lo que tu corazón anhela.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">•</span>
                <span>
                  <strong className="text-gray-700">Personalidad:</strong> Calculado con las
                  consonantes. Muestra la imagen que proyectas al mundo y cómo te perciben los demás
                  en un primer encuentro.
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

        <Button asChild variant="outline" size="sm">
          <Link href={ROUTES.ENCICLOPEDIA_GUIA('guia-numerologia')}>
            <BookOpen className="mr-2 h-4 w-4" />
            Ver más en la Enciclopedia
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
