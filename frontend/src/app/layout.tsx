import type { Metadata } from 'next';
import { Cormorant_Garamond, Lato } from 'next/font/google';
import { ReactQueryProvider } from '@/lib/providers/react-query-provider';
import './globals.css';

/**
 * Cormorant Garamond - Serif font for headings
 * Design Token: font-serif
 */
const cormorantGaramond = Cormorant_Garamond({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

/**
 * Lato - Sans-serif font for body text
 * Design Token: font-sans
 */
const lato = Lato({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TarotFlavia',
  description: 'Marketplace de tarotistas profesionales',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${cormorantGaramond.variable} ${lato.variable} antialiased`}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
