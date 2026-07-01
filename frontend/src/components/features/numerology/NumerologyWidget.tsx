'use client';

import Link from 'next/link';
import { Hash, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { WidgetCard } from '@/components/features/dashboard/WidgetCard';
import { useMyNumerologyProfile, useDayNumber } from '@/hooks/api/useNumerology';
import { NUMEROLOGY_NUMBERS_INFO } from '@/lib/utils/numerology';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants/routes';

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
      <WidgetCard
        title="Tu Numerología"
        icon={<Hash className="h-5 w-5" />}
        data-testid="numerology-widget-no-data"
        contentClassName="py-8 text-center"
      >
        <p className="text-muted-foreground mb-4">
          Configura tu fecha de nacimiento para ver tu perfil numerológico
        </p>
        <Button asChild size="sm">
          <Link href={ROUTES.PERFIL}>
            <Settings className="mr-2 h-4 w-4" />
            Configurar
          </Link>
        </Button>
      </WidgetCard>
    );
  }

  // Success state
  const lifePathInfo = NUMEROLOGY_NUMBERS_INFO[profile.lifePath.value] || {
    emoji: '🔢',
    color: 'text-muted-foreground',
  };

  const isMasterLifePath = profile.lifePath.isMaster;

  return (
    <WidgetCard
      title="Tu Numerología"
      icon={<Hash className="h-5 w-5" />}
      data-testid="numerology-widget"
      contentClassName="space-y-4"
    >
      {/* Life Path Number */}
      <div className="border-primary/20 bg-primary/5 rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{lifePathInfo.emoji}</div>
          <div className="flex-1">
            <div className="text-muted-foreground text-sm font-medium uppercase">
              Camino de Vida
            </div>
            <div className={cn('text-3xl font-bold', lifePathInfo.color)}>
              {profile.lifePath.value}
            </div>
            <div className="text-foreground text-sm font-semibold">{profile.lifePath.name}</div>
            {isMasterLifePath && (
              <div className="bg-secondary/15 text-secondary mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold">
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
              <div className="text-muted-foreground text-sm font-medium uppercase">
                Número del Día
              </div>
              <div
                className={cn(
                  'text-2xl font-bold',
                  NUMEROLOGY_NUMBERS_INFO[dayNumber.dayNumber]?.color || 'text-foreground'
                )}
              >
                {dayNumber.dayNumber}
              </div>
              {dayNumber.meaning && (
                <>
                  <div className="text-foreground mt-1 text-sm font-medium">
                    {dayNumber.meaning.name}
                  </div>
                  {[11, 22, 33].includes(dayNumber.dayNumber) && (
                    <div className="bg-secondary/15 text-secondary mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold">
                      ⭐ Maestro
                    </div>
                  )}
                  <p className="text-muted-foreground mt-2 line-clamp-2 text-xs">
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
        <Link href={ROUTES.NUMEROLOGIA}>Ver informe completo</Link>
      </Button>
    </WidgetCard>
  );
}
