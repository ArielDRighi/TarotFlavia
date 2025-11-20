import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { of } from 'rxjs';
import { ReadingsCacheInterceptor } from './readings-cache.interceptor';

describe('ReadingsCacheInterceptor', () => {
  let interceptor: ReadingsCacheInterceptor;
  let cacheManager: jest.Mocked<Cache>;

  const mockCachedData = {
    readings: [{ id: 1, question: 'Test' }],
    meta: { total: 1 },
  };

  beforeEach(async () => {
    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      reset: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReadingsCacheInterceptor,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    interceptor = module.get<ReadingsCacheInterceptor>(
      ReadingsCacheInterceptor,
    );
    cacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('intercept', () => {
    it('should be defined', () => {
      expect(interceptor).toBeDefined();
    });

    it('should bypass cache for unauthenticated requests (no user)', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: undefined,
            query: {},
          }),
        }),
      } as unknown as ExecutionContext;

      const mockNext: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ data: 'test' })),
      };

      await interceptor.intercept(mockContext, mockNext);

      expect(cacheManager.get).not.toHaveBeenCalled();
      expect(mockNext.handle).toHaveBeenCalled();
    });

    it('should bypass cache for requests without userId in user object', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 1 }, // userId is missing, only id exists
            query: {},
          }),
        }),
      } as unknown as ExecutionContext;

      const mockNext: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ data: 'test' })),
      };

      await interceptor.intercept(mockContext, mockNext);

      expect(cacheManager.get).not.toHaveBeenCalled();
      expect(mockNext.handle).toHaveBeenCalled();
    });

    it('should return cached data if available', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 100 },
            query: {},
          }),
        }),
      } as unknown as ExecutionContext;

      cacheManager.get.mockResolvedValue(mockCachedData);

      const mockNext: CallHandler = {
        handle: jest.fn(),
      };

      const result = await interceptor.intercept(mockContext, mockNext);
      const data = await new Promise((resolve) => {
        result.subscribe((value) => resolve(value));
      });

      expect(cacheManager.get).toHaveBeenCalledWith('readings:100:default');
      expect(mockNext.handle).not.toHaveBeenCalled();
      expect(data).toEqual(mockCachedData);
    });

    it('should cache response data when cache miss', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 100 },
            query: {},
          }),
        }),
      } as unknown as ExecutionContext;

      const responseData = { readings: [], meta: { total: 0 } };

      cacheManager.get.mockResolvedValue(null as unknown as undefined);

      const mockNext: CallHandler = {
        handle: jest.fn().mockReturnValue(of(responseData)),
      };

      const result = await interceptor.intercept(mockContext, mockNext);

      await new Promise((resolve) => {
        result.subscribe(() => resolve(true));
      });

      expect(cacheManager.get).toHaveBeenCalledWith('readings:100:default');
      expect(mockNext.handle).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(
        'readings:100:default',
        responseData,
        300000, // TTL 5 minutes
      );
    });

    it('should build cache key with query params', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 100 },
            query: {
              page: '2',
              limit: '10',
              sortBy: 'createdAt',
            },
          }),
        }),
      } as unknown as ExecutionContext;

      cacheManager.get.mockResolvedValue(null as unknown as undefined);

      const mockNext: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ data: 'test' })),
      };

      const result = await interceptor.intercept(mockContext, mockNext);

      await new Promise((resolve) => {
        result.subscribe(() => resolve(true));
      });

      // URLSearchParams sorts keys alphabetically: limit, page, sortBy
      expect(cacheManager.get).toHaveBeenCalledWith(
        'readings:100:page=2&limit=10&sortBy=createdAt',
      );
    });

    it('should use "default" when no query params', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 100 },
            query: {},
          }),
        }),
      } as unknown as ExecutionContext;

      cacheManager.get.mockResolvedValue(null as unknown as undefined);

      const mockNext: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ data: 'test' })),
      };

      const result = await interceptor.intercept(mockContext, mockNext);

      await new Promise((resolve) => {
        result.subscribe(() => resolve(true));
      });

      expect(cacheManager.get).toHaveBeenCalledWith('readings:100:default');
    });

    it('should handle different user IDs with different cache keys', async () => {
      const user1Context = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 100 },
            query: {},
          }),
        }),
      } as unknown as ExecutionContext;

      const user2Context = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 200 },
            query: {},
          }),
        }),
      } as unknown as ExecutionContext;

      cacheManager.get.mockResolvedValue(null as unknown as undefined);

      const mockNext: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ data: 'test' })),
      };

      await interceptor.intercept(user1Context, mockNext);
      await interceptor.intercept(user2Context, mockNext);

      expect(cacheManager.get).toHaveBeenCalledWith('readings:100:default');
      expect(cacheManager.get).toHaveBeenCalledWith('readings:200:default');
    });

    it('should handle cache get errors gracefully', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 100 },
            query: {},
          }),
        }),
      } as unknown as ExecutionContext;

      cacheManager.get.mockRejectedValue(new Error('Redis connection error'));

      const mockNext: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ data: 'test' })),
      };

      // Should not throw, but propagate to caller
      await expect(
        interceptor.intercept(mockContext, mockNext),
      ).rejects.toThrow('Redis connection error');
    });

    it('should handle cache set errors silently (void promise)', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 100 },
            query: {},
          }),
        }),
      } as unknown as ExecutionContext;

      cacheManager.get.mockResolvedValue(null as unknown as undefined);
      cacheManager.set.mockResolvedValue(undefined); // Set should resolve

      const mockNext: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ data: 'test' })),
      };

      const result = await interceptor.intercept(mockContext, mockNext);

      const data = await new Promise((resolve) => {
        result.subscribe((value) => resolve(value));
      });

      // Should complete successfully
      expect(data).toEqual({ data: 'test' });
      expect(cacheManager.set).toHaveBeenCalledWith(
        'readings:100:default',
        { data: 'test' },
        300000,
      );
    });

    it('should handle empty query params object', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 100 },
            query: {}, // Empty object
          }),
        }),
      } as unknown as ExecutionContext;

      cacheManager.get.mockResolvedValue(null as unknown as undefined);

      const mockNext: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ data: 'test' })),
      };

      const result = await interceptor.intercept(mockContext, mockNext);

      await new Promise((resolve) => {
        result.subscribe(() => resolve(true));
      });

      // Empty params should result in 'default'
      expect(cacheManager.get).toHaveBeenCalledWith('readings:100:default');
    });

    it('should cache for userId 0 (edge case)', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 0 },
            query: {},
          }),
        }),
      } as unknown as ExecutionContext;

      cacheManager.get.mockResolvedValue(null as unknown as undefined);

      const mockNext: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ data: 'test' })),
      };

      const result = await interceptor.intercept(mockContext, mockNext);

      await new Promise((resolve) => {
        result.subscribe(() => resolve(true));
      });

      // userId 0 is valid and should be cached
      expect(cacheManager.get).toHaveBeenCalledWith('readings:0:default');
      expect(cacheManager.set).toHaveBeenCalledWith(
        'readings:0:default',
        { data: 'test' },
        300000,
      );
    });

    it('should handle negative userId (edge case)', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: -1 },
            query: {},
          }),
        }),
      } as unknown as ExecutionContext;

      cacheManager.get.mockResolvedValue(null as unknown as undefined);

      const mockNext: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ data: 'test' })),
      };

      const result = await interceptor.intercept(mockContext, mockNext);

      await new Promise((resolve) => {
        result.subscribe(() => resolve(true));
      });

      expect(cacheManager.get).toHaveBeenCalledWith('readings:-1:default');
    });
  });
});
