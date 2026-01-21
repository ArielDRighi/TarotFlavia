'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NumberCard } from './NumberCard';
import type { NumerologyResponseDto } from '@/types/numerology.types';

interface Props {
  profile: NumerologyResponseDto;
  className?: string;
}

export function NumerologyProfile({ profile, className }: Props) {
  return (
    <div className={className} data-testid="numerology-profile">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tu Perfil Numerológico</h1>
        <p className="mt-1 text-gray-600">
          Fecha de nacimiento: <span className="font-semibold">{profile.birthDate}</span>
        </p>
        {profile.fullName && (
          <p className="text-gray-600">
            Nombre: <span className="font-semibold">{profile.fullName}</span>
          </p>
        )}
      </div>

      {/* Life Path Number (highlighted) */}
      <div className="mb-6">
        <h2 className="mb-3 text-xl font-semibold text-gray-800">Camino de Vida</h2>
        <NumberCard number={profile.lifePath} context="lifePath" variant="full" />
      </div>

      {/* 
        TODO: FEATURE PAUSED - Personalized AI Interpretation
        
        REASON: Need to define strategy for annual regeneration and prevent abuse
        
        ISSUES TO RESOLVE:
        1. Annual regeneration: When to regenerate (Jan 1st cron vs lazy on-demand)?
        2. Profile changes: How to prevent abuse when user changes name/birthdate?
        3. Cost optimization: Regenerate for ALL premium users or only active ones?
        4. Year-specific content: Interpretation includes "Año Personal 2026" which becomes stale
        
        INFRASTRUCTURE READY:
        - Backend: POST /numerology/my-profile/interpret (working)
        - Frontend: useMyNumerologyInterpretation hook (working)
        - Database: numerology_interpretations table (working)
        - UI: Components ready (commented out below)
        
        NEXT STEPS:
        - Define regeneration strategy
        - Implement abuse prevention (cooldown, limits, etc.)
        - Update AI prompt to separate permanent vs annual interpretations
        - Uncomment and test
        
        IMPORTANT: When re-enabling, remember to:
        - Add: import ReactMarkdown from 'react-markdown';
        - Add: import { Button } from '@/components/ui/button';
        - Add: import { Alert, AlertDescription } from '@/components/ui/alert';
        - Add: import { Sparkles } from 'lucide-react';
        - Update Props interface with interpretation, canGenerateInterpretation, etc.
      */}
      {/* Personalized Interpretation Section - DISABLED */}
      {/* <div className="mb-6">
        {hasInterpretation ? (
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Sparkles className="h-5 w-5" />
                Interpretación Personalizada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-slate max-w-none text-gray-700"
                data-testid="interpretation-content"
              >
                <ReactMarkdown>{interpretation.interpretation}</ReactMarkdown>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                Generada el{' '}
                {new Date(interpretation.generatedAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </CardContent>
          </Card>
        ) : canGenerateInterpretation ? (
          <Alert className="border-purple-200 bg-purple-50">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 font-semibold text-purple-900">
                    Interpretación Personalizada (PREMIUM)
                  </p>
                  <p className="text-sm text-gray-700">
                    Obtén un análisis profundo y personalizado de tu perfil numerológico
                  </p>
                </div>
                <Button
                  onClick={onRequestInterpretation}
                  disabled={isGeneratingInterpretation}
                  size="sm"
                  className="ml-4"
                >
                  {isGeneratingInterpretation ? 'Generando...' : 'Generar interpretación'}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertDescription>
              <p className="text-sm text-gray-700">
                Mejora a <strong>PREMIUM</strong> para obtener una interpretación profunda y
                personalizada de tu perfil numerológico completo.
              </p>
            </AlertDescription>
          </Alert>
        )}
      </div> */}

      {/* Core Numbers Grid */}
      <div className="mb-6">
        <h2 className="mb-3 text-xl font-semibold text-gray-800">Números Principales</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {profile.expression && (
            <NumberCard number={profile.expression} context="expression" variant="full" />
          )}
          {profile.soulUrge && (
            <NumberCard number={profile.soulUrge} context="soulUrge" variant="full" />
          )}
          {profile.personality && (
            <NumberCard number={profile.personality} context="personality" variant="full" />
          )}
          <NumberCard number={profile.birthday} context="birthday" variant="full" />
        </div>
      </div>

      {/* Personal Year and Month */}
      <div>
        <h2 className="mb-3 text-xl font-semibold text-gray-800">Ciclos Actuales</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Año Personal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-600">{profile.personalYear}</div>
              <p className="mt-2 text-sm text-gray-600">Ciclo anual de energía y oportunidades</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mes Personal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-indigo-600">{profile.personalMonth}</div>
              <p className="mt-2 text-sm text-gray-600">Influencias del mes actual</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
