import Link from 'next/link';

import { ROUTES } from '@/lib/constants/routes';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SectionConfig {
  id: string;
  title: string;
  description: string;
  href: string;
  linkTestId: string;
  sectionTestId: string;
  icon: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ENCYCLOPEDIA_SECTIONS: SectionConfig[] = [
  {
    id: 'tarot',
    title: 'Tarot',
    description:
      'Explora las 78 cartas del tarot y descubre sus significados, simbolismo y guía para lecturas.',
    href: ROUTES.ENCICLOPEDIA_TAROT,
    linkTestId: 'encyclopedia-link-tarot',
    sectionTestId: 'encyclopedia-section-tarot',
    icon: '🃏',
  },
  {
    id: 'astrologia',
    title: 'Astrología',
    description: 'Conoce los 12 signos zodiacales, los planetas y las casas astrales del zodiaco.',
    href: ROUTES.ENCICLOPEDIA_ASTROLOGIA,
    linkTestId: 'encyclopedia-link-astrologia',
    sectionTestId: 'encyclopedia-section-astrologia',
    icon: '⭐',
  },
  {
    id: 'guias',
    title: 'Guías',
    description:
      'Aprende con nuestras guías sobre numerología, péndulo, carta astral, rituales y más.',
    href: ROUTES.ENCICLOPEDIA_GUIAS,
    linkTestId: 'encyclopedia-link-guias',
    sectionTestId: 'encyclopedia-section-guias',
    icon: '📚',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * EnciclopediaHubContent
 *
 * Hub principal de la Enciclopedia. Muestra las 3 grandes secciones:
 * Tarot, Astrología y Guías, cada una con su enlace de navegación.
 */
export function EnciclopediaHubContent() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="mb-3 font-serif text-4xl">Enciclopedia Mística</h1>
        <p className="text-muted-foreground mx-auto max-w-xl text-lg">
          Explora nuestro completo repositorio de conocimiento esotérico: tarot, astrología y guías
          prácticas.
        </p>
      </div>

      {/* Sections grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ENCYCLOPEDIA_SECTIONS.map((section) => (
          <div
            key={section.id}
            data-testid={section.sectionTestId}
            className="bg-card rounded-xl border p-6 transition-shadow hover:shadow-md"
          >
            <div className="mb-4 text-4xl">{section.icon}</div>
            <h2 className="mb-2 font-serif text-2xl font-semibold">{section.title}</h2>
            <p className="text-muted-foreground mb-4 text-sm">{section.description}</p>
            <Link
              data-testid={section.linkTestId}
              href={section.href}
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-medium transition-colors"
            >
              Explorar {section.title} →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
