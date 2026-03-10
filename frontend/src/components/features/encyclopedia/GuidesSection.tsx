'use client';

import Link from 'next/link';

import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const GUIDES = [
  {
    id: 'numerologia',
    title: 'Numerología',
    description: 'Descubre el significado de los números y su influencia en tu vida.',
    icon: '🔢',
    href: '/enciclopedia?categoria=guide_numerology',
  },
  {
    id: 'pendulo',
    title: 'Péndulo',
    description: 'Aprende a usar el péndulo como herramienta de radiestesia y adivinación.',
    icon: '⚖️',
    href: '/enciclopedia?categoria=guide_pendulum',
  },
  {
    id: 'carta-astral',
    title: 'Carta Astral',
    description: 'Interpreta tu carta natal y comprende la posición de los planetas al nacer.',
    icon: '🌟',
    href: '/enciclopedia?categoria=guide_birth_chart',
  },
  {
    id: 'rituales',
    title: 'Rituales',
    description: 'Guías de rituales para conectar con las energías del universo.',
    icon: '🕯️',
    href: '/enciclopedia?categoria=guide_ritual',
  },
  {
    id: 'horoscopo-occidental',
    title: 'Horóscopo Occidental',
    description: 'Comprende las predicciones y características del horóscopo occidental.',
    icon: '♏',
    href: '/enciclopedia?categoria=guide_horoscope',
  },
  {
    id: 'horoscopo-chino',
    title: 'Horóscopo Chino',
    description: 'Explora los 12 animales del zodíaco chino y sus significados.',
    icon: '🐉',
    href: '/enciclopedia?categoria=guide_chinese',
  },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GuidesSectionProps {
  /** Additional CSS classes */
  className?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface GuideCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
}

function GuideCard({ title, description, icon, href }: GuideCardProps) {
  return (
    <Link
      href={href}
      data-testid="guide-card"
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
 * GuidesSection Component
 *
 * Displays the "Guías" section with exactly 6 activity guide cards:
 * Numerología, Péndulo, Carta Astral, Rituales, Horóscopo Occidental, Horóscopo Chino.
 *
 * @example
 * ```tsx
 * <GuidesSection />
 * ```
 */
export function GuidesSection({ className }: GuidesSectionProps) {
  return (
    <section data-testid="guides-section" className={cn('space-y-4', className)}>
      <h2 className="text-foreground text-2xl font-bold">Guías</h2>
      <p className="text-muted-foreground text-sm">
        Aprende y practica las distintas tradiciones místicas con nuestras guías paso a paso.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {GUIDES.map((guide) => (
          <GuideCard key={guide.id} {...guide} />
        ))}
      </div>
    </section>
  );
}
