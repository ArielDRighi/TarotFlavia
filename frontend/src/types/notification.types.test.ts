import { describe, it, expect } from 'vitest';
import {
  NotificationType,
  NOTIFICATION_TYPE_INFO,
  type Notification,
  type UnreadCountResponse,
  type NotificationFilters,
} from './notification.types';

describe('NotificationType', () => {
  it('should have SACRED_EVENT with correct value', () => {
    expect(NotificationType.SACRED_EVENT).toBe('sacred_event');
  });

  it('should have RITUAL_REMINDER with correct value', () => {
    expect(NotificationType.RITUAL_REMINDER).toBe('ritual_reminder');
  });

  it('should have READING_SHARED with correct value', () => {
    expect(NotificationType.READING_SHARED).toBe('reading_shared');
  });

  it('should have SYSTEM with correct value', () => {
    expect(NotificationType.SYSTEM).toBe('system');
  });

  it('should have PROMOTION with correct value', () => {
    expect(NotificationType.PROMOTION).toBe('promotion');
  });

  it('should have exactly 5 notification types', () => {
    const types = Object.values(NotificationType);
    expect(types).toHaveLength(5);
  });
});

describe('NOTIFICATION_TYPE_INFO', () => {
  it('should have info for all notification types', () => {
    const allTypes = Object.values(NotificationType);
    allTypes.forEach((type) => {
      expect(NOTIFICATION_TYPE_INFO[type]).toBeDefined();
    });
  });

  it('should have SACRED_EVENT info with Spanish name', () => {
    const info = NOTIFICATION_TYPE_INFO[NotificationType.SACRED_EVENT];
    expect(info.name).toBe('Evento Sagrado');
    expect(info.icon).toBe('✨');
    expect(info.color).toBe('text-purple-500');
  });

  it('should have RITUAL_REMINDER info with Spanish name', () => {
    const info = NOTIFICATION_TYPE_INFO[NotificationType.RITUAL_REMINDER];
    expect(info.name).toBe('Ritual');
    expect(info.icon).toBe('🕯️');
    expect(info.color).toBe('text-amber-500');
  });

  it('should have READING_SHARED info with Spanish name', () => {
    const info = NOTIFICATION_TYPE_INFO[NotificationType.READING_SHARED];
    expect(info.name).toBe('Lectura');
    expect(info.icon).toBe('🔮');
    expect(info.color).toBe('text-blue-500');
  });

  it('should have SYSTEM info with Spanish name', () => {
    const info = NOTIFICATION_TYPE_INFO[NotificationType.SYSTEM];
    expect(info.name).toBe('Sistema');
    expect(info.icon).toBe('⚙️');
    expect(info.color).toBe('text-gray-500');
  });

  it('should have PROMOTION info with Spanish name', () => {
    const info = NOTIFICATION_TYPE_INFO[NotificationType.PROMOTION];
    expect(info.name).toBe('Promoción');
    expect(info.icon).toBe('🎁');
    expect(info.color).toBe('text-pink-500');
  });

  it('should have consistent structure for all types', () => {
    const allTypes = Object.values(NotificationType);
    allTypes.forEach((type) => {
      const info = NOTIFICATION_TYPE_INFO[type];
      expect(info).toHaveProperty('name');
      expect(info).toHaveProperty('icon');
      expect(info).toHaveProperty('color');
      expect(typeof info.name).toBe('string');
      expect(typeof info.icon).toBe('string');
      expect(typeof info.color).toBe('string');
    });
  });

  it('should have Tailwind color classes', () => {
    const allTypes = Object.values(NotificationType);
    allTypes.forEach((type) => {
      const info = NOTIFICATION_TYPE_INFO[type];
      expect(info.color).toMatch(/^text-\w+-\d{3}$/);
    });
  });

  it('should have emoji icons', () => {
    const allTypes = Object.values(NotificationType);
    allTypes.forEach((type) => {
      const info = NOTIFICATION_TYPE_INFO[type];
      expect(info.icon).toBeTruthy();
      expect(info.icon.length).toBeGreaterThan(0);
    });
  });
});

describe('Notification interface', () => {
  it('should accept valid notification object', () => {
    const notification: Notification = {
      id: 1,
      userId: 10,
      type: NotificationType.SACRED_EVENT,
      title: 'Luna Llena',
      message: 'Evento sagrado próximo',
      data: { eventId: 5 },
      actionUrl: '/rituales',
      read: false,
      readAt: null,
      createdAt: '2026-02-03T10:00:00Z',
    };

    expect(notification.id).toBe(1);
    expect(notification.type).toBe(NotificationType.SACRED_EVENT);
  });

  it('should accept notification with optional fields as undefined', () => {
    const notification: Notification = {
      id: 2,
      userId: 20,
      type: NotificationType.SYSTEM,
      title: 'Test',
      message: 'Message',
      read: true,
      createdAt: '2026-02-03T10:00:00Z',
    };

    expect(notification.data).toBeUndefined();
    expect(notification.actionUrl).toBeUndefined();
    expect(notification.readAt).toBeUndefined();
  });

  it('should require numeric id', () => {
    const notification: Notification = {
      id: 123, // Must be number, not string
      userId: 1,
      type: NotificationType.SYSTEM,
      title: 'Test',
      message: 'Message',
      read: false,
      createdAt: '2026-02-03T10:00:00Z',
    };

    expect(typeof notification.id).toBe('number');
  });
});

describe('UnreadCountResponse interface', () => {
  it('should accept valid count response', () => {
    const response: UnreadCountResponse = {
      count: 5,
    };

    expect(response.count).toBe(5);
  });

  it('should accept zero count', () => {
    const response: UnreadCountResponse = {
      count: 0,
    };

    expect(response.count).toBe(0);
  });
});

describe('NotificationFilters interface', () => {
  it('should accept empty filters', () => {
    const filters: NotificationFilters = {};

    expect(filters).toBeDefined();
  });

  it('should accept unreadOnly filter', () => {
    const filters: NotificationFilters = {
      unreadOnly: true,
    };

    expect(filters.unreadOnly).toBe(true);
  });

  it('should accept type filter', () => {
    const filters: NotificationFilters = {
      type: NotificationType.SACRED_EVENT,
    };

    expect(filters.type).toBe(NotificationType.SACRED_EVENT);
  });

  it('should accept pagination filters', () => {
    const filters: NotificationFilters = {
      limit: 10,
      offset: 20,
    };

    expect(filters.limit).toBe(10);
    expect(filters.offset).toBe(20);
  });

  it('should accept all filters combined', () => {
    const filters: NotificationFilters = {
      unreadOnly: true,
      type: NotificationType.RITUAL_REMINDER,
      limit: 15,
      offset: 0,
    };

    expect(filters.unreadOnly).toBe(true);
    expect(filters.type).toBe(NotificationType.RITUAL_REMINDER);
    expect(filters.limit).toBe(15);
    expect(filters.offset).toBe(0);
  });
});
