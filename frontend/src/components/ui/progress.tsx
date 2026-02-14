/**
 * Progress Component
 * A simple progress bar component for showing completion percentage.
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, indicatorClassName, ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value));

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clampedValue}
        data-slot="progress"
        className={cn('bg-secondary relative h-4 w-full overflow-hidden rounded-full', className)}
        {...props}
      >
        <div
          data-slot="progress-indicator"
          className={cn(
            'bg-primary h-full transition-all duration-300 ease-in-out',
            indicatorClassName
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
