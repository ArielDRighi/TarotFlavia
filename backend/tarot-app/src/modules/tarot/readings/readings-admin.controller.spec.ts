import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReadingsAdminController } from './readings-admin.controller';
import { ReadingsOrchestratorService } from './application/services/readings-orchestrator.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/infrastructure/guards/admin.guard';
import { TarotReading } from './entities/tarot-reading.entity';
import { ReadingListItemDto } from './dto/reading-list-item.dto';
import { PaginatedReadingsResponseDto } from './dto/paginated-readings-response.dto';

describe('ReadingsAdminController', () => {
  let controller: ReadingsAdminController;
  let orchestrator: jest.Mocked<ReadingsOrchestratorService>;
  let auditLogService: jest.Mocked<AuditLogService>;

  const mockReading = (): TarotReading => {
    const r = new TarotReading();
    r.id = 1;
    r.customQuestion = 'Pregunta test';
    r.spreadId = 1;
    r.spreadName = 'Test Spread';
    r.cardPositions = [];
    r.isPublic = false;
    r.sharedToken = null;
    r.viewCount = 0;
    r.createdAt = new Date();
    r.updatedAt = new Date();
    r.deletedAt = undefined;
    return r;
  };

  const mockReadingDto = (): ReadingListItemDto => ({
    id: 1,
    question: 'Pregunta test',
    spreadId: 1,
    spreadName: 'Test Spread',
    cardsCount: 3,
    cardPreviews: [],
    createdAt: new Date().toISOString(),
    deletedAt: undefined,
  });

  const mockPaginatedResponse = (): PaginatedReadingsResponseDto => ({
    data: [mockReadingDto()],
    meta: {
      page: 1,
      limit: 50,
      totalItems: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  });

  const mockRequest = (userId = 99, ip = '127.0.0.1') => ({
    user: { userId },
    ip,
    headers: { 'user-agent': 'test-agent' },
  });

  beforeEach(async () => {
    const mockOrchestrator = {
      findAllForAdmin: jest.fn(),
      adminSoftDelete: jest.fn(),
      adminRestore: jest.fn(),
    };

    const mockAuditLogService = {
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReadingsAdminController],
      providers: [
        { provide: ReadingsOrchestratorService, useValue: mockOrchestrator },
        { provide: AuditLogService, useValue: mockAuditLogService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReadingsAdminController>(ReadingsAdminController);
    orchestrator = module.get(ReadingsOrchestratorService);
    auditLogService = module.get(AuditLogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllReadings', () => {
    it('debe retornar lecturas paginadas sin eliminadas por defecto', async () => {
      orchestrator.findAllForAdmin.mockResolvedValue(mockPaginatedResponse());

      const result = await controller.getAllReadings(undefined);

      expect(orchestrator.findAllForAdmin).toHaveBeenCalledWith(false);
      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(1);
    });

    it('debe incluir eliminadas cuando includeDeleted es true', async () => {
      orchestrator.findAllForAdmin.mockResolvedValue(mockPaginatedResponse());

      await controller.getAllReadings(true);

      expect(orchestrator.findAllForAdmin).toHaveBeenCalledWith(true);
    });

    it('debe usar false cuando includeDeleted es false explícito', async () => {
      orchestrator.findAllForAdmin.mockResolvedValue(mockPaginatedResponse());

      await controller.getAllReadings(false);

      expect(orchestrator.findAllForAdmin).toHaveBeenCalledWith(false);
    });
  });

  describe('softDelete', () => {
    it('debe borrar lectura lógicamente y registrar en audit log', async () => {
      orchestrator.adminSoftDelete.mockResolvedValue(undefined);
      auditLogService.log.mockResolvedValue(undefined as never);

      const req = mockRequest();
      await controller.softDelete(1, req);

      expect(orchestrator.adminSoftDelete).toHaveBeenCalledWith(1);
      expect(auditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 99,
          action: 'reading_deleted',
          entityType: 'TarotReading',
          entityId: '1',
        }),
      );
    });

    it('debe propagar NotFoundException si la lectura no existe', async () => {
      orchestrator.adminSoftDelete.mockRejectedValue(
        new NotFoundException('Lectura no encontrada'),
      );
      const req = mockRequest();

      await expect(controller.softDelete(999, req)).rejects.toThrow(
        NotFoundException,
      );
      expect(auditLogService.log).not.toHaveBeenCalled();
    });

    it('debe incluir ip y userAgent en el audit log', async () => {
      orchestrator.adminSoftDelete.mockResolvedValue(undefined);
      auditLogService.log.mockResolvedValue(undefined as never);

      const req = {
        user: { userId: 99 },
        ip: '10.0.0.1',
        headers: { 'user-agent': 'Mozilla/5.0' },
      };

      await controller.softDelete(1, req);

      expect(auditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: '10.0.0.1',
          userAgent: 'Mozilla/5.0',
        }),
      );
    });

    it('debe manejar ip null en el audit log', async () => {
      orchestrator.adminSoftDelete.mockResolvedValue(undefined);
      auditLogService.log.mockResolvedValue(undefined as never);

      const req = {
        user: { userId: 99 },
        ip: undefined as unknown as string,
        headers: {} as Record<string, string>,
      };

      await controller.softDelete(1, req);

      expect(auditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: null,
          userAgent: null,
        }),
      );
    });
  });

  describe('restore', () => {
    it('debe restaurar lectura y registrar en audit log', async () => {
      const reading = mockReading();
      orchestrator.adminRestore.mockResolvedValue(reading);
      auditLogService.log.mockResolvedValue(undefined as never);

      const req = mockRequest();
      const result = await controller.restore(1, req);

      expect(orchestrator.adminRestore).toHaveBeenCalledWith(1);
      expect(auditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 99,
          action: 'reading_restored',
          entityType: 'TarotReading',
          entityId: '1',
        }),
      );
      expect(result).toEqual(reading);
    });

    it('debe propagar NotFoundException si la lectura no existe', async () => {
      orchestrator.adminRestore.mockRejectedValue(
        new NotFoundException('Lectura no encontrada'),
      );
      const req = mockRequest();

      await expect(controller.restore(999, req)).rejects.toThrow(
        NotFoundException,
      );
      expect(auditLogService.log).not.toHaveBeenCalled();
    });

    it('debe incluir ip y userAgent en el audit log de restore', async () => {
      orchestrator.adminRestore.mockResolvedValue(mockReading());
      auditLogService.log.mockResolvedValue(undefined as never);

      const req = {
        user: { userId: 5 },
        ip: '192.168.1.1',
        headers: { 'user-agent': 'Chrome/120' },
      };

      await controller.restore(2, req);

      expect(auditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 5,
          entityId: '2',
          ipAddress: '192.168.1.1',
          userAgent: 'Chrome/120',
        }),
      );
    });

    it('debe retornar la lectura restaurada', async () => {
      const reading = mockReading();
      reading.id = 42;
      orchestrator.adminRestore.mockResolvedValue(reading);
      auditLogService.log.mockResolvedValue(undefined as never);

      const req = mockRequest();
      const result = await controller.restore(42, req);

      expect(result.id).toBe(42);
    });
  });
});
