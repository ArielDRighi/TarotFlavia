import type { Metadata } from 'next';

/**
 * El resultado es una pantalla de app (45 palabras propias en el HTML, el resto
 * llega por el cliente desde el store). `robots.txt` la bloquea, pero un revisor
 * que llega por un link la ve igual: `noindex, follow` (T-SEO-015).
 */
export const metadata: Metadata = {
  // Sin la marca: el `title.template` del root layout ya agrega " | Auguria".
  title: 'Tu Carta Astral',
  description: 'Visualiza tu carta astral natal con interpretaciones personalizadas.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function ResultLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
