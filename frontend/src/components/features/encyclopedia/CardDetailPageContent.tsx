'use client';

// 1. React & Next.js
import Link from 'next/link';
// 2. Custom hooks
import { useCard } from '@/hooks/api/useEncyclopedia';
// 3. Components (ui → features)
import { Button } from '@/components/ui/button';
import { CardDetailView } from './CardDetailView';
import { EncyclopediaSkeleton } from './EncyclopediaSkeleton';
// 4. Utils & types
import { ROUTES } from '@/lib/constants/routes';
import type { CardDetail } from '@/types/encyclopedia.types';

/**
 * Contenido de la ficha de una carta (`/enciclopedia/tarot/[slug]`).
 *
 * La ruta es un server component: resuelve la carta y la pasa por `initialCard`
 * para que el HTML que sirve Next ya traiga el contenido real. Antes la página
 * era client-only y Googlebot recibía el mismo skeleton en las 78 fichas —
 * contenido indistinguible que Google agrupaba como duplicado (T-PROD-020).
 *
 * Sigue usando React Query igual: `initialCard` solo siembra la caché.
 */

interface CardDetailPageContentProps {
  slug: string;
  /** Carta resuelta en el servidor. La ruta 404ea si el slug no existe. */
  initialCard: CardDetail;
}

export function CardDetailPageContent({ slug, initialCard }: CardDetailPageContentProps) {
  const { data: card, isLoading } = useCard(slug, initialCard);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EncyclopediaSkeleton variant="detail" />
      </div>
    );
  }

  // Sin `error` a propósito: en React Query v5 un refetch fallido puebla `error`
  // conservando el `data` bueno. Mirar `error` tiraba abajo una ficha ya cargada
  // (pestaña abierta > 1 h, vuelve al foco, la API no responde).
  if (!card) {
    return (
      <div className="container mx-auto px-4 py-8 text-center" data-testid="card-detail-not-found">
        <h1 className="mb-4 text-2xl">Carta no encontrada</h1>
        <p className="text-muted-foreground mb-6">La carta que buscas no existe o fue eliminada.</p>
        <Button asChild>
          <Link href={ROUTES.ENCICLOPEDIA_TAROT}>Ver todas las cartas</Link>
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
