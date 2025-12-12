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
  Session,
  SessionDetail,
  BookSessionDto,
} from './session.types';
