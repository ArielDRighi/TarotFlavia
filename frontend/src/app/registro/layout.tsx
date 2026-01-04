import type { Metadata } from 'next';
import { registerMetadata } from '@/lib/metadata/seo';

export const metadata: Metadata = registerMetadata;

export default function RegistroLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
