// 1. React & Next.js
import Image from 'next/image';
import Link from 'next/link';
// 5. Components
import {
  GuideBlock,
  GuideHeader,
  GuideLinks,
  GuideParagraphs,
} from '@/components/common/EditorialGuide';
import { DailyCardExperience } from './DailyCardExperience';
// 6. Utils & types
import { DAILY_CARD_GUIDE } from '@/lib/constants/daily-card-guide.data';
import { ROUTES } from '@/lib/constants/routes';
import { formatDateFull, formatDateFullWithYear } from '@/lib/utils/date';
import { splitParagraphs } from '@/lib/utils/text';
import { ArcanaType, SUIT_INFO } from '@/types/encyclopedia.types';
import type { CardDetail } from '@/types/encyclopedia.types';
import type {
  CanonicalDailyCard,
  DailyCardArchiveEntry,
  DailyCardPageData,
} from '@/types/home.types';

/**
 * `/carta-del-dia` (T-SEO-015).
 *
 * Servía 220 palabras con la plantilla de las otras herramientas. Ahora es el
 * mejor activo del sitio para un revisor: contenido fechado y fresco.
 *
 * 1. **La carta de hoy** — la canónica del sitio (`getCanonicalDailyCard`, la
 *    misma que muestra la portada), con fecha, imagen e interpretación
 *    (significado, amor, trabajo, consejo: ~400–600 palabras cuando la ficha
 *    trae el contenido extendido) y enlace a la ficha completa.
 * 2. **La herramienta** — `DailyCardExperience`, tu propia carta con sorteo por
 *    visitante, usable sin registro como siempre. Queda como componente, no
 *    como página.
 * 3. **Guía permanente** — "Cómo usar la carta del día" (800+ palabras,
 *    `daily-card-guide.data.ts`).
 * 4. **Archivo** — la carta canónica de cada uno de los últimos 30 días.
 *
 * Server Component: sólo la herramienta es cliente. Sin `ServiceIntro`: la
 * teoría vive en la enciclopedia, enlazada desde la ficha y desde el pie de la
 * guía.
 */
