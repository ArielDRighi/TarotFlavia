import {
  UserPlan,
  UserRole,
  SubscriptionStatus,
} from '../../../modules/users/entities/user.entity';

/**
 * Flavia User Data
 * Default tarotist user for the MVP
 */
export const flaviaUserData = {
  email: 'flavia@tarotflavia.com',
  password: '$2b$10$YourSecureHashHere', // This will be replaced with actual hash in seeder
  name: 'Flavia',
  roles: [UserRole.TAROTIST, UserRole.ADMIN],
  plan: UserPlan.PREMIUM,
  isAdmin: true, // Backward compatibility
  planStartedAt: new Date('2024-01-01'),
  subscriptionStatus: SubscriptionStatus.ACTIVE,
  profilePicture: null,
};
