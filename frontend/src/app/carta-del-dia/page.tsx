import { DailyCardPage } from '@/components/features/daily-reading/DailyCardPage';
import { getDailyCardPageData } from '@/lib/api/daily-card-page-server';

/**
 * Carta del Día (`/carta-del-dia`).
 *
 * Server Component desde T-SEO-015: la carta canónica de hoy y el archivo de
 * los últimos 30 días viajan en el HTML; la herramienta interactiva sigue
 * siendo cliente. ISR de una hora: la carta cambia con el día canónico.
 */
export const revalidate = 3600;

export default async function CartaDelDiaPage() {
  const data = await getDailyCardPageData();

  return <DailyCardPage data={data} />;
}
