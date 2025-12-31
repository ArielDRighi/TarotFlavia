'use client';

import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Collection of interesting tarot facts
 */
const TAROT_FACTS = [
  'El Tarot tiene 78 cartas: 22 Arcanos Mayores que representan arquetipos universales y 56 Arcanos Menores que reflejan situaciones cotidianas.',
  'La carta de "El Loco" (The Fool) es considerada la carta sin número o número 0, representando el inicio del viaje espiritual.',
  'Los Arcanos Menores están divididos en cuatro palos: Copas (emociones), Espadas (mente), Bastos (acción) y Oros (material).',
  'El Tarot de Marsella es uno de los mazos más antiguos, datando del siglo XV en Europa.',
  'La carta de "La Torre" representa cambios repentinos y transformaciones necesarias, aunque a menudo temidas.',
  'Cada palo de los Arcanos Menores corresponde a un elemento: Copas (Agua), Espadas (Aire), Bastos (Fuego) y Oros (Tierra).',
  'El Tarot Rider-Waite, creado en 1909, es el mazo más utilizado en el mundo occidental.',
  'La posición invertida de una carta puede modificar su significado, añadiendo matices o invirtiendo su energía.',
  'Los Arcanos Mayores representan lecciones kármicas y eventos significativos en la vida de una persona.',
  'La tirada de la Cruz Celta es una de las más populares, con 10 cartas que exploran una situación desde múltiples ángulos.',
];

/**
 * Get a random tarot fact
 */
function getRandomFact(): string {
  const index = Math.floor(Math.random() * TAROT_FACTS.length);
  return TAROT_FACTS[index];
}

/**
 * Did You Know section component
 *
 * Displays a random interesting fact about tarot.
 * The fact rotates on each page visit to keep content fresh.
 *
 * @example
 * ```tsx
 * <DidYouKnowSection />
 * ```
 */
export function DidYouKnowSection() {
  // Initialize with random fact directly
  const [fact] = useState<string>(() => getRandomFact());

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <CardTitle className="font-serif text-xl">¿Sabías que...?</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 dark:text-gray-300" data-testid="tarot-fact">
          {fact}
        </p>
      </CardContent>
    </Card>
  );
}
