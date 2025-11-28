import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { USER_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserWithoutPassword } from '../../entities/user.entity';

/**
 * Use case: Actualizar un usuario existente
 */
@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Preparar campos actualizados sin mutar el DTO
    const updatedFields: Partial<UpdateUserDto> = { ...updateUserDto };

    // Normalizar y validar email si se proporciona
    if (updatedFields.email) {
      updatedFields.email = updatedFields.email.toLowerCase();
      if (updatedFields.email !== user.email) {
        const existingUser = await this.userRepository.findByEmail(
          updatedFields.email,
        );
        if (existingUser) {
          throw new ConflictException('Email already in use');
        }
      }
    }

    // Si hay una nueva contraseña, hashearla
    if (updatedFields.password) {
      const salt = await bcrypt.genSalt();
      updatedFields.password = await bcrypt.hash(updatedFields.password, salt);
    }

    // Actualizar usuario
    Object.assign(user, updatedFields);

    try {
      return await this.userRepository.save(user);
    } catch {
      throw new InternalServerErrorException('Error updating user');
    }
  }
}
