import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { QueryAuditLogDto } from './query-audit-log.dto';
import { AuditAction } from '../enums/audit-action.enum';

describe('QueryAuditLogDto', () => {
  it('should validate with default values', async () => {
    const dto = plainToInstance(QueryAuditLogDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should validate with all optional fields', async () => {
    const dto = plainToInstance(QueryAuditLogDto, {
      userId: 1,
      action: AuditAction.USER_BANNED,
      entityType: 'User',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      page: 1,
      limit: 20,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should validate userId is a number', async () => {
    const dto = plainToInstance(QueryAuditLogDto, {
      userId: 'invalid',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('userId');
  });

  it('should validate action is valid enum', async () => {
    const dto = plainToInstance(QueryAuditLogDto, {
      action: 'invalid_action',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('action');
  });

  it('should validate page is at least 1', async () => {
    const dto = plainToInstance(QueryAuditLogDto, {
      page: 0,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('page');
  });

  it('should validate limit is between 1 and 100', async () => {
    const dtoTooLow = plainToInstance(QueryAuditLogDto, {
      limit: 0,
    });
    const errorsLow = await validate(dtoTooLow);
    expect(errorsLow.length).toBeGreaterThan(0);

    const dtoTooHigh = plainToInstance(QueryAuditLogDto, {
      limit: 101,
    });
    const errorsHigh = await validate(dtoTooHigh);
    expect(errorsHigh.length).toBeGreaterThan(0);
  });

  it('should validate startDate is a valid date string', async () => {
    const dto = plainToInstance(QueryAuditLogDto, {
      startDate: 'invalid-date',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('startDate');
  });

  it('should validate endDate is a valid date string', async () => {
    const dto = plainToInstance(QueryAuditLogDto, {
      endDate: 'invalid-date',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('endDate');
  });

  it('should accept ISO 8601 date format', async () => {
    const dto = plainToInstance(QueryAuditLogDto, {
      startDate: '2025-01-01T00:00:00Z',
      endDate: '2025-12-31T23:59:59Z',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should validate entityType is a string', async () => {
    const dto = plainToInstance(QueryAuditLogDto, {
      entityType: 123,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('entityType');
  });

  it('should allow filtering by multiple criteria', async () => {
    const dto = plainToInstance(QueryAuditLogDto, {
      userId: 1,
      action: AuditAction.ROLE_ADDED,
      entityType: 'User',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      page: 2,
      limit: 50,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
