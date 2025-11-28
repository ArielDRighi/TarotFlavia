import {
  Injectable,
  Inject,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { USER_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserWithoutPassword } from '../../entities/user.entity';

/**
 * Use case: Crear un nuevo usuario
 */
@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
    const { email, password, name } = createUserDto;

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      return await this.userRepository.create(
        normalizedEmail,
        hashedPassword,
        name,
      );
    } catch {
      throw new InternalServerErrorException('Error creating user');
    }
  }
}
