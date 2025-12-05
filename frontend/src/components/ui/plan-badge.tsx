import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Plan types for user subscription levels
 */
export type PlanType = 'guest' | 'free' | 'premium' | 'professional';

export interface PlanBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * The user's subscription plan type
   */
  plan: PlanType;
}

/**
 * Style configurations for each plan type
 */
const planStyles: Record<PlanType, React.CSSProperties> = {
  guest: {
    backgroundColor: '#F7FAFC',
    color: '#1A202C',
  },
  free: {
    backgroundColor: '#F7FAFC',
    color: '#1A202C',
  },
  premium: {
    backgroundColor: '#FEFCBF',
    color: '#B7791F',
    borderColor: '#D69E2E',
  },
  professional: {
    backgroundColor: '#1A202C',
    color: '#FFFFFF',
  },
};

/**
 * Label mappings for each plan type (uppercase)
 */
const planLabels: Record<PlanType, string> = {
  guest: 'GUEST',
  free: 'FREE',
  premium: 'PREMIUM',
  professional: 'PROFESSIONAL',
};

/**
 * PlanBadge - Displays user subscription plan as a styled badge
 *
 * @example
 * ```tsx
 * import { PlanBadge } from '@/components/ui/plan-badge';
 *
 * <PlanBadge plan="premium" />
 * <PlanBadge plan="free" />
 * <PlanBadge plan="professional" />
 * ```
 */
export function PlanBadge({ plan, className, ...props }: PlanBadgeProps) {
  const styles = planStyles[plan];
  const label = planLabels[plan];

  // guest and free have transparent border, premium has golden border
  const hasBorder = plan === 'premium';

  return (
    <Badge
      className={cn(hasBorder ? '' : 'border-transparent', className)}
      style={styles}
      {...props}
    >
      {label}
    </Badge>
  );
}
