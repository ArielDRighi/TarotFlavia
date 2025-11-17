import { SecurityEvent } from './security-event.entity';
import { SecurityEventType } from '../enums/security-event-type.enum';
import { SecurityEventSeverity } from '../enums/security-event-severity.enum';

describe('SecurityEvent Entity', () => {
  it('should create a security event with all fields', () => {
    const event = new SecurityEvent();
    event.eventType = SecurityEventType.FAILED_LOGIN;
    event.userId = 1;
    event.ipAddress = '192.168.1.1';
    event.userAgent = 'Mozilla/5.0';
    event.severity = SecurityEventSeverity.MEDIUM;
    event.details = { attemptCount: 3 };

    expect(event).toBeDefined();
    expect(event.eventType).toBe(SecurityEventType.FAILED_LOGIN);
    expect(event.severity).toBe(SecurityEventSeverity.MEDIUM);
    expect(event.details).toEqual({ attemptCount: 3 });
  });

  it('should allow nullable userId for anonymous events', () => {
    const event = new SecurityEvent();
    event.eventType = SecurityEventType.RATE_LIMIT_VIOLATION;
    event.userId = null;
    event.ipAddress = '192.168.1.1';
    event.severity = SecurityEventSeverity.LOW;

    expect(event.userId).toBeNull();
  });

  it('should store details as JSONB', () => {
    const event = new SecurityEvent();
    event.details = {
      previousEmail: 'old@test.com',
      newEmail: 'new@test.com',
      changedFields: ['email', 'password'],
    };

    expect(event.details).toHaveProperty('previousEmail');
    expect(event.details).toHaveProperty('changedFields');
    expect(Array.isArray(event.details.changedFields)).toBe(true);
  });
});
