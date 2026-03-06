'use client';

import { useState } from 'react';

import Image from 'next/image';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface CardImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function CardImage({ src, alt, className }: CardImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div data-testid="card-image" className={cn('inline-block', className)}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            data-testid="card-image-trigger"
            aria-label={`Ampliar imagen: ${alt}`}
            className={cn(
              'relative cursor-zoom-in overflow-hidden rounded-lg shadow-lg',
              'aspect-[2/3] w-full max-w-xs'
            )}
          >
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover transition-transform hover:scale-105"
              sizes="(max-width: 768px) 100vw, 320px"
              priority
              unoptimized
            />
          </button>
        </DialogTrigger>
        <DialogContent data-testid="card-image-modal" className="max-w-2xl overflow-hidden p-0">
          <div className="relative aspect-[2/3]">
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 672px"
              unoptimized
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
