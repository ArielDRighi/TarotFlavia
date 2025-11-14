import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseHealthService } from './database-health.service';
import { DataSource } from 'typeorm';

interface MockDataSource {
  driver: {
    master: {
      _clients: unknown[];
      _idle: unknown[];
      waitingCount: number;
      options: { max: number; min: number };
    };
  };
  isInitialized: boolean;
}

describe('DatabaseHealthService', () => {
  let service: DatabaseHealthService;
  let mockDataSource: MockDataSource;

  beforeEach(async () => {
    // Simple mock
    mockDataSource = {
      driver: {
        master: {
          _clients: Array(5).fill({}),
          _idle: Array(2).fill({}),
          waitingCount: 0,
          options: { max: 10, min: 2 },
        },
      },
      isInitialized: true,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseHealthService,
        {
          provide: DataSource,
          useValue: mockDataSource as unknown as DataSource,
        },
      ],
    }).compile();

    service = module.get<DatabaseHealthService>(DatabaseHealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPoolMetrics', () => {
    it('should return basic pool metrics', () => {
      const metrics = service.getPoolMetrics();

      expect(metrics).toHaveProperty('active');
      expect(metrics).toHaveProperty('idle');
      expect(metrics).toHaveProperty('waiting');
      expect(metrics).toHaveProperty('max');
      expect(metrics).toHaveProperty('total');
      expect(metrics).toHaveProperty('utilizationPercent');
      expect(metrics).toHaveProperty('timestamp');
    });
  });

  describe('getHealthStatus', () => {
    it('should return health status', () => {
      const status = service.getHealthStatus();

      expect(status).toHaveProperty('status');
      expect(['up', 'down']).toContain(status.status);
    });
  });
});
