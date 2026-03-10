/**
 * Encyclopedia Feature Components
 *
 * This module exports all components related to the Tarot Encyclopedia feature:
 *
 * List components (Tarot cards):
 * - CardThumbnail: Card image thumbnail with badge and link
 * - CardGrid: Responsive grid layout for card thumbnails
 * - CardListItem: Horizontal list item for card display
 * - SuitSelector: Horizontal suit filter buttons
 * - CategoryTabs: Arcana type tab selector
 * - EncyclopediaSearchBar: Search input with debounce (encyclopedia-specific)
 * - EncyclopediaSkeleton: Loading skeleton states
 *
 * Detail components (Tarot cards):
 * - CardDetailView: Full detail view for a single card
 * - CardImage: Card image with zoom modal
 * - CardMeaning: Upright/reversed meanings with tabs
 * - CardKeywords: Keyword badges grouped by orientation
 * - CardMetadata: Card metadata (arcana, element, suit, etc.)
 * - CardNavigation: Previous/next card navigation
 * - RelatedCards: Related cards grid
 *
 * Article components (Astrology & Guides):
 * - ArticleCard: Adaptive card for encyclopedia articles (zodiac, planets, houses, guides)
 * - ArticleGrid: Responsive grid layout for article cards
 * - ArticleSkeleton: Loading skeleton for article grids
 * - AstrologySection: Section hub with 3 astrology sub-sections
 * - GuidesSection: Section hub with 6 guide activity cards
 * - EncyclopediaHome: Full hub page (Tarot + Astrología + Guías)
 *
 * Widget components:
 * - EncyclopediaInfoWidget: Informational snippet widget for embedding in other pages
 */

// Page content components
export { EnciclopediaContent } from './EnciclopediaContent';
export { EnciclopediaHubContent } from './EnciclopediaHubContent';
export { ArticleDetailPageContent } from './ArticleDetailPageContent';
export { ArticleListPageContent } from './ArticleListPageContent';
export { GuiasContent } from './GuiasContent';

// List components
export { CardThumbnail } from './CardThumbnail';
export { CardGrid } from './CardGrid';
export { CardListItem } from './CardListItem';
export { SuitSelector } from './SuitSelector';
export { CategoryTabs } from './CategoryTabs';
export { EncyclopediaSearchBar } from './EncyclopediaSearchBar';
export { EncyclopediaSkeleton } from './EncyclopediaSkeleton';

// Detail components
export { CardDetailView } from './CardDetailView';
export { CardImage } from './CardImage';
export { CardMeaning } from './CardMeaning';
export { CardKeywords } from './CardKeywords';
export { CardMetadata } from './CardMetadata';
export { CardNavigation } from './CardNavigation';
export { RelatedCards } from './RelatedCards';

// Type exports — list components
export type { CardThumbnailProps } from './CardThumbnail';
export type { CardGridProps } from './CardGrid';
export type { CardListItemProps } from './CardListItem';
export type { SuitSelectorProps } from './SuitSelector';
export type { CategoryTabsProps } from './CategoryTabs';
export type { EncyclopediaSearchBarProps } from './EncyclopediaSearchBar';
export type { EncyclopediaSkeletonProps } from './EncyclopediaSkeleton';

// Type exports — detail components
export type { CardDetailViewProps } from './CardDetailView';
export type { CardImageProps } from './CardImage';
export type { CardMeaningProps } from './CardMeaning';
export type { CardKeywordsProps } from './CardKeywords';
export type { CardMetadataProps } from './CardMetadata';
export type { CardNavigationProps } from './CardNavigation';
export type { RelatedCardsProps } from './RelatedCards';

// Widget components
export { EncyclopediaInfoWidget } from './EncyclopediaInfoWidget';
export type { EncyclopediaInfoWidgetProps } from './EncyclopediaInfoWidget';

// Article components (Astrology & Guides)
export { ArticleCard } from './ArticleCard';
export { ArticleGrid } from './ArticleGrid';
export { ArticleSkeleton } from './ArticleSkeleton';
export { AstrologySection } from './AstrologySection';
export { GuidesSection } from './GuidesSection';
export { EncyclopediaHome } from './EncyclopediaHome';

// Type exports — article components
export type { ArticleCardProps } from './ArticleCard';
export type { ArticleGridProps } from './ArticleGrid';
export type { ArticleSkeletonProps } from './ArticleSkeleton';
export type { AstrologySectionProps } from './AstrologySection';
export type { GuidesSectionProps } from './GuidesSection';
export type { EncyclopediaHomeProps } from './EncyclopediaHome';

// Article detail components
export { ArticleDetailView } from './ArticleDetailView';
export type { ArticleDetailViewProps } from './ArticleDetailView';
