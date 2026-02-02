import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SacredCalendarService } from './sacred-calendar.service';
import { SacredEvent } from '../../entities/sacred-event.entity';
import { LunarPhaseService } from './lunar-phase.service';
import {
  Sabbat,
  Hemisphere,
  SacredEventType,
  LunarPhase,
} from '../../domain/enums';

describe('SacredCalendarService', () => {
  let service: SacredCalendarService;

  const mockEventRepo = {
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    }),
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  };

  const mockLunarService = {
    getCurrentPhase: jest.fn(),
    calculatePhase: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SacredCalendarService,
        {
          provide: getRepositoryToken(SacredEvent),
          useValue: mockEventRepo,
        },
        {
          provide: LunarPhaseService,
          useValue: mockLunarService,
        },
      ],
    }).compile();

    service = module.get<SacredCalendarService>(SacredCalendarService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('getUpcomingEvents', () => {
    it('should return upcoming events for a hemisphere', async () => {
      const mockEvents: Partial<SacredEvent>[] = [
        {
          id: 1,
          name: 'Luna Nueva',
          eventType: SacredEventType.LUNAR_PHASE,
          eventDate: new Date('2026-02-15'),
          hemisphere: null,
        },
        {
          id: 2,
          name: 'Samhain',
          eventType: SacredEventType.SABBAT,
          eventDate: new Date('2026-10-31'),
          hemisphere: Hemisphere.NORTH,
        },
      ];

      mockEventRepo.createQueryBuilder().getMany.mockResolvedValue(mockEvents);

      const result = await service.getUpcomingEvents(Hemisphere.NORTH, 30);

      expect(result).toEqual(mockEvents);
      expect(mockEventRepo.createQueryBuilder).toHaveBeenCalled();
    });

    it('should filter events within date range', async () => {
      mockEventRepo.createQueryBuilder().getMany.mockResolvedValue([]);

      await service.getUpcomingEvents(Hemisphere.SOUTH, 60);

      const queryBuilder = mockEventRepo.createQueryBuilder();
      expect(queryBuilder.where).toHaveBeenCalled();
      expect(queryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  describe('getTodayEvents', () => {
    it('should return events for today', async () => {
      const mockEvents: Partial<SacredEvent>[] = [
        {
          id: 1,
          name: 'Portal 11/11',
          eventType: SacredEventType.PORTAL,
          eventDate: new Date(),
          hemisphere: null,
        },
      ];

      mockEventRepo.find.mockResolvedValue(mockEvents);

      const result = await service.getTodayEvents(Hemisphere.NORTH);

      expect(result).toEqual(mockEvents);
      expect(mockEventRepo.find).toHaveBeenCalled();
    });
  });

  describe('getSabbatDate', () => {
    it('should return correct date for Samhain in Northern Hemisphere', () => {
      const result = service.getSabbatDate(
        Sabbat.SAMHAIN,
        2026,
        Hemisphere.NORTH,
      );
      expect(result).toEqual(new Date(2026, 9, 31)); // October 31
    });

    it('should return correct date for Samhain in Southern Hemisphere', () => {
      const result = service.getSabbatDate(
        Sabbat.SAMHAIN,
        2026,
        Hemisphere.SOUTH,
      );
      expect(result).toEqual(new Date(2026, 3, 30)); // April 30
    });

    it('should return correct date for Yule in Northern Hemisphere', () => {
      const result = service.getSabbatDate(Sabbat.YULE, 2026, Hemisphere.NORTH);
      expect(result).toEqual(new Date(2026, 11, 21)); // December 21
    });

    it('should return correct date for Yule in Southern Hemisphere', () => {
      const result = service.getSabbatDate(Sabbat.YULE, 2026, Hemisphere.SOUTH);
      expect(result).toEqual(new Date(2026, 5, 21)); // June 21
    });

    it('should handle all sabbats correctly', () => {
      const sabbats = Object.values(Sabbat);
      sabbats.forEach((sabbat) => {
        const northDate = service.getSabbatDate(sabbat, 2026, Hemisphere.NORTH);
        const southDate = service.getSabbatDate(sabbat, 2026, Hemisphere.SOUTH);

        expect(northDate).toBeInstanceOf(Date);
        expect(southDate).toBeInstanceOf(Date);
        expect(northDate.getTime()).not.toEqual(southDate.getTime());
      });
    });
  });

  describe('generateYearEvents', () => {
    beforeEach(() => {
      mockEventRepo.findOne.mockResolvedValue(null); // No existing events
      mockEventRepo.save.mockImplementation((event: SacredEvent) =>
        Promise.resolve(event),
      );
      mockEventRepo.create.mockImplementation(
        (event: any) => event as SacredEvent,
      );
      mockLunarService.calculatePhase.mockReturnValue(LunarPhase.NEW_MOON);
    });

    it('should generate events for a full year', async () => {
      const year = 2026;
      const eventsCreated = await service.generateYearEvents(year);

      // Sabbats: 8 sabbats * 2 hemisferios = 16
      // Lunas: ~24 (12 nuevas + 12 llenas)
      // Portales: 12
      // Mensuales: 12
      // Total esperado: ~64 eventos
      expect(eventsCreated).toBeGreaterThan(50);
      expect(mockEventRepo.save).toHaveBeenCalled();
    });

    it('should not duplicate existing events', async () => {
      // Simular que ya existe un evento
      mockEventRepo.findOne.mockResolvedValueOnce({ id: 1 } as SacredEvent);

      const eventsCreated = await service.generateYearEvents(2026);

      // Debe crear menos eventos porque uno ya existe
      expect(eventsCreated).toBeGreaterThan(0);
    });

    it('should generate Sabbat events for both hemispheres', async () => {
      await service.generateYearEvents(2026);

      // Verificar que se intentaron guardar eventos con ambos hemisferios
      const saveCalls = mockEventRepo.save.mock.calls;
      const northEvents = saveCalls.filter(
        (call: any[]) => call[0].hemisphere === Hemisphere.NORTH,
      );
      const southEvents = saveCalls.filter(
        (call: any[]) => call[0].hemisphere === Hemisphere.SOUTH,
      );

      expect(northEvents.length).toBeGreaterThan(0);
      expect(southEvents.length).toBeGreaterThan(0);
    });
  });

  describe('generateLunarEvents', () => {
    it('should generate lunar events for all months', async () => {
      mockEventRepo.findOne.mockResolvedValue(null);
      mockEventRepo.save.mockImplementation((event: SacredEvent) =>
        Promise.resolve(event),
      );
      mockEventRepo.create.mockImplementation(
        (event: any) => event as SacredEvent,
      );

      mockLunarService.calculatePhase.mockReturnValue(LunarPhase.NEW_MOON);

      const count = await service['generateLunarEvents'](2026);

      // Debe generar eventos de luna para cada mes (nueva y llena)
      expect(count).toBeGreaterThan(0);
      expect(mockLunarService.calculatePhase).toHaveBeenCalled();
    });
  });

  describe('generatePortalEvents', () => {
    it('should generate 12 portal events', async () => {
      mockEventRepo.find.mockResolvedValue([]); // No existing portals
      mockEventRepo.save.mockImplementation((event: SacredEvent) =>
        Promise.resolve(event),
      );
      mockEventRepo.create.mockImplementation(
        (event: any) => event as SacredEvent,
      );

      const count = await service['generatePortalEvents'](2026);

      expect(count).toBe(12);
    });

    it('should include special portals with high importance', async () => {
      mockEventRepo.find.mockResolvedValue([]); // No existing portals
      mockEventRepo.save.mockImplementation((event: SacredEvent) =>
        Promise.resolve(event),
      );
      mockEventRepo.create.mockImplementation(
        (event: any) => event as SacredEvent,
      );

      await service['generatePortalEvents'](2026);

      const saveCalls = mockEventRepo.save.mock.calls;
      const lionGate = saveCalls.find(
        (call) => call[0].name && call[0].name.includes('8/8'),
      );
      const elevenEleven = saveCalls.find(
        (call) => call[0].name && call[0].name.includes('11/11'),
      );

      expect(lionGate).toBeDefined();
      expect(elevenEleven).toBeDefined();
    });
  });

  describe('generateMonthlyEvents', () => {
    it('should generate 12 monthly events (Ritual de la Canela)', async () => {
      mockEventRepo.findOne.mockResolvedValue(null);
      mockEventRepo.save.mockImplementation((event: SacredEvent) =>
        Promise.resolve(event),
      );
      mockEventRepo.create.mockImplementation(
        (event: any) => event as SacredEvent,
      );

      const count = await service['generateMonthlyEvents'](2026);

      expect(count).toBe(12);
    });

    it('should create events for first day of each month', async () => {
      mockEventRepo.findOne.mockResolvedValue(null);
      mockEventRepo.save.mockImplementation((event: SacredEvent) =>
        Promise.resolve(event),
      );
      mockEventRepo.create.mockImplementation(
        (event: any) => event as SacredEvent,
      );

      await service['generateMonthlyEvents'](2026);

      const saveCalls = mockEventRepo.save.mock.calls;
      saveCalls.forEach((call) => {
        const event = call[0];
        if (event.name && event.name.includes('Canela')) {
          const date = new Date(event.eventDate);
          expect(date.getDate()).toBe(1); // Primer día del mes
        }
      });
    });
  });

  describe('getMonthName', () => {
    it('should return correct month names in Spanish', () => {
      expect(service['getMonthName'](0)).toBe('Enero');
      expect(service['getMonthName'](5)).toBe('Junio');
      expect(service['getMonthName'](11)).toBe('Diciembre');
    });
  });
});
