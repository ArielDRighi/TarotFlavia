/**
 * Premium Benefits — Fuente única de verdad
 *
 * Esta es la ÚNICA fuente de beneficios/planes consumida por todos los puntos de
 * venta (página `/premium`, comparativa del home, modales de upsell y prompts de
 * conversión). Cada dato refleja la implementación real del backend; ver la tabla
 * de "números reales" en `docs/BACKLOG_FEEDBACK_UX_2026_07.md` (FBK-004).
 *
 * ⚠️ No dupliques estos datos en componentes. Si un plan cambia, se edita acá.
 *
 * Números reales validados contra el backend:
 * - Tiradas de tarot: FREE 1/día (tiradas de 1 y 3 cartas) · PREMIUM 3/día (todas).
 * - Tiradas premium-only: SOLO 5 cartas y Cruz Céltica (la de 3 cartas es FREE).
 * - Carta astral: FREE ilimitada · PREMIUM ilimitada; el diferenciador Premium es
 *   el resumen personalizado (síntesis con IA), exclusivo de Premium — Free no tiene
 *   IA (ver FBK-004 y T-FBK-009).
 * - Péndulo: FREE 1/día · PREMIUM 3/día.
 * - Historial: FREE 30 días · PREMIUM 365 días.
 * - NO existen: Oráculo, regeneración como feature comercial, tiradas
 *   "Herradura/Año completo", estadísticas, publicidad ni acceso prioritario.
 */

// ============================================================================
// Matriz de planes (fuente de las tablas comparativas)
// ============================================================================

/**
 * Valor de una celda de la comparativa:
 * - `true`  → incluido, sin matiz de cantidad.
 * - `false` → no incluido.
 * - `string` → incluido, con un matiz (ej. "3 por día", "365 días").
 */
export type PlanCell = boolean | string;

export interface PlanMatrixRow {
  /** Clave estable para keys de React y tests. */
  readonly key: string;
  /** Nombre de la característica (columna izquierda de la comparativa). */
  readonly feature: string;
  /** Disponibilidad para visitantes sin registro (plan anónimo). */
  readonly anonymous: PlanCell;
  /** Disponibilidad para el plan Free. */
  readonly free: PlanCell;
  /** Disponibilidad para el plan Premium. */
  readonly premium: PlanCell;
}

export const PLAN_MATRIX: readonly PlanMatrixRow[] = [
  {
    key: 'daily-card',
    feature: 'Carta del día',
    anonymous: true,
    free: true,
    premium: 'Con interpretación personalizada',
  },
  {
    key: 'tarot-readings',
    feature: 'Lecturas de tarot',
    anonymous: false,
    free: '1 por día (1 y 3 cartas)',
    premium: '3 por día',
  },
  {
    key: 'advanced-spreads',
    feature: 'Tiradas de 5 cartas y Cruz Céltica',
    anonymous: false,
    free: false,
    premium: true,
  },
  {
    key: 'personalized-interpretation',
    feature: 'Interpretación personalizada',
    anonymous: false,
    free: false,
    premium: true,
  },
  {
    key: 'custom-questions',
    feature: 'Preguntas personalizadas',
    anonymous: false,
    free: false,
    premium: true,
  },
  {
    key: 'horoscope-numerology',
    feature: 'Horóscopo y numerología',
    anonymous: true,
    free: true,
    premium: true,
  },
  {
    key: 'birth-chart',
    feature: 'Carta astral',
    anonymous: '1 carta',
    free: 'Ilimitada',
    premium: 'Ilimitada con resumen personalizado',
  },
  {
    key: 'pendulum',
    feature: 'Consultas de péndulo',
    anonymous: '1 consulta',
    free: '1 por día',
    premium: '3 por día',
  },
  {
    key: 'rituals-encyclopedia',
    feature: 'Rituales y enciclopedia',
    anonymous: true,
    free: true,
    premium: true,
  },
  {
    key: 'share-readings',
    feature: 'Compartir lecturas',
    anonymous: false,
    free: true,
    premium: true,
  },
  {
    key: 'history',
    feature: 'Historial de lecturas',
    anonymous: false,
    free: '30 días',
    premium: '365 días',
  },
] as const;

