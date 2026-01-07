/**
 * Authentication Types
 */

/**
 * Authenticated user information
 */
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  roles: string[];
  plan: string;
  /** @deprecated Use dailyCardCount and tarotReadingsCount instead */
  dailyReadingsCount: number;
  /** @deprecated Use dailyCardLimit and tarotReadingsLimit instead */
  dailyReadingsLimit: number;
  /** Number of daily cards used today */
  dailyCardCount: number;
  /** Maximum daily cards allowed by plan */
  dailyCardLimit: number;
  /** Number of tarot readings used today */
  tarotReadingsCount: number;
  /** Maximum tarot readings allowed by plan */
  tarotReadingsLimit: number;
}

/**
 * Authentication state
 */
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Internal flag to track if Zustand has hydrated from localStorage */
  _hasHydrated: boolean;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Register credentials
 */
export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

/**
 * Login response from API
 */
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

/**
 * Register response from API
 */
export interface RegisterResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
  isNewUser: boolean;
}

/**
 * Authentication actions for the store
 */
export interface AuthActions {
  setUser: (user: AuthUser | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<RegisterResponse>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setHasHydrated: (state: boolean) => void;
}

/**
 * Complete auth store type
 */
export type AuthStore = AuthState & AuthActions;
