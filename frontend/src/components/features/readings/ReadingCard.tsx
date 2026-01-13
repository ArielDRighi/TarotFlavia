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
 * Redesigned in TASK-UI-003 following DESIGN_HAND-OFF.md specifications.
 *
 * Layout (horizontal flex-row):
 * - Left: Card thumbnail or placeholder icon
 * - Center: Question (2-line truncated, bold) + relative date (gray)
 * - Right: Spread badge + view/delete action buttons
 *
 * Features:
 * - Uses cardPreviews from reading (TASK-UI-002) for thumbnails
 * - Compact design with reduced padding
 * - Question as prominent title
 * - Relative date display (e.g., "hace 2 días")
 * - Spread type badge
 * - View and delete actions with confirmation modal
 * - Hover scale effect
 *
 * @example
 * ```tsx
 * <ReadingCard
 *   reading={reading}
 *   onView={(id) => router.push(`/lecturas/${id}`)}
 *   onDelete={(id) => deleteReading(id)}
 * />
 * ```
 */
export function ReadingCard({ reading, cards, onView, onDelete, className }: ReadingCardProps) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState(false);

  // Prefer cardPreviews from reading (TASK-UI-002), fallback to cards prop
  const cardPreview = reading.cardPreviews?.[0] || cards?.[0];
  const hasCardThumbnail = cardPreview?.imageUrl;

  const relativeDate = React.useMemo(
    () =>
      formatDistanceToNow(new Date(reading.createdAt), {
        addSuffix: true,
        locale: es,
      }),
    [reading.createdAt]
  );

  const handleViewClick = React.useCallback(() => {
    onView(reading.id);
  }, [onView, reading.id]);

  const handleDeleteClick = React.useCallback(() => {
    setShowDeleteConfirmation(true);
  }, []);

  const handleConfirmDelete = React.useCallback(() => {
    onDelete(reading.id);
  }, [onDelete, reading.id]);

  return (
    <>
      <Card
        data-testid="reading-card"
        className={cn(
          'flex flex-row items-stretch',
          'bg-card',
          'shadow-sm',
          'transition-all duration-200',
          'hover:scale-[1.02] hover:shadow-lg',
          className
        )}
      >
        {/* Left Section - Card Thumbnail */}
        <div className="flex items-center justify-center p-4">
          <div className="bg-muted flex h-20 w-14 items-center justify-center overflow-hidden rounded-lg">
            {hasCardThumbnail && cardPreview?.imageUrl ? (
              <Image
                data-testid="card-thumbnail"
                src={cardPreview.imageUrl}
                alt={`Carta ${cardPreview.name}`}
                width={56}
                height={80}
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
        <CardContent className="flex flex-1 flex-col justify-center gap-1 py-3">
          {/* Question - Título grande */}
          <p className="text-text-primary line-clamp-2 font-semibold">{reading.question}</p>

          {/* Fecha relativa - Gris */}
          <span className="text-text-muted text-sm">{relativeDate}</span>
        </CardContent>

        {/* Right Section - Actions */}
        <div className="border-border flex items-center gap-2 border-l p-4">
          {/* Badge tipo tirada */}
          {reading.spreadName && (
            <Badge data-testid="spread-badge" variant="secondary">
              {reading.spreadName}
            </Badge>
          )}

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
