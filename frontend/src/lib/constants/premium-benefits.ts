/**
 * Premium Benefits
 *
 * Centralized constants for premium plan benefits displayed in upsell modals.
 * Used across multiple components (DailyCardLimitReached, AnonymousLimitReached, etc.)
 *
 * Structure:
 * - icon: Lucide icon name (string reference)
 * - text: Spanish description of benefit
 */

export interface PremiumBenefit {
  readonly icon: string;
  readonly text: string;
}

export interface PremiumBenefits {
  readonly readings: readonly PremiumBenefit[];
  readonly rituals: readonly PremiumBenefit[];
  readonly general: readonly PremiumBenefit[];
}

export const PREMIUM_BENEFITS: PremiumBenefits = {
  readings: [
    {
      icon: 'Layers',
      text: 'Todas las tiradas (1, 3, 5 cartas y Cruz Céltica)',
    },
    {
      icon: 'Sparkles',
      text: '3 lecturas completas por día',
    },
    {
      icon: 'MessageSquare',
      text: 'Preguntas personalizadas',
    },
  ],
  rituals: [
    {
      icon: 'CalendarHeart',
      text: 'Calendario sagrado completo',
    },
    {
      icon: 'Bell',
      text: 'Notificaciones de eventos cósmicos',
    },
    {
      icon: 'Wand2',
      text: 'Rituales recomendados según tus lecturas',
    },
    {
      icon: 'History',
      text: 'Historial ilimitado de rituales',
    },
  ],
  general: [
    {
      icon: 'CalendarClock',
      text: 'Historial de 365 días',
    },
    {
      icon: 'Brain',
      text: 'Interpretaciones con IA avanzada',
    },
  ],
} as const;
