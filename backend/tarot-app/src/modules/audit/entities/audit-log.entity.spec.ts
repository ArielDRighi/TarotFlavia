import { AuditLog } from './audit-log.entity';
import { AuditAction } from '../enums/audit-action.enum';
import { User } from '../../users/entities/user.entity';

describe('AuditLog Entity', () => {
  it('should create an audit log instance', () => {
    const auditLog = new AuditLog();
    expect(auditLog).toBeDefined();
    expect(auditLog).toBeInstanceOf(AuditLog);
  });

  it('should have all required properties', () => {
    const auditLog = new AuditLog();
    auditLog.userId = 1;
    auditLog.targetUserId = 2;
    auditLog.action = AuditAction.USER_BANNED;
    auditLog.entityType = 'User';
    auditLog.entityId = '2';
    auditLog.oldValue = { status: 'active' };
    auditLog.newValue = { status: 'banned', reason: 'Violation' };
    auditLog.ipAddress = '192.168.1.1';
    auditLog.userAgent = 'Mozilla/5.0';
    auditLog.createdAt = new Date();

    expect(auditLog.userId).toBe(1);
    expect(auditLog.targetUserId).toBe(2);
    expect(auditLog.action).toBe(AuditAction.USER_BANNED);
    expect(auditLog.entityType).toBe('User');
    expect(auditLog.entityId).toBe('2');
    expect(auditLog.oldValue).toEqual({ status: 'active' });
    expect(auditLog.newValue).toEqual({
      status: 'banned',
      reason: 'Violation',
    });
    expect(auditLog.ipAddress).toBe('192.168.1.1');
    expect(auditLog.userAgent).toBe('Mozilla/5.0');
    expect(auditLog.createdAt).toBeInstanceOf(Date);
  });

  it('should allow nullable targetUserId', () => {
    const auditLog = new AuditLog();
    auditLog.userId = 1;
    auditLog.targetUserId = null;
    auditLog.action = AuditAction.CONFIG_CHANGED;

    expect(auditLog.targetUserId).toBeNull();
  });

  it('should allow nullable oldValue for creation actions', () => {
    const auditLog = new AuditLog();
    auditLog.action = AuditAction.USER_CREATED;
    auditLog.oldValue = null;
    auditLog.newValue = { email: 'test@example.com' };

    expect(auditLog.oldValue).toBeNull();
    expect(auditLog.newValue).toBeDefined();
  });

  it('should store complex jsonb values', () => {
    const auditLog = new AuditLog();
    const complexOldValue = {
      roles: ['consumer'],
      plan: 'FREE',
      metadata: { lastLogin: '2025-01-01' },
    };
    const complexNewValue = {
      roles: ['consumer', 'admin'],
      plan: 'PREMIUM',
      metadata: { lastLogin: '2025-01-02' },
    };

    auditLog.oldValue = complexOldValue;
    auditLog.newValue = complexNewValue;

    expect(auditLog.oldValue).toEqual(complexOldValue);
    expect(auditLog.newValue).toEqual(complexNewValue);
  });

  it('should have relation with user', () => {
    const auditLog = new AuditLog();
    const user = new User();
    user.id = 1;

    auditLog.user = user;
    auditLog.userId = user.id;

    expect(auditLog.user).toBe(user);
    expect(auditLog.userId).toBe(1);
  });

  it('should have relation with target user', () => {
    const auditLog = new AuditLog();
    const targetUser = new User();
    targetUser.id = 2;

    auditLog.targetUser = targetUser;
    auditLog.targetUserId = targetUser.id;

    expect(auditLog.targetUser).toBe(targetUser);
    expect(auditLog.targetUserId).toBe(2);
  });
});
