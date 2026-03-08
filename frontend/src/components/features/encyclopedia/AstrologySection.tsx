'use client';

import Link from 'next/link';

import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const ASTROLOGY_SUBSECTIONS = [
  {
    id: 'signos',
    title: 'Signos Zodiacales',
    description: 'Descubre los 12 signos del zodíaco, sus características, elementos y más.',
    icon: '♈',
    href: '/enciclopedia?categoria=zodiac_sign',
  },
  {
    id: 'planetas',
    title: 'Planetas',
    description: 'Conoce los planetas del sistema solar y su influencia astrológica.',
    icon: '🪐',
    href: '/enciclopedia?categoria=planet',
  },
  {
    id: 'casas',
    title: 'Casas Astrales',
    description: 'Explora las 12 casas astrológicas y las áreas de vida que rigen.',
    icon: '🏠',
    href: '/enciclopedia?categoria=astro_house',
  },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AstrologySectionProps {
  /** Additional CSS classes */
  className?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SubsectionCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
}

function SubsectionCard({ title, description, icon, href }: SubsectionCardProps) {
  return (
    <Link
      href={href}
      data-testid="astrology-subsection"
      className="bg-card hover:bg-accent group flex flex-col gap-2 rounded-lg border p-5 transition-colors"
    >
      <div className="text-3xl" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-foreground font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * AstrologySection Component
 *
 * Displays the "Astrología" section with links to 3 sub-sections:
 * Zodiac Signs, Planets, and Astrological Houses.
 *
 * @example
 * ```tsx
 * <AstrologySection />
 * ```
 */
export function AstrologySection({ className }: AstrologySectionProps) {
  return (
    <section data-testid="astrology-section" className={cn('space-y-4', className)}>
      <h2 className="text-foreground text-2xl font-bold">Astrología</h2>
      <p className="text-muted-foreground text-sm">
        Explora los fundamentos de la astrología: signos, planetas y casas astrales.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ASTROLOGY_SUBSECTIONS.map((subsection) => (
          <SubsectionCard key={subsection.id} {...subsection} />
        ))}
      </div>
    </section>
  );
}
