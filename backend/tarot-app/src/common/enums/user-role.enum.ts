/**
 * User roles enum for authorization system.
 * Supports multiple roles per user.
 */
export enum UserRole {
  /** Usuario final que consume lecturas */
  CONSUMER = 'consumer',
  /** Usuario que ofrece lecturas (tarotista) */
  TAROTIST = 'tarotist',
  /** Administrador del sistema */
  ADMIN = 'admin',
}

/**
 * Helper type for validation
 */
export type UserRoleType = `${UserRole}`;
