import type { Metadata } from 'next';

import { ListingIntro } from '@/components/common/ListingIntro';
import { GuiasContent } from '@/components/features/encyclopedia/GuiasContent';
import { getArticlesByCategories } from '@/lib/api/encyclopedia-articles-api';
import { LISTING_INTROS } from '@/lib/constants/listing-intros.data';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';
import { GUIDE_CATEGORIES } from '@/types/encyclopedia-article.types';

/**
 * Guías List Page
 *
 * Route: /enciclopedia/guias
 * Listado de las 7 guías prácticas de espiritualidad.
 *
 * Servía 13 palabras propias: las siete tarjetas llegaban por el cliente
 * (T-SEO-003). Ahora la ruta resuelve las siete categorías en el servidor y
 * `GuiasContent` siembra React Query con ellas.
 */
export const metadata: Metadata = STATIC_PAGE_METADATA.enciclopediaGuias;

/** Las guías son contenido estático; un día de ISR alcanza. */
export const revalidate = 86400;

export default async function GuiasPage() {
  const initialArticlesByCategory = await getArticlesByCategories(GUIDE_CATEGORIES);

  return (
    <>
      <GuiasContent initialArticlesByCategory={initialArticlesByCategory} />
      <ListingIntro intro={LISTING_INTROS.enciclopediaGuias} />
    </>
  );
}