// ============================================================================
// Listas de beneficios (callouts de upsell con icono)
// ============================================================================

export interface PremiumBenefit {
  readonly icon: string;
  readonly text: string;
}

export interface PremiumBenefits {
  readonly readings: readonly PremiumBenefit[];
  readonly rituals: readonly PremiumBenefit[];
  readonly general: readonly PremiumBenefit[];
}

/**
 * Beneficios de Premium agrupados por dominio, con icono de Lucide.
 * Usado por los callouts extensos (ej. `DailyCardLimitReached`). Todos los textos
 * están alineados con `PLAN_MATRIX`.
 */
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
  ],
  general: [
    {
      icon: 'Star',
      text: 'Carta astral con resumen personalizado',
    },
    {
      icon: 'CalendarClock',
      text: 'Historial de 365 días',
    },
    {
      icon: 'Brain',
      text: 'Interpretaciones personalizadas y profundas',
    },
  ],
} as const;

export interface PremiumHomeBenefit {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

/**
 * Tarjetas de la sección "¿Por qué elegir Premium?" del home. Cada tarjeta tiene
 * una contraparte real en la implementación (ver `PLAN_MATRIX`). No incluye
 * promesas sin sustento (publicidad, acceso prioritario, estadísticas, etc.).
 */
export const PREMIUM_HOME_BENEFITS: readonly PremiumHomeBenefit[] = [
  {
    icon: 'Sparkles',
    title: 'Interpretaciones profundas y personalizadas',
    description: 'Análisis detallados adaptados a tu situación y a las cartas que elegiste.',
  },
  {
    icon: 'Layers',
    title: 'Todas las tiradas disponibles',
    description: 'Sumá las tiradas de 5 cartas y la Cruz Céltica a las de 1 y 3 cartas.',
  },
  {
    icon: 'MessageSquare',
    title: 'Preguntas personalizadas',
    description: 'Formulá tus propias consultas para lecturas más precisas.',
  },
  {
    icon: 'Star',
    title: 'Carta astral con resumen personalizado',
    description: 'Tu carta natal con una síntesis personalizada, exclusiva de Premium.',
  },
  {
    icon: 'CalendarClock',
    title: 'Historial de 365 días',
    description: 'Conservá y revisá tus lecturas durante todo un año.',
  },
  {
    icon: 'TrendingUp',
    title: '3 lecturas de tarot por día',
    description: 'Triplicá tu límite diario de lecturas respecto del plan gratuito.',
  },
] as const;

export interface PremiumModalBenefit {
  readonly icon: string;
  readonly text: string;
  readonly description: string;
}

/**
 * Beneficios con descripción para el modal persuasivo `UpgradeModal`.
 * Cada ítem tiene contraparte real (ver `PLAN_MATRIX`).
 */
export const PREMIUM_MODAL_BENEFITS: readonly PremiumModalBenefit[] = [
  {
    icon: 'Sparkles',
    text: 'Interpretaciones personalizadas y profundas',
    description: 'Análisis profundos adaptados a tu situación',
  },
  {
    icon: 'TrendingUp',
    text: 'Todas las tiradas disponibles',
    description: 'Incluye la tirada de 5 cartas y la Cruz Céltica',
  },
  {
    icon: 'MessageCircle',
    text: 'Preguntas personalizadas',
    description: 'Crea tus propias preguntas para lecturas únicas',
  },
  {
    icon: 'Star',
    text: 'Carta astral con resumen personalizado',
    description: 'Tu carta natal con una síntesis exclusiva de Premium',
  },
] as const;

/**
 * Lista corta y plana de los diferenciadores clave de Premium.
 * Usada por los modales/prompts compactos de conversión.
 */
export const PREMIUM_UPGRADE_HIGHLIGHTS: readonly string[] = [
  'Interpretaciones personalizadas y profundas',
  '3 lecturas de tarot por día',
  'Todas las tiradas (5 cartas y Cruz Céltica)',
  'Preguntas personalizadas',
] as const;
