'use client';

import * as React from 'react';
import { Loader2Icon } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface ConfirmationModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when the open state changes */
  onOpenChange: (open: boolean) => void;
  /** Modal title */
  title: string;
  /** Modal description */
  description: string;
  /** Text for the confirm button (default: "Confirmar") */
  confirmText?: string;
  /** Text for the cancel button (default: "Cancelar") */
  cancelText?: string;
  /** Callback when the confirm button is clicked. Can be async. */
  onConfirm: () => void | Promise<void>;
  /** Variant for the confirm button (default: 'default') */
  variant?: 'default' | 'destructive';
  /** Whether the modal is in a loading state */
  loading?: boolean;
}

/**
 * A reusable confirmation modal component built on top of shadcn/ui Dialog.
 *
 * @example
 * ```tsx
 * <ConfirmationModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Eliminar lectura"
 *   description="¿Estás seguro de que deseas eliminar esta lectura?"
 *   confirmText="Eliminar"
 *   variant="destructive"
 *   onConfirm={handleDelete}
 * />
 * ```
 */
export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  variant = 'default',
  loading = false,
}: ConfirmationModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const isDisabled = loading || isLoading;

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      const result = onConfirm();

      if (result instanceof Promise) {
        await result;
      }

      onOpenChange(false);
    } catch {
      // Don't close the modal if there's an error
      // The parent component should handle the error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={isDisabled ? undefined : onOpenChange}>
      <DialogContent showCloseButton={!isDisabled}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isDisabled}>
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant}
            data-variant={variant}
            onClick={handleConfirm}
            disabled={isDisabled}
          >
            {(loading || isLoading) && (
              <Loader2Icon data-testid="loading-spinner" className="mr-2 h-4 w-4 animate-spin" />
            )}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
