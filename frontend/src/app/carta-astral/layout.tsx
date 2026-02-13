import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Carta Astral | Auguria',
  description:
    'Descubre tu carta astral natal. Conoce la posición de los planetas en el momento de tu nacimiento y obtén interpretaciones personalizadas.',
  openGraph: {
    title: 'Carta Astral | Auguria',
    description:
      'Descubre tu carta astral natal. Conoce la posición de los planetas en el momento de tu nacimiento.',
    images: ['/og/carta-astral.png'],
  },
};

export default function BirthChartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
