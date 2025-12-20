import type { Metadata } from 'next';
import { cartaDelDiaMetadata } from '@/lib/metadata/seo';

export const metadata: Metadata = cartaDelDiaMetadata;

export default function CartaDelDiaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
