import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateAuditLogDto } from './create-audit-log.dto';
import { AuditAction } from '../enums/audit-action.enum';

describe('CreateAuditLogDto', () => {
  it('should validate a valid DTO', async () => {
    const dto = plainToInstance(CreateAuditLogDto, {
      userId: 1,
      action: AuditAction.USER_BANNED,
      entityType: 'User',
      entityId: '123',
      newValue: { status: 'banned' },
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should allow nullable userId (for deleted admin accounts)', async () => {
    const dto = plainToInstance(CreateAuditLogDto, {
      userId: null,
      action: AuditAction.USER_BANNED,
      entityType: 'User',
      entityId: '123',
      newValue: { status: 'banned' },
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should require action', async () => {
    const dto = plainToInstance(CreateAuditLogDto, {
      userId: 1,
      entityType: 'User',
      entityId: '123',
      newValue: { status: 'banned' },
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('action');
  });

  it('should require entityType', async () => {
    const dto = plainToInstance(CreateAuditLogDto, {
      userId: 1,
      action: AuditAction.USER_BANNED,
      entityId: '123',
      newValue: { status: 'banned' },
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('entityType');
  });

  it('should require entityId', async () => {
    const dto = plainToInstance(CreateAuditLogDto, {
      userId: 1,
      action: AuditAction.USER_BANNED,
      entityType: 'User',
      newValue: { status: 'banned' },
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('entityId');
  });

  it('should require newValue', async () => {
    const dto = plainToInstance(CreateAuditLogDto, {
      userId: 1,
      action: AuditAction.USER_BANNED,
      entityType: 'User',
      entityId: '123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('newValue');
  });

  it('should allow optional targetUserId', async () => {
    const dto = plainToInstance(CreateAuditLogDto, {
      userId: 1,
      targetUserId: 2,
      action: AuditAction.USER_BANNED,
      entityType: 'User',
      entityId: '123',
      newValue: { status: 'banned' },
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should allow optional oldValue', async () => {
    const dto = plainToInstance(CreateAuditLogDto, {
      userId: 1,
      action: AuditAction.USER_BANNED,
      entityType: 'User',
      entityId: '123',
      oldValue: { status: 'active' },
      newValue: { status: 'banned' },
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should allow optional ipAddress', async () => {
    const dto = plainToInstance(CreateAuditLogDto, {
      userId: 1,
      action: AuditAction.USER_BANNED,
      entityType: 'User',
      entityId: '123',
      newValue: { status: 'banned' },
      ipAddress: '192.168.1.1',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should allow optional userAgent', async () => {
    const dto = plainToInstance(CreateAuditLogDto, {
      userId: 1,
      action: AuditAction.USER_BANNED,
      entityType: 'User',
      entityId: '123',
      newValue: { status: 'banned' },
      userAgent: 'Mozilla/5.0',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should validate action is a valid enum', async () => {
    const dto = plainToInstance(CreateAuditLogDto, {
      userId: 1,
      action: 'invalid_action',
      entityType: 'User',
      entityId: '123',
      newValue: { status: 'banned' },
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('action');
  });

  it('should validate complex newValue objects', async () => {
    const dto = plainToInstance(CreateAuditLogDto, {
      userId: 1,
      action: AuditAction.ROLE_ADDED,
      entityType: 'User',
      entityId: '123',
      newValue: {
        roles: ['consumer', 'admin'],
        timestamp: '2025-01-01',
        metadata: { reason: 'promotion' },
      },
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
