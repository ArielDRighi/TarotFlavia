/**
 * Shared Reading Page
 *
 * Public page to view shared readings (no authentication required)
 * Route: /compartida/[token]
 */
import { Metadata } from 'next';
import Link from 'next/link';

import { getSharedReading } from '@/lib/api';
import { SharedReadingView } from '@/components/features/readings';
import { Button } from '@/components/ui/button';

interface SharedReadingPageProps {
  params: Promise<{
    token: string;
  }>;
}

/**
 * Generate metadata for SEO and social sharing
 */
export async function generateMetadata({ params }: SharedReadingPageProps): Promise<Metadata> {
  try {
    const { token } = await params;
    const reading = await getSharedReading(token);

    return {
      title: `${reading.question} | Lectura Compartida - TarotFlavia`,
      description: `Descubre esta lectura del tarot: ${reading.question}`,
      openGraph: {
        title: `${reading.question} - TarotFlavia`,
        description: 'Una lectura del tarot compartida contigo',
        type: 'article',
        images: [
          {
            url: '/og-image.jpg',
            width: 1200,
            height: 630,
            alt: 'TarotFlavia - Lectura Compartida',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${reading.question} - TarotFlavia`,
        description: 'Una lectura del tarot compartida contigo',
      },
    };
  } catch {
    return {
      title: 'Lectura no disponible | TarotFlavia',
      description: 'Esta lectura compartida ya no está disponible',
    };
  }
}

/**
 * Shared Reading Page Component (Server Component)
 */
export default async function SharedReadingPage({ params }: SharedReadingPageProps) {
  const { token } = await params;

  // Fetch reading data - if it fails, Next.js will handle it
  let reading;
  try {
    reading = await getSharedReading(token);
  } catch {
    return <ReadingNotAvailable />;
  }

  // Get spread name (fallback if not available)
  const spreadName = 'Lectura de Tarot'; // TODO: Fetch spread name from API if needed

  return <SharedReadingView reading={reading} spreadName={spreadName} />;
}

/**
 * Error state when reading is not available
 */
function ReadingNotAvailable() {
  return (
    <div className="bg-bg-main flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <svg
            className="h-24 w-24 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="mb-4 font-serif text-3xl font-bold text-gray-900">
          Esta lectura ya no está disponible
        </h1>

        <p className="mb-8 text-gray-600">La lectura que buscas no existe o ha sido eliminada.</p>

        <div className="space-y-4">
          <Button asChild size="lg" className="w-full bg-purple-600 hover:bg-purple-700">
            <Link href="/registro">Crear mi cuenta gratis</Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/">Ir al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
