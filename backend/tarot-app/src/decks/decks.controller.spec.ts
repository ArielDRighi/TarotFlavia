import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { DecksController } from './decks.controller';
import { DecksService } from './decks.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { TarotDeck } from './entities/tarot-deck.entity';

describe('DecksController', () => {
  let controller: DecksController;
  let service: DecksService;

  const mockDeck: TarotDeck = {
    id: 1,
    name: 'Rider-Waite',
    description: 'Classic tarot deck',
    imageUrl: 'https://example.com/rw.jpg',
    cardCount: 78,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    cards: [],
  };

  const mockDecksService = {
    createDeck: jest.fn(),
    findAllDecks: jest.fn(),
    findDeckById: jest.fn(),
    updateDeck: jest.fn(),
    removeDeck: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DecksController],
      providers: [
        {
          provide: DecksService,
          useValue: mockDecksService,
        },
      ],
    }).compile();

    controller = module.get<DecksController>(DecksController);
    service = module.get<DecksService>(DecksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createDeck', () => {
    const createDeckDto: CreateDeckDto = {
      name: 'Thoth Tarot',
      description: 'Aleister Crowley tarot deck',
      imageUrl: 'https://example.com/thoth.jpg',
    };

    const adminUser = {
      user: {
        id: 1,
        email: 'admin@test.com',
        isAdmin: true,
      },
    };

    const regularUser = {
      user: {
        id: 2,
        email: 'user@test.com',
        isAdmin: false,
      },
    };

    it('should create a deck when user is admin', async () => {
      const newDeck = { ...mockDeck, ...createDeckDto, id: 2 };
      mockDecksService.createDeck.mockResolvedValue(newDeck);

      const result = await controller.createDeck(adminUser, createDeckDto);

      expect(result).toEqual(newDeck);
      expect(service.createDeck).toHaveBeenCalledWith(createDeckDto);
    });

    it('should throw ForbiddenException when user is not admin', async () => {
      await expect(
        controller.createDeck(regularUser, createDeckDto),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.createDeck(regularUser, createDeckDto),
      ).rejects.toThrow('Solo administradores pueden crear mazos');
      expect(service.createDeck).not.toHaveBeenCalled();
    });
  });

  describe('getAllDecks', () => {
    it('should return an array of decks', async () => {
      const decks = [mockDeck];
      mockDecksService.findAllDecks.mockResolvedValue(decks);

      const result = await controller.getAllDecks();

      expect(result).toEqual(decks);
      expect(service.findAllDecks).toHaveBeenCalled();
    });
  });

  describe('getDeckById', () => {
    it('should return a deck by id', async () => {
      mockDecksService.findDeckById.mockResolvedValue(mockDeck);

      const result = await controller.getDeckById(1);

      expect(result).toEqual(mockDeck);
      expect(service.findDeckById).toHaveBeenCalledWith(1);
    });
  });

  describe('updateDeck', () => {
    const updateDeckDto: UpdateDeckDto = {
      description: 'Updated description',
    };

    const adminUser = {
      user: {
        id: 1,
        email: 'admin@test.com',
        isAdmin: true,
      },
    };

    const regularUser = {
      user: {
        id: 2,
        email: 'user@test.com',
        isAdmin: false,
      },
    };

    it('should update a deck when user is admin', async () => {
      const updatedDeck = { ...mockDeck, ...updateDeckDto };
      mockDecksService.updateDeck.mockResolvedValue(updatedDeck);

      const result = await controller.updateDeck(adminUser, 1, updateDeckDto);

      expect(result).toEqual(updatedDeck);
      expect(service.updateDeck).toHaveBeenCalledWith(1, updateDeckDto);
    });

    it('should throw ForbiddenException when user is not admin', async () => {
      await expect(
        controller.updateDeck(regularUser, 1, updateDeckDto),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.updateDeck(regularUser, 1, updateDeckDto),
      ).rejects.toThrow('Solo administradores pueden actualizar mazos');
      expect(service.updateDeck).not.toHaveBeenCalled();
    });
  });

  describe('removeDeck', () => {
    const adminUser = {
      user: {
        id: 1,
        email: 'admin@test.com',
        isAdmin: true,
      },
    };

    const regularUser = {
      user: {
        id: 2,
        email: 'user@test.com',
        isAdmin: false,
      },
    };

    it('should delete a deck when user is admin', async () => {
      mockDecksService.removeDeck.mockResolvedValue(undefined);

      const result = await controller.removeDeck(adminUser, 1);

      expect(result).toEqual({ message: 'Mazo eliminado con éxito' });
      expect(service.removeDeck).toHaveBeenCalledWith(1);
    });

    it('should throw ForbiddenException when user is not admin', async () => {
      await expect(controller.removeDeck(regularUser, 1)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(controller.removeDeck(regularUser, 1)).rejects.toThrow(
        'Solo administradores pueden eliminar mazos',
      );
      expect(service.removeDeck).not.toHaveBeenCalled();
    });
  });
});