export interface DailyCardPageProps {
  data: DailyCardPageData;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** "Arcano mayor · VII" o "Arcano menor · Copas", según la carta. */
function arcanaLabel(card: CardDetail): string {
  if (card.arcanaType === ArcanaType.MAJOR) {
    return `Arcano mayor${card.romanNumeral ? ` · ${card.romanNumeral}` : ''}`;
  }
  return `Arcano menor${card.suit ? ` · ${SUIT_INFO[card.suit].nameEs}` : ''}`;
}

/** Un campo de la ficha (puede traer varios párrafos separados por línea en blanco). */
function Paragraphs({ text, className }: { text: string; className?: string }) {
  return <GuideParagraphs paragraphs={splitParagraphs(text)} className={className} />;
}

function TodayCardSection({ today }: { today: CanonicalDailyCard | undefined }) {
  if (!today) {
    return (
      <section data-testid="daily-card-today" className="mb-14">
        <p
          data-testid="daily-card-today-empty"
          className="text-text-muted border-border rounded-xl border border-dashed p-6 font-sans leading-relaxed"
        >
          La carta de hoy no se pudo cargar. Podés sacar la tuya con la herramienta de abajo o
          recorrer{' '}
          <Link
            href={ROUTES.ENCICLOPEDIA_TAROT}
            className="text-primary underline-offset-4 hover:underline"
          >
            las 78 cartas de la enciclopedia
          </Link>
          .
        </p>
      </section>
    );
  }

  const { card, canonicalDate } = today;

  return (
    <section data-testid="daily-card-today" className="mb-14">
      <article className="grid items-start gap-8 md:grid-cols-[minmax(0,260px)_1fr] md:gap-12">
        <div className="relative mx-auto aspect-[2/3] w-full max-w-[260px] overflow-hidden rounded-xl shadow-lg">
          <Image
            src={card.imageUrl}
            alt={`Carta ${card.nameEs} del tarot Rider-Waite`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 60vw, 260px"
            priority
          />
        </div>

        <div className="space-y-5">
          <p className="text-text-muted font-sans text-sm">
            La carta de hoy ·{' '}
            <time data-testid="daily-card-today-date" dateTime={canonicalDate}>
              {formatDateFullWithYear(canonicalDate)}
            </time>
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            {arcanaLabel(card)}
          </p>
          <h2 className="text-text-primary font-serif text-3xl font-semibold md:text-4xl">
            {card.nameEs}
          </h2>

          {card.description && (
            <Paragraphs
              text={card.description}
              className="text-text-muted font-sans leading-relaxed"
            />
          )}

          <Paragraphs
            text={card.meaningUpright}
            className="text-text-primary font-sans leading-relaxed"
          />

          {card.meaningLove && (
            <div>
              <h3 className="text-text-primary mb-1 font-serif text-lg font-semibold">
                En el amor
              </h3>
              <Paragraphs
                text={card.meaningLove}
                className="text-text-primary font-sans leading-relaxed"
              />
            </div>
          )}

          {card.meaningWork && (
            <div>
              <h3 className="text-text-primary mb-1 font-serif text-lg font-semibold">
                En el trabajo
              </h3>
              <Paragraphs
                text={card.meaningWork}
                className="text-text-primary font-sans leading-relaxed"
              />
            </div>
          )}

          {card.advice && (
            <div className="border-secondary/60 bg-bg-main rounded-lg border-l-4 p-4">
              <h3 className="text-text-muted mb-1 font-sans text-xs font-semibold tracking-wide uppercase">
                Consejo del día
              </h3>
              <Paragraphs
                text={card.advice}
                className="text-text-primary font-sans leading-relaxed"
              />
            </div>
          )}

          <Link
            href={ROUTES.ENCICLOPEDIA_TAROT_CARD(card.slug)}
            className="text-primary inline-block text-sm font-medium underline-offset-4 hover:underline"
          >
            Ver la ficha completa de {card.nameEs} →
          </Link>
        </div>
      </article>
    </section>
  );
}

function DailyCardGuide() {
  const { title, lead, steps, links } = DAILY_CARD_GUIDE;

  return (
    <section data-testid="daily-card-guide" className="mb-14">
      <GuideHeader title={title} lead={lead} className="max-w-3xl" />

      <div className="max-w-3xl space-y-8">
        {steps.map((step) => (
          <GuideBlock key={step.heading} heading={step.heading} paragraphs={step.paragraphs} />
        ))}
      </div>

      <GuideLinks links={links} />
    </section>
  );
}

function DailyCardArchive({ archive }: { archive: DailyCardArchiveEntry[] | undefined }) {
  if (!archive || archive.length === 0) {
    return null;
  }

  return (
    <section data-testid="daily-card-archive">
      <h2 className="text-text-primary mb-3 font-serif text-2xl font-semibold">
        Las cartas de los últimos {archive.length} días
      </h2>
      <p className="text-text-muted mb-6 max-w-3xl font-sans leading-relaxed">
        La carta canónica del sitio, día por día: la misma que mostró la portada. Sirve para releer
        el mes y ver qué cartas y qué palos se repitieron.
      </p>
      <ol className="grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
        {archive.map((entry) => (
          <li key={entry.date} className="flex items-baseline gap-2 font-sans text-sm">
            <time dateTime={entry.date} className="text-text-muted shrink-0 tabular-nums">
              {formatDateFull(entry.date)}
            </time>
            <span aria-hidden="true">·</span>
            <Link
              href={ROUTES.ENCICLOPEDIA_TAROT_CARD(entry.card.slug)}
              className="text-primary underline-offset-4 hover:underline"
            >
              {entry.card.nameEs}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DailyCardPage({ data }: DailyCardPageProps) {
  return (
    <div className="from-bg-main to-primary/5 min-h-screen bg-gradient-to-b">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <header className="mb-10">
          <h1 className="text-text-primary mb-3 font-serif text-4xl font-light md:text-5xl">
            Tarot del día
          </h1>
          <p className="text-text-muted max-w-3xl font-sans leading-relaxed">
            Una carta del tarot para leer la jornada. Arriba, la carta de hoy del sitio con su
            interpretación; después, la herramienta para sacar la tuya —una por día, sin registro—;
            y más abajo, una guía para usarla bien y el archivo de los últimos treinta días.
          </p>
        </header>

        <TodayCardSection today={data.today} />

        <section data-testid="daily-card-tool" className="mb-14">
          <h2 className="text-text-primary mb-2 font-serif text-2xl font-semibold">
            Sacá tu propia carta
          </h2>
          <p className="text-text-muted mb-6 max-w-3xl font-sans leading-relaxed">
            La carta de arriba es la del sitio, la misma para todos. Esta es la tuya: se sortea al
            tocar el mazo y queda guardada con la fecha si tenés cuenta.
          </p>
          <div className="mx-auto flex max-w-2xl flex-col items-center">
            <DailyCardExperience />
          </div>
        </section>

        <DailyCardGuide />

        <DailyCardArchive archive={data.archive} />
      </div>
    </div>
  );
}
