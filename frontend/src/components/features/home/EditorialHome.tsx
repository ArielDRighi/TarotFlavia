// 5. Components
import { AboutTeaser } from './AboutTeaser';
import { DailyCardSpotlight } from './DailyCardSpotlight';
import { DailyHoroscopeDigest } from './DailyHoroscopeDigest';
import { EditorialHero } from './EditorialHero';
import { EncyclopediaShowcase } from './EncyclopediaShowcase';
import { LatestGuides } from './LatestGuides';
import { ServicesStrip } from './ServicesStrip';
// 6. Utils & types
import type { EditorialHomeData } from '@/types/home.types';

/**
 * Portada editorial para el visitante sin sesión (T-SEO-014).
 *
 * Reemplaza a `LandingPage` (hero de producto, tabla de planes, "3 pasos",
 * beneficios Premium): la causa n.º 1 del tercer rechazo de AdSense era que la
 * raíz del sitio se leía como app comercial. Estructura acordada:
 *
 * 1. Hero de publicación (`h1` único)
 * 2. Horóscopo de hoy — 12 signos con extracto, en el HTML
 * 3. Carta del día — imagen + interpretación
 * 4. Últimas guías
 * 5. Explorá la enciclopedia — con los números a la vista
 * 6. Quiénes somos
 * 7. Franja discreta de servicios
 *
 * El disclaimer del footer es de T-SEO-018. `UserDashboard` (usuario logueado)
 * no cambia: ahí y en `/premium` vive el upsell.
 *
 * Los datos llegan resueltos del servidor (`getEditorialHomeData`); este
 * componente no hace fetch ni tiene estado, así el HTML inicial y la
 * hidratación son idénticos.
 */
export interface EditorialHomeProps {
  data: EditorialHomeData;
}

export function EditorialHome({ data }: EditorialHomeProps) {
  return (
    <main data-testid="editorial-home" className="min-h-screen">
      <EditorialHero />
      <DailyHoroscopeDigest daily={data.dailyHoroscopes} />
      <DailyCardSpotlight dailyCard={data.dailyCard} />
      <LatestGuides guides={data.latestGuides} />
      <EncyclopediaShowcase />
      <AboutTeaser />
      <ServicesStrip />
    </main>
  );
}
