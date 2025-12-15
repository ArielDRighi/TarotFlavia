/**
 * Shared Reading View Component
 *
 * Public component for displaying shared readings (no auth required)
 */
import * as React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

import { TarotCard } from '@/components/features/readings/TarotCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ReadingDetail, Interpretation } from '@/types';

/**
 * Helper to safely extract interpretation data
 */
function getInterpretationText(interpretation: Interpretation | string | null): string {
  if (!interpretation) {
    return '';
  }
  if (typeof interpretation === 'string') {
    return interpretation;
  }
  return interpretation.generalInterpretation || '';
}

export interface SharedReadingViewProps {
  reading: ReadingDetail;
  spreadName: string;
}

/**
 * SharedReadingView Component
 *
 * Displays a public shared reading with:
 * - Question and metadata
 * - Cards grid
 * - Interpretation
 * - CTA to register
 */
export function SharedReadingView({ reading, spreadName }: SharedReadingViewProps) {
  const interpretationText = getInterpretationText(reading.interpretation);

  return (
    <div className="bg-bg-main min-h-screen">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-6 text-center">
          <h2 className="font-serif text-2xl font-bold text-purple-700">TarotFlavia</h2>
          <p className="mt-1 text-sm text-gray-600">Lectura compartida</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Question Card */}
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <h1 className="font-serif text-3xl font-bold text-gray-900 sm:text-4xl">
                  {reading.question}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary" className="text-sm">
                    {spreadName}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {format(new Date(reading.createdAt), "d 'de' MMMM 'de' yyyy", { locale: es })}
                  </span>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Cards Grid */}
          <div>
            <h2 className="mb-4 font-serif text-2xl font-semibold text-gray-900">
              Las Cartas Reveladas
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {reading.cards.map((card) => (
                <div key={card.id} className="space-y-3">
                  <TarotCard card={card} isRevealed={true} size="md" />
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{card.name}</p>
                    <p className="text-sm text-gray-600">{card.positionName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interpretation */}
          {interpretationText && (
            <Card>
              <CardHeader>
                <CardTitle>Interpretación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-purple max-w-none">
                  <ReactMarkdown>{interpretationText}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer CTA */}
      <footer className="border-t bg-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="mb-4 font-serif text-2xl font-semibold text-gray-900">
            ¿Quieres tu propia lectura?
          </h3>
          <p className="mb-6 text-gray-600">
            Crea tu cuenta gratis y descubre lo que las cartas tienen para ti
          </p>
          <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
            <Link href="/registro">Crear mi cuenta gratis</Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}
