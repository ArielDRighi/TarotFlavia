import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Logo Component Props
 */
export interface LogoProps {
  /** Width of the logo in pixels */
  width?: number;
  /** Height of the logo in pixels */
  height?: number;
  /** Whether to prioritize loading (for above-the-fold usage) */
  priority?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Logo Component
 *
 * Displays the TarotFlavia brand logo using optimized SVG.
 *
 * @example
 * ```tsx
 * // In header (above-the-fold)
 * <Logo priority />
 *
 * // In footer
 * <Logo />
 *
 * // Custom size
 * <Logo width={200} height={80} />
 * ```
 */
export function Logo({ width = 180, height = 60, priority = false, className }: LogoProps) {
  return (
    <div className={cn('relative', className)}>
      <Image src="/logo.svg" alt="TarotFlavia" width={width} height={height} priority={priority} />
    </div>
  );
}
