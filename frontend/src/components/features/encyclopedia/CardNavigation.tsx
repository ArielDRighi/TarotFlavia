'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useCardNavigation } from '@/hooks/api/useEncyclopedia';

export interface CardNavigationProps {
  slug: string;
}

export function CardNavigation({ slug }: CardNavigationProps) {
  const { data: navigation, isLoading } = useCardNavigation(slug);

  if (isLoading || !navigation) {
    return null;
  }

  return (
    <div data-testid="card-navigation" className="flex items-center justify-between">
      {navigation.previous ? (
        <Button variant="ghost" asChild>
          <Link
            data-testid="card-navigation-prev"
            href={`/enciclopedia/${navigation.previous.slug}`}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {navigation.previous.nameEs}
          </Link>
        </Button>
      ) : (
        <div />
      )}

      {navigation.next ? (
        <Button variant="ghost" asChild>
          <Link data-testid="card-navigation-next" href={`/enciclopedia/${navigation.next.slug}`}>
            {navigation.next.nameEs}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <div />
      )}
    </div>
  );
}
