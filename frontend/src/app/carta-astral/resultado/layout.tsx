import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tu Carta Astral | Auguria',
  description: 'Visualiza tu carta astral natal con interpretaciones personalizadas.',
};

export default function ResultLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
