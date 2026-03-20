import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GetServiceAvailabilityUseCase } from './get-service-availability.use-case';
import {
  HOLISTIC_SERVICE_REPOSITORY,
  SERVICE_PURCHASE_REPOSITORY,
  IHolisticServiceRepository,
} from '../../domain/interfaces';
import { IServicePurchaseRepository } from '../../domain/interfaces/service-purchase-repository.interface';
import { ServicePurchase } from '../../entities/service-purchase.entity';
import { PurchaseStatus as HolisticPurchaseStatus } from '../../domain/enums/purchase-status.enum';
import { IAvailabilityRepository } from '../../../scheduling/domain/interfaces/availability-repository.interface';
import { IExceptionRepository } from '../../../scheduling/domain/interfaces/exception-repository.interface';
import { ISessionRepository } from '../../../scheduling/domain/interfaces/session-repository.interface';
import {
  AVAILABILITY_REPOSITORY,
  EXCEPTION_REPOSITORY,
  SESSION_REPOSITORY,
} from '../../../scheduling/domain/interfaces/repository.tokens';
import { HolisticService } from '../../entities/holistic-service.entity';
import {
  SessionType,
  DayOfWeek,
  ExceptionType,
  SessionStatus,
  PaymentStatus,
} from '../../../scheduling/domain/enums';
import { TarotistAvailability } from '../../../scheduling/entities/tarotist-availability.entity';
import { TarotistException } from '../../../scheduling/entities/tarotist-exception.entity';
import { Session } from '../../../scheduling/entities/session.entity';

const FLAVIA_TAROTISTA_ID = 1;

