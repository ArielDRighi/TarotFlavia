'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/utils/useToast';

/**
 * ShareButton Props
 */
export interface ShareButtonProps {
  /** Text content to share */
  text: string;
  /** Optional title for Web Share API */
  title?: string;
  /** Optional URL to share */
  url?: string;
  /** Button variant */
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link';
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';
  /** Callback when share succeeds */
  onSuccess?: () => void;
  /** Callback when share fails */
  onError?: (error: Error) => void;
}

/**
 * ShareButton Component
 *
 * Reusable button that implements Web Share API with fallback to clipboard.
 *
 * Features:
 * - Mobile: Uses Web Share API when available (native share sheet)
 * - Desktop: Falls back to copying text to clipboard
 * - Shows toast feedback (success/error)
 * - Handles AbortError gracefully (user cancels share)
 * - Configurable variant and size
 * - Optional callbacks for success/error
 *
 * @example
 * ```tsx
 * <ShareButton
 *   text="My shared content"
 *   title="Share Title"
 *   url="https://example.com"
 *   onSuccess={() => console.log('Shared!')}
 * />
 * ```
 */
export function ShareButton({
  text,
  title,
  url,
  variant = 'outline',
  size = 'default',
  onSuccess,
  onError,
}: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (isSharing) return; // Prevent double-clicks

    setIsSharing(true);

    try {
      // Check if Web Share API is available (typically mobile)
      if (navigator.share) {
        await navigator.share({
          text,
          title,
          url,
        });

        toast.success('¡Compartido!');
        onSuccess?.();
      } else {
        // Fallback: Copy to clipboard (typically desktop)
        await navigator.clipboard.writeText(text);
        toast.success('Texto copiado');
        onSuccess?.();
      }
    } catch (error) {
      // Don't show error if user cancelled share (AbortError)
      if (error instanceof DOMException && error.name === 'AbortError') {
        // User cancelled - do nothing
        setIsSharing(false);
        return;
      }

      // Show error for actual failures
      const err = error instanceof Error ? error : new Error('Error al compartir');
      toast.error('Error al compartir');
      onError?.(err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      disabled={isSharing}
      aria-label="Compartir"
    >
      <Share2 className="h-4 w-4" />
      Compartir
    </Button>
  );
}
