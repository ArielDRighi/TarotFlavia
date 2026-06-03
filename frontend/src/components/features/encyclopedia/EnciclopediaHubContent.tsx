// 1. React & Next.js
import Image from 'next/image';
import Link from 'next/link';

// 5. Components (ui → features)
import { Reveal } from './Reveal';
// 6. Utils & types
import { ROUTES } from '@/lib/constants/routes';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SectionConfig {
  id: string;
  title: string;
  description: string;
  href: string;
  linkTestId: string;
  sectionTestId: string;
  /** Themed brand image replacing the legacy system emoji. */
  image: { src: string; alt: string };
}

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Brand-night gradient used as the header band background and as the card image
 * overlay (kept in sync with `ArticleHero` and the `--color-bg-hero` tokens).
 */
const HERO_GRADIENT = 'linear-gradient(160deg, #1a0a2e 0%, #2d1b69 55%, #1a0a2e 100%)';
const CARD_OVERLAY =
  'linear-gradient(180deg, rgba(26, 10, 46, 0.15) 0%, rgba(26, 10, 46, 0.55) 55%, rgba(26, 10, 46, 0.9) 100%)';
const CREAM = '#f9f7f2';
const CREAM_MUTED = 'rgba(249, 247, 242, 0.72)';

// Decorative star positions — purely visual, no logic.
const DECORATIVE_STARS = [
  { top: '22%', left: '12%', size: 3, delay: '0s', duration: '2.8s' },
  { top: '34%', left: '88%', size: 2, delay: '0.6s', duration: '3.2s' },
  { top: '68%', left: '8%', size: 2, delay: '1s', duration: '2.5s' },
  { top: '28%', left: '64%', size: 2, delay: '1.3s', duration: '3.4s' },
];

const IMAGE_BASE = '/images/enciclopedia';

const ENCYCLOPEDIA_SECTIONS: SectionConfig[] = [
  {
    id: 'tarot',
    title: 'Tarot',
    description:
      'Explora las 78 cartas del tarot y descubre sus significados, simbolismo y guía para lecturas.',
    href: ROUTES.ENCICLOPEDIA_TAROT,
    linkTestId: 'encyclopedia-link-tarot',
    sectionTestId: 'encyclopedia-section-tarot',
    image: {
      src: `${IMAGE_BASE}/hub-tarot.webp`,
      alt: 'Cartas de tarot iluminadas con resplandor dorado sobre un fondo místico violeta',
    },
  },
  {
    id: 'astrologia',
    title: 'Astrología',
    description: 'Conoce los 12 signos zodiacales, los planetas y las casas astrales del zodiaco.',
    href: ROUTES.ENCICLOPEDIA_ASTROLOGIA,
    linkTestId: 'encyclopedia-link-astrologia',
    sectionTestId: 'encyclopedia-section-astrologia',
    image: {
      src: `${IMAGE_BASE}/hub-astrologia.webp`,
      alt: 'Rueda zodiacal y constelaciones doradas en un cielo nocturno índigo',
    },
  },
  {
    id: 'guias',
    title: 'Guías',
    description:
      'Aprende con nuestras guías sobre numerología, péndulo, carta astral, rituales y más.',
    href: ROUTES.ENCICLOPEDIA_GUIAS,
    linkTestId: 'encyclopedia-link-guias',
    sectionTestId: 'encyclopedia-section-guias',
    image: {
      src: `${IMAGE_BASE}/hub-guias.webp`,
      alt: 'Libro abierto antiguo rodeado de símbolos esotéricos dorados y luz etérea',
    },
  },
];

// ─── Sub-components ─────────────────────────────────────────────────────────────

/**
 * SectionCard
 *
 * Editorial card for a hub section: themed brand image with a legibility
 * overlay, gold title and CTA. Hover triggers a coherent micro-interaction
 * (image zoom + gold glow) via the `group` utility.
 */
function SectionCard({ section }: { section: SectionConfig }) {
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
        {/* Imagen temática de marca */}
        <Image
          src={section.image.src}
          alt={section.image.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Overlay de legibilidad */}
        <div className="absolute inset-0" style={{ background: CARD_OVERLAY }} aria-hidden="true" />

        {/* Glow dorado en hover */}
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ boxShadow: 'inset 0 0 60px 0 rgba(214, 158, 46, 0.35)' }}
          aria-hidden="true"
        />

        {/* Contenido */}
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

        {/* Filete dorado inferior */}
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
 * EnciclopediaHubContent
 *
 * Hub principal de la Enciclopedia. Muestra una banda de cabecera con identidad
 * de marca (gradiente noche + título Cormorant + filete dorado) y las 3 grandes
 * secciones (Tarot, Astrología y Guías) como tarjetas editoriales con imagen
 * temática y micro-interacción de hover (zoom + glow dorado).
 *
 * Reemplaza los emojis del sistema (🃏 ⭐ 📚) por ilustraciones de marca, de modo
 * que el hub se ve idéntico en todos los SO (T-ENC-005 / hallazgo ENC-004).
 */
export function EnciclopediaHubContent() {
  return (
    <div data-testid="encyclopedia-hub" className="container mx-auto px-4 py-8">
      {/* Banda de cabecera con identidad de marca */}
      <header
        data-testid="encyclopedia-hub-hero"
        className="relative mb-10 overflow-hidden rounded-2xl"
        style={{ background: HERO_GRADIENT }}
      >
        {/* Estrellas decorativas */}
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

        {/* Luna creciente decorativa (solo CSS) */}
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

        {/* Contenido */}
        <div className="relative z-10 px-6 py-12 text-center sm:px-10 sm:py-16">
          <h1
            className="font-serif text-4xl leading-tight font-bold sm:text-5xl"
            style={{ color: CREAM }}
          >
            Enciclopedia Mística
          </h1>
          <p
            className="mx-auto mt-4 max-w-xl text-lg leading-relaxed"
            style={{ color: CREAM_MUTED }}
          >
            Explora nuestro completo repositorio de conocimiento esotérico: tarot, astrología y
            guías prácticas.
          </p>
        </div>

        {/* Filete dorado inferior */}
        <div
          className="absolute inset-x-0 bottom-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, transparent, #d69e2e, transparent)' }}
          aria-hidden="true"
        />
      </header>

      {/* Grid de secciones — reveal fade-up escalonado al entrar en viewport */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ENCYCLOPEDIA_SECTIONS.map((section, index) => (
          <Reveal key={section.id} index={index} className="h-full">
            <SectionCard section={section} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
