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
export type { User, UserProfile, UserPreferences, UserRole } from './user.types';

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
  CreateReadingDto,
  PaginatedReadings,
  PaginationMeta,
  ShareReadingResponse,
  Interpretation,
  CardInterpretation,
  ReadingFilters,
  DailyReading,
  DailyReadingCard,
  PaginatedDailyReadings,
} from './reading.types';

// Tarotista Types
export type { Tarotista, TarotistaReview, TarotistaFilters, BookingSlot } from './tarotista.types';
