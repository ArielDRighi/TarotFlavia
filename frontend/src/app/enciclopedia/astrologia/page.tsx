import Link from 'next/link';

import { ROUTES } from '@/lib/constants/routes';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubSectionConfig {
  id: string;
  title: string;
  description: string;
  href: string;
  linkTestId: string;
  sectionTestId: string;
  count: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ASTROLOGIA_SECTIONS: SubSectionConfig[] = [
  {
    id: 'signos',
    title: 'Signos Zodiacales',
    description: 'Los 12 signos del zodiaco: características, fechas y compatibilidades.',
    href: ROUTES.ENCICLOPEDIA_ASTROLOGIA_SIGNOS,
    linkTestId: 'astrologia-link-signos',
    sectionTestId: 'astrologia-section-signos',
    count: '12 signos',
  },
  {
    id: 'planetas',
    title: 'Planetas',
    description: 'Los planetas astrológicos y su influencia en la carta natal y el horóscopo.',
    href: ROUTES.ENCICLOPEDIA_ASTROLOGIA_PLANETAS,
    linkTestId: 'astrologia-link-planetas',
    sectionTestId: 'astrologia-section-planetas',
    count: '10 planetas',
  },
  {
    id: 'casas',
    title: 'Casas Astrales',
    description: 'Las 12 casas astrales y los ámbitos de la vida que representan.',
    href: ROUTES.ENCICLOPEDIA_ASTROLOGIA_CASAS,
    linkTestId: 'astrologia-link-casas',
    sectionTestId: 'astrologia-section-casas',
    count: '12 casas',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Astrología Hub Page
 *
 * Route: /enciclopedia/astrologia
 * Hub de astrología con enlaces a signos, planetas y casas.
 */
export default function AstrologiaPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-10">
        <nav aria-label="Navegación" className="mb-4 flex items-center gap-2 text-sm">
          <Link
            href={ROUTES.ENCICLOPEDIA}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Enciclopedia
          </Link>
          <span className="text-muted-foreground" aria-hidden="true">
            /
          </span>
          <span className="text-foreground font-medium" aria-current="page">
            Astrología
          </span>
        </nav>
        <h1 className="mb-3 font-serif text-4xl font-bold">Astrología</h1>
        <p className="text-muted-foreground text-lg">
          Explora los fundamentos de la astrología: signos, planetas y casas astrales.
        </p>
      </div>

      {/* Sections grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ASTROLOGIA_SECTIONS.map((section) => (
          <div
            key={section.id}
            data-testid={section.sectionTestId}
            className="bg-card rounded-xl border p-6 transition-shadow hover:shadow-md"
          >
            <div className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
              {section.count}
            </div>
            <h2 className="mb-2 font-serif text-xl font-semibold">{section.title}</h2>
            <p className="text-muted-foreground mb-4 text-sm">{section.description}</p>
            <Link
              data-testid={section.linkTestId}
              href={section.href}
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-medium transition-colors"
            >
              Explorar →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
