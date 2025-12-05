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
}

/**
 * Authentication state
 */
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
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
  logout: () => void;
  checkAuth: () => Promise<void>;
}

/**
 * Complete auth store type
 */
export type AuthStore = AuthState & AuthActions;
