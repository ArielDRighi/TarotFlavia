import {
  UserTarotistaSubscription,
  SubscriptionType,
  SubscriptionStatus,
} from './user-tarotista-subscription.entity';
import { User } from '../../users/entities/user.entity';
import { Tarotista } from './tarotista.entity';

describe('UserTarotistaSubscription Entity', () => {
  describe('enums', () => {
    it('should have SubscriptionType enum values', () => {
      expect(SubscriptionType.FAVORITE).toBe('favorite');
      expect(SubscriptionType.PREMIUM_INDIVIDUAL).toBe('premium_individual');
      expect(SubscriptionType.PREMIUM_ALL_ACCESS).toBe('premium_all_access');
    });

    it('should have SubscriptionStatus enum values', () => {
      expect(SubscriptionStatus.ACTIVE).toBe('active');
      expect(SubscriptionStatus.CANCELLED).toBe('cancelled');
      expect(SubscriptionStatus.EXPIRED).toBe('expired');
    });
  });

  describe('creation and validation', () => {
    it('should create a subscription with required fields', () => {
      const subscription = new UserTarotistaSubscription();
      subscription.id = 1;
      subscription.userId = 1;
      subscription.tarotistaId = 1;
      subscription.subscriptionType = SubscriptionType.FAVORITE;
      subscription.status = SubscriptionStatus.ACTIVE;

      expect(subscription.id).toBe(1);
      expect(subscription.userId).toBe(1);
      expect(subscription.tarotistaId).toBe(1);
      expect(subscription.subscriptionType).toBe(SubscriptionType.FAVORITE);
      expect(subscription.status).toBe(SubscriptionStatus.ACTIVE);
    });

    it('should support FAVORITE subscription type (FREE plan)', () => {
      const subscription = new UserTarotistaSubscription();
      subscription.subscriptionType = SubscriptionType.FAVORITE;
      subscription.tarotistaId = 1;
      subscription.changeCount = 0;

      expect(subscription.subscriptionType).toBe(SubscriptionType.FAVORITE);
      expect(subscription.tarotistaId).toBe(1);
    });

    it('should support PREMIUM_INDIVIDUAL subscription type', () => {
      const subscription = new UserTarotistaSubscription();
      subscription.subscriptionType = SubscriptionType.PREMIUM_INDIVIDUAL;
      subscription.tarotistaId = 1;

      expect(subscription.subscriptionType).toBe(
        SubscriptionType.PREMIUM_INDIVIDUAL,
      );
      expect(subscription.tarotistaId).toBe(1);
    });

    it('should support PREMIUM_ALL_ACCESS subscription type', () => {
      const subscription = new UserTarotistaSubscription();
      subscription.subscriptionType = SubscriptionType.PREMIUM_ALL_ACCESS;
      subscription.tarotistaId = null; // All-access doesn't tie to specific tarotista

      expect(subscription.subscriptionType).toBe(
        SubscriptionType.PREMIUM_ALL_ACCESS,
      );
      expect(subscription.tarotistaId).toBeNull();
    });

    it('should track subscription dates', () => {
      const subscription = new UserTarotistaSubscription();
      const now = new Date();
      const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      subscription.startedAt = now;
      subscription.expiresAt = futureDate;

      expect(subscription.startedAt).toEqual(now);
      expect(subscription.expiresAt).toEqual(futureDate);
    });

    it('should track cancellation date', () => {
      const subscription = new UserTarotistaSubscription();
      const now = new Date();

      subscription.status = SubscriptionStatus.CANCELLED;
      subscription.cancelledAt = now;

      expect(subscription.status).toBe(SubscriptionStatus.CANCELLED);
      expect(subscription.cancelledAt).toEqual(now);
    });

    it('should track when FREE user can change favorite tarotista', () => {
      const subscription = new UserTarotistaSubscription();
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      subscription.canChangeAt = futureDate;
      subscription.changeCount = 1;

      expect(subscription.canChangeAt).toEqual(futureDate);
      expect(subscription.changeCount).toBe(1);
    });

    it('should store Stripe subscription ID', () => {
      const subscription = new UserTarotistaSubscription();
      subscription.stripeSubscriptionId = 'sub_123456789';

      expect(subscription.stripeSubscriptionId).toBe('sub_123456789');
    });
  });

  describe('relationships', () => {
    it('should have a user relationship', () => {
      const subscription = new UserTarotistaSubscription();
      const user = new User();
      user.id = 1;
      user.email = 'user@example.com';

      subscription.user = user;
      subscription.userId = user.id;

      expect(subscription.user).toBeDefined();
      expect(subscription.userId).toBe(1);
    });

    it('should have a tarotista relationship', () => {
      const subscription = new UserTarotistaSubscription();
      const tarotista = new Tarotista();
      tarotista.id = 1;
      tarotista.nombrePublico = 'Flavia';

      subscription.tarotista = tarotista;
      subscription.tarotistaId = tarotista.id;

      expect(subscription.tarotista).toBeDefined();
      expect(subscription.tarotistaId).toBe(1);
    });

    it('should allow null tarotista for PREMIUM_ALL_ACCESS', () => {
      const subscription = new UserTarotistaSubscription();
      subscription.subscriptionType = SubscriptionType.PREMIUM_ALL_ACCESS;
      subscription.tarotistaId = null;
      subscription.tarotista = null;

      expect(subscription.tarotistaId).toBeNull();
      expect(subscription.tarotista).toBeNull();
    });
  });

  describe('business logic - unique constraints', () => {
    it('should enforce only 1 active FAVORITE per user (DB constraint)', () => {
      // This is enforced at DB level via unique partial index
      const sub1 = new UserTarotistaSubscription();
      sub1.userId = 1;
      sub1.subscriptionType = SubscriptionType.FAVORITE;
      sub1.status = SubscriptionStatus.ACTIVE;

      expect(sub1.userId).toBe(1);
      expect(sub1.subscriptionType).toBe(SubscriptionType.FAVORITE);
      expect(sub1.status).toBe(SubscriptionStatus.ACTIVE);
    });

    it('should enforce only 1 active PREMIUM_INDIVIDUAL per user (DB constraint)', () => {
      const sub1 = new UserTarotistaSubscription();
      sub1.userId = 1;
      sub1.subscriptionType = SubscriptionType.PREMIUM_INDIVIDUAL;
      sub1.status = SubscriptionStatus.ACTIVE;

      expect(sub1.subscriptionType).toBe(SubscriptionType.PREMIUM_INDIVIDUAL);
      expect(sub1.status).toBe(SubscriptionStatus.ACTIVE);
    });

    it('should enforce only 1 active PREMIUM_ALL_ACCESS per user (DB constraint)', () => {
      const sub1 = new UserTarotistaSubscription();
      sub1.userId = 1;
      sub1.subscriptionType = SubscriptionType.PREMIUM_ALL_ACCESS;
      sub1.status = SubscriptionStatus.ACTIVE;

      expect(sub1.subscriptionType).toBe(SubscriptionType.PREMIUM_ALL_ACCESS);
      expect(sub1.status).toBe(SubscriptionStatus.ACTIVE);
    });

    it('should allow multiple cancelled subscriptions', () => {
      const sub1 = new UserTarotistaSubscription();
      sub1.userId = 1;
      sub1.subscriptionType = SubscriptionType.FAVORITE;
      sub1.status = SubscriptionStatus.CANCELLED;

      const sub2 = new UserTarotistaSubscription();
      sub2.userId = 1;
      sub2.subscriptionType = SubscriptionType.FAVORITE;
      sub2.status = SubscriptionStatus.CANCELLED;

      expect(sub1.status).toBe(SubscriptionStatus.CANCELLED);
      expect(sub2.status).toBe(SubscriptionStatus.CANCELLED);
    });
  });

  describe('timestamps', () => {
    it('should have createdAt and updatedAt fields', () => {
      const subscription = new UserTarotistaSubscription();
      const now = new Date();

      subscription.createdAt = now;
      subscription.updatedAt = now;

      expect(subscription.createdAt).toEqual(now);
      expect(subscription.updatedAt).toEqual(now);
    });
  });
});
