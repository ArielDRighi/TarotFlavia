'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings } from 'lucide-react';
import { useMyNumerologyProfile, useDayNumber } from '@/hooks/api/useNumerology';
import { NUMEROLOGY_NUMBERS_INFO } from '@/lib/utils/numerology';
import { cn } from '@/lib/utils';

export function NumerologyWidget() {
  const { data: profile, isLoading: isLoadingProfile } = useMyNumerologyProfile();
  const { data: dayNumber, isLoading: isLoadingDay } = useDayNumber();

  const isLoading = isLoadingProfile || isLoadingDay;

  // Loading state
  if (isLoading) {
    return (
      <Card data-testid="numerology-widget-loading">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  // No data state (no profile)
  if (!profile) {
    return (
      <Card data-testid="numerology-widget-no-data">
        <CardHeader>
          <CardTitle>Tu Numerología</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <p className="mb-4 text-gray-600">
            Configura tu fecha de nacimiento para ver tu perfil numerológico
          </p>
          <Button asChild size="sm">
            <Link href="/perfil">
              <Settings className="mr-2 h-4 w-4" />
              Configurar
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Success state
  const lifePathInfo = NUMEROLOGY_NUMBERS_INFO[profile.lifePath.value] || {
    emoji: '🔢',
    color: 'text-gray-500',
  };

  const isMasterLifePath = profile.lifePath.isMaster;

  return (
    <Card data-testid="numerology-widget">
      <CardHeader>
        <CardTitle>Tu Numerología</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Life Path Number */}
        <div className="rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{lifePathInfo.emoji}</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-600 uppercase">Camino de Vida</div>
              <div className={cn('text-3xl font-bold', lifePathInfo.color)}>
                {profile.lifePath.value}
              </div>
              <div className="text-sm font-semibold text-gray-700">{profile.lifePath.name}</div>
              {isMasterLifePath && (
                <div className="mt-1 inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-600">
                  ⭐ Maestro
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Day Number */}
        {dayNumber && (
          <div className="rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <div className="text-3xl">
                {NUMEROLOGY_NUMBERS_INFO[dayNumber.dayNumber]?.emoji || '📅'}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-600 uppercase">Número del Día</div>
                <div
                  className={cn(
                    'text-2xl font-bold',
                    NUMEROLOGY_NUMBERS_INFO[dayNumber.dayNumber]?.color || 'text-gray-700'
                  )}
                >
                  {dayNumber.dayNumber}
                </div>
                {dayNumber.meaning && (
                  <>
                    <div className="mt-1 text-sm font-medium text-gray-700">
                      {dayNumber.meaning.name}
                    </div>
                    {[11, 22, 33].includes(dayNumber.dayNumber) && (
                      <div className="mt-1 inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-600">
                        ⭐ Maestro
                      </div>
                    )}
                    <p className="mt-2 line-clamp-2 text-xs text-gray-600">
                      {dayNumber.meaning.description}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Link to full profile */}
        <Button asChild variant="outline" className="w-full" size="sm">
          <Link href="/numerologia">Ver informe completo</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
