/**
 * User Types
 */

/**
 * User roles matching backend enum values
 * Backend: UserRole enum with lowercase values
 */
export type UserRole = 'consumer' | 'tarotist' | 'admin';

/**
 * User plan types matching backend enum
 * Backend: UserPlan enum
 * UPDATED: 'guest' -> 'anonymous', removed 'professional'
 */
export type UserPlan = 'anonymous' | 'free' | 'premium';

/**
 * User entity from backend
 */
export interface User {
  id: number;
  email: string;
  name: string;
  roles: UserRole[];
  plan: UserPlan;
  profilePicture?: string;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * User profile response (includes usage stats)
 * Note: dailyReadingsCount and dailyReadingsLimit are calculated at runtime
 * based on user's plan and current usage, not stored in User entity
 */
export interface UserProfile extends User {
  dailyReadingsCount: number;
  dailyReadingsLimit: number;
}

/**
 * DTO for updating user profile
 */
export interface UpdateProfileDto {
  name?: string;
  email?: string;
  password?: string;
  profilePicture?: string;
}

/**
 * DTO for updating user password
 */
export interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
}
