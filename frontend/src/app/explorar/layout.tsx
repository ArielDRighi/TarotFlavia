import type { Metadata } from 'next';
import { explorarMetadata } from '@/lib/metadata/seo';

export const metadata: Metadata = explorarMetadata;

export default function ExplorarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
