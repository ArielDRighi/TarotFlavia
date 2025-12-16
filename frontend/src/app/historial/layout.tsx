import type { Metadata } from 'next';
import { historialMetadata } from '@/lib/metadata/seo';

export const metadata: Metadata = historialMetadata;

export default function HistorialLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
