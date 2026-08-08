import type { Metadata } from 'next';
import { Cormorant_Garamond, Lato } from 'next/font/google';
import { ReactQueryProvider, AuthProvider } from '@/lib/providers';
import { Toaster } from '@/components/ui/toaster';
import { AdSenseScript } from '@/components/features/ads';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { defaultMetadata } from '@/lib/metadata/seo';
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

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${cormorantGaramond.variable} ${lato.variable} bg-bg-main min-h-screen antialiased`}
      >
        <ReactQueryProvider>
          <AuthProvider>
            {/* El gating de AdSense NO depende de este árbol: `useAdsEnabled` exige
                `_hasHydrated` por su cuenta, así que un Premium no ve ni un flash de
                anuncio (T-PROD-008). El `AuthProvider` ya no bloquea el render —
                bloquearlo dejaba el sitio entero en blanco para los buscadores
                (T-PROD-022). */}
            <AdSenseScript />
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </ReactQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
