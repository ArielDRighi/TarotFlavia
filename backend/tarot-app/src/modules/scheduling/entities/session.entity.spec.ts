import { Session } from './session.entity';
import { SessionType, SessionStatus, PaymentStatus } from '../domain/enums';

describe('Session Entity', () => {
  it('should create an instance', () => {
    const session = new Session();
    expect(session).toBeDefined();
    expect(session).toBeInstanceOf(Session);
  });

  it('should have all required properties', () => {
    const session = new Session();
    session.tarotistaId = 1;
    session.userId = 1;
    session.sessionDate = new Date('2025-11-20');
    session.sessionTime = '10:00';
    session.durationMinutes = 60;
    session.sessionType = SessionType.TAROT_READING;
    session.status = SessionStatus.PENDING;
    session.priceUsd = 50.0;
    session.paymentStatus = PaymentStatus.PENDING;
    session.googleMeetLink = 'https://meet.google.com/abc-defg-hij';
    session.userEmail = 'user@example.com';

    expect(session.tarotistaId).toBe(1);
    expect(session.userId).toBe(1);
    expect(session.sessionDate).toEqual(new Date('2025-11-20'));
    expect(session.sessionTime).toBe('10:00');
    expect(session.durationMinutes).toBe(60);
    expect(session.sessionType).toBe(SessionType.TAROT_READING);
    expect(session.status).toBe(SessionStatus.PENDING);
    expect(session.priceUsd).toBe(50.0);
    expect(session.paymentStatus).toBe(PaymentStatus.PENDING);
    expect(session.googleMeetLink).toBe('https://meet.google.com/abc-defg-hij');
    expect(session.userEmail).toBe('user@example.com');
  });

  it('should validate session type enum', () => {
    const session = new Session();

    session.sessionType = SessionType.TAROT_READING;
    expect(session.sessionType).toBe('tarot_reading');

    session.sessionType = SessionType.ENERGY_CLEANING;
    expect(session.sessionType).toBe('energy_cleaning');

    session.sessionType = SessionType.HEBREW_PENDULUM;
    expect(session.sessionType).toBe('hebrew_pendulum');

    session.sessionType = SessionType.CONSULTATION;
    expect(session.sessionType).toBe('consultation');
  });

  it('should validate session status enum', () => {
    const session = new Session();

    session.status = SessionStatus.PENDING;
    expect(session.status).toBe('pending');

    session.status = SessionStatus.CONFIRMED;
    expect(session.status).toBe('confirmed');

    session.status = SessionStatus.COMPLETED;
    expect(session.status).toBe('completed');

    session.status = SessionStatus.CANCELLED_BY_USER;
    expect(session.status).toBe('cancelled_by_user');

    session.status = SessionStatus.CANCELLED_BY_TAROTIST;
    expect(session.status).toBe('cancelled_by_tarotist');
  });

  it('should validate payment status enum', () => {
    const session = new Session();

    session.paymentStatus = PaymentStatus.PENDING;
    expect(session.paymentStatus).toBe('pending');

    session.paymentStatus = PaymentStatus.PAID;
    expect(session.paymentStatus).toBe('paid');

    session.paymentStatus = PaymentStatus.REFUNDED;
    expect(session.paymentStatus).toBe('refunded');
  });

  it('should allow nullable optional fields', () => {
    const session = new Session();
    session.userNotes = null;
    session.tarotistNotes = null;
    session.cancelledAt = null;
    session.cancellationReason = null;
    session.confirmedAt = null;
    session.completedAt = null;

    expect(session.userNotes).toBeNull();
    expect(session.tarotistNotes).toBeNull();
    expect(session.cancelledAt).toBeNull();
    expect(session.cancellationReason).toBeNull();
    expect(session.confirmedAt).toBeNull();
    expect(session.completedAt).toBeNull();
  });

  it('should accept user notes', () => {
    const session = new Session();
    session.userNotes = 'I need help with my career decisions';

    expect(session.userNotes).toBe('I need help with my career decisions');
  });

  it('should accept tarotist notes', () => {
    const session = new Session();
    session.tarotistNotes = 'User is very receptive, good session';

    expect(session.tarotistNotes).toBe('User is very receptive, good session');
  });

  it('should accept cancellation data', () => {
    const session = new Session();
    const cancelDate = new Date();
    session.cancelledAt = cancelDate;
    session.cancellationReason = 'Personal emergency';

    expect(session.cancelledAt).toEqual(cancelDate);
    expect(session.cancellationReason).toBe('Personal emergency');
  });

  it('should accept confirmation timestamp', () => {
    const session = new Session();
    const confirmDate = new Date();
    session.confirmedAt = confirmDate;

    expect(session.confirmedAt).toEqual(confirmDate);
  });

  it('should accept completion timestamp', () => {
    const session = new Session();
    const completeDate = new Date();
    session.completedAt = completeDate;

    expect(session.completedAt).toEqual(completeDate);
  });

  it('should have timestamps', () => {
    const session = new Session();
    const now = new Date();
    session.createdAt = now;
    session.updatedAt = now;

    expect(session.createdAt).toEqual(now);
    expect(session.updatedAt).toEqual(now);
  });

  it('should accept different duration minutes', () => {
    const session = new Session();

    session.durationMinutes = 30;
    expect(session.durationMinutes).toBe(30);

    session.durationMinutes = 60;
    expect(session.durationMinutes).toBe(60);

    session.durationMinutes = 90;
    expect(session.durationMinutes).toBe(90);
  });

  it('should accept decimal price', () => {
    const session = new Session();
    session.priceUsd = 49.99;

    expect(session.priceUsd).toBe(49.99);
  });
});
