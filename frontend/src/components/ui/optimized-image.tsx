import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

/**
 * OptimizedImage Component Props
 * Extends Next.js Image props with sensible defaults
 */
export type OptimizedImageProps = ImageProps & {
  /** Additional CSS classes */
  className?: string;
};

/**
 * OptimizedImage Component
 *
 * Wrapper around Next.js Image with optimized defaults:
 * - Lazy loading by default (override with priority prop)
 * - Responsive sizes
 * - Automatic blur placeholder support
 *
 * @example
 * ```tsx
 * // Above-the-fold image
 * <OptimizedImage src="/hero.jpg" alt="Hero" width={1200} height={600} priority />
 *
 * // Lazy loaded image
 * <OptimizedImage src="/card.jpg" alt="Card" width={300} height={400} />
 *
 * // With blur placeholder
 * <OptimizedImage
 *   src="/avatar.jpg"
 *   alt="Avatar"
 *   width={100}
 *   height={100}
 *   placeholder="blur"
 *   blurDataURL="data:image/jpeg;base64,..."
 * />
 * ```
 */
export function OptimizedImage({ className, alt, ...props }: OptimizedImageProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image alt={alt} {...props} />
    </div>
  );
}
