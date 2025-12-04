import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ErrorDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The error message to display
   */
  message: string;
  /**
   * Optional callback to retry the failed operation
   */
  onRetry?: () => void;
}

/**
 * ErrorDisplay - A reusable error state component
 * Shows an error icon, message, and optional retry button
 */
export function ErrorDisplay({ message, onRetry, className, ...props }: ErrorDisplayProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn('flex flex-col items-center justify-center gap-4 p-8 text-center', className)}
      {...props}
    >
      <AlertCircle
        data-testid="error-icon"
        className="text-destructive/80 h-12 w-12"
        aria-hidden="true"
      />
      <p className="text-muted-foreground text-sm">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Intentar de nuevo
        </Button>
      )}
    </div>
  );
}
