// Enums & Literal Types
export type PendulumResponse = 'yes' | 'no' | 'maybe';

export type PendulumMovement = 'vertical' | 'horizontal' | 'circular';

export type PendulumPeriod = 'daily' | 'monthly' | 'lifetime';

// Interfaces
export interface PendulumQueryRequest {
  question?: string;
}

export interface PendulumQueryResponse {
  response: PendulumResponse;
  movement: PendulumMovement;
  responseText: string;
  interpretation: string;
  queryId: number | null;
  lunarPhase: string;
  lunarPhaseName: string;
}

export interface PendulumHistoryItem {
  id: number;
  question: string | null;
  response: PendulumResponse;
  interpretation: string;
  lunarPhase: string;
  createdAt: string;
}

export interface PendulumStats {
  total: number;
  yesCount: number;
  noCount: number;
  maybeCount: number;
}

export interface PendulumCapabilities {
  used: number;
  limit: number;
  canUse: boolean;
  resetAt: string | null;
  period: PendulumPeriod;
}

// Helper Constants
export const PENDULUM_RESPONSE_CONFIG = {
  yes: {
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    label: 'Sí',
  },
  no: {
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    label: 'No',
  },
  maybe: {
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    label: 'Quizás',
  },
} as const;

export const PENDULUM_MOVEMENT_CONFIG = {
  vertical: {
    label: 'Vertical',
    description: 'Oscilación adelante-atrás',
  },
  horizontal: {
    label: 'Horizontal',
    description: 'Oscilación izquierda-derecha',
  },
  circular: {
    label: 'Circular',
    description: 'Movimiento circular',
  },
} as const;