const mockHolisticService: HolisticService = {
  id: 1,
  name: 'Trabajo con el Árbol Genealógico',
  slug: 'arbol-genealogico',
  shortDescription: '¿Qué heredamos del árbol familiar?',
  longDescription: 'Descripción larga del servicio...',
  priceArs: 15000,
  durationMinutes: 60,
  sessionType: SessionType.FAMILY_TREE,
  whatsappNumber: '+5491112345678',
  mercadoPagoLink: 'https://mpago.la/1234567',
  imageUrl: null,
  displayOrder: 1,
  isActive: true,
  purchases: [],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

// 2099-06-09 is a Monday
const mockAvailabilityMonday: TarotistAvailability = {
  id: 1,
  tarotistaId: FLAVIA_TAROTISTA_ID,
  dayOfWeek: DayOfWeek.MONDAY,
  startTime: '09:00',
  endTime: '11:00',
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
} as TarotistAvailability;

const mockBlockedException: TarotistException = {
  id: 1,
  tarotistaId: FLAVIA_TAROTISTA_ID,
  exceptionDate: '2099-06-01',
  exceptionType: ExceptionType.BLOCKED,
  startTime: null,
  endTime: null,
  reason: 'Vacaciones',
  createdAt: new Date(),
} as TarotistException;

const mockOccupiedSession: Session = {
  id: 10,
  tarotistaId: FLAVIA_TAROTISTA_ID,
  userId: 5,
  sessionDate: '2099-06-01',
  sessionTime: '09:00',
  durationMinutes: 60,
  sessionType: SessionType.FAMILY_TREE,
  status: SessionStatus.CONFIRMED,
  priceUsd: 0,
  paymentStatus: PaymentStatus.PENDING,
  googleMeetLink: '',
  userEmail: 'test@test.com',
  userNotes: null,
  tarotistNotes: null,
  cancelledAt: null,
  cancellationReason: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  confirmedAt: null,
  completedAt: null,
} as Session;

describe('GetServiceAvailabilityUseCase', () => {
  let useCase: GetServiceAvailabilityUseCase;
  let mockHolisticRepo: jest.Mocked<IHolisticServiceRepository>;
  let mockPurchaseRepo: jest.Mocked<IServicePurchaseRepository>;
  let mockAvailabilityRepo: jest.Mocked<IAvailabilityRepository>;
  let mockExceptionRepo: jest.Mocked<IExceptionRepository>;
  let mockSessionRepo: jest.Mocked<ISessionRepository>;

  beforeEach(async () => {
    mockHolisticRepo = {
      findAllActive: jest.fn(),
      findBySlug: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    mockPurchaseRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByUserIdWithService: jest.fn(),
      findPendingByUserAndService: jest.fn(),
      findPendingPayments: jest.fn(),
      findAllPurchases: jest.fn(),
      findByIdWithRelations: jest.fn(),
      updateStatus: jest.fn(),
      updateStatusIfCurrent: jest.fn(),
      findPaidUnassignedByUserAndSessionType: jest.fn(),
      findByMercadoPagoPaymentId: jest.fn(),
      findByPreferenceId: jest.fn(),
      findActiveByDate: jest.fn(),
    };

    mockAvailabilityRepo = {
      setWeeklyAvailability: jest.fn(),
      getWeeklyAvailability: jest.fn(),
      removeWeeklyAvailability: jest.fn(),
      findByTarotistaAndDay: jest.fn(),
    };

    mockExceptionRepo = {
      addException: jest.fn(),
      getExceptions: jest.fn(),
      getExceptionsByDateRange: jest.fn(),
      removeException: jest.fn(),
      findByTarotistaAndDate: jest.fn(),
    };

    mockSessionRepo = {
      createSession: jest.fn(),
      findSessionById: jest.fn(),
      findSessionsByUser: jest.fn(),
      findSessionsByTarotist: jest.fn(),
      findSessionsByTarotistAndDateRange: jest.fn(),
      findPendingSessionByUserAndTarotist: jest.fn(),
      findConflictingSession: jest.fn(),
      updateSession: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetServiceAvailabilityUseCase,
        { provide: HOLISTIC_SERVICE_REPOSITORY, useValue: mockHolisticRepo },
        { provide: SERVICE_PURCHASE_REPOSITORY, useValue: mockPurchaseRepo },
        { provide: AVAILABILITY_REPOSITORY, useValue: mockAvailabilityRepo },
        { provide: EXCEPTION_REPOSITORY, useValue: mockExceptionRepo },
        { provide: SESSION_REPOSITORY, useValue: mockSessionRepo },
      ],
    }).compile();

    useCase = module.get(GetServiceAvailabilityUseCase);
  });

  afterEach(() => jest.clearAllMocks());

  describe('validaciones de entrada', () => {
    it('debe lanzar NotFoundException si el servicio no existe para el slug', async () => {
      mockHolisticRepo.findBySlug.mockResolvedValue(null);

      await expect(
        useCase.execute('slug-inexistente', '2099-06-09'),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar NotFoundException si el servicio está inactivo', async () => {
      mockHolisticRepo.findBySlug.mockResolvedValue({
        ...mockHolisticService,
        isActive: false,
      });

      await expect(
        useCase.execute('arbol-genealogico', '2099-06-09'),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar BadRequestException si el formato de fecha es inválido', async () => {
      mockHolisticRepo.findBySlug.mockResolvedValue(mockHolisticService);

      await expect(
        useCase.execute('arbol-genealogico', 'fecha-invalida'),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si la fecha es en el pasado', async () => {
      mockHolisticRepo.findBySlug.mockResolvedValue(mockHolisticService);

      await expect(
        useCase.execute('arbol-genealogico', '2020-01-01'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('retorno de slots', () => {
    const futureMonday = '2099-06-01'; // Monday
    const futureTuesday = '2099-06-02'; // Tuesday

    beforeEach(() => {
      mockHolisticRepo.findBySlug.mockResolvedValue(mockHolisticService);
      mockExceptionRepo.getExceptionsByDateRange.mockResolvedValue([]);
      mockSessionRepo.findSessionsByTarotistAndDateRange.mockResolvedValue([]);
      mockPurchaseRepo.findActiveByDate.mockResolvedValue([]);
    });

    it('debe retornar objeto con date y slots cuando el servicio existe', async () => {
      mockAvailabilityRepo.getWeeklyAvailability.mockResolvedValue([
        mockAvailabilityMonday,
      ]);

      const result = await useCase.execute('arbol-genealogico', futureMonday);

      expect(result.date).toBe(futureMonday);
      expect(Array.isArray(result.slots)).toBe(true);
    });

    it('debe retornar lista vacía si no hay disponibilidad semanal configurada', async () => {
      mockAvailabilityRepo.getWeeklyAvailability.mockResolvedValue([]);

      const result = await useCase.execute('arbol-genealogico', futureMonday);

      expect(result.slots).toHaveLength(0);
    });

    it('debe retornar lista vacía si el día consultado no tiene disponibilidad', async () => {
      // mockAvailabilityMonday es lunes; 2099-06-02 es martes
      mockAvailabilityRepo.getWeeklyAvailability.mockResolvedValue([
        mockAvailabilityMonday,
      ]);

      const result = await useCase.execute('arbol-genealogico', futureTuesday);

      expect(result.date).toBe(futureTuesday);
      expect(result.slots).toHaveLength(0);
    });

    it('debe retornar lista vacía si el día está bloqueado por excepción', async () => {
      mockAvailabilityRepo.getWeeklyAvailability.mockResolvedValue([
        mockAvailabilityMonday,
      ]);
      mockExceptionRepo.getExceptionsByDateRange.mockResolvedValue([
        mockBlockedException,
      ]);

      const result = await useCase.execute('arbol-genealogico', futureMonday);

      expect(result.slots).toHaveLength(0);
    });

    it('cada slot debe tener time (string) y available (boolean)', async () => {
      mockAvailabilityRepo.getWeeklyAvailability.mockResolvedValue([
        mockAvailabilityMonday,
      ]);

      const result = await useCase.execute('arbol-genealogico', futureMonday);

      expect(result.slots.length).toBeGreaterThan(0);
      result.slots.forEach((slot) => {
        expect(typeof slot.time).toBe('string');
        expect(typeof slot.available).toBe('boolean');
      });
    });

    it('debe consultar los repos de scheduling con FLAVIA_TAROTISTA_ID=1', async () => {
      mockAvailabilityRepo.getWeeklyAvailability.mockResolvedValue([
        mockAvailabilityMonday,
      ]);

      await useCase.execute('arbol-genealogico', futureMonday);

      expect(mockAvailabilityRepo.getWeeklyAvailability).toHaveBeenCalledWith(
        FLAVIA_TAROTISTA_ID,
      );
      expect(mockExceptionRepo.getExceptionsByDateRange).toHaveBeenCalledWith(
        FLAVIA_TAROTISTA_ID,
        futureMonday,
        futureMonday,
      );
      expect(
        mockSessionRepo.findSessionsByTarotistAndDateRange,
      ).toHaveBeenCalledWith(
        FLAVIA_TAROTISTA_ID,
        futureMonday,
        futureMonday,
        expect.any(Array),
      );
    });

    it('debe marcar available=false para slots ocupados por sesiones existentes', async () => {
      mockAvailabilityRepo.getWeeklyAvailability.mockResolvedValue([
        mockAvailabilityMonday, // 09:00-11:00
      ]);
      mockSessionRepo.findSessionsByTarotistAndDateRange.mockResolvedValue([
        mockOccupiedSession, // 09:00, duration 60min
      ]);

      const result = await useCase.execute('arbol-genealogico', futureMonday);

      const slot900 = result.slots.find((s) => s.time === '09:00');
      expect(slot900).toBeDefined();
      expect(slot900?.available).toBe(false);

      const slot930 = result.slots.find((s) => s.time === '09:30');
      if (slot930) {
        // 09:30 slot conflicts with 09:00-10:00 session
        expect(slot930.available).toBe(false);
      }
    });

    it('debe generar slots con intervalo de 30 minutos', async () => {
      mockAvailabilityRepo.getWeeklyAvailability.mockResolvedValue([
        mockAvailabilityMonday, // 09:00-11:00 → 09:00, 09:30, 10:00, 10:30 = 4 slots
      ]);

      const result = await useCase.execute('arbol-genealogico', futureMonday);

      expect(result.slots).toHaveLength(4);
      expect(result.slots[0].time).toBe('09:00');
      expect(result.slots[1].time).toBe('09:30');
      expect(result.slots[2].time).toBe('10:00');
      expect(result.slots[3].time).toBe('10:30');
    });

    it('debe incluir slots ocupados en la respuesta marcados como available=false', async () => {
      mockAvailabilityRepo.getWeeklyAvailability.mockResolvedValue([
        mockAvailabilityMonday,
      ]);
      mockSessionRepo.findSessionsByTarotistAndDateRange.mockResolvedValue([
        mockOccupiedSession,
      ]);

      const result = await useCase.execute('arbol-genealogico', futureMonday);

      // Todos los slots deben estar presentes (4 total)
      expect(result.slots).toHaveLength(4);
      // Pero el 09:00 y 09:30 deben estar ocupados
      const availableSlots = result.slots.filter((s) => s.available);
      const occupiedSlots = result.slots.filter((s) => !s.available);
      expect(occupiedSlots.length).toBeGreaterThan(0);
      expect(availableSlots.length).toBeGreaterThan(0);
    });
  });

  describe('filtro de anticipación mínima (minAdvanceHours)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      mockHolisticRepo.findBySlug.mockResolvedValue(mockHolisticService);
      mockExceptionRepo.getExceptionsByDateRange.mockResolvedValue([]);
      mockSessionRepo.findSessionsByTarotistAndDateRange.mockResolvedValue([]);
      mockPurchaseRepo.findActiveByDate.mockResolvedValue([]);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('debe marcar available=false para slots con menos de 2 horas de anticipación', async () => {
      // "now" = 09:00 → minDateTime = 11:00 → slots 09:00 y 09:30 quedan dentro del umbral
      jest.setSystemTime(new Date('2099-06-01T09:00:00'));

      mockAvailabilityRepo.getWeeklyAvailability.mockResolvedValue([
        mockAvailabilityMonday, // 09:00-11:00 → 09:00, 09:30, 10:00, 10:30
      ]);

      const result = await useCase.execute('arbol-genealogico', '2099-06-01');

      // 09:00 < minDateTime (11:00) → no disponible
      const slot900 = result.slots.find((s) => s.time === '09:00');
      expect(slot900).toBeDefined();
      expect(slot900?.available).toBe(false);

      // 09:30 < 11:00 → no disponible
      const slot930 = result.slots.find((s) => s.time === '09:30');
      expect(slot930).toBeDefined();
      expect(slot930?.available).toBe(false);
    });

    it('debe mantener available=true para slots con 2 horas o más de anticipación', async () => {
      // "now" = 07:00 → minDateTime = 09:00 → slot 09:00 es exactamente el umbral
      jest.setSystemTime(new Date('2099-06-01T07:00:00'));

      mockAvailabilityRepo.getWeeklyAvailability.mockResolvedValue([
        mockAvailabilityMonday, // 09:00-11:00
      ]);

      const result = await useCase.execute('arbol-genealogico', '2099-06-01');

      // 09:00 == minDateTime → disponible (no es estrictamente menor)
      const slot900 = result.slots.find((s) => s.time === '09:00');
      expect(slot900).toBeDefined();
      expect(slot900?.available).toBe(true);
    });

    it('debe incluir todos los slots en la respuesta aunque algunos no estén disponibles por anticipación', async () => {
      // "now" = 10:00 → minDateTime = 12:00 → los 4 slots (09:00-11:00) quedan antes
      jest.setSystemTime(new Date('2099-06-01T10:00:00'));

      mockAvailabilityRepo.getWeeklyAvailability.mockResolvedValue([
        mockAvailabilityMonday, // 09:00-11:00 → 4 slots
      ]);

      const result = await useCase.execute('arbol-genealogico', '2099-06-01');

      // Todos los 4 slots deben estar presentes
      expect(result.slots).toHaveLength(4);
      // Todos marcados como no disponibles por anticipación insuficiente
      result.slots.forEach((slot) => {
        expect(slot.available).toBe(false);
      });
    });
  });

  describe('bloqueo de slots por compras existentes (service_purchases)', () => {
    const futureMonday = '2099-06-01';

    beforeEach(() => {
      mockHolisticRepo.findBySlug.mockResolvedValue(mockHolisticService);
      mockExceptionRepo.getExceptionsByDateRange.mockResolvedValue([]);
      mockSessionRepo.findSessionsByTarotistAndDateRange.mockResolvedValue([]);
      mockAvailabilityRepo.getWeeklyAvailability.mockResolvedValue([
        mockAvailabilityMonday, // 09:00-11:00 → 4 slots
      ]);
    });

    it('debe marcar available=false para slots ocupados por una compra pagada', async () => {
      mockPurchaseRepo.findActiveByDate.mockResolvedValue([
        {
          id: 100,
          selectedDate: futureMonday,
          selectedTime: '09:00',
          paymentStatus: HolisticPurchaseStatus.PAID,
          holisticService: mockHolisticService,
        } as ServicePurchase,
      ]);

      const result = await useCase.execute('arbol-genealogico', futureMonday);

      const slot900 = result.slots.find((s) => s.time === '09:00');
      expect(slot900).toBeDefined();
      expect(slot900?.available).toBe(false);

      // 09:30 also blocked (60min duration overlaps)
      const slot930 = result.slots.find((s) => s.time === '09:30');
      expect(slot930).toBeDefined();
      expect(slot930?.available).toBe(false);
    });

    it('debe marcar available=false para slots ocupados por una compra pendiente', async () => {
      mockPurchaseRepo.findActiveByDate.mockResolvedValue([
        {
          id: 101,
          selectedDate: futureMonday,
          selectedTime: '10:00',
          paymentStatus: HolisticPurchaseStatus.PENDING,
          holisticService: mockHolisticService,
        } as ServicePurchase,
      ]);

      const result = await useCase.execute('arbol-genealogico', futureMonday);

      const slot1000 = result.slots.find((s) => s.time === '10:00');
      expect(slot1000).toBeDefined();
      expect(slot1000?.available).toBe(false);
    });

    it('debe mantener available=true para slots no ocupados por compras', async () => {
      mockPurchaseRepo.findActiveByDate.mockResolvedValue([
        {
          id: 102,
          selectedDate: futureMonday,
          selectedTime: '09:00',
          paymentStatus: HolisticPurchaseStatus.PAID,
          holisticService: mockHolisticService,
        } as ServicePurchase,
      ]);

      const result = await useCase.execute('arbol-genealogico', futureMonday);

      // 10:00 should still be available (09:00 + 60min = 10:00, no overlap)
      const slot1000 = result.slots.find((s) => s.time === '10:00');
      expect(slot1000).toBeDefined();
      expect(slot1000?.available).toBe(true);
    });

    it('debe bloquear slots por múltiples compras en la misma fecha', async () => {
      mockPurchaseRepo.findActiveByDate.mockResolvedValue([
        {
          id: 103,
          selectedDate: futureMonday,
          selectedTime: '09:00',
          paymentStatus: HolisticPurchaseStatus.PAID,
          holisticService: mockHolisticService,
        } as ServicePurchase,
        {
          id: 104,
          selectedDate: futureMonday,
          selectedTime: '10:00',
          paymentStatus: HolisticPurchaseStatus.PENDING,
          holisticService: mockHolisticService,
        } as ServicePurchase,
      ]);

      const result = await useCase.execute('arbol-genealogico', futureMonday);

      // All 4 slots should be blocked:
      // 09:00-10:00 by purchase 103, 10:00-11:00 by purchase 104
      const allBlocked = result.slots.every((s) => !s.available);
      expect(allBlocked).toBe(true);
    });

    it('debe llamar a findActiveByDate con la fecha correcta', async () => {
      mockPurchaseRepo.findActiveByDate.mockResolvedValue([]);

      await useCase.execute('arbol-genealogico', futureMonday);

      expect(mockPurchaseRepo.findActiveByDate).toHaveBeenCalledWith(
        futureMonday,
      );
    });

    it('no debe bloquear slots por compras sin selectedTime', async () => {
      mockPurchaseRepo.findActiveByDate.mockResolvedValue([
        {
          id: 105,
          selectedDate: futureMonday,
          selectedTime: null,
          paymentStatus: HolisticPurchaseStatus.PAID,
          holisticService: mockHolisticService,
        } as ServicePurchase,
      ]);

      const result = await useCase.execute('arbol-genealogico', futureMonday);

      const availableSlots = result.slots.filter((s) => s.available);
      expect(availableSlots.length).toBe(4);
    });
  });
});
