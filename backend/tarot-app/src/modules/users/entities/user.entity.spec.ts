import { User, UserPlan, SubscriptionStatus, UserRole } from './user.entity';

describe('User Entity', () => {
  describe('Role Helper Methods', () => {
    describe('hasRole', () => {
      it('should return true when user has the specified role', () => {
        const user = new User();
        user.roles = [UserRole.CONSUMER, UserRole.ADMIN];

        expect(user.hasRole(UserRole.ADMIN)).toBe(true);
      });

      it('should return false when user does not have the specified role', () => {
        const user = new User();
        user.roles = [UserRole.CONSUMER];

        expect(user.hasRole(UserRole.ADMIN)).toBe(false);
      });

      it('should return false when roles array is empty', () => {
        const user = new User();
        user.roles = [];

        expect(user.hasRole(UserRole.CONSUMER)).toBe(false);
      });
    });

    describe('hasAnyRole', () => {
      it('should return true when user has at least one of the specified roles', () => {
        const user = new User();
        user.roles = [UserRole.CONSUMER, UserRole.TAROTIST];

        expect(user.hasAnyRole(UserRole.TAROTIST, UserRole.ADMIN)).toBe(true);
      });

      it('should return false when user has none of the specified roles', () => {
        const user = new User();
        user.roles = [UserRole.CONSUMER];

        expect(user.hasAnyRole(UserRole.TAROTIST, UserRole.ADMIN)).toBe(false);
      });

      it('should return false when roles array is empty', () => {
        const user = new User();
        user.roles = [];

        expect(user.hasAnyRole(UserRole.CONSUMER, UserRole.ADMIN)).toBe(false);
      });
    });

    describe('hasAllRoles', () => {
      it('should return true when user has all specified roles', () => {
        const user = new User();
        user.roles = [UserRole.CONSUMER, UserRole.TAROTIST, UserRole.ADMIN];

        expect(user.hasAllRoles(UserRole.CONSUMER, UserRole.TAROTIST)).toBe(
          true,
        );
      });

      it('should return false when user is missing at least one role', () => {
        const user = new User();
        user.roles = [UserRole.CONSUMER, UserRole.TAROTIST];

        expect(user.hasAllRoles(UserRole.CONSUMER, UserRole.ADMIN)).toBe(false);
      });

      it('should return false when roles array is empty', () => {
        const user = new User();
        user.roles = [];

        expect(user.hasAllRoles(UserRole.CONSUMER)).toBe(false);
      });
    });

    describe('isConsumer', () => {
      it('should return true when user has CONSUMER role', () => {
        const user = new User();
        user.roles = [UserRole.CONSUMER];

        expect(user.isConsumer()).toBe(true);
      });

      it('should return false when user does not have CONSUMER role', () => {
        const user = new User();
        user.roles = [UserRole.ADMIN];

        expect(user.isConsumer()).toBe(false);
      });
    });

    describe('isTarotist', () => {
      it('should return true when user has TAROTIST role', () => {
        const user = new User();
        user.roles = [UserRole.CONSUMER, UserRole.TAROTIST];

        expect(user.isTarotist()).toBe(true);
      });

      it('should return false when user does not have TAROTIST role', () => {
        const user = new User();
        user.roles = [UserRole.CONSUMER];

        expect(user.isTarotist()).toBe(false);
      });
    });

    describe('isAdminRole', () => {
      it('should return true when user has ADMIN role', () => {
        const user = new User();
        user.roles = [UserRole.CONSUMER, UserRole.ADMIN];

        expect(user.isAdminRole()).toBe(true);
      });

      it('should return false when user does not have ADMIN role', () => {
        const user = new User();
        user.roles = [UserRole.CONSUMER];

        expect(user.isAdminRole()).toBe(false);
      });
    });

    describe('isAdminUser getter - Backward Compatibility', () => {
      it('should return true when user has ADMIN role in roles array', () => {
        const user = new User();
        user.roles = [UserRole.CONSUMER, UserRole.ADMIN];
        user.isAdmin = true;

        expect(user.isAdminUser).toBe(true);
      });

      it('should return false when user does not have ADMIN role', () => {
        const user = new User();
        user.roles = [UserRole.CONSUMER];
        user.isAdmin = false;

        expect(user.isAdminUser).toBe(false);
      });

      it('should sync with isAdmin field for backward compatibility', () => {
        const user = new User();
        user.roles = [UserRole.CONSUMER, UserRole.ADMIN];
        user.isAdmin = true;

        expect(user.isAdminUser).toBe(true);
        expect(user.isAdmin).toBe(true);
      });
    });
  });

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

  describe('Ban Status Methods', () => {
    describe('isBanned', () => {
      it('should return true when user has banned_at date', () => {
        const user = new User();
        user.bannedAt = new Date();

        expect(user.isBanned()).toBe(true);
      });

      it('should return false when banned_at is null', () => {
        const user = new User();
        user.bannedAt = null;

        expect(user.isBanned()).toBe(false);
      });

      it('should return false when banned_at is undefined', () => {
        const user = new User();

        expect(user.isBanned()).toBe(false);
      });
    });

    describe('ban', () => {
      it('should set bannedAt date and ban reason', () => {
        const user = new User();
        const reason = 'Violated terms of service';

        user.ban(reason);

        expect(user.bannedAt).toBeInstanceOf(Date);
        expect(user.banReason).toBe(reason);
      });

      it('should set bannedAt date without reason', () => {
        const user = new User();

        user.ban();

        expect(user.bannedAt).toBeInstanceOf(Date);
        expect(user.banReason).toBeNull();
      });
    });

    describe('unban', () => {
      it('should clear bannedAt and banReason', () => {
        const user = new User();
        user.bannedAt = new Date();
        user.banReason = 'Some reason';

        user.unban();

        expect(user.bannedAt).toBeNull();
        expect(user.banReason).toBeNull();
      });

      it('should work even if user was not banned', () => {
        const user = new User();

        user.unban();

        expect(user.bannedAt).toBeNull();
        expect(user.banReason).toBeNull();
      });
    });
  });
});
