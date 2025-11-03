import { PasswordResetToken } from './password-reset-token.entity';
import { User } from '../../users/entities/user.entity';

describe('PasswordResetToken', () => {
  it('should be defined', () => {
    expect(new PasswordResetToken()).toBeDefined();
  });

  it('should have correct properties', () => {
    const token = new PasswordResetToken();
    expect(token).toHaveProperty('id');
    expect(token).toHaveProperty('userId');
    expect(token).toHaveProperty('user');
    expect(token).toHaveProperty('token');
    expect(token).toHaveProperty('expiresAt');
    expect(token).toHaveProperty('usedAt');
    expect(token).toHaveProperty('createdAt');
  });

  it('should create instance with values', () => {
    const token = new PasswordResetToken();
    const user = new User();
    user.id = 1;

    token.id = 'uuid-test';
    token.userId = 1;
    token.user = user;
    token.token = 'hashed-token';
    token.expiresAt = new Date();
    token.usedAt = null;
    token.createdAt = new Date();

    expect(token.id).toBe('uuid-test');
    expect(token.userId).toBe(1);
    expect(token.user).toBe(user);
    expect(token.token).toBe('hashed-token');
    expect(token.expiresAt).toBeInstanceOf(Date);
    expect(token.usedAt).toBeNull();
    expect(token.createdAt).toBeInstanceOf(Date);
  });
});
