// 5. Components
import { ArticleCard } from '@/components/features/encyclopedia/ArticleCard';
import { HomeSectionHeader } from './HomeSectionHeader';
// 6. Utils & types
import { GUIDES_CATALOG_LIST, getGuideTheme } from '@/lib/constants/guides-catalog.data';
import { HOME_EDITORIAL } from '@/lib/constants/home-editorial.data';
import type { ArticleCardData } from '@/components/features/encyclopedia/ArticleCard';
import type { ArticleSummary } from '@/types/encyclopedia-article.types';

/**
 * Últimas guías de la portada (T-SEO-014).
 *
 * Reutiliza `ArticleCard` de la enciclopedia: título, categoría y extracto con
 * enlace a la guía. Sin fecha ni byline: la API no expone fecha de edición de
 * las guías (T-SEO-017 lo confirmó) y mostrar `new Date()` sería inventarla.
 *
 * Desde T-SEO-022 cada tarjeta lleva la miniatura de su categoría
 * (`guia-*-hero.webp`, la misma del listado) y **no hay estado vacío**: si la
 * API no responde durante el ISR, la portada cae a las siete guías del
 * catálogo estático (título, extracto y miniatura), en vez de mostrarle al
 * revisor una caja punteada con "no se pudieron cargar". El aviso queda en el
 * `console.warn` del servidor (`home-server.ts`).
 */
export interface LatestGuidesProps {
  guides: ArticleSummary[] | undefined;
}

/**
 * Tarjeta de guía con la miniatura del catálogo. A propósito no usa el
 * `imageUrl` de la API: `next/image` optimizado con un host externo (no hay
 * `remotePatterns`) tiraría el render de `/` entera, y los assets
 * `guia-*-hero.webp` son definitivos.
 */
function GuideCard({ guide }: { guide: ArticleCardData }) {
  return <ArticleCard article={guide} thumbnailSrc={getGuideTheme(guide.category).image?.src} />;
}

export function LatestGuides({ guides }: LatestGuidesProps) {
  const copy = HOME_EDITORIAL.guides;
  // Una lista vacía de la API cae al catálogo igual que un `undefined`.
  const apiGuides = guides && guides.length > 0 ? guides : undefined;

  return (
    <section data-testid="home-guides" className="bg-bg-main px-4 py-14 md:py-20">
      <div className="container mx-auto max-w-6xl">
        <HomeSectionHeader copy={copy} />

        {apiGuides ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {apiGuides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        ) : (
          <div
            data-testid="home-guides-fallback"
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {GUIDES_CATALOG_LIST.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
