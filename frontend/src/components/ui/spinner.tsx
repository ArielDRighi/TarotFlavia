import { Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Optional text label */
  text?: string;
  /** Whether to center the spinner */
  centered?: boolean;
  /** Additional className */
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
} as const;

/**
 * A reusable spinner component for loading states.
 * Uses lucide-react's Loader2Icon with customizable size and text.
 *
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner size="lg" text="Cargando..." />
 * <Spinner centered={false} />
 * ```
 */
export function Spinner({ size = 'md', text, centered = true, className }: SpinnerProps) {
  return (
    <div
      data-testid="spinner"
      className={cn('flex items-center', centered && 'justify-center', className)}
    >
      <Loader2Icon
        data-testid="spinner-icon"
        aria-label={text || 'Cargando'}
        className={cn('animate-spin', sizeClasses[size])}
      />
      {text && <span className="ml-2">{text}</span>}
    </div>
  );
}
