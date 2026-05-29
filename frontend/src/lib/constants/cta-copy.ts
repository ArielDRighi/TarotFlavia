/**
 * Textos canónicos para CTAs de upgrade a Premium.
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

/**
 * Textos canónicos para CTAs de autenticación.
 *
 * Contextos:
 * - LOGIN: Entrada a la app (header, formularios).
 * - REGISTER: Submit del formulario de registro y links de navegación.
 * - REGISTER_CONVERSION: CTA de conversión en páginas públicas (resultado gratis, lectura compartida).
 */
export const CTA_AUTH = {
  /** Header UserMenu, links de navegación */
  LOGIN: 'Iniciar sesión',
  /** Submit del RegisterForm, UserMenu unauthenticated */
  REGISTER: 'Crear cuenta',
  /** Páginas públicas de conversión (compartida, resultado free) */
  REGISTER_CONVERSION: 'Crear cuenta gratis',
} as const;

export type CtaAuthKey = keyof typeof CTA_AUTH;
