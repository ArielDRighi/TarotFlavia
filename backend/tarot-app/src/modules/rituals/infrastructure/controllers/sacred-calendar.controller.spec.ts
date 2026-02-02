import { Test, TestingModule } from '@nestjs/testing';
import { SacredCalendarController } from './sacred-calendar.controller';
import { SacredCalendarService } from '../../application/services/sacred-calendar.service';
import { ForbiddenException } from '@nestjs/common';
import {
  Hemisphere,
  SacredEventType,
  LunarPhase,
  SacredEventImportance,
  RitualCategory,
} from '../../domain/enums';
import { UserPlan } from '../../../users/application/dto/user-profile-response.dto';

describe('SacredCalendarController', () => {
  let controller: SacredCalendarController;
  let service: SacredCalendarService;

  const mockEvents = [
    {
      id: 1,
      name: 'Luna Nueva de Enero',
      slug: 'luna-nueva-2025-01',
      description: 'Luna Nueva en enero. Ideal para nuevos comienzos.',
      eventType: SacredEventType.LUNAR_PHASE,
      sabbat: null,
      lunarPhase: LunarPhase.NEW_MOON,
      eventDate: new Date('2025-01-15T12:00:00.000Z'),
      eventTime: null,
      hemisphere: null,
      importance: SacredEventImportance.HIGH,
      energyDescription: 'Ideal para nuevos comienzos.',
      suggestedRitualCategories: [RitualCategory.LUNAR],
      suggestedRitualIds: null,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 2,
      name: 'Luna Llena de Enero',
      slug: 'luna-llena-2025-01',
      description: 'Luna Llena en enero. Momento de culminación.',
      eventType: SacredEventType.LUNAR_PHASE,
      sabbat: null,
      lunarPhase: LunarPhase.FULL_MOON,
      eventDate: new Date('2025-01-28T12:00:00.000Z'),
      eventTime: null,
      hemisphere: null,
      importance: SacredEventImportance.HIGH,
      energyDescription: 'Momento de culminación.',
      suggestedRitualCategories: [
        RitualCategory.LUNAR,
        RitualCategory.CLEANSING,
      ],
      suggestedRitualIds: null,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 3,
      name: 'Portal 2/2',
      slug: 'portal-2-2',
      description: 'Equilibrio y dualidad.',
      eventType: SacredEventType.PORTAL,
      sabbat: null,
      lunarPhase: null,
      eventDate: new Date('2025-02-02T12:00:00.000Z'),
      eventTime: null,
      hemisphere: null,
      importance: SacredEventImportance.MEDIUM,
      energyDescription: 'Equilibrio y dualidad.',
      suggestedRitualCategories: [RitualCategory.MEDITATION],
      suggestedRitualIds: null,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 4,
      name: 'Portal 3/3',
      slug: 'portal-3-3',
      description: 'Creatividad y expresión.',
      eventType: SacredEventType.PORTAL,
      sabbat: null,
      lunarPhase: null,
      eventDate: new Date('2025-03-03T12:00:00.000Z'),
      eventTime: null,
      hemisphere: null,
      importance: SacredEventImportance.MEDIUM,
      energyDescription: 'Creatividad y expresión.',
      suggestedRitualCategories: [RitualCategory.MEDITATION],
      suggestedRitualIds: null,
      isActive: true,
      createdAt: new Date(),
    },
  ];

  const mockService = {
    getUpcomingEvents: jest.fn(),
    getTodayEvents: jest.fn(),
    getMonthEvents: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SacredCalendarController],
      providers: [
        {
          provide: SacredCalendarService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SacredCalendarController>(SacredCalendarController);
    service = module.get<SacredCalendarService>(SacredCalendarService);

    // Clear mocks
    jest.clearAllMocks();
  });

  describe('getUpcomingEvents', () => {
    it('should return all events for premium users', async () => {
      mockService.getUpcomingEvents.mockResolvedValue(mockEvents);

      const user = {
        userId: 1,
        plan: UserPlan.PREMIUM,
        hemisphere: Hemisphere.SOUTH,
      };

      const result = await controller.getUpcomingEvents(30, user);

      expect(result).toHaveLength(4);
      expect(result[0].name).toBe('Luna Nueva de Enero');
      expect(service.getUpcomingEvents).toHaveBeenCalledWith(
        Hemisphere.SOUTH,
        30,
      );
    });

    it('should return only 3 events for free users', async () => {
      mockService.getUpcomingEvents.mockResolvedValue(mockEvents);

      const user = {
        userId: 1,
        plan: UserPlan.FREE,
        hemisphere: Hemisphere.SOUTH,
      };

      const result = await controller.getUpcomingEvents(30, user);

      expect(result).toHaveLength(3);
      expect(service.getUpcomingEvents).toHaveBeenCalledWith(
        Hemisphere.SOUTH,
        30,
      );
    });

    it('should return only 3 events for anonymous users', async () => {
      mockService.getUpcomingEvents.mockResolvedValue(mockEvents);

      const result = await controller.getUpcomingEvents(30, undefined);

      expect(result).toHaveLength(3);
      expect(service.getUpcomingEvents).toHaveBeenCalledWith(
        Hemisphere.SOUTH,
        30,
      );
    });

    it('should use default days of 30 if not provided', async () => {
      mockService.getUpcomingEvents.mockResolvedValue(mockEvents);

      await controller.getUpcomingEvents(undefined, undefined);

      expect(service.getUpcomingEvents).toHaveBeenCalledWith(
        Hemisphere.SOUTH,
        30,
      );
    });

    it('should use user hemisphere if provided', async () => {
      mockService.getUpcomingEvents.mockResolvedValue([]);

      const user = {
        userId: 1,
        plan: UserPlan.FREE,
        hemisphere: Hemisphere.NORTH,
      };

      await controller.getUpcomingEvents(30, user);

      expect(service.getUpcomingEvents).toHaveBeenCalledWith(
        Hemisphere.NORTH,
        30,
      );
    });

    it('should convert Date to YYYY-MM-DD string in response', async () => {
      mockService.getUpcomingEvents.mockResolvedValue([mockEvents[0]]);

      const user = {
        userId: 1,
        plan: UserPlan.PREMIUM,
        hemisphere: Hemisphere.SOUTH,
      };

      const result = await controller.getUpcomingEvents(30, user);

      expect(typeof result[0].eventDate).toBe('string');
      expect(result[0].eventDate).toBe('2025-01-15');
    });
  });

  describe('getTodayEvents', () => {
    it('should return today events for authenticated user', async () => {
      mockService.getTodayEvents.mockResolvedValue([mockEvents[0]]);

      const user = {
        userId: 1,
        hemisphere: Hemisphere.SOUTH,
      };

      const result = await controller.getTodayEvents(user);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Luna Nueva de Enero');
      expect(service.getTodayEvents).toHaveBeenCalledWith(Hemisphere.SOUTH);
    });

    it('should use default hemisphere for anonymous users', async () => {
      mockService.getTodayEvents.mockResolvedValue([mockEvents[0]]);

      const result = await controller.getTodayEvents(undefined);

      expect(result).toHaveLength(1);
      expect(service.getTodayEvents).toHaveBeenCalledWith(Hemisphere.SOUTH);
    });

    it('should convert Date to YYYY-MM-DD string in response', async () => {
      mockService.getTodayEvents.mockResolvedValue([mockEvents[0]]);

      const result = await controller.getTodayEvents(undefined);

      expect(typeof result[0].eventDate).toBe('string');
      expect(result[0].eventDate).toBe('2025-01-15');
    });
  });

  describe('getMonthEvents', () => {
    it('should return month events for premium users', async () => {
      mockService.getMonthEvents = jest
        .fn()
        .mockResolvedValue([mockEvents[0], mockEvents[1]]);

      const user = {
        userId: 1,
        plan: UserPlan.PREMIUM,
        hemisphere: Hemisphere.SOUTH,
      };

      const result = await controller.getMonthEvents(2025, 1, user);

      expect(result).toHaveLength(2);
      expect(service.getMonthEvents).toHaveBeenCalledWith(
        2025,
        1,
        Hemisphere.SOUTH,
      );
    });

    it('should throw ForbiddenException for non-premium users', async () => {
      const user = {
        userId: 1,
        plan: UserPlan.FREE,
        hemisphere: Hemisphere.SOUTH,
      };

      await expect(controller.getMonthEvents(2025, 1, user)).rejects.toThrow(
        ForbiddenException,
      );
      expect(service.getMonthEvents).not.toHaveBeenCalled();
    });

    it('should use user hemisphere', async () => {
      mockService.getMonthEvents = jest.fn().mockResolvedValue([mockEvents[0]]);

      const user = {
        userId: 1,
        plan: UserPlan.PREMIUM,
        hemisphere: Hemisphere.NORTH,
      };

      await controller.getMonthEvents(2025, 1, user);

      expect(service.getMonthEvents).toHaveBeenCalledWith(
        2025,
        1,
        Hemisphere.NORTH,
      );
    });

    it('should use default hemisphere if user has no hemisphere', async () => {
      mockService.getMonthEvents = jest.fn().mockResolvedValue([mockEvents[0]]);

      const user = {
        userId: 1,
        plan: UserPlan.PREMIUM,
        hemisphere: undefined,
      };

      await controller.getMonthEvents(2025, 1, user);

      expect(service.getMonthEvents).toHaveBeenCalledWith(
        2025,
        1,
        Hemisphere.SOUTH,
      );
    });

    it('should convert Date to YYYY-MM-DD string in response', async () => {
      mockService.getMonthEvents = jest.fn().mockResolvedValue([mockEvents[0]]);

      const user = {
        userId: 1,
        plan: UserPlan.PREMIUM,
        hemisphere: Hemisphere.SOUTH,
      };

      const result = await controller.getMonthEvents(2025, 1, user);

      expect(typeof result[0].eventDate).toBe('string');
      expect(result[0].eventDate).toBe('2025-01-15');
    });
  });
});
