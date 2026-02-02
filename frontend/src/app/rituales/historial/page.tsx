'use client';

import { ArrowLeft, Calendar, Moon, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useRitualHistory, useRitualStats } from '@/hooks/api/useRituals';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { ROUTES } from '@/lib/constants/routes';
import { CATEGORY_INFO, LUNAR_PHASE_INFO } from '@/types/ritual.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function RitualHistorialPage() {
  useRequireAuth();

  const { data: history, isLoading: loadingHistory } = useRitualHistory(50);
  const { data: stats, isLoading: loadingStats } = useRitualStats();

  if (loadingStats || loadingHistory) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-8 h-8 w-64" />
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href={ROUTES.RITUALES}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Rituales
          </Link>
        </Button>
        <div>
          <h1 className="font-serif text-4xl">Mi Historial de Rituales</h1>
          <p className="text-muted-foreground">Registro de tu práctica espiritual</p>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="text-muted-foreground mb-1 flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              Total Completados
            </div>
            <div className="text-2xl font-bold">{stats.totalCompleted}</div>
          </Card>

          <Card className="p-4">
            <div className="text-muted-foreground mb-1 flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              Este Mes
            </div>
            <div className="text-2xl font-bold">{stats.thisMonthCount}</div>
          </Card>

          <Card className="p-4">
            <div className="text-muted-foreground mb-1 flex items-center gap-2 text-sm">
              <Star className="h-4 w-4" />
              Racha Actual
            </div>
            <div className="text-2xl font-bold">
              {stats.currentStreak} {stats.currentStreak === 1 ? 'día' : 'días'}
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-muted-foreground mb-1 flex items-center gap-2 text-sm">
              <Moon className="h-4 w-4" />
              Categoría Favorita
            </div>
            <div className="text-lg font-semibold">
              {stats.favoriteCategory ? CATEGORY_INFO[stats.favoriteCategory]?.name || '-' : '-'}
            </div>
          </Card>
        </div>
      )}

      {/* Historial */}
      <Card className="p-6">
        <h2 className="mb-4 font-serif text-2xl">Rituales Realizados</h2>

        {!history || history.length === 0 ? (
          <div className="text-muted-foreground py-12 text-center">
            <p className="mb-4">Aún no has completado ningún ritual</p>
            <Button asChild>
              <Link href={ROUTES.RITUALES}>Explorar Rituales</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => {
              const categoryInfo = CATEGORY_INFO[entry.ritual.category];
              const lunarInfo = entry.lunarPhase ? LUNAR_PHASE_INFO[entry.lunarPhase] : null;

              return (
                <Card key={entry.id} className="p-4">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Link
                          href={ROUTES.RITUAL_DETAIL(entry.ritual.slug)}
                          className="hover:text-primary font-medium"
                        >
                          {entry.ritual.title}
                        </Link>
                        <Badge variant="outline" className={categoryInfo.color}>
                          {categoryInfo.icon} {categoryInfo.name}
                        </Badge>
                      </div>

                      <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(entry.completedAt), "d 'de' MMMM, yyyy", {
                            locale: es,
                          })}
                        </span>

                        {lunarInfo && entry.lunarSign && (
                          <span className="flex items-center gap-1">
                            {lunarInfo.icon} {lunarInfo.name} en {entry.lunarSign}
                          </span>
                        )}

                        {entry.rating && (
                          <span className="flex items-center gap-1">
                            {[...Array(entry.rating)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            ))}
                          </span>
                        )}
                      </div>

                      {entry.notes && (
                        <p className="text-muted-foreground mt-2 text-sm italic">&ldquo;{entry.notes}&rdquo;</p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
