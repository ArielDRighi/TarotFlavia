'use client';

import { Lock, Crown, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

/**
 * Badge variants for premium features
 */
export type PremiumBadgeVariant = 'lock' | 'crown' | 'sparkles';

/**
 * Badge sizes
 */
export type PremiumBadgeSize = 'sm' | 'md' | 'lg';

/**
 * Props for PremiumBadge component
 */
export interface PremiumBadgeProps {
  /** Icon variant to display */
  variant?: PremiumBadgeVariant;
  /** Badge size */
  size?: PremiumBadgeSize;
  /** Custom text (default: "Premium") */
  text?: string;
  /** Tooltip text shown as title attribute */
  tooltip?: string;
  /** Additional CSS classes */
  className?: string;
}

const ICONS = {
  lock: Lock,
  crown: Crown,
  sparkles: Sparkles,
} as const;

const SIZE_CLASSES: Record<PremiumBadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

/**
 * PremiumBadge Component
 *
 * Displays a premium feature badge with icon and tooltip.
 * Used to mark features that require premium subscription.
 *
 * @example
 * ```tsx
 * // Simple badge
 * <PremiumBadge />
 *
 * // With tooltip
 * <PremiumBadge tooltip="Actualiza tu plan" />
 *
 * // With crown icon
 * <PremiumBadge variant="crown" />
 *
 * // Large size
 * <PremiumBadge size="lg" />
 * ```
 */
export function PremiumBadge({
  variant = 'lock',
  size = 'sm',
  text = 'Premium',
  tooltip,
  className,
}: PremiumBadgeProps) {
  const Icon = ICONS[variant];

  return (
    <Badge
      data-slot="badge"
      title={tooltip}
      className={cn(
        'inline-flex items-center gap-1.5',
        'bg-gradient-to-r from-purple-600 to-pink-600',
        'border-none text-white',
        'hover:from-purple-700 hover:to-pink-700',
        'transition-all duration-200',
        'font-semibold',
        SIZE_CLASSES[size],
        className
      )}
      aria-label={tooltip}
    >
      <Icon
        data-testid={`${variant}-icon`}
        className={cn(
          'shrink-0',
          size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-3.5 w-3.5' : 'h-4 w-4'
        )}
        aria-hidden="true"
      />
      <span>{text}</span>
    </Badge>
  );
}
