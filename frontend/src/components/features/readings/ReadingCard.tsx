'use client';

import * as React from 'react';
import Image from 'next/image';
import { Eye, Trash2, Layers } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
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
 * Displays a compact reading summary card for the history view.
 * Redesigned following UI/UX best practices for wellness apps:
 * - Proximity principle: related content grouped together
 * - Minimalist aesthetic with soft shadows
 * - Compact layout optimized for scanning
 *
 * Layout (single-row compact):
 * - Thumbnail (40x56px): Card image or placeholder icon
 * - Content: Question (1-line) + meta row (date + spread badge)
 * - Actions: View and delete buttons (32x32px)
 *
 * Features:
 * - Compact card height (~62px) for efficient list viewing
 * - Question truncated to 1 line for consistency
 * - Date and spread badge grouped on same line
 * - Smaller action buttons for cleaner appearance
 * - Subtle hover shadow (no scale) for peaceful feel
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
          'flex flex-row items-center gap-3',
          'bg-card',
          'shadow-sm',
          'p-3',
          'transition-all duration-200',
          'hover:shadow-md',
          className
        )}
      >
        {/* Thumbnail - Compact */}
        <div className="bg-muted flex h-14 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md">
          {hasCardThumbnail && cardPreview?.imageUrl ? (
            <Image
              data-testid="card-thumbnail"
              src={cardPreview.imageUrl}
              alt={`Carta ${cardPreview.name}`}
              width={40}
              height={56}
              className="h-full w-full object-cover"
            />
          ) : (
            <Layers
              data-testid="card-placeholder-icon"
              className="text-muted-foreground h-5 w-5"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Content - Question/Cards + Meta grouped together */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          {reading.question ? (
            <p className="text-text-primary line-clamp-1 text-sm font-medium">{reading.question}</p>
          ) : (
            <p className="text-text-primary line-clamp-1 text-sm font-medium">
              {reading.cardPreviews?.map((c) => c.name).join(', ') || 'Lectura de tarot'}
            </p>
          )}
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-xs">{relativeDate}</span>
            {reading.spreadName && (
              <Badge data-testid="spread-badge" variant="secondary" className="px-1.5 py-0 text-xs">
                {reading.spreadName}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions - Minimal */}
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleViewClick}
            aria-label="Ver lectura"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDeleteClick}
            aria-label="Eliminar lectura"
          >
            <Trash2 className="text-destructive h-4 w-4" />
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
