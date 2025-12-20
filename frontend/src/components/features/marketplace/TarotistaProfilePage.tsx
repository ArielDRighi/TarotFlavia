/**
 * TarotistaProfilePage Component
 *
 * Página completa de perfil público de tarotista con información detallada
 * y opciones para consultar el tarot o reservar sesión.
 */
'use client';

import { useRouter } from 'next/navigation';
import { Star, Sparkles, Calendar, MessageSquare } from 'lucide-react';
import { useTarotistaDetail } from '@/hooks/api/useTarotistas';
import { getInitials } from '@/lib/utils/text';
import { SPECIALTY_COLORS, DEFAULT_SPECIALTY_COLOR } from '@/lib/constants/marketplace';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { FavoriteTarotistaButton } from './FavoriteTarotistaButton';

// ============================================================================
// Types
// ============================================================================

export interface TarotistaProfilePageProps {
  /** Tarotista ID (numeric) */
  id: number;
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function ProfileSkeleton() {
  return (
    <div className="bg-bg-main min-h-screen" data-testid="skeleton-container">
      {/* Hero Skeleton */}
      <div className="from-primary/10 to-secondary/10 bg-gradient-to-br py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-32 w-32 rounded-full" data-testid="skeleton-avatar" />
            <Skeleton className="h-10 w-64" data-testid="skeleton-name" />
            <Skeleton className="h-6 w-48" data-testid="skeleton-rating" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" data-testid="skeleton-badge" />
              <Skeleton className="h-6 w-20" data-testid="skeleton-badge" />
              <Skeleton className="h-6 w-20" data-testid="skeleton-badge" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="mb-8 h-40" data-testid="skeleton-bio" />
        <Skeleton className="h-60" data-testid="skeleton-services" />
      </div>
    </div>
  );
}

// ============================================================================
// Error State
// ============================================================================

function ErrorState({ error }: { error: Error }) {
  return (
    <div className="bg-bg-main flex min-h-screen items-center justify-center">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">Error al cargar perfil</CardTitle>
          <CardDescription>{error.message}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

// ============================================================================
// Rating Stars Component
// ============================================================================

function RatingStars({ rating }: { rating: number | null }) {
  const normalizedRating = rating ?? 0;
  const fullStars = Math.floor(normalizedRating);
  const emptyStars = 5 - fullStars;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: fullStars }).map((_, index) => (
        <Star
          key={`filled-${index}`}
          className="fill-secondary text-secondary h-5 w-5"
          aria-hidden="true"
        />
      ))}
      {Array.from({ length: emptyStars }).map((_, index) => (
        <Star key={`empty-${index}`} className="h-5 w-5 text-gray-300" aria-hidden="true" />
      ))}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function TarotistaProfilePage({ id }: TarotistaProfilePageProps) {
  const router = useRouter();
  const { data: tarotista, isLoading, error } = useTarotistaDetail(id);

  // ============================================================================
  // Loading State
  // ============================================================================

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  // ============================================================================
  // Error State
  // ============================================================================

  if (error) {
    return <ErrorState error={error as Error} />;
  }

  // ============================================================================
  // No Data State
  // ============================================================================

  if (!tarotista) {
    return <ErrorState error={new Error('Tarotista no encontrado')} />;
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleConsultarTarot = () => {
    router.push(`/ritual?tarotistaId=${id}`);
  };

  const handleVerDisponibilidad = () => {
    router.push(`/tarotistas/${id}/reservar`);
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="bg-bg-main min-h-screen" data-testid="tarotista-profile">
      {/* ========================================================================
          HERO SECTION
      ======================================================================== */}
      <section className="from-primary/10 to-secondary/10 bg-gradient-to-br py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-6">
            {/* Avatar with golden border */}
            <div className="border-secondary relative rounded-full border-[3px]">
              <Avatar className="h-32 w-32">
                {tarotista.fotoPerfil ? (
                  <AvatarImage src={tarotista.fotoPerfil} alt={tarotista.nombrePublico} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary text-3xl font-semibold">
                  {getInitials(tarotista.nombrePublico)}
                </AvatarFallback>
              </Avatar>

              {/* Availability indicator */}
              <div
                className={cn(
                  'absolute right-2 bottom-2 h-4 w-4 rounded-full border-2 border-white',
                  tarotista.isActive ? 'bg-green-500' : 'bg-gray-400'
                )}
                aria-label={tarotista.isActive ? 'Disponible ahora' : 'No disponible'}
              />
            </div>

            {/* Name */}
            <h1 className="text-center font-serif text-4xl md:text-5xl">
              {tarotista.nombrePublico}
            </h1>

            {/* Rating */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <RatingStars rating={tarotista.ratingPromedio} />
                <span className="text-lg font-semibold">
                  {tarotista.ratingPromedio?.toFixed(1) ?? 'N/A'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {tarotista.totalReviews} reseñas · {tarotista.totalLecturas} lecturas
              </p>
            </div>

            {/* Specialty Badges */}
            <div className="flex flex-wrap justify-center gap-2">
              {tarotista.especialidades.map((especialidad) => (
                <Badge
                  key={especialidad}
                  variant="outline"
                  className={cn(
                    'px-3 py-1 text-sm',
                    SPECIALTY_COLORS[especialidad] ?? DEFAULT_SPECIALTY_COLOR
                  )}
                >
                  {especialidad}
                </Badge>
              ))}
            </div>

            {/* Availability Badge */}
            <Badge
              variant={tarotista.isActive ? 'default' : 'outline'}
              className={cn(
                'px-4 py-1.5 text-sm',
                tarotista.isActive
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-200 text-gray-700'
              )}
            >
              {tarotista.isActive ? '✓ Disponible ahora' : 'No disponible'}
            </Badge>

            {/* Favorite Tarotista Button (FREE users only) */}
            <FavoriteTarotistaButton
              tarotistaId={tarotista.id}
              tarotistaName={tarotista.nombrePublico}
            />
          </div>
        </div>
      </section>

      {/* ========================================================================
          BIO SECTION
      ======================================================================== */}
      <section className="container mx-auto px-4 py-12">
        <Card className="shadow-soft">
          <CardHeader>
            <h2 className="font-serif text-2xl font-semibold tracking-tight">Sobre mí</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="leading-relaxed whitespace-pre-line text-gray-700">
              {tarotista.bio ?? 'Sin biografía disponible.'}
            </p>

            <div className="grid gap-4 border-t pt-4 md:grid-cols-2">
              {/* Years of Experience */}
              {tarotista.añosExperiencia && (
                <div>
                  <p className="text-sm font-semibold tracking-wide text-gray-500 uppercase">
                    Experiencia
                  </p>
                  <p className="text-lg font-medium">{tarotista.añosExperiencia} años</p>
                </div>
              )}

              {/* Languages */}
              {tarotista.idiomas.length > 0 && (
                <div>
                  <p className="text-sm font-semibold tracking-wide text-gray-500 uppercase">
                    Idiomas
                  </p>
                  <p className="text-lg font-medium">{tarotista.idiomas.join(', ')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ========================================================================
          SERVICES SECTION
      ======================================================================== */}
      <section className="container mx-auto px-4 pb-12">
        <div className="grid gap-6 md:grid-cols-2">
          {/* CARD 1: Oráculo Digital */}
          <Card className="shadow-soft transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <CardHeader className="text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Sparkles className="text-primary h-8 w-8" />
              </div>
              <h2 className="font-serif text-2xl font-semibold tracking-tight">Oráculo Digital</h2>
              <CardDescription className="text-base">Lectura con IA personalizada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-gray-600">
                Consulta el tarot con una interpretación guiada por {tarotista.nombrePublico}.
              </p>
              <Button
                onClick={handleConsultarTarot}
                className="bg-primary hover:bg-primary/90 w-full"
                size="lg"
              >
                Consultar el Tarot
              </Button>
            </CardContent>
          </Card>

          {/* CARD 2: Sesión Privada */}
          <Card className="shadow-soft transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <CardHeader className="text-center">
              <div className="bg-secondary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Calendar className="text-secondary h-8 w-8" />
              </div>
              <h2 className="font-serif text-2xl font-semibold tracking-tight">Sesión Privada</h2>
              <CardDescription className="text-base">Sesión en vivo conmigo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-gray-600">Reserva una sesión individual personalizada.</p>
              <div className="text-sm text-gray-500">
                <p>30 minutos · $25 USD</p>
              </div>
              <Button
                onClick={handleVerDisponibilidad}
                variant="outline"
                className="border-secondary text-secondary hover:bg-secondary/10 w-full"
                size="lg"
              >
                Ver disponibilidad
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ========================================================================
          REVIEWS SECTION
      ======================================================================== */}
      <section className="container mx-auto px-4 pb-16">
        <Card className="shadow-soft">
          <CardHeader>
            <h2 className="text-center font-serif text-2xl font-semibold tracking-tight">
              Lo que dicen mis consultantes
            </h2>
          </CardHeader>
          <CardContent>
            {/* TODO: Implementar lista de reviews cuando el backend esté listo */}
            <div className="py-8 text-center text-gray-500">
              <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p>Las reseñas estarán disponibles próximamente.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
