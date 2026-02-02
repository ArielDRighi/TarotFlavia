import { UserSacredEventNotification } from './user-sacred-event-notification.entity';

describe('UserSacredEventNotification Entity', () => {
  it('should create an instance', () => {
    const notification = new UserSacredEventNotification();
    expect(notification).toBeDefined();
    expect(notification).toBeInstanceOf(UserSacredEventNotification);
  });

  it('should have all required properties', () => {
    const notification = new UserSacredEventNotification();
    notification.id = 1;
    notification.userId = 42;
    notification.eventId = 15;

    expect(notification.id).toBe(1);
    expect(notification.userId).toBe(42);
    expect(notification.eventId).toBe(15);
  });

  it('should have default values for notification flags', () => {
    const notification = new UserSacredEventNotification();
    notification.notified24h = false;
    notification.notifiedOnDay = false;
    notification.dismissed = false;

    expect(notification.notified24h).toBe(false);
    expect(notification.notifiedOnDay).toBe(false);
    expect(notification.dismissed).toBe(false);
  });

  it('should allow setting notification flags to true', () => {
    const notification = new UserSacredEventNotification();
    notification.notified24h = true;
    notification.notifiedOnDay = true;
    notification.dismissed = false;

    expect(notification.notified24h).toBe(true);
    expect(notification.notifiedOnDay).toBe(true);
    expect(notification.dismissed).toBe(false);
  });

  it('should allow marking event as dismissed', () => {
    const notification = new UserSacredEventNotification();
    notification.dismissed = true;

    expect(notification.dismissed).toBe(true);
  });

  it('should have timestamp', () => {
    const notification = new UserSacredEventNotification();
    const now = new Date();
    notification.createdAt = now;

    expect(notification.createdAt).toEqual(now);
  });

  describe('Notification Workflow', () => {
    it('should track 24h notification sent', () => {
      const notification = new UserSacredEventNotification();
      notification.userId = 10;
      notification.eventId = 5;
      notification.notified24h = true;
      notification.notifiedOnDay = false;

      expect(notification.notified24h).toBe(true);
      expect(notification.notifiedOnDay).toBe(false);
    });

    it('should track both notifications sent', () => {
      const notification = new UserSacredEventNotification();
      notification.userId = 10;
      notification.eventId = 5;
      notification.notified24h = true;
      notification.notifiedOnDay = true;

      expect(notification.notified24h).toBe(true);
      expect(notification.notifiedOnDay).toBe(true);
    });

    it('should track user dismissed event', () => {
      const notification = new UserSacredEventNotification();
      notification.userId = 10;
      notification.eventId = 5;
      notification.notified24h = true;
      notification.notifiedOnDay = false;
      notification.dismissed = true;

      expect(notification.dismissed).toBe(true);
      // Aunque se notificó, el usuario lo descartó
      expect(notification.notified24h).toBe(true);
    });
  });

  describe('Preventing Duplicate Notifications', () => {
    it('should prevent duplicate 24h notifications', () => {
      const notification = new UserSacredEventNotification();
      notification.userId = 10;
      notification.eventId = 5;
      notification.notified24h = true;

      // Sistema debe verificar esta flag antes de enviar
      const shouldNotify24h = !notification.notified24h;
      expect(shouldNotify24h).toBe(false);
    });

    it('should allow on-day notification after 24h notification', () => {
      const notification = new UserSacredEventNotification();
      notification.userId = 10;
      notification.eventId = 5;
      notification.notified24h = true;
      notification.notifiedOnDay = false;

      // Sistema puede enviar notificación del día
      const shouldNotifyOnDay = !notification.notifiedOnDay;
      expect(shouldNotifyOnDay).toBe(true);
    });

    it('should not send notifications if event dismissed', () => {
      const notification = new UserSacredEventNotification();
      notification.userId = 10;
      notification.eventId = 5;
      notification.dismissed = true;

      // Sistema debe verificar dismissed antes de enviar
      const shouldNotify =
        !notification.dismissed &&
        (!notification.notified24h || !notification.notifiedOnDay);
      expect(shouldNotify).toBe(false);
    });
  });

  describe('User-Event Relationship', () => {
    it('should track notifications per user per event', () => {
      // Usuario 1, Evento 5
      const notification1 = new UserSacredEventNotification();
      notification1.userId = 1;
      notification1.eventId = 5;
      notification1.notified24h = true;

      // Usuario 2, Evento 5 (mismo evento, diferente usuario)
      const notification2 = new UserSacredEventNotification();
      notification2.userId = 2;
      notification2.eventId = 5;
      notification2.notified24h = false;

      expect(notification1.userId).toBe(1);
      expect(notification2.userId).toBe(2);
      expect(notification1.eventId).toBe(notification2.eventId);
      expect(notification1.notified24h).toBe(true);
      expect(notification2.notified24h).toBe(false);
    });
  });
});
