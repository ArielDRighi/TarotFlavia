import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ritual de Lectura | TarotFlavia',
  description:
    'Inicia tu ritual de lectura de tarot seleccionando una categoría que resuene con tu alma.',
};

export default function RitualLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
