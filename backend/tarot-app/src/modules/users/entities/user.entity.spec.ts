import { User, UserPlan, SubscriptionStatus } from './user.entity';

describe('User Entity', () => {
  describe('isPremium', () => {
    it('should return true for active premium user', () => {
      const user = new User();
      user.plan = UserPlan.PREMIUM;
      user.subscriptionStatus = SubscriptionStatus.ACTIVE;
      user.planExpiresAt = new Date(Date.now() + 86400000); // Tomorrow

      expect(user.isPremium()).toBe(true);
    });

    it('should return false for free user', () => {
      const user = new User();
      user.plan = UserPlan.FREE;

      expect(user.isPremium()).toBe(false);
    });

    it('should return false for premium user with expired subscription', () => {
      const user = new User();
      user.plan = UserPlan.PREMIUM;
      user.subscriptionStatus = SubscriptionStatus.EXPIRED;
      user.planExpiresAt = new Date(Date.now() - 86400000); // Yesterday

      expect(user.isPremium()).toBe(false);
    });

    it('should return false for premium user with cancelled subscription', () => {
      const user = new User();
      user.plan = UserPlan.PREMIUM;
      user.subscriptionStatus = SubscriptionStatus.CANCELLED;

      expect(user.isPremium()).toBe(false);
    });

    it('should return false for premium user without active status', () => {
      const user = new User();
      user.plan = UserPlan.PREMIUM;

      expect(user.isPremium()).toBe(false);
    });
  });

  describe('hasPlanExpired', () => {
    it('should return true for expired plan date', () => {
      const user = new User();
      user.planExpiresAt = new Date(Date.now() - 86400000); // Yesterday

      expect(user.hasPlanExpired()).toBe(true);
    });

    it('should return false for future plan expiration date', () => {
      const user = new User();
      user.planExpiresAt = new Date(Date.now() + 86400000); // Tomorrow

      expect(user.hasPlanExpired()).toBe(false);
    });

    it('should return false when planExpiresAt is null', () => {
      const user = new User();
      (user.planExpiresAt as unknown) = null;

      expect(user.hasPlanExpired()).toBe(false);
    });

    it('should return false when planExpiresAt is undefined', () => {
      const user = new User();

      expect(user.hasPlanExpired()).toBe(false);
    });
  });
});
