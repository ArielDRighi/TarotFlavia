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
