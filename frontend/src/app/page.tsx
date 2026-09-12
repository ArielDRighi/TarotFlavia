import type { Metadata } from 'next';

import { EditorialHome } from '@/components/features/home/EditorialHome';
import { HomePageContent } from '@/components/features/home/HomePageContent';
import { getEditorialHomeData } from '@/lib/api/home-server';
import { homeMetadata } from '@/lib/metadata/seo';

/**
 * Home Page
 *
 * Route: /
 *
 * `homeMetadata` existía en `seo.ts` desde siempre pero **nadie la importaba**:
 * la home era un client component y Next no admite `export const metadata` en
 * uno, así que servía el título genérico "Auguria" igual que el resto del sitio
 * (T-PROD-020). La lógica dual portada/dashboard vive en `HomePageContent`.
 *
 * Desde T-SEO-014 la portada anónima es editorial y trae datos del día
 * resueltos acá, en el servidor: los 12 extractos del horóscopo, la carta del
 * día y las guías viajan en el HTML que ve el crawler. `EditorialHome` se
 * renderiza acá (Server Component) y va como `children` de `HomePageContent`,
 * que es client sólo por el store de sesión.
 */
export const metadata: Metadata = homeMetadata;

/**
 * Una hora de ISR, el mismo criterio que `/horoscopo/[sign]` (T-SEO-016): el
 * horóscopo y la carta cambian una vez por día y el cron puede atrasarse.
 */
export const revalidate = 3600;

export default async function Home() {
  const home = await getEditorialHomeData();

  return (
    <HomePageContent>
      <EditorialHome data={home} />
    </HomePageContent>
  );
}
