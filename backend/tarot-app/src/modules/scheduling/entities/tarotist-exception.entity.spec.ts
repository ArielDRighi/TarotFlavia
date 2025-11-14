import { TarotistException } from './tarotist-exception.entity';
import { ExceptionType } from '../domain/enums';

describe('TarotistException Entity', () => {
  it('should create an instance', () => {
    const exception = new TarotistException();
    expect(exception).toBeDefined();
    expect(exception).toBeInstanceOf(TarotistException);
  });

  it('should have all required properties for blocked day', () => {
    const exception = new TarotistException();
    exception.tarotistaId = 1;
    exception.exceptionDate = new Date('2025-12-25');
    exception.exceptionType = ExceptionType.BLOCKED;
    exception.reason = 'Christmas Holiday';

    expect(exception.tarotistaId).toBe(1);
    expect(exception.exceptionDate).toEqual(new Date('2025-12-25'));
    expect(exception.exceptionType).toBe(ExceptionType.BLOCKED);
    expect(exception.reason).toBe('Christmas Holiday');
    expect(exception.startTime).toBeUndefined();
    expect(exception.endTime).toBeUndefined();
  });

  it('should have all required properties for custom hours', () => {
    const exception = new TarotistException();
    exception.tarotistaId = 1;
    exception.exceptionDate = new Date('2025-12-24');
    exception.exceptionType = ExceptionType.CUSTOM_HOURS;
    exception.startTime = '10:00';
    exception.endTime = '14:00';
    exception.reason = 'Christmas Eve - Short hours';

    expect(exception.tarotistaId).toBe(1);
    expect(exception.exceptionDate).toEqual(new Date('2025-12-24'));
    expect(exception.exceptionType).toBe(ExceptionType.CUSTOM_HOURS);
    expect(exception.startTime).toBe('10:00');
    expect(exception.endTime).toBe('14:00');
    expect(exception.reason).toBe('Christmas Eve - Short hours');
  });

  it('should validate exception type enum', () => {
    const exception = new TarotistException();

    exception.exceptionType = ExceptionType.BLOCKED;
    expect(exception.exceptionType).toBe('blocked');

    exception.exceptionType = ExceptionType.CUSTOM_HOURS;
    expect(exception.exceptionType).toBe('custom_hours');
  });

  it('should allow nullable times for blocked days', () => {
    const exception = new TarotistException();
    exception.exceptionType = ExceptionType.BLOCKED;
    exception.startTime = null;
    exception.endTime = null;

    expect(exception.startTime).toBeNull();
    expect(exception.endTime).toBeNull();
  });

  it('should allow nullable reason', () => {
    const exception = new TarotistException();
    exception.reason = null;

    expect(exception.reason).toBeNull();
  });

  it('should have createdAt timestamp', () => {
    const exception = new TarotistException();
    const now = new Date();
    exception.createdAt = now;

    expect(exception.createdAt).toEqual(now);
  });

  it('should accept date in Date format', () => {
    const exception = new TarotistException();
    const date = new Date('2025-12-25');
    exception.exceptionDate = date;

    expect(exception.exceptionDate).toEqual(date);
    expect(exception.exceptionDate).toBeInstanceOf(Date);
  });
});
