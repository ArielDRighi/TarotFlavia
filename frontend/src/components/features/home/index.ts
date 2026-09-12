export { HomePageContent } from './HomePageContent';
export { EditorialHome } from './EditorialHome';
export { EditorialHero } from './EditorialHero';
export { DailyHoroscopeDigest } from './DailyHoroscopeDigest';
export { DailyCardSpotlight } from './DailyCardSpotlight';
export { LatestGuides } from './LatestGuides';
export { EncyclopediaShowcase } from './EncyclopediaShowcase';
export { AboutTeaser } from './AboutTeaser';
export { ServicesStrip } from './ServicesStrip';

// Secciones de venta que la portada dejó de mostrar (T-SEO-014). Se conservan
// con sus tests porque T-SEO-015 las reubica en `/premium`, que es donde vive
// el upsell junto con el dashboard del usuario logueado. No volver a usarlas
// en la home anónima.
export { PremiumBenefitsSection } from './PremiumBenefitsSection';
export { PlanComparison } from './PlanComparison';
export { HowItWorks } from './HowItWorks';
