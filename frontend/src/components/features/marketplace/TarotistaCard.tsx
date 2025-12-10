'use client';

import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Tarotista } from '@/types/tarotista.types';

/**
 * Specialty color mapping for badges
 * Uses pastel colors as per design specs
 */
const SPECIALTY_COLORS: Record<string, string> = {
  Amor: 'bg-pink-100 text-pink-700',
  Dinero: 'bg-green-100 text-green-700',
  Carrera: 'bg-blue-100 text-blue-700',
  Salud: 'bg-orange-100 text-orange-700',
  Espiritual: 'bg-purple-100 text-purple-700',
};

/**
 * Default color for unknown specialties
 */
const DEFAULT_SPECIALTY_COLOR = 'bg-gray-100 text-gray-700';

/**
 * TarotistaCard Component Props
 */
export interface TarotistaCardProps {
  /** Tarotista data */
  tarotista: Tarotista;
  /** Callback when "Ver Perfil" button is clicked */
  onViewProfile: (id: number) => void;
  /** Whether the tarotista is currently available */
  isAvailable?: boolean;
  /** Price per session (30 min) */
  pricePerSession?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Generates initials from a name
 * @param name - Full name to extract initials from
 * @returns Two-letter initials
 */
function getInitials(name: string): string {
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Renders rating stars
 * @param rating - Rating value (0-5)
 * @returns Array of star elements
 */
function RatingStars({ rating }: { rating: number | null }) {
  const normalizedRating = rating ?? 0;
  const fullStars = Math.floor(normalizedRating);
  const emptyStars = 5 - fullStars;

  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${normalizedRating} de 5`}>
      {Array.from({ length: fullStars }).map((_, index) => (
        <Star
          key={`filled-${index}`}
          data-testid="star-filled"
          className="fill-secondary text-secondary h-4 w-4"
        />
      ))}
      {Array.from({ length: emptyStars }).map((_, index) => (
        <Star
          key={`empty-${index}`}
          data-testid="star-empty"
          className="text-muted-foreground h-4 w-4"
        />
      ))}
    </div>
  );
}

/**
 * TarotistaCard Component
 *
 * Displays a tarotista profile card for the marketplace with photo, info, and actions.
 *
 * Features:
 * - Large circular profile photo with golden border
 * - Availability indicator (green/gray dot)
 * - Dynamic star rating display
 * - Specialty badges with pastel colors
 * - 3-line truncated bio
 * - Price per session display
 * - "Ver Perfil" action button
 * - Hover animation with scale and shadow
 *
 * @example
 * ```tsx
 * <TarotistaCard
 *   tarotista={tarotista}
 *   onViewProfile={(id) => router.push(`/tarotistas/${id}`)}
 *   isAvailable={true}
 *   pricePerSession={25}
 * />
 * ```
 */
export function TarotistaCard({
  tarotista,
  onViewProfile,
  isAvailable = false,
  pricePerSession,
  className,
}: TarotistaCardProps) {
  const handleViewProfile = () => {
    onViewProfile(tarotista.id);
  };

  return (
    <Card
      data-testid="tarotista-card"
      className={cn(
        'flex flex-col',
        'bg-card',
        'shadow-soft',
        'transition-all duration-300',
        'hover:scale-105 hover:shadow-lg',
        className
      )}
    >
      {/* Header - Avatar with availability */}
      <CardHeader className="flex flex-col items-center pt-6 pb-2">
        {/* Avatar Container with golden border */}
        <div
          data-testid="avatar-container"
          className="border-secondary relative rounded-full border-[3px]"
        >
          <Avatar className="h-24 w-24">
            {tarotista.fotoPerfil ? (
              <AvatarImage
                src={tarotista.fotoPerfil}
                alt={tarotista.nombrePublico}
                data-testid="profile-image"
              />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {getInitials(tarotista.nombrePublico)}
            </AvatarFallback>
          </Avatar>

          {/* Availability Badge */}
          <span
            data-testid="availability-badge"
            className={cn(
              'absolute right-1 bottom-1 h-4 w-4 rounded-full border-2 border-white',
              isAvailable ? 'bg-accent-success' : 'bg-gray-400'
            )}
            aria-label={isAvailable ? 'Disponible' : 'No disponible'}
          />
        </div>
      </CardHeader>

      {/* Body - Name, Rating, Specialties, Bio */}
      <CardContent className="flex flex-1 flex-col items-center gap-3 px-4 text-center">
        {/* Name */}
        <h3 className="text-primary font-serif text-lg font-bold">{tarotista.nombrePublico}</h3>

        {/* Rating and Reviews */}
        <div className="flex flex-col items-center gap-1">
          <RatingStars rating={tarotista.ratingPromedio} />
          <span className="text-muted-foreground text-sm">
            ({tarotista.totalReviews} valoraciones)
          </span>
        </div>

        {/* Specialties */}
        <div data-testid="specialties-container" className="flex flex-wrap justify-center gap-2">
          {tarotista.especialidades.map((specialty) => (
            <span
              key={specialty}
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                SPECIALTY_COLORS[specialty] ?? DEFAULT_SPECIALTY_COLOR
              )}
            >
              {specialty}
            </span>
          ))}
        </div>

        {/* Bio */}
        {tarotista.bio && (
          <p
            data-testid="tarotista-bio"
            className="text-muted-foreground line-clamp-3 text-sm leading-relaxed"
          >
            {tarotista.bio}
          </p>
        )}
      </CardContent>

      {/* Footer - Price and Action */}
      <CardFooter className="flex flex-col gap-3 border-t px-4 pt-4">
        {/* Price */}
        <span className="text-primary font-semibold">
          {pricePerSession ? `$${pricePerSession} / 30 min` : 'Consultar precio'}
        </span>

        {/* View Profile Button */}
        <Button variant="outline" className="w-full" onClick={handleViewProfile}>
          Ver Perfil
        </Button>
      </CardFooter>
    </Card>
  );
}
