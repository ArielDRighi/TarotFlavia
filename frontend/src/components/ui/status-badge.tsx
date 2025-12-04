import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Status types for session states
 */
export type StatusType = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * The session status type
   */
  status: StatusType;
}

/**
 * Style configurations for each status type
 */
const statusStyles: Record<StatusType, React.CSSProperties> = {
  pending: {
    backgroundColor: '#ECC94B',
    color: '#FFFFFF',
  },
  confirmed: {
    backgroundColor: '#48BB78',
    color: '#FFFFFF',
  },
  completed: {
    backgroundColor: '#4299E1',
    color: '#FFFFFF',
  },
  cancelled: {
    backgroundColor: '#F56565',
    color: '#FFFFFF',
  },
};

/**
 * Label mappings for each status type (translated to Spanish)
 */
const statusLabels: Record<StatusType, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

/**
 * StatusBadge - Displays session status as a colored badge
 *
 * @example
 * ```tsx
 * import { StatusBadge } from '@/components/ui/status-badge';
 *
 * <StatusBadge status="pending" />
 * <StatusBadge status="confirmed" />
 * <StatusBadge status="completed" />
 * <StatusBadge status="cancelled" />
 * ```
 */
export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const styles = statusStyles[status];
  const label = statusLabels[status];

  return (
    <Badge className={cn('border-transparent', className)} style={styles} {...props}>
      {label}
    </Badge>
  );
}
