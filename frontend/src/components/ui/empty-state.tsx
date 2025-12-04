import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateAction {
  /**
   * The button label
   */
  label: string;
  /**
   * Callback when the button is clicked
   */
  onClick: () => void;
}

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional icon to display (rendered large and in muted gray)
   */
  icon?: React.ReactNode;
  /**
   * Title text (displayed in serif font)
   */
  title: string;
  /**
   * Description message (displayed in muted color)
   */
  message: string;
  /**
   * Optional action button configuration
   */
  action?: EmptyStateAction;
}

/**
 * EmptyState - A reusable empty state component
 * Used when there's no content to display (e.g., empty lists, no search results)
 */
export function EmptyState({ icon, title, message, action, className, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-4 p-8 text-center', className)}
      {...props}
    >
      {icon && (
        <div
          data-testid="empty-state-icon"
          className="text-muted-foreground/50 [&>svg]:h-16 [&>svg]:w-16"
        >
          {icon}
        </div>
      )}
      <div className="space-y-2">
        <h3 className="font-serif text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
