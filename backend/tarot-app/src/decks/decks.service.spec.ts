import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DecksService } from './decks.service';
import { TarotDeck } from './entities/tarot-deck.entity';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';

describe('DecksService', () => {
  let service: DecksService;

  const mockDeck: TarotDeck = {
    id: 1,
    name: 'Rider-Waite',
    description: 'Classic tarot deck',
    imageUrl: 'https://example.com/rw.jpg',
    cardCount: 78,
    isActive: true,
    isDefault: false,
    artist: 'Pamela Colman Smith',
    yearCreated: 1909,
    tradition: 'Hermética',
    publisher: 'Rider & Company',
    createdAt: new Date(),
    updatedAt: new Date(),
    cards: [],
  };

  const mockDeckRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DecksService,
        {
          provide: getRepositoryToken(TarotDeck),
          useValue: mockDeckRepository,
        },
      ],
    }).compile();

    service = module.get<DecksService>(DecksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDeck', () => {
    const createDeckDto: CreateDeckDto = {
      name: 'Thoth Tarot',
      description: 'Aleister Crowley tarot deck',
      imageUrl: 'https://example.com/thoth.jpg',
    };

    it('should create a new deck', async () => {
      const newDeck = { ...mockDeck, ...createDeckDto, id: 2 };
      mockDeckRepository.findOne.mockResolvedValue(null);
      mockDeckRepository.create.mockReturnValue(newDeck);
      mockDeckRepository.save.mockResolvedValue(newDeck);

      const result = await service.createDeck(createDeckDto);

      expect(result).toEqual(newDeck);
      expect(mockDeckRepository.findOne).toHaveBeenCalledWith({
        where: { name: createDeckDto.name },
      });
      expect(mockDeckRepository.create).toHaveBeenCalledWith(createDeckDto);
      expect(mockDeckRepository.save).toHaveBeenCalledWith(newDeck);
    });

    it('should throw ConflictException if deck name already exists', async () => {
      mockDeckRepository.findOne.mockResolvedValue(mockDeck);

      await expect(service.createDeck(createDeckDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.createDeck(createDeckDto)).rejects.toThrow(
        `Ya existe un mazo con el nombre: ${createDeckDto.name}`,
      );
    });

    it('should throw InternalServerErrorException on save error', async () => {
      mockDeckRepository.findOne.mockResolvedValue(null);
      mockDeckRepository.create.mockReturnValue({});
      mockDeckRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.createDeck(createDeckDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAllDecks', () => {
    it('should return an array of decks', async () => {
      const decks = [mockDeck];
      mockDeckRepository.find.mockResolvedValue(decks);

      const result = await service.findAllDecks();

      expect(result).toEqual(decks);
      expect(mockDeckRepository.find).toHaveBeenCalled();
    });

    it('should return an empty array if no decks exist', async () => {
      mockDeckRepository.find.mockResolvedValue([]);

      const result = await service.findAllDecks();

      expect(result).toEqual([]);
    });
  });

  describe('findDeckById', () => {
    it('should return a deck by id', async () => {
      mockDeckRepository.findOne.mockResolvedValue(mockDeck);

      const result = await service.findDeckById(1);

      expect(result).toEqual(mockDeck);
      expect(mockDeckRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['cards'],
      });
    });

    it('should throw NotFoundException if deck not found', async () => {
      mockDeckRepository.findOne.mockResolvedValue(null);

      await expect(service.findDeckById(999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findDeckById(999)).rejects.toThrow(
        'Mazo con ID 999 no encontrado',
      );
    });
  });

  describe('updateDeck', () => {
    const updateDeckDto: UpdateDeckDto = {
      description: 'Updated description',
    };

    it('should update a deck', async () => {
      const updatedDeck = { ...mockDeck, ...updateDeckDto };
      mockDeckRepository.findOne.mockResolvedValue(mockDeck);
      mockDeckRepository.save.mockResolvedValue(updatedDeck);

      const result = await service.updateDeck(1, updateDeckDto);

      expect(result).toEqual(updatedDeck);
      expect(mockDeckRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateDeckDto),
      );
    });

    it('should throw ConflictException if new name already exists', async () => {
      const updateWithName: UpdateDeckDto = { name: 'Existing Deck' };
      const anotherDeck = { ...mockDeck, id: 2, name: 'Existing Deck' };

      mockDeckRepository.findOne
        .mockResolvedValueOnce(mockDeck)
        .mockResolvedValueOnce(anotherDeck);

      await expect(service.updateDeck(1, updateWithName)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException if deck does not exist', async () => {
      mockDeckRepository.findOne.mockResolvedValue(null);

      await expect(service.updateDeck(999, updateDeckDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on save error', async () => {
      mockDeckRepository.findOne.mockResolvedValue(mockDeck);
      mockDeckRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.updateDeck(1, updateDeckDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('removeDeck', () => {
    it('should delete a deck', async () => {
      mockDeckRepository.delete.mockResolvedValue({ affected: 1 });

      await service.removeDeck(1);

      expect(mockDeckRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if deck does not exist', async () => {
      mockDeckRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.removeDeck(999)).rejects.toThrow(NotFoundException);
      await expect(service.removeDeck(999)).rejects.toThrow(
        'Mazo con ID 999 no encontrado',
      );
    });
  });

  describe('deckExists', () => {
    it('should return true if deck exists', async () => {
      mockDeckRepository.count.mockResolvedValue(1);

      const result = await service.deckExists(1);

      expect(result).toBe(true);
      expect(mockDeckRepository.count).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return false if deck does not exist', async () => {
      mockDeckRepository.count.mockResolvedValue(0);

      const result = await service.deckExists(999);

      expect(result).toBe(false);
    });
  });
});
