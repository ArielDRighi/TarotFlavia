import type { Metadata } from 'next';

import { OG_IMAGE_PATH } from '@/lib/metadata/og-image';

export const metadata: Metadata = {
  title: 'Carta Astral | Auguria',
  description:
    'Descubre tu carta astral natal. Conoce la posición de los planetas en el momento de tu nacimiento y obtén interpretaciones personalizadas.',
  openGraph: {
    title: 'Carta Astral | Auguria',
    description:
      'Descubre tu carta astral natal. Conoce la posición de los planetas en el momento de tu nacimiento.',
    images: [OG_IMAGE_PATH],
  },
};

export default function BirthChartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
