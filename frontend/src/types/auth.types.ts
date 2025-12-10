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
  /** Number of readings used today (for limit tracking) */
  dailyReadingsCount: number;
  /** Maximum daily readings allowed by plan */
  dailyReadingsLimit: number;
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
 * Authentication actions for the store
 */
export interface AuthActions {
  setUser: (user: AuthUser | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setHasHydrated: (state: boolean) => void;
}

/**
 * Complete auth store type
 */
export type AuthStore = AuthState & AuthActions;
