import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { cn } from '@/lib/utils';

/**
 * UserAvatar Component Props
 */
export interface UserAvatarProps {
  /** Image source URL (optional) */
  src?: string;
  /** Alt text for accessibility */
  alt: string;
  /** Initials to show as fallback */
  initials?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional CSS classes */
  className?: string;
}

/** Size configuration mapping */
const sizeConfig = {
  sm: { className: 'size-8', imageSize: 32 },
  md: { className: 'size-12', imageSize: 48 },
  lg: { className: 'size-16', imageSize: 64 },
  xl: { className: 'size-24', imageSize: 96 },
} as const;

/**
 * UserAvatar Component
 *
 * Wrapper around shadcn Avatar with Next.js Image optimization.
 *
 * Features:
 * - Optimized image loading with Next.js Image
 * - Automatic fallback to initials or placeholder
 * - Multiple size variants (sm, md, lg, xl)
 * - Accessible with proper alt text
 *
 * @example
 * ```tsx
 * // With image
 * <UserAvatar src="/user.jpg" alt="John Doe" size="md" />
 *
 * // With initials fallback
 * <UserAvatar alt="John Doe" initials="JD" size="sm" />
 * ```
 */
export function UserAvatar({ src, alt, initials, size = 'md', className }: UserAvatarProps) {
  const config = sizeConfig[size];

  return (
    <Avatar className={cn(config.className, className)} data-testid="user-avatar">
      {src ? (
        <AvatarImage asChild>
          <Image src={src} alt={alt} width={config.imageSize} height={config.imageSize} />
        </AvatarImage>
      ) : null}
      <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
        {initials || alt.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
