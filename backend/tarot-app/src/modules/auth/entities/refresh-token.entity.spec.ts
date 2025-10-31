import { RefreshToken } from './refresh-token.entity';
import { User } from '../../users/entities/user.entity';

describe('RefreshToken Entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    user.id = 1;
    user.email = 'test@example.com';
  });

  describe('Creation', () => {
    it('should create a refresh token with required fields', () => {
      const refreshToken = new RefreshToken();
      refreshToken.user = user;
      refreshToken.token = 'hashed_token_value';
      refreshToken.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      refreshToken.ipAddress = '192.168.1.1';
      refreshToken.userAgent = 'Mozilla/5.0';

      expect(refreshToken.user).toBe(user);
      expect(refreshToken.token).toBe('hashed_token_value');
      expect(refreshToken.expiresAt).toBeInstanceOf(Date);
      expect(refreshToken.ipAddress).toBe('192.168.1.1');
      expect(refreshToken.userAgent).toBe('Mozilla/5.0');
      expect(refreshToken.revokedAt).toBeUndefined();
    });
  });

  describe('Validation', () => {
    it('should validate that token is required', () => {
      const refreshToken = new RefreshToken();
      refreshToken.user = user;
      refreshToken.expiresAt = new Date();

      expect(refreshToken.token).toBeUndefined();
    });

    it('should validate that expiresAt is required', () => {
      const refreshToken = new RefreshToken();
      refreshToken.user = user;
      refreshToken.token = 'hashed_token';

      expect(refreshToken.expiresAt).toBeUndefined();
    });
  });

  describe('Business Logic', () => {
    it('should determine if token is expired', () => {
      const refreshToken = new RefreshToken();
      refreshToken.expiresAt = new Date(Date.now() - 1000); // Expirado

      expect(refreshToken.isExpired()).toBe(true);
    });

    it('should determine if token is not expired', () => {
      const refreshToken = new RefreshToken();
      refreshToken.expiresAt = new Date(Date.now() + 10000); // No expirado

      expect(refreshToken.isExpired()).toBe(false);
    });

    it('should determine if token is revoked', () => {
      const refreshToken = new RefreshToken();
      refreshToken.revokedAt = new Date();

      expect(refreshToken.isRevoked()).toBe(true);
    });

    it('should determine if token is not revoked', () => {
      const refreshToken = new RefreshToken();
      refreshToken.revokedAt = null;

      expect(refreshToken.isRevoked()).toBe(false);
    });

    it('should determine if token is valid (not expired and not revoked)', () => {
      const refreshToken = new RefreshToken();
      refreshToken.expiresAt = new Date(Date.now() + 10000);
      refreshToken.revokedAt = null;

      expect(refreshToken.isValid()).toBe(true);
    });

    it('should determine if token is invalid when expired', () => {
      const refreshToken = new RefreshToken();
      refreshToken.expiresAt = new Date(Date.now() - 1000);
      refreshToken.revokedAt = null;

      expect(refreshToken.isValid()).toBe(false);
    });

    it('should determine if token is invalid when revoked', () => {
      const refreshToken = new RefreshToken();
      refreshToken.expiresAt = new Date(Date.now() + 10000);
      refreshToken.revokedAt = new Date();

      expect(refreshToken.isValid()).toBe(false);
    });

    it('should revoke token by setting revokedAt', () => {
      const refreshToken = new RefreshToken();
      refreshToken.expiresAt = new Date(Date.now() + 10000);

      expect(refreshToken.revokedAt).toBeUndefined();

      refreshToken.revoke();

      expect(refreshToken.revokedAt).toBeInstanceOf(Date);
      expect(refreshToken.isRevoked()).toBe(true);
    });
  });
});
