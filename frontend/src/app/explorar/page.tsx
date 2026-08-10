import { ListingIntro } from '@/components/common/ListingIntro';
import { ExplorarContent } from '@/components/features/marketplace';
import { getTarotistas } from '@/lib/api/tarotistas-api';
import { LISTING_INTROS } from '@/lib/constants/listing-intros.data';
import { resolveListingData } from '@/lib/metadata/route-data';

/**
 * Explorar Page - Tarotistas Marketplace
 *
 * Public page that displays the marketplace of tarotistas.
 *
 * Servía 20 palabras propias: la ruta era un client component y el listado
 * llegaba por el cliente (T-SEO-003). Ahora resuelve en el servidor la
 * **primera página** —el endpoint es paginado— y `ExplorarContent` la siembra.
 * La navegación al perfil vive en ese componente cliente.
 */
export const revalidate = 3600;

export default async function ExplorarPage() {
  const initialTarotistas = await resolveListingData(() => getTarotistas());

  return (
    <>
      <ExplorarContent initialTarotistas={initialTarotistas} />
      <ListingIntro intro={LISTING_INTROS.explorar} />
    </>
  );
}
