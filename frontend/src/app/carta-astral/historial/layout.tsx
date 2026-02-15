import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historial de Cartas | Auguria',
  description:
    'Accede a tus cartas astrales guardadas. Busca, ordena y gestiona tu historial de cartas personales.',
};

export default function HistorialLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
