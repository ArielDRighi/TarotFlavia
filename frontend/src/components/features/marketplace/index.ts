/**
 * Marketplace Components
 *
 * Feature-based components for the tarotista marketplace.
 */

export { BookingCalendar } from './BookingCalendar';
export { BookingPage } from './BookingPage';

export { SessionCard } from './SessionCard';
export type { SessionCardProps } from './SessionCard';

export { TarotistaCard } from './TarotistaCard';
export type { TarotistaCardProps } from './TarotistaCard';

// `ExplorarContent` es el componente de ruta de `/explorar` y NO se exporta acá
// a propósito (mismo criterio que T-SEO-002): el barrel es lo que importa un
// client component, así que exportarlo arrastraría todo el marketplace al grafo
// de una ruta de servidor. La ruta lo importa por su path directo.

export { TarotistasExplorer } from './TarotistasExplorer';
export type { TarotistasExplorerProps } from './TarotistasExplorer';

export { TarotistaProfilePage } from './TarotistaProfilePage';
export type { TarotistaProfilePageProps } from './TarotistaProfilePage';
