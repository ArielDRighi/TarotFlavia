'use client';

import {
  CARD_TEXT_SECTIONS,
  DEFAULT_CARD_SECTION_ORDER,
} from '@/lib/constants/card-content-sections.data';
import type { CardSectionKey } from '@/lib/constants/card-content-sections.data';
// Solo tipos: el módulo con el contenido de las 22 fichas no debe entrar al
// bundle del cliente (T-SEO-020). La ruta lo resuelve en el servidor.
import type { MajorArcanaExtras } from '@/lib/constants/major-arcana-extras.data';
import { splitParagraphs } from '@/lib/utils/text';
import type { CardDetail } from '@/types/encyclopedia.types';

import { CardCombinations } from './CardCombinations';
import { CardContentSection } from './CardContentSection';
import { CardDetailHero } from './CardDetailHero';
import { CardIconography } from './CardIconography';
import { CardKeywords } from './CardKeywords';
import { CardMeaning } from './CardMeaning';
import { CardMetadata } from './CardMetadata';
import { CardNavigation } from './CardNavigation';
import { CardReadingCase } from './CardReadingCase';
import { RelatedCards } from './RelatedCards';
import { AuthorByline } from '@/components/common/AuthorByline';
import { ContentDisclaimer } from '@/components/common/ContentDisclaimer';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CardDetailViewProps {
  card: CardDetail;
  /**
   * Nombres en español de las cartas que aparecen en `card.combinations`,
   * resueltos en el servidor por la ruta (T-SEO-010). Sin esto el texto de los
   * cross-links no viajaría en el HTML que ve el crawler.
   */
  combinationCardNames?: Record<string, string>;
  /**
   * Contenido extra de los 22 Arcanos Mayores (T-SEO-020): sección Invertida,
   * mini-caso de tirada, nota iconográfica y el orden propio de secciones.
   * `undefined` para los 56 menores, que conservan el orden base.
   */
  majorArcanaExtras?: MajorArcanaExtras;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CardDetailView({
  card,
  combinationCardNames,
  majorArcanaExtras,
}: CardDetailViewProps) {
  const descriptionParagraphs = splitParagraphs(card.description);
  const sectionOrder = majorArcanaExtras?.sectionOrder ?? DEFAULT_CARD_SECTION_ORDER;

  /**
   * Una sección del cuerpo, por clave. Las tres nuevas solo existen si hay
   * extras; las de texto degradan solas si el campo no vino en la respuesta.
   */
  function renderSection(key: CardSectionKey) {
    switch (key) {
      case 'reversed':
        return majorArcanaExtras ? (
          <CardContentSection
            key={key}
            heading={majorArcanaExtras.reversed.heading}
            text={majorArcanaExtras.reversed.paragraphs.join('\n\n')}
            testId="card-section-reversed"
          />
        ) : null;
      case 'readingCase':
        return majorArcanaExtras ? (
          <CardReadingCase key={key} readingCase={majorArcanaExtras.readingCase} />
        ) : null;
      case 'iconography':
        return majorArcanaExtras ? (
          <CardIconography
            key={key}
            imageUrl={card.imageUrl}
            cardName={card.nameEs}
            iconography={majorArcanaExtras.iconography}
          />
        ) : null;
      default: {
        const section = CARD_TEXT_SECTIONS.find((candidate) => candidate.key === key);
        return section ? (
          <CardContentSection
            key={key}
            heading={section.heading}
            text={card[section.key]}
            testId={section.testId}
          />
        ) : null;
      }
    }
  }

  return (
    <div data-testid="card-detail-view" className="mx-auto max-w-3xl space-y-8">
      {/* Hero con imagen de la carta, breadcrumb y chip */}
      <CardDetailHero card={card} />

      {/* Metadata (elemento, planeta, signo, etc.) */}
      <CardMetadata card={card} />

      {/* Descripción narrativa */}
      {descriptionParagraphs.length > 0 && (
        <div data-testid="card-detail-description" className="space-y-4">
          {descriptionParagraphs.map((paragraph, i) => (
            <p key={i} className="leading-relaxed text-gray-700">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {/* Significados */}
      <CardMeaning meaningUpright={card.meaningUpright} meaningReversed={card.meaningReversed} />

      {/* Secciones temáticas (T-SEO-010). Cada una degrada sola si su campo no
          vino en la respuesta: la ficha se puede cargar de a tandas sin dejar
          encabezados vacíos.

          El orden lo decide la carta (T-SEO-020): los 22 mayores traen el suyo,
          con las tres secciones nuevas intercaladas y, en algunas, sin
          "¿Sí o no?"; los 56 menores usan el orden base. */}
      {sectionOrder.map(renderSection)}

      {/* Palabras clave */}
      <CardKeywords keywords={card.keywords} />

      {/* Combinaciones: cross-links internos hacia otras fichas */}
      <CardCombinations combinations={card.combinations} cardNames={combinationCardNames} />

      {/* Firma de autoría (T-SEO-011). Las 78 fichas promedian 676 palabras de
          texto de autor desde T-SEO-009, así que son contenido editorial y no
          datos de referencia: van firmadas, igual que las guías. */}
      <AuthorByline />

      {/* Aviso legal al pie de la ficha (T-SEO-018) */}
      <ContentDisclaimer />

      {/* Cartas relacionadas */}
      <RelatedCards slug={card.slug} />

      {/* Navegación inferior */}
      <CardNavigation slug={card.slug} />
    </div>
  );
}
