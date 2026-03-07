'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { CardDetailView, EncyclopediaSkeleton } from '@/components/features/encyclopedia';
import { useCard } from '@/hooks/api/useEncyclopedia';
import { ROUTES } from '@/lib/constants/routes';

// ─── Component ────────────────────────────────────────────────────────────────

export default function CardDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: card, isLoading, error } = useCard(slug);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EncyclopediaSkeleton variant="detail" />
      </div>
    );
  }

  if (error ?? !card) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="mb-4 text-2xl">Carta no encontrada</h1>
        <p className="text-muted-foreground mb-6">La carta que buscas no existe o fue eliminada.</p>
        <Button asChild>
          <Link href={ROUTES.ENCICLOPEDIA}>Ver todas las cartas</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CardDetailView card={card} />
    </div>
  );
}
