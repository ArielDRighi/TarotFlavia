// Enums
export enum RitualCategory {
  TAROT = 'tarot',
  LUNAR = 'lunar',
  CLEANSING = 'cleansing',
  MEDITATION = 'meditation',
  PROTECTION = 'protection',
  ABUNDANCE = 'abundance',
  LOVE = 'love',
  HEALING = 'healing',
}

export enum RitualDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum LunarPhase {
  NEW_MOON = 'new_moon',
  WAXING_CRESCENT = 'waxing_crescent',
  FIRST_QUARTER = 'first_quarter',
  WAXING_GIBBOUS = 'waxing_gibbous',
  FULL_MOON = 'full_moon',
  WANING_GIBBOUS = 'waning_gibbous',
  LAST_QUARTER = 'last_quarter',
  WANING_CRESCENT = 'waning_crescent',
}

export enum MaterialType {
  REQUIRED = 'required',
  OPTIONAL = 'optional',
  ALTERNATIVE = 'alternative',
}

// Interfaces
export interface RitualMaterial {
  id: number;
  name: string;
  description: string | null;
  type: MaterialType;
  alternative: string | null;
  quantity: number;
  unit: string | null;
}

export interface RitualStep {
  id: number;
  stepNumber: number;
  title: string;
  description: string;
  durationSeconds: number | null;
  imageUrl: string | null;
  mantra: string | null;
  visualization: string | null;
}

export interface RitualSummary {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: RitualCategory;
  difficulty: RitualDifficulty;
  durationMinutes: number;
  bestLunarPhase: LunarPhase | null;
  imageUrl: string;
  materialsCount: number;
  stepsCount: number;
}

export interface RitualDetail extends RitualSummary {
  bestTimeOfDay: string | null;
  purpose: string | null;
  preparation: string | null;
  closing: string | null;
  tips: string[] | null;
  audioUrl: string | null;
  materials: RitualMaterial[];
  steps: RitualStep[];
  completionCount: number;
}

export interface LunarInfo {
  phase: LunarPhase;
  phaseName: string;
  illumination: number;
  zodiacSign: string;
  isGoodFor: string[];
}

export interface RitualHistoryEntry {
  id: number;
  ritual: {
    id: number;
    slug: string;
    title: string;
    category: RitualCategory;
  };
  completedAt: string;
  lunarPhase: LunarPhase | null;
  lunarSign: string | null;
  notes: string | null;
  rating: number | null;
  durationMinutes: number | null;
}

export interface UserRitualStats {
  totalCompleted: number;
  favoriteCategory: RitualCategory | null;
  currentStreak: number;
  thisMonthCount: number;
}

export interface RitualFilters {
  category?: RitualCategory;
  difficulty?: RitualDifficulty;
  lunarPhase?: LunarPhase;
  search?: string;
}

export interface CompleteRitualRequest {
  notes?: string;
  rating?: number;
  durationMinutes?: number;
}

// Helpers de UI
export const CATEGORY_INFO: Record<
  RitualCategory,
  {
    name: string;
    icon: string;
    color: string;
  }
> = {
  [RitualCategory.TAROT]: {
    name: 'Tarot',
    icon: '🎴',
    color: 'text-purple-500',
  },
  [RitualCategory.LUNAR]: {
    name: 'Lunar',
    icon: '🌙',
    color: 'text-blue-400',
  },
  [RitualCategory.CLEANSING]: {
    name: 'Limpieza',
    icon: '✨',
    color: 'text-cyan-500',
  },
  [RitualCategory.MEDITATION]: {
    name: 'Meditación',
    icon: '🧘',
    color: 'text-indigo-500',
  },
  [RitualCategory.PROTECTION]: {
    name: 'Protección',
    icon: '🛡️',
    color: 'text-amber-500',
  },
  [RitualCategory.ABUNDANCE]: {
    name: 'Abundancia',
    icon: '💰',
    color: 'text-green-500',
  },
  [RitualCategory.LOVE]: { name: 'Amor', icon: '💕', color: 'text-pink-500' },
  [RitualCategory.HEALING]: {
    name: 'Sanación',
    icon: '💚',
    color: 'text-emerald-500',
  },
};

export const DIFFICULTY_INFO: Record<
  RitualDifficulty,
  {
    name: string;
    color: string;
  }
> = {
  [RitualDifficulty.BEGINNER]: {
    name: 'Principiante',
    color: 'text-green-500',
  },
  [RitualDifficulty.INTERMEDIATE]: {
    name: 'Intermedio',
    color: 'text-yellow-500',
  },
  [RitualDifficulty.ADVANCED]: { name: 'Avanzado', color: 'text-red-500' },
};

export const LUNAR_PHASE_INFO: Record<
  LunarPhase,
  {
    name: string;
    icon: string;
  }
> = {
  [LunarPhase.NEW_MOON]: { name: 'Luna Nueva', icon: '🌑' },
  [LunarPhase.WAXING_CRESCENT]: {
    name: 'Luna Creciente',
    icon: '🌒',
  },
  [LunarPhase.FIRST_QUARTER]: {
    name: 'Cuarto Creciente',
    icon: '🌓',
  },
  [LunarPhase.WAXING_GIBBOUS]: {
    name: 'Gibosa Creciente',
    icon: '🌔',
  },
  [LunarPhase.FULL_MOON]: { name: 'Luna Llena', icon: '🌕' },
  [LunarPhase.WANING_GIBBOUS]: {
    name: 'Gibosa Menguante',
    icon: '🌖',
  },
  [LunarPhase.LAST_QUARTER]: {
    name: 'Cuarto Menguante',
    icon: '🌗',
  },
  [LunarPhase.WANING_CRESCENT]: {
    name: 'Luna Menguante',
    icon: '🌘',
  },
};
