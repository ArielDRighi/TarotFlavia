import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TarotDeck } from './entities/tarot-deck.entity';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';

@Injectable()
export class DecksService {
  constructor(
    @InjectRepository(TarotDeck)
    private deckRepository: Repository<TarotDeck>,
  ) {}

  async createDeck(createDeckDto: CreateDeckDto): Promise<TarotDeck> {
    const existingDeck = await this.deckRepository.findOne({
      where: { name: createDeckDto.name },
    });

    if (existingDeck) {
      throw new ConflictException(
        `Ya existe un mazo con el nombre: ${createDeckDto.name}`,
      );
    }

    const deck = this.deckRepository.create(createDeckDto);

    try {
      return await this.deckRepository.save(deck);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        'Error al crear el mazo de tarot',
        errorMessage,
      );
    }
  }

  async findAllDecks(): Promise<TarotDeck[]> {
    return this.deckRepository.find();
  }

  async findDeckById(id: number): Promise<TarotDeck> {
    const deck = await this.deckRepository.findOne({
      where: { id },
      relations: ['cards'],
    });

    if (!deck) {
      throw new NotFoundException(`Mazo con ID ${id} no encontrado`);
    }

    return deck;
  }

  async updateDeck(
    id: number,
    updateDeckDto: UpdateDeckDto,
  ): Promise<TarotDeck> {
    const deck = await this.findDeckById(id);

    if (updateDeckDto.name && updateDeckDto.name !== deck.name) {
      const existingDeck = await this.deckRepository.findOne({
        where: { name: updateDeckDto.name },
      });

      if (existingDeck) {
        throw new ConflictException(
          `Ya existe un mazo con el nombre: ${updateDeckDto.name}`,
        );
      }
    }

    Object.assign(deck, updateDeckDto);

    try {
      return await this.deckRepository.save(deck);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        'Error al actualizar el mazo de tarot',
        errorMessage,
      );
    }
  }

  async removeDeck(id: number): Promise<void> {
    const result = await this.deckRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Mazo con ID ${id} no encontrado`);
    }
  }

  async deckExists(id: number): Promise<boolean> {
    const count = await this.deckRepository.count({ where: { id } });
    return count > 0;
  }

  async findDefaultDeck(): Promise<TarotDeck> {
    const defaultDeck = await this.deckRepository.findOne({
      where: { isDefault: true },
      relations: ['cards'],
    });

    if (!defaultDeck) {
      throw new NotFoundException('No se encontró un mazo predeterminado');
    }

    return defaultDeck;
  }
}
