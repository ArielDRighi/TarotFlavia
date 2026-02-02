import { Test, TestingModule } from '@nestjs/testing';
import { SacredCalendarCronService } from './sacred-calendar-cron.service';
import { SacredCalendarService } from '../services/sacred-calendar.service';

describe('SacredCalendarCronService', () => {
  let service: SacredCalendarCronService;

  const mockCalendarService = {
    generateYearEvents: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SacredCalendarCronService,
        {
          provide: SacredCalendarService,
          useValue: mockCalendarService,
        },
      ],
    }).compile();

    service = module.get<SacredCalendarCronService>(SacredCalendarCronService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateNextYearEvents', () => {
    it('should generate events for next year', async () => {
      const nextYear = new Date().getFullYear() + 1;
      mockCalendarService.generateYearEvents.mockResolvedValue(64);

      await service.generateNextYearEvents();

      expect(mockCalendarService.generateYearEvents).toHaveBeenCalledWith(
        nextYear,
      );
    });

    it('should log the number of events created', async () => {
      const logSpy = jest.spyOn(service['logger'], 'log');
      mockCalendarService.generateYearEvents.mockResolvedValue(64);

      await service.generateNextYearEvents();

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Generando eventos'),
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Creados 64 eventos'),
      );
    });

    it('should handle errors gracefully', async () => {
      const errorSpy = jest.spyOn(service['logger'], 'error');
      mockCalendarService.generateYearEvents.mockRejectedValue(
        new Error('Database error'),
      );

      await service.generateNextYearEvents();

      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('generateEventsForYear', () => {
    it('should generate events for specific year', async () => {
      mockCalendarService.generateYearEvents.mockResolvedValue(64);

      const result = await service.generateEventsForYear(2027);

      expect(mockCalendarService.generateYearEvents).toHaveBeenCalledWith(2027);
      expect(result).toBe(64);
    });

    it('should log when generating events manually', async () => {
      const logSpy = jest.spyOn(service['logger'], 'log');
      mockCalendarService.generateYearEvents.mockResolvedValue(64);

      await service.generateEventsForYear(2027);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Generando eventos manualmente para el año 2027',
        ),
      );
    });
  });
});
