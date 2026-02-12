import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';

describe('OptionalJwtAuthGuard', () => {
  let guard: OptionalJwtAuthGuard;

  beforeEach(() => {
    guard = new OptionalJwtAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should extend AuthGuard with jwt strategy', () => {
    expect(guard).toBeInstanceOf(AuthGuard('jwt'));
  });

  describe('canActivate', () => {
    let mockContext: ExecutionContext;
    let mockRequest: { headers: Record<string, string | undefined> };

    beforeEach(() => {
      mockRequest = {
        headers: {},
      };
      mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as unknown as ExecutionContext;
    });

    it('should return true when no authorization header is present (anonymous)', async () => {
      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should return true when authorization header with valid token', async () => {
      mockRequest.headers.authorization = 'Bearer valid-token';

      // Mock parent canActivate to return true
      jest
        .spyOn(AuthGuard('jwt').prototype, 'canActivate')
        .mockResolvedValue(true);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should return true when JWT validation fails (catches exception)', async () => {
      mockRequest.headers.authorization = 'Bearer invalid-token';

      // Mock parent canActivate to throw error
      jest
        .spyOn(AuthGuard('jwt').prototype, 'canActivate')
        .mockRejectedValue(new Error('Unauthorized'));

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
    });
  });

  describe('handleRequest', () => {
    it('should return user when provided', () => {
      const mockUser = { id: 1, email: 'test@example.com' };

      const result = guard.handleRequest(null, mockUser);

      expect(result).toEqual(mockUser);
    });

    it('should return null when no user provided (anonymous)', () => {
      const result = guard.handleRequest(null, null);

      expect(result).toBeNull();
    });

    it('should return null when error occurs (instead of throwing)', () => {
      const mockError = new Error('Unauthorized');

      const result = guard.handleRequest(mockError, null);

      expect(result).toBeNull();
    });

    it('should return user when both error and user exist', () => {
      const mockError = new Error('Some error');
      const mockUser = { id: 1, email: 'test@example.com' };

      const result = guard.handleRequest(mockError, mockUser);

      expect(result).toEqual(mockUser);
    });
  });
});
