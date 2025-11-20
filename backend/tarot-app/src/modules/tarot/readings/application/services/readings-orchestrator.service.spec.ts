import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReadingsOrchestratorService } from './readings-orchestrator.service';
import { CreateReadingUseCase } from '../use-cases/create-reading.use-case';
import { ListReadingsUseCase } from '../use-cases/list-readings.use-case';
import { GetReadingUseCase } from '../use-cases/get-reading.use-case';
import { ShareReadingUseCase } from '../use-cases/share-reading.use-case';
import { RegenerateReadingUseCase } from '../use-cases/regenerate-reading.use-case';
import { DeleteReadingUseCase } from '../use-cases/delete-reading.use-case';
import { RestoreReadingUseCase } from '../use-cases/restore-reading.use-case';
import { IReadingRepository } from '../../domain/interfaces/reading-repository.interface';
import { TarotReading } from '../../entities/tarot-reading.entity';
import { User, UserPlan } from '../../../../users/entities/user.entity';
import { CreateReadingDto } from '../../dto/create-reading.dto';
import { QueryReadingsDto } from '../../dto/query-readings.dto';
import { PaginatedReadingsResponseDto } from '../../dto/paginated-readings-response.dto';

describe('ReadingsOrchestratorService', () => {
  let service: ReadingsOrchestratorService;
  let readingRepo: jest.Mocked<IReadingRepository>;
  let createReadingUC: jest.Mocked<CreateReadingUseCase>;
  let listReadingsUC: jest.Mocked<ListReadingsUseCase>;
  let getReadingUC: jest.Mocked<GetReadingUseCase>;
  let shareReadingUC: jest.Mocked<ShareReadingUseCase>;
  let regenerateReadingUC: jest.Mocked<RegenerateReadingUseCase>;
  let deleteReadingUC: jest.Mocked<DeleteReadingUseCase>;
  let restoreReadingUC: jest.Mocked<RestoreReadingUseCase>;

  const createMockUser = (): User => {
    const user = new User();
    user.id = 1;
    user.email = 'test@example.com';
    user.name = 'Test User';
    user.plan = UserPlan.FREE;
    user.bannedAt = null;
    user.banReason = null;
    user.createdAt = new Date();
    user.updatedAt = new Date();
    return user;
  };

  const mockUser = createMockUser();

  const createMockReading = (): TarotReading => {
    const reading = new TarotReading();
    reading.id = 1;
    reading.user = mockUser;
    reading.customQuestion = 'Test question';
    reading.questionType = 'custom';
    reading.predefinedQuestionId = null;
    reading.cardPositions = [];
    reading.isPublic = false;
    reading.sharedToken = null;
    reading.viewCount = 0;
    reading.createdAt = new Date();
    reading.updatedAt = new Date();
    return reading;
  };

  const mockReading = createMockReading();

  beforeEach(async () => {
    const mockReadingRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findAll: jest.fn(),
      findTrashed: jest.fn(),
      findAllForAdmin: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
      hardDelete: jest.fn(),
      findByShareToken: jest.fn(),
      incrementViewCount: jest.fn(),
    };

    const mockCreateReadingUC = {
      execute: jest.fn(),
    };

    const mockListReadingsUC = {
      execute: jest.fn(),
    };

    const mockGetReadingUC = {
      execute: jest.fn(),
    };

    const mockShareReadingUC = {
      execute: jest.fn(),
    };

    const mockRegenerateReadingUC = {
      execute: jest.fn(),
    };

    const mockDeleteReadingUC = {
      execute: jest.fn(),
    };

    const mockRestoreReadingUC = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReadingsOrchestratorService,
        {
          provide: 'IReadingRepository',
          useValue: mockReadingRepo,
        },
        {
          provide: CreateReadingUseCase,
          useValue: mockCreateReadingUC,
        },
        {
          provide: ListReadingsUseCase,
          useValue: mockListReadingsUC,
        },
        {
          provide: GetReadingUseCase,
          useValue: mockGetReadingUC,
        },
        {
          provide: ShareReadingUseCase,
          useValue: mockShareReadingUC,
        },
        {
          provide: RegenerateReadingUseCase,
          useValue: mockRegenerateReadingUC,
        },
        {
          provide: DeleteReadingUseCase,
          useValue: mockDeleteReadingUC,
        },
        {
          provide: RestoreReadingUseCase,
          useValue: mockRestoreReadingUC,
        },
      ],
    }).compile();

    service = module.get<ReadingsOrchestratorService>(
      ReadingsOrchestratorService,
    );
    readingRepo = module.get('IReadingRepository');
    createReadingUC = module.get(CreateReadingUseCase);
    listReadingsUC = module.get(ListReadingsUseCase);
    getReadingUC = module.get(GetReadingUseCase);
    shareReadingUC = module.get(ShareReadingUseCase);
    regenerateReadingUC = module.get(RegenerateReadingUseCase);
    deleteReadingUC = module.get(DeleteReadingUseCase);
    restoreReadingUC = module.get(RestoreReadingUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Use Case Delegations', () => {
    describe('create', () => {
      it('should delegate to CreateReadingUseCase', async () => {
        const dto: CreateReadingDto = {
          customQuestion: 'Test question',
          spreadId: 1,
          deckId: 1,
          cardIds: [1, 2, 3],
          cardPositions: [],
          generateInterpretation: true,
        };

        createReadingUC.execute.mockResolvedValue(mockReading);

        const result = await service.create(mockUser, dto);

        expect(createReadingUC.execute).toHaveBeenCalledWith(mockUser, dto);
        expect(result).toEqual(mockReading);
      });

      it('should handle null user', async () => {
        const dto: CreateReadingDto = {
          customQuestion: 'Test question',
          spreadId: 1,
          deckId: 1,
          cardIds: [1, 2, 3],
          cardPositions: [],
          generateInterpretation: true,
        };

        await service.create(null as unknown as User, dto);

        expect(createReadingUC.execute).toHaveBeenCalledWith(null, dto);
      });

      it('should handle null dto', async () => {
        await service.create(mockUser, null as unknown as CreateReadingDto);

        expect(createReadingUC.execute).toHaveBeenCalledWith(mockUser, null);
      });

      it('should propagate errors from use case', async () => {
        const dto: CreateReadingDto = {
          customQuestion: 'Test question',
          spreadId: 1,
          deckId: 1,
          cardIds: [1, 2, 3],
          cardPositions: [],
          generateInterpretation: true,
        };

        createReadingUC.execute.mockRejectedValue(new Error('Creation failed'));

        await expect(service.create(mockUser, dto)).rejects.toThrow(
          'Creation failed',
        );
      });
    });

    describe('findAll', () => {
      it('should delegate to ListReadingsUseCase', async () => {
        const queryDto: QueryReadingsDto = { page: 1, limit: 10 };
        const paginatedResponse: PaginatedReadingsResponseDto = {
          data: [mockReading],
          meta: {
            page: 1,
            limit: 10,
            totalItems: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };

        listReadingsUC.execute.mockResolvedValue(paginatedResponse);

        const result = await service.findAll(mockUser, queryDto);

        expect(listReadingsUC.execute).toHaveBeenCalledWith(mockUser, queryDto);
        expect(result).toEqual(paginatedResponse);
      });

      it('should delegate to ListReadingsUseCase without query params', async () => {
        const paginatedResponse: PaginatedReadingsResponseDto = {
          data: [mockReading],
          meta: {
            page: 1,
            limit: 10,
            totalItems: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };

        listReadingsUC.execute.mockResolvedValue(paginatedResponse);

        const result = await service.findAll(mockUser);

        expect(listReadingsUC.execute).toHaveBeenCalledWith(
          mockUser,
          undefined,
        );
        expect(result).toEqual(paginatedResponse);
      });
    });

    describe('findOne', () => {
      it('should delegate to GetReadingUseCase', async () => {
        getReadingUC.execute.mockResolvedValue(mockReading);

        const result = await service.findOne(1, mockUser.id, false);

        expect(getReadingUC.execute).toHaveBeenCalledWith(
          1,
          mockUser.id,
          false,
        );
        expect(result).toEqual(mockReading);
      });

      it('should delegate to GetReadingUseCase as admin', async () => {
        getReadingUC.execute.mockResolvedValue(mockReading);

        const result = await service.findOne(1, mockUser.id, true);

        expect(getReadingUC.execute).toHaveBeenCalledWith(1, mockUser.id, true);
        expect(result).toEqual(mockReading);
      });

      it('should handle reading id 0', async () => {
        await service.findOne(0, mockUser.id, false);

        expect(getReadingUC.execute).toHaveBeenCalledWith(
          0,
          mockUser.id,
          false,
        );
      });

      it('should handle negative reading id', async () => {
        await service.findOne(-1, mockUser.id, false);

        expect(getReadingUC.execute).toHaveBeenCalledWith(
          -1,
          mockUser.id,
          false,
        );
      });

      it('should handle user id 0', async () => {
        await service.findOne(1, 0, false);

        expect(getReadingUC.execute).toHaveBeenCalledWith(1, 0, false);
      });

      it('should handle negative user id', async () => {
        await service.findOne(1, -1, false);

        expect(getReadingUC.execute).toHaveBeenCalledWith(1, -1, false);
      });

      it('should handle null userId', async () => {
        await service.findOne(1, null as unknown as number, false);

        expect(getReadingUC.execute).toHaveBeenCalledWith(1, null, false);
      });
    });

    describe('shareReading', () => {
      it('should delegate to ShareReadingUseCase', async () => {
        const shareResult = {
          sharedToken: 'abc123',
          shareUrl: 'http://example.com/share/abc123',
          isPublic: true,
        };

        shareReadingUC.execute.mockResolvedValue(shareResult);

        const result = await service.shareReading(1, mockUser.id);

        expect(shareReadingUC.execute).toHaveBeenCalledWith(1, mockUser.id);
        expect(result).toEqual(shareResult);
      });
    });

    describe('regenerateInterpretation', () => {
      it('should delegate to RegenerateReadingUseCase', async () => {
        regenerateReadingUC.execute.mockResolvedValue(mockReading);

        const result = await service.regenerateInterpretation(1, mockUser.id);

        expect(regenerateReadingUC.execute).toHaveBeenCalledWith(
          1,
          mockUser.id,
        );
        expect(result).toEqual(mockReading);
      });
    });

    describe('remove', () => {
      it('should delegate to DeleteReadingUseCase', async () => {
        deleteReadingUC.execute.mockResolvedValue(undefined);

        await service.remove(1, mockUser.id);

        expect(deleteReadingUC.execute).toHaveBeenCalledWith(1, mockUser.id);
      });
    });

    describe('restore', () => {
      it('should delegate to RestoreReadingUseCase', async () => {
        restoreReadingUC.execute.mockResolvedValue(mockReading);

        const result = await service.restore(1, mockUser.id);

        expect(restoreReadingUC.execute).toHaveBeenCalledWith(1, mockUser.id);
        expect(result).toEqual(mockReading);
      });
    });
  });

  describe('Direct Repository Delegations', () => {
    describe('update', () => {
      it('should validate ownership and update reading', async () => {
        const updateData: Partial<TarotReading> = {
          customQuestion: 'Updated question',
        };

        getReadingUC.execute.mockResolvedValue(mockReading);
        readingRepo.update.mockResolvedValue({
          ...mockReading,
          ...updateData,
        });

        const result = await service.update(1, mockUser.id, updateData);

        expect(getReadingUC.execute).toHaveBeenCalledWith(1, mockUser.id);
        expect(readingRepo.update).toHaveBeenCalledWith(1, updateData);
        expect(result.customQuestion).toBe('Updated question');
      });

      it('should throw if user does not own reading', async () => {
        const updateData: Partial<TarotReading> = {
          customQuestion: 'Updated question',
        };

        getReadingUC.execute.mockRejectedValue(
          new NotFoundException('Reading not found'),
        );

        await expect(
          service.update(1, mockUser.id, updateData),
        ).rejects.toThrow(NotFoundException);

        expect(readingRepo.update).not.toHaveBeenCalled();
      });

      it('should handle reading id 0', async () => {
        const updateData: Partial<TarotReading> = { customQuestion: 'test' };
        getReadingUC.execute.mockResolvedValue(mockReading);
        readingRepo.update.mockResolvedValue(mockReading);

        await service.update(0, mockUser.id, updateData);

        expect(getReadingUC.execute).toHaveBeenCalledWith(0, mockUser.id);
      });

      it('should handle negative reading id', async () => {
        const updateData: Partial<TarotReading> = { customQuestion: 'test' };
        getReadingUC.execute.mockResolvedValue(mockReading);
        readingRepo.update.mockResolvedValue(mockReading);

        await service.update(-1, mockUser.id, updateData);

        expect(getReadingUC.execute).toHaveBeenCalledWith(-1, mockUser.id);
      });

      it('should handle null updateData', async () => {
        getReadingUC.execute.mockResolvedValue(mockReading);
        readingRepo.update.mockResolvedValue(mockReading);

        await service.update(
          1,
          mockUser.id,
          null as unknown as Partial<TarotReading>,
        );

        expect(readingRepo.update).toHaveBeenCalledWith(1, null);
      });

      it('should handle empty updateData', async () => {
        getReadingUC.execute.mockResolvedValue(mockReading);
        readingRepo.update.mockResolvedValue(mockReading);

        await service.update(1, mockUser.id, {});

        expect(readingRepo.update).toHaveBeenCalledWith(1, {});
      });
    });

    describe('findTrashedReadings', () => {
      it('should return trashed readings for user', async () => {
        const trashedReading = { ...mockReading, deletedAt: new Date() };
        readingRepo.findTrashed.mockResolvedValue([trashedReading]);

        const result = await service.findTrashedReadings(mockUser.id);

        expect(readingRepo.findTrashed).toHaveBeenCalledWith(mockUser.id);
        expect(result).toEqual([trashedReading]);
      });

      it('should handle user id 0', async () => {
        readingRepo.findTrashed.mockResolvedValue([]);

        await service.findTrashedReadings(0);

        expect(readingRepo.findTrashed).toHaveBeenCalledWith(0);
      });

      it('should handle negative user id', async () => {
        readingRepo.findTrashed.mockResolvedValue([]);

        await service.findTrashedReadings(-1);

        expect(readingRepo.findTrashed).toHaveBeenCalledWith(-1);
      });

      it('should handle null user id', async () => {
        readingRepo.findTrashed.mockResolvedValue([]);

        await service.findTrashedReadings(null as unknown as number);

        expect(readingRepo.findTrashed).toHaveBeenCalledWith(null);
      });
    });

    describe('findAllForAdmin', () => {
      it('should return paginated readings for admin without deleted', async () => {
        readingRepo.findAllForAdmin.mockResolvedValue([[mockReading], 1]);

        const result = await service.findAllForAdmin(false);

        expect(readingRepo.findAllForAdmin).toHaveBeenCalledWith(false);
        expect(result.data).toEqual([mockReading]);
        expect(result.meta.totalItems).toBe(1);
        expect(result.meta.page).toBe(1);
        expect(result.meta.limit).toBe(50);
      });

      it('should return paginated readings for admin including deleted', async () => {
        const deletedReading = { ...mockReading, deletedAt: new Date() };
        readingRepo.findAllForAdmin.mockResolvedValue([
          [mockReading, deletedReading],
          2,
        ]);

        const result = await service.findAllForAdmin(true);

        expect(readingRepo.findAllForAdmin).toHaveBeenCalledWith(true);
        expect(result.data).toHaveLength(2);
        expect(result.meta.totalItems).toBe(2);
      });

      it('should calculate pagination correctly for multiple pages', async () => {
        const readings = Array.from({ length: 100 }, (_, i) => ({
          ...mockReading,
          id: i + 1,
        }));
        readingRepo.findAllForAdmin.mockResolvedValue([readings, 100]);

        const result = await service.findAllForAdmin(false);

        expect(result.meta.totalPages).toBe(2);
        expect(result.meta.hasNextPage).toBe(false);
        expect(result.meta.hasPreviousPage).toBe(false);
      });
    });

    describe('cleanupOldDeletedReadings', () => {
      it('should hard delete old readings and return count', async () => {
        readingRepo.hardDelete.mockResolvedValue(5);

        const result = await service.cleanupOldDeletedReadings();

        expect(readingRepo.hardDelete).toHaveBeenCalledWith(30);
        expect(result).toBe(5);
      });

      it('should return 0 if no readings were deleted', async () => {
        readingRepo.hardDelete.mockResolvedValue(0);

        const result = await service.cleanupOldDeletedReadings();

        expect(result).toBe(0);
      });
    });

    describe('unshareReading', () => {
      it('should validate ownership and unshare reading', async () => {
        getReadingUC.execute.mockResolvedValue(mockReading);
        readingRepo.update.mockResolvedValue({
          ...mockReading,
          sharedToken: null,
          isPublic: false,
        });

        const result = await service.unshareReading(1, mockUser.id);

        expect(getReadingUC.execute).toHaveBeenCalledWith(1, mockUser.id);
        expect(readingRepo.update).toHaveBeenCalledWith(1, {
          sharedToken: null,
          isPublic: false,
        });
        expect(result).toEqual({
          message: 'Lectura dejó de ser compartida con éxito',
          isPublic: false,
          sharedToken: null,
        });
      });

      it('should throw if user does not own reading', async () => {
        getReadingUC.execute.mockRejectedValue(
          new NotFoundException('Reading not found'),
        );

        await expect(service.unshareReading(1, mockUser.id)).rejects.toThrow(
          NotFoundException,
        );

        expect(readingRepo.update).not.toHaveBeenCalled();
      });
    });

    describe('getSharedReading', () => {
      it('should return shared reading and increment view count', async () => {
        const sharedReading = {
          ...mockReading,
          sharedToken: 'abc123',
          isPublic: true,
        };

        readingRepo.findByShareToken.mockResolvedValue(sharedReading);
        readingRepo.incrementViewCount.mockResolvedValue(undefined);

        const result = await service.getSharedReading('abc123');

        expect(readingRepo.findByShareToken).toHaveBeenCalledWith('abc123');
        expect(readingRepo.incrementViewCount).toHaveBeenCalledWith(
          sharedReading.id,
        );
        expect(result).toEqual(sharedReading);
      });

      it('should throw NotFoundException if shared reading not found', async () => {
        readingRepo.findByShareToken.mockResolvedValue(null);

        await expect(service.getSharedReading('invalid')).rejects.toThrow(
          NotFoundException,
        );
        await expect(service.getSharedReading('invalid')).rejects.toThrow(
          'Lectura compartida no encontrada o no está pública',
        );

        expect(readingRepo.incrementViewCount).not.toHaveBeenCalled();
      });

      it('should handle empty token', async () => {
        readingRepo.findByShareToken.mockResolvedValue(null);

        await expect(service.getSharedReading('')).rejects.toThrow(
          NotFoundException,
        );
        expect(readingRepo.findByShareToken).toHaveBeenCalledWith('');
      });

      it('should handle null token', async () => {
        readingRepo.findByShareToken.mockResolvedValue(null);

        await expect(
          service.getSharedReading(null as unknown as string),
        ).rejects.toThrow(NotFoundException);
        expect(readingRepo.findByShareToken).toHaveBeenCalledWith(null);
      });

      it('should handle undefined token', async () => {
        readingRepo.findByShareToken.mockResolvedValue(null);

        await expect(
          service.getSharedReading(undefined as unknown as string),
        ).rejects.toThrow(NotFoundException);
        expect(readingRepo.findByShareToken).toHaveBeenCalledWith(undefined);
      });

      it('should handle very long token', async () => {
        const longToken = 'a'.repeat(10000);
        readingRepo.findByShareToken.mockResolvedValue(null);

        await expect(service.getSharedReading(longToken)).rejects.toThrow(
          NotFoundException,
        );
        expect(readingRepo.findByShareToken).toHaveBeenCalledWith(longToken);
      });

      it('should handle SQL injection attempt in token', async () => {
        const maliciousToken = "'; DROP TABLE readings;--";
        readingRepo.findByShareToken.mockResolvedValue(null);

        await expect(service.getSharedReading(maliciousToken)).rejects.toThrow(
          NotFoundException,
        );
        expect(readingRepo.findByShareToken).toHaveBeenCalledWith(
          maliciousToken,
        );
      });
    });
  });
});
