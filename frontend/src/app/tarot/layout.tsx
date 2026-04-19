import type { Metadata } from 'next';
import { ritualMetadata } from '@/lib/metadata/seo';

export const metadata: Metadata = ritualMetadata;

export default function TarotLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
