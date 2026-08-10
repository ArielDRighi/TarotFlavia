import type { Metadata } from 'next';

import { ListingIntro } from '@/components/common/ListingIntro';
import { EnciclopediaContent } from '@/components/features/encyclopedia/EnciclopediaContent';
import { getCards } from '@/lib/api/encyclopedia-api';
import { LISTING_INTROS } from '@/lib/constants/listing-intros.data';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';
import { resolveListingData } from '@/lib/metadata/route-data';

/**
 * Enciclopedia Tarot Page
 *
 * Route: /enciclopedia/tarot
 * Listado de las 78 cartas del tarot.
 *
 * Servía 24 palabras propias: el listado llegaba por el cliente, así que el
 * crawler solo veía el encabezado y el esqueleto (T-SEO-003). Ahora la ruta
 * resuelve las cartas en el servidor y `EnciclopediaContent` siembra React Query
 * con ellas. La introducción editorial es el piso que queda aunque la API falle.
 */
export const metadata: Metadata = STATIC_PAGE_METADATA.enciclopediaTarot;

/** El mazo no cambia; un día de ISR alcanza, igual que en las fichas. */
export const revalidate = 86400;

export default async function EnciclopediaTarotPage() {
  const initialCards = await resolveListingData(() => getCards());

  return (
    <>
      <EnciclopediaContent initialCards={initialCards} />
      <ListingIntro intro={LISTING_INTROS.enciclopediaTarot} />
    </>
  );
}
