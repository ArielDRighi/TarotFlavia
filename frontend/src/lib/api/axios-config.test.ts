/**
 * Axios Configuration Tests
 *
 * Tests para la configuración de Axios con interceptors JWT y manejo de errores
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';

// Mock axios
vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  return {
    ...actual,
    default: {
      create: vi.fn(() => ({
        interceptors: {
          request: {
            use: vi.fn(),
          },
          response: {
            use: vi.fn(),
          },
        },
        defaults: {
          headers: {},
        },
      })),
    },
  };
});

describe('axios-config', () => {
  // Store original localStorage and window.location
  const originalLocalStorage = global.localStorage;
  const originalLocation = global.location;

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup localStorage mock
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    // Mock window.location
    Object.defineProperty(global, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
    Object.defineProperty(global, 'location', {
      value: originalLocation,
      writable: true,
    });
    vi.resetModules();
  });

  describe('apiClient configuration', () => {
    it('should create axios instance with correct baseURL from env', async () => {
      const mockCreate = vi.fn().mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
        defaults: { headers: {} },
      });
      vi.mocked(axios.create).mockImplementation(mockCreate);

      vi.resetModules();
      await import('./axios-config');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: process.env.NEXT_PUBLIC_API_URL,
        })
      );
    });

    it('should create axios instance with timeout of 30000ms', async () => {
      const mockCreate = vi.fn().mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
        defaults: { headers: {} },
      });
      vi.mocked(axios.create).mockImplementation(mockCreate);

      vi.resetModules();
      await import('./axios-config');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 30000,
        })
      );
    });

    it('should create axios instance with Content-Type header', async () => {
      const mockCreate = vi.fn().mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
        defaults: { headers: {} },
      });
      vi.mocked(axios.create).mockImplementation(mockCreate);

      vi.resetModules();
      await import('./axios-config');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });
  });

  describe('request interceptor', () => {
    it('should add Authorization header when token exists in localStorage', async () => {
      const mockRequestUse = vi.fn();
      const mockCreate = vi.fn().mockReturnValue({
        interceptors: {
          request: { use: mockRequestUse },
          response: { use: vi.fn() },
        },
        defaults: { headers: {} },
      });
      vi.mocked(axios.create).mockImplementation(mockCreate);

      vi.resetModules();
      await import('./axios-config');

      const [[successHandler]] = mockRequestUse.mock.calls;

      localStorageMock.getItem.mockReturnValue('test-jwt-token');

      const mockConfig: InternalAxiosRequestConfig = {
        headers: new AxiosHeaders(),
        method: 'get',
        url: '/test',
      };

      const result = successHandler(mockConfig);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('access_token');
      expect(result.headers.Authorization).toBe('Bearer test-jwt-token');
    });

    it('should not add Authorization header when no token exists', async () => {
      const mockRequestUse = vi.fn();
      const mockCreate = vi.fn().mockReturnValue({
        interceptors: {
          request: { use: mockRequestUse },
          response: { use: vi.fn() },
        },
        defaults: { headers: {} },
      });
      vi.mocked(axios.create).mockImplementation(mockCreate);

      vi.resetModules();
      await import('./axios-config');

      const [[successHandler]] = mockRequestUse.mock.calls;

      localStorageMock.getItem.mockReturnValue(null);

      const mockConfig: InternalAxiosRequestConfig = {
        headers: new AxiosHeaders(),
        method: 'get',
        url: '/test',
      };

      const result = successHandler(mockConfig);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('response interceptor - error handling', () => {
    it('should send refreshToken in request body when refreshing', async () => {
      const mockResponseUse = vi.fn();
      const mockPost = vi.fn();
      const mockRequest = vi.fn();
      const mockCreate = vi.fn().mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: mockResponseUse },
        },
        defaults: { headers: {} },
        post: mockPost,
        request: mockRequest,
      });
      vi.mocked(axios.create).mockImplementation(mockCreate);

      vi.resetModules();
      await import('./axios-config');

      const [[, errorHandler]] = mockResponseUse.mock.calls;

      const mockError = {
        response: { status: 401, data: {} },
        config: { url: '/test', _retry: false, headers: {} },
      } as unknown as AxiosError;

      localStorageMock.getItem.mockReturnValue('stored-refresh-token');
      mockPost.mockResolvedValue({
        data: { access_token: 'new-access-token', refresh_token: 'new-refresh-token' },
      });
      mockRequest.mockResolvedValue({ data: 'success' });

      await errorHandler(mockError);

      expect(mockPost).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: 'stored-refresh-token',
      });
    });

    it('should save both access_token and refresh_token on refresh success', async () => {
      const mockResponseUse = vi.fn();
      const mockPost = vi.fn();
      const mockRequest = vi.fn();
      const mockCreate = vi.fn().mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: mockResponseUse },
        },
        defaults: { headers: {} },
        post: mockPost,
        request: mockRequest,
      });
      vi.mocked(axios.create).mockImplementation(mockCreate);

      vi.resetModules();
      await import('./axios-config');

      const [[, errorHandler]] = mockResponseUse.mock.calls;

      const mockError = {
        response: { status: 401, data: {} },
        config: { url: '/test', _retry: false, headers: {} },
      } as unknown as AxiosError;

      localStorageMock.getItem.mockReturnValue('old-refresh-token');
      mockPost.mockResolvedValue({
        data: { access_token: 'new-access-token', refresh_token: 'new-refresh-token' },
      });
      mockRequest.mockResolvedValue({ data: 'success' });

      await errorHandler(mockError);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'new-access-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', 'new-refresh-token');
    });

    it('should retry original request after successful token refresh', async () => {
      const mockResponseUse = vi.fn();
      const mockPost = vi.fn();
      const mockRequest = vi.fn();
      const mockCreate = vi.fn().mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: mockResponseUse },
        },
        defaults: { headers: {} },
        post: mockPost,
        request: mockRequest,
      });
      vi.mocked(axios.create).mockImplementation(mockCreate);

      vi.resetModules();
      await import('./axios-config');

      const [[, errorHandler]] = mockResponseUse.mock.calls;

      const originalConfig = {
        url: '/protected-resource',
        method: 'get',
        _retry: false,
        headers: {},
      };

      const mockError = {
        response: { status: 401, data: {} },
        config: originalConfig,
      } as unknown as AxiosError;

      localStorageMock.getItem.mockReturnValue('refresh-token');
      mockPost.mockResolvedValue({
        data: { access_token: 'new-access-token', refresh_token: 'new-refresh-token' },
      });
      mockRequest.mockResolvedValue({ data: 'success' });

      await errorHandler(mockError);

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/protected-resource',
          _retry: true,
        })
      );
    });

    it('should fail when no refresh token is available', async () => {
      const mockResponseUse = vi.fn();
      const mockPost = vi.fn();
      const mockCreate = vi.fn().mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: mockResponseUse },
        },
        defaults: { headers: {} },
        post: mockPost,
      });
      vi.mocked(axios.create).mockImplementation(mockCreate);

      vi.resetModules();
      await import('./axios-config');

      const [[, errorHandler]] = mockResponseUse.mock.calls;

      const mockError = {
        response: { status: 401, data: {} },
        config: { url: '/test', _retry: false, headers: {} },
      } as unknown as AxiosError;

      // No refresh token available
      localStorageMock.getItem.mockReturnValue(null);

      await expect(errorHandler(mockError)).rejects.toThrow('No refresh token available');
    });

    it('should clear tokens and redirect to /login on refresh failure', async () => {
      const mockResponseUse = vi.fn();
      const mockPost = vi.fn();
      const mockCreate = vi.fn().mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: mockResponseUse },
        },
        defaults: { headers: {} },
        post: mockPost,
      });
      vi.mocked(axios.create).mockImplementation(mockCreate);

      vi.resetModules();
      await import('./axios-config');

      const [[, errorHandler]] = mockResponseUse.mock.calls;

      const mockError = {
        response: { status: 401, data: {} },
        config: { url: '/test', _retry: false, headers: {} },
      } as unknown as AxiosError;

      localStorageMock.getItem.mockReturnValue('refresh-token');
      mockPost.mockRejectedValue(new Error('Refresh failed'));

      try {
        await errorHandler(mockError);
      } catch {
        // Expected to throw
      }

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
      expect(global.location.href).toBe('/login');
    });

    it('should handle 401 error when originalRequest config is undefined', async () => {
      const mockResponseUse = vi.fn();
      const mockCreate = vi.fn().mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: mockResponseUse },
        },
        defaults: { headers: {} },
      });
      vi.mocked(axios.create).mockImplementation(mockCreate);

      vi.resetModules();
      await import('./axios-config');

      const [[, errorHandler]] = mockResponseUse.mock.calls;

      // Network error without config
      const mockError = {
        response: { status: 401, data: {} },
        config: undefined,
      } as unknown as AxiosError;

      // Should not throw TypeError, should just reject with original error
      await expect(errorHandler(mockError)).rejects.toBeDefined();
    });

    it('should preserve AxiosError on 403 response', async () => {
      const mockResponseUse = vi.fn();
      const mockCreate = vi.fn().mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: mockResponseUse },
        },
        defaults: { headers: {} },
      });
      vi.mocked(axios.create).mockImplementation(mockCreate);

      vi.resetModules();
      await import('./axios-config');

      const [[, errorHandler]] = mockResponseUse.mock.calls;

      const mockError = {
        response: { status: 403, data: {} },
        config: { url: '/test' },
      } as unknown as AxiosError;

      await expect(errorHandler(mockError)).rejects.toMatchObject({ response: { status: 403 } });
    });

    it('should not transform 403 errors', async () => {
      const mockResponseUse = vi.fn();
      const mockCreate = vi.fn().mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: mockResponseUse },
        },
        defaults: { headers: {} },
      });
      vi.mocked(axios.create).mockImplementation(mockCreate);

      vi.resetModules();
      await import('./axios-config');

      const [[, errorHandler]] = mockResponseUse.mock.calls;

      const mockError = {
        response: { status: 403, data: { message: 'Permission denied' } },
        config: { url: '/test' },
      } as unknown as AxiosError;

      const rejectedError = await errorHandler(mockError).catch((e: unknown) => e);
      expect(rejectedError).toMatchObject({ response: { status: 403 } });
    });

    it('should throw RateLimitError on 429 response', async () => {
      const mockResponseUse = vi.fn();
      const mockCreate = vi.fn().mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: mockResponseUse },
        },
        defaults: { headers: {} },
      });
      vi.mocked(axios.create).mockImplementation(mockCreate);

      vi.resetModules();
      const axiosModule = await import('./axios-config');

      const [[, errorHandler]] = mockResponseUse.mock.calls;

      const mockError = {
        response: { status: 429, data: {} },
        config: { url: '/test' },
      } as unknown as AxiosError;

      await expect(errorHandler(mockError)).rejects.toBeInstanceOf(axiosModule.RateLimitError);
    });

    it('should throw RateLimitError with rate limit message on 429', async () => {
      const mockResponseUse = vi.fn();
      const mockCreate = vi.fn().mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: mockResponseUse },
        },
        defaults: { headers: {} },
      });
      vi.mocked(axios.create).mockImplementation(mockCreate);

      vi.resetModules();
      await import('./axios-config');

      const [[, errorHandler]] = mockResponseUse.mock.calls;

      const mockError = {
        response: { status: 429, data: {} },
        config: { url: '/test' },
      } as unknown as AxiosError;

      await expect(errorHandler(mockError)).rejects.toThrow(/solicitudes|rate limit/i);
    });
  });

  describe('exported error classes', () => {
    it('should export ForbiddenError class', async () => {
      vi.resetModules();
      const axiosModule = await import('./axios-config');

      expect(axiosModule.ForbiddenError).toBeDefined();
      expect(new axiosModule.ForbiddenError('test')).toBeInstanceOf(Error);
    });

    it('should export RateLimitError class', async () => {
      vi.resetModules();
      const axiosModule = await import('./axios-config');

      expect(axiosModule.RateLimitError).toBeDefined();
      expect(new axiosModule.RateLimitError('test')).toBeInstanceOf(Error);
    });

    it('should export apiClient', async () => {
      vi.resetModules();
      const axiosModule = await import('./axios-config');

      expect(axiosModule.apiClient).toBeDefined();
    });
  });
});
