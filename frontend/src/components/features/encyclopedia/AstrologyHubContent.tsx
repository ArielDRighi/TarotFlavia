import Image from 'next/image';
import Link from 'next/link';

import { Reveal } from './Reveal';
import { ROUTES } from '@/lib/constants/routes';

// ─── Constants ────────────────────────────────────────────────────────────────

const HERO_GRADIENT = 'linear-gradient(160deg, #1a0a2e 0%, #2d1b69 55%, #1a0a2e 100%)';
const CARD_OVERLAY =
  'linear-gradient(180deg, rgba(26, 10, 46, 0.15) 0%, rgba(26, 10, 46, 0.55) 55%, rgba(26, 10, 46, 0.9) 100%)';
const CREAM = '#f9f7f2';
const CREAM_MUTED = 'rgba(249, 247, 242, 0.72)';

const DECORATIVE_STARS = [
  { top: '22%', left: '12%', size: 3, delay: '0s', duration: '2.8s' },
  { top: '34%', left: '88%', size: 2, delay: '0.6s', duration: '3.2s' },
  { top: '68%', left: '8%', size: 2, delay: '1s', duration: '2.5s' },
  { top: '28%', left: '64%', size: 2, delay: '1.3s', duration: '3.4s' },
];

const IMAGE_BASE = '/images/enciclopedia';

interface SubSectionConfig {
  id: string;
  title: string;
  description: string;
  href: string;
  linkTestId: string;
  sectionTestId: string;
  image: { src: string; alt: string };
}

const ASTROLOGY_SUBSECTIONS: SubSectionConfig[] = [
  {
    id: 'signos',
    title: 'Signos Zodiacales',
    description: 'Los 12 signos del zodiaco: características, fechas y compatibilidades.',
    href: ROUTES.ENCICLOPEDIA_ASTROLOGIA_SIGNOS,
    linkTestId: 'astrologia-link-signos',
    sectionTestId: 'astrologia-section-signos',
    image: {
      src: `${IMAGE_BASE}/astro-signos.webp`,
      alt: 'Rueda zodiacal con los doce glifos de los signos brillando sobre un cosmos violeta profundo',
    },
  },
  {
    id: 'planetas',
    title: 'Planetas',
    description: 'Los planetas astrológicos y su influencia en la carta natal y el horóscopo.',
    href: ROUTES.ENCICLOPEDIA_ASTROLOGIA_PLANETAS,
    linkTestId: 'astrologia-link-planetas',
    sectionTestId: 'astrologia-section-planetas',
    image: {
      src: `${IMAGE_BASE}/astro-planetas.webp`,
      alt: 'Los planetas clásicos orbitando en un cosmos dorado luminoso',
    },
  },
  {
    id: 'casas',
    title: 'Casas Astrales',
    description: 'Las 12 casas astrales y los ámbitos de la vida que representan.',
    href: ROUTES.ENCICLOPEDIA_ASTROLOGIA_CASAS,
    linkTestId: 'astrologia-link-casas',
    sectionTestId: 'astrologia-section-casas',
    image: {
      src: `${IMAGE_BASE}/astro-casas.webp`,
      alt: 'Rueda astral dividida en doce casas brillantes sobre el horizonte de la Tierra',
    },
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SubSectionCard({ section }: { section: SubSectionConfig }) {
  return (
    <Link
      data-testid={section.linkTestId}
      href={section.href}
      aria-label={`Explorar ${section.title}`}
      className="group focus-visible:ring-secondary focus-visible:ring-offset-background relative block h-full overflow-hidden rounded-2xl border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-12px_rgba(214,158,46,0.45)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <div
        data-testid={section.sectionTestId}
        className="relative flex min-h-[20rem] flex-col justify-end"
      >
        <Image
          src={section.image.src}
          alt={section.image.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        <div className="absolute inset-0" style={{ background: CARD_OVERLAY }} aria-hidden="true" />

        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ boxShadow: 'inset 0 0 60px 0 rgba(214, 158, 46, 0.35)' }}
          aria-hidden="true"
        />

        <div className="relative z-10 p-6">
          <h2 className="font-serif text-2xl font-semibold" style={{ color: CREAM }}>
            {section.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: CREAM_MUTED }}>
            {section.description}
          </p>
          <span
            className="text-secondary mt-4 inline-flex items-center gap-1 text-sm font-medium transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          >
            Explorar {section.title} →
          </span>
        </div>

        <div
          className="absolute inset-x-0 bottom-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, transparent, #d69e2e, transparent)' }}
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AstrologyHubContent
 *
 * Hub de Astrología con banda de cabecera de marca (gradiente noche + estrellas)
 * y las 3 sub-secciones (Signos, Planetas, Casas) como tarjetas editoriales con
 * imagen temática y micro-interacción hover (zoom + glow dorado).
 */
export function AstrologyHubContent() {
  return (
    <div data-testid="astrology-hub" className="container mx-auto px-4 py-8">
      {/* Banda de cabecera con identidad de marca */}
      <header
        data-testid="astrology-hub-hero"
        className="relative mb-10 overflow-hidden rounded-2xl"
        style={{ background: HERO_GRADIENT }}
      >
        {DECORATIVE_STARS.map((star, i) => (
          <span
            key={i}
            className="animate-twinkle absolute rounded-full bg-amber-200/80"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
            aria-hidden="true"
          />
        ))}

        <div
          className="absolute top-6 right-8 z-0 opacity-30"
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            boxShadow: 'inset -18px -6px 0 0 #d69e2e',
            filter: 'blur(1px)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 px-6 py-12 text-center sm:px-10 sm:py-16">
          <h1
            className="font-serif text-4xl leading-tight font-bold sm:text-5xl"
            style={{ color: CREAM }}
          >
            Astrología
          </h1>
          <p
            className="mx-auto mt-4 max-w-xl text-lg leading-relaxed"
            style={{ color: CREAM_MUTED }}
          >
            Explora los fundamentos de la astrología: signos zodiacales, planetas y casas astrales.
          </p>
        </div>

        <div
          className="absolute inset-x-0 bottom-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, transparent, #d69e2e, transparent)' }}
          aria-hidden="true"
        />
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ASTROLOGY_SUBSECTIONS.map((section, index) => (
          <Reveal key={section.id} index={index} className="h-full">
            <SubSectionCard section={section} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
