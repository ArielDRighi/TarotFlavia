import type { Metadata } from 'next';

import { HomePageContent } from '@/components/features/home/HomePageContent';
import { homeMetadata } from '@/lib/metadata/seo';

/**
 * Home Page
 *
 * Route: /
 *
 * `homeMetadata` existía en `seo.ts` desde siempre pero **nadie la importaba**:
 * la home era un client component y Next no admite `export const metadata` en
 * uno, así que servía el título genérico "Auguria" igual que el resto del sitio
 * (T-PROD-020). La lógica dual landing/dashboard vive en `HomePageContent`.
 */
export const metadata: Metadata = homeMetadata;

export default function Home() {
  return <HomePageContent />;
}
