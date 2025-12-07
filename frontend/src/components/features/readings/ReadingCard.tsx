'use client';

import * as React from 'react';
import Image from 'next/image';
import { Eye, Trash2, Layers } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import type { Reading, ReadingCard as ReadingCardType } from '@/types/reading.types';

/**
 * ReadingCard Component Props
 */
export interface ReadingCardProps {
  /** Reading data */
  reading: Reading;
  /** Optional cards array for thumbnail display */
  cards?: ReadingCardType[];
  /** Callback when view button is clicked */
  onView: (id: number) => void;
  /** Callback when delete is confirmed */
  onDelete: (id: number) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ReadingCard Component
 *
 * Displays a reading summary card for the history view with preview and actions.
 *
 * Features:
 * - Responsive layout (vertical on mobile, horizontal on desktop)
 * - Card thumbnail or placeholder icon
 * - Question with 2-line truncation
 * - Relative date display (e.g., "hace 2 días")
 * - Spread type badge
 * - View and delete actions with confirmation modal
 *
 * @example
 * ```tsx
 * <ReadingCard
 *   reading={reading}
 *   cards={cards}
 *   onView={(id) => router.push(`/lecturas/${id}`)}
 *   onDelete={(id) => deleteReading(id)}
 * />
 * ```
 */
export function ReadingCard({ reading, cards, onView, onDelete, className }: ReadingCardProps) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState(false);

  const firstCard = cards?.[0];
  const hasCardThumbnail = firstCard?.imageUrl;

  const relativeDate = formatDistanceToNow(new Date(reading.createdAt), {
    addSuffix: true,
    locale: es,
  });

  const handleViewClick = () => {
    onView(reading.id);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    onDelete(reading.id);
  };

  return (
    <>
      <Card
        data-testid="reading-card"
        className={cn(
          'flex flex-col items-stretch md:flex-row',
          'bg-card',
          'shadow-sm',
          'transition-all duration-200',
          'hover:scale-[1.02] hover:shadow-lg',
          className
        )}
      >
        {/* Left Section - Card Thumbnail */}
        <div className="flex items-center justify-center p-4 md:p-4 md:pr-0">
          <div className="bg-muted flex h-24 w-16 items-center justify-center overflow-hidden rounded-lg md:h-28 md:w-20">
            {hasCardThumbnail && firstCard?.imageUrl ? (
              <Image
                data-testid="card-thumbnail"
                src={firstCard.imageUrl}
                alt={`Carta ${firstCard.name}`}
                width={80}
                height={112}
                className="h-full w-full object-cover"
              />
            ) : (
              <Layers
                data-testid="card-placeholder-icon"
                className="text-muted-foreground h-8 w-8"
                aria-hidden="true"
              />
            )}
          </div>
        </div>

        {/* Center Section - Content */}
        <CardContent className="flex flex-1 flex-col justify-center gap-2 p-4">
          {/* Question */}
          <p className="text-primary line-clamp-2 text-sm font-semibold md:text-base">
            {reading.question}
          </p>

          {/* Metadata Row */}
          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
            {/* Relative Date */}
            <span>{relativeDate}</span>

            {/* Spread Badge */}
            {reading.spreadName && (
              <Badge data-testid="spread-badge" variant="secondary" className="text-xs">
                {reading.spreadName}
              </Badge>
            )}
          </div>
        </CardContent>

        {/* Right Section - Actions */}
        <div className="border-border flex flex-row items-center justify-center gap-2 border-t p-4 md:flex-col md:border-t-0 md:border-l md:pl-0">
          <Button variant="ghost" size="icon" onClick={handleViewClick} aria-label="Ver lectura">
            <Eye className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteClick}
            aria-label="Eliminar lectura"
          >
            <Trash2 className="text-destructive h-5 w-5" />
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
        title="Eliminar lectura"
        description="¿Estás seguro de que deseas eliminar esta lectura? Esta acción se puede deshacer desde la papelera."
        confirmText="Confirmar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
