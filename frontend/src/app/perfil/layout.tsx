import type { Metadata } from 'next';
import { perfilMetadata } from '@/lib/metadata/seo';

export const metadata: Metadata = perfilMetadata;

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
