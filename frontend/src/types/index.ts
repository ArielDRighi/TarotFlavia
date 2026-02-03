/**
 * Global Types Exports
 */

// API Types
export type { ApiResponse, PaginatedResponse, ApiError, PaginationParams } from './api.types';

// Auth Types
export type {
  AuthUser,
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  LoginResponse,
  RegisterResponse,
  AuthActions,
  AuthStore,
} from './auth.types';

// User Types
export type {
  User,
  UserProfile,
  UserRole,
  UserPlan,
  UpdateProfileDto,
  UpdatePasswordDto,
} from './user.types';

// Capabilities Types
export type { FeatureLimit, UserCapabilities } from './capabilities.types';

// Reading Types
export type {
  Category,
  PredefinedQuestion,
  Spread,
  SpreadPosition,
  Reading,
  ReadingCard,
  ReadingDetail,
  TrashedReading,
  CardPositionDto,
  CreateReadingDto,
  PaginatedReadings,
  PaginationMeta,
  ShareReadingResponse,
  ShareTextResponse,
  SharedReading,
  CardPosition,
  DeckInfo,
  CategoryInfo,
  PredefinedQuestionInfo,
  TarotCardBasic,
  Interpretation,
  CardInterpretation,
  ReadingFilters,
  TarotCard,
  DailyReading,
  DailyReadingHistoryItem,
  PaginatedDailyReadings,
} from './reading.types';

// Tarotista Types
export type {
  Tarotista,
  TarotistaDetail,
  TarotistaReview,
  TarotistaFilters,
  PaginatedTarotistas,
  BookingSlot,
} from './tarotista.types';

// Session Types
export type {
  TimeSlot,
  SessionStatus,
  SessionType,
  PaymentStatus,
  Session,
  SessionDetail,
  TarotistaSummary,
  BookSessionDto,
  CancelSessionDto,
} from './session.types';

// Platform Metrics Types
export type {
  PlatformMetricsQueryDto,
  TarotistaMetricsDto,
  PlatformMetricsDto,
  PeriodOption,
  MetricCard,
  ChartDataPoint,
  TopTarotistaRow,
} from './platform-metrics.types';
export { MetricsPeriod } from './platform-metrics.types';

// Subscription Types
export type {
  SubscriptionType,
  SubscriptionStatus,
  UserTarotistaSubscription,
  SubscriptionInfo,
  SetFavoriteTarotistaDto,
  SetFavoriteTarotistaResponse,
} from './subscription.types';

// Horoscope Types
export type {
  DailyHoroscope,
  HoroscopeArea,
  HoroscopeAreas,
  ZodiacSignInfo,
} from './horoscope.types';
export { ZodiacSign } from './horoscope.types';

// Chinese Horoscope Types
export type {
  ChineseHoroscope,
  ChineseHoroscopeArea,
  ChineseHoroscopeLucky,
  ChineseZodiacInfo,
  ChineseZodiacElement,
  CalculateAnimalResponse,
} from './chinese-horoscope.types';
export { ChineseZodiacAnimal } from './chinese-horoscope.types';

// Numerology Types
export type {
  NumberDetailDto,
  NumerologyResponseDto,
  NumerologyInterpretationResponseDto,
  NumerologyMeaning,
  DayNumberResponse,
  CalculateNumerologyRequest,
  CompatibilityLevel,
  Compatibility,
} from './numerology.types';

// Ritual Types
export type {
  RitualMaterial,
  RitualStep,
  RitualSummary,
  RitualDetail,
  LunarInfo,
  RitualHistoryEntry,
  UserRitualStats,
  RitualFilters,
  CompleteRitualRequest,
  RitualRecommendation,
  RitualRecommendationsResponse,
  RecommendationPattern,
} from './ritual.types';
export {
  RitualCategory,
  RitualDifficulty,
  LunarPhase,
  MaterialType,
  CATEGORY_INFO,
  DIFFICULTY_INFO,
  LUNAR_PHASE_INFO,
} from './ritual.types';

// Sacred Calendar Types
export type { SacredEvent, SacredCalendarFilters } from './sacred-calendar.types';
export {
  SacredEventType,
  ImportanceLevel,
  EVENT_TYPE_INFO,
  IMPORTANCE_INFO,
} from './sacred-calendar.types';
