/**
 * User Types
 */

export type UserRole = 'USER' | 'TAROTISTA' | 'ADMIN';

/**
 * User entity from backend
 */
export interface User {
  id: number;
  email: string;
  name: string;
  roles: UserRole[];
  plan: string;
  profilePicture?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User profile response (includes stats)
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
