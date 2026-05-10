/**
 * Copys canónicos para CTAs de upgrade a Premium.
 *
 * Contextos:
 * - PURCHASE: Compra inicial desde la página de planes / comparativa / prompt de conversión.
 * - LIMIT_REACHED: El usuario alcanzó su límite gratuito (lecturas, cartas diarias, etc.).
 * - UPSELL_SOFT: Upsell suave en banners persistentes o widgets del dashboard.
 */
export const CTA_PREMIUM = {
  /** Página Premium, PlanComparison, PremiumUpgradePrompt, PremiumPreview */
  PURCHASE: 'Comenzar Premium',
  /** UpgradeModal, DailyCardLimitReached, ReadingLimitReached */
  LIMIT_REACHED: 'Mejorar a Premium',
  /** UpgradeBanner, SacredEventsWidget */
  UPSELL_SOFT: 'Upgrade a Premium',
} as const;

export type CtaPremiumKey = keyof typeof CTA_PREMIUM;
