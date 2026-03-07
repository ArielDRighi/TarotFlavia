'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NumerologyIntro, NumerologyProfile } from '@/components/features/numerology';
import { EncyclopediaInfoWidget } from '@/components/features/encyclopedia';
import { useAuthStore } from '@/stores/authStore';
import { useCalculateNumerology, useMyNumerologyProfile } from '@/hooks/api/useNumerology';
import { ROUTES } from '@/lib/constants/routes';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { NumerologyResponseDto } from '@/types/numerology.types';

/**
 * Numerología Page Component
 *
 * Página principal de numerología:
 * - Muestra introducción de qué es la numerología
 * - Si el usuario está autenticado y tiene perfil completo, muestra su informe
 * - Si faltan datos (nombre o fecha), muestra alerta para completar perfil
 * - Siempre muestra calculadora para consultas de terceros
 * - Los resultados de la calculadora se muestran inline (sin navegar a otra página)
 */
export function NumerologyPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { mutate, isPending } = useCalculateNumerology();
  const { data: myProfile, isLoading: isLoadingProfile } = useMyNumerologyProfile({
    enabled: isAuthenticated,
  });

  const [birthDate, setBirthDate] = useState('');
  const [fullName, setFullName] = useState('');
  const [calculatedResult, setCalculatedResult] = useState<NumerologyResponseDto | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    if (!birthDate) return;

    mutate(
      { birthDate, fullName: fullName || undefined },
      {
        onSuccess: (data) => {
          setCalculatedResult(data);
          // Scroll to result after a brief delay to allow render
          setTimeout(() => {
            if (resultRef.current && typeof resultRef.current.scrollIntoView === 'function') {
              resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
        },
      }
    );
  };

  const handleReset = () => {
    setCalculatedResult(null);
    setBirthDate('');
    setFullName('');
  };

  // Check if user has incomplete profile
  const hasIncompleteName = isAuthenticated && (!user?.name || user.name.split(' ').length < 2);
  const hasIncompleteBirthDate = isAuthenticated && !user?.birthDate;
  const hasIncompleteProfile = hasIncompleteName || hasIncompleteBirthDate;

  return (
    <div className="container mx-auto px-4 py-8" data-testid="numerologia-page">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-serif text-4xl">Numerología</h1>
          <p className="text-muted-foreground">Descubre los números que rigen tu vida</p>
        </div>

        <NumerologyIntro className="mb-8" />

        <EncyclopediaInfoWidget slug="guide-numerology" className="mb-6" />

        {/* Alert for incomplete profile */}
        {hasIncompleteProfile && (
          <Alert className="mb-8 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-amber-900">
                    Completa tu perfil para ver tu informe numerológico
                  </p>
                  <p className="mt-1 text-sm text-amber-800">
                    {hasIncompleteName &&
                      'Tu nombre completo es necesario para calcular todos los números. '}
                    {hasIncompleteBirthDate && 'Tu fecha de nacimiento es necesaria. '}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline" className="shrink-0">
                  <Link href={ROUTES.PERFIL}>Completar perfil</Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* User's Numerology Profile */}
        {isAuthenticated && !hasIncompleteProfile && (
          <div className="mb-8">
            {isLoadingProfile ? (
              <Card className="p-6">
                <Skeleton className="mb-4 h-8 w-64" />
                <Skeleton className="mb-2 h-4 w-48" />
                <Skeleton className="mb-6 h-4 w-56" />
                <Skeleton className="h-64 w-full" />
              </Card>
            ) : myProfile ? (
              <>
                <NumerologyProfile profile={myProfile} />

                {/* Tip para actualizar nombre */}
                <Alert className="mt-4 border-blue-200 bg-blue-50">
                  <AlertDescription className="text-sm text-blue-900">
                    💡 <strong>Consejo:</strong> Si cambiaste tu nombre o quieres usar tu nombre
                    completo para un análisis más preciso,{' '}
                    <Link
                      href={ROUTES.PERFIL}
                      className="font-semibold underline hover:text-blue-700"
                    >
                      actualízalo en tu perfil
                    </Link>
                    .
                  </AlertDescription>
                </Alert>
              </>
            ) : null}
          </div>
        )}

        {/* Calculator Section - Always visible */}
        <Card className="p-6">
          <h2 className="mb-2 font-serif text-xl">Calculadora de Numerología</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Calcula números numerológicos para cualquier fecha y nombre
          </p>

          {!calculatedResult ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="birthDate">Fecha de Nacimiento *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  data-testid="birth-date-input"
                />
              </div>

              <div>
                <Label htmlFor="fullName">Nombre Completo (opcional)</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Para números de expresión y alma"
                  data-testid="full-name-input"
                />
              </div>

              <Button
                onClick={handleCalculate}
                disabled={!birthDate || isPending}
                className="w-full"
                data-testid="calculate-button"
              >
                {isPending ? 'Calculando...' : 'Calcular Números'}
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground mb-2 text-sm">
                Resultado calculado para otra fecha/nombre
              </p>
              <Button onClick={handleReset} variant="outline" size="sm">
                <RotateCcw className="mr-2 h-4 w-4" />
                Nueva consulta
              </Button>
            </div>
          )}

          {!isAuthenticated && !calculatedResult && (
            <p className="text-muted-foreground mt-4 text-center text-sm">
              <Link href={ROUTES.REGISTER} className="text-primary hover:underline">
                Regístrate
              </Link>{' '}
              para guardar tus resultados
            </p>
          )}
        </Card>

        {/* Calculated Result - Inline */}
        {calculatedResult && (
          <div ref={resultRef} className="mt-8" data-testid="calculated-result">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-2xl">Resultado del Cálculo</h2>
              <Button onClick={handleReset} variant="ghost" size="sm">
                <RotateCcw className="mr-2 h-4 w-4" />
                Nueva consulta
              </Button>
            </div>
            <NumerologyProfile profile={calculatedResult} />
          </div>
        )}
      </div>
    </div>
  );
}
