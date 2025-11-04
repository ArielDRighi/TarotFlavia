import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserWithoutPassword } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPlanDto } from './dto/update-user-plan.dto';
import { RefreshTokenService } from '../auth/refresh-token.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private refreshTokenService: RefreshTokenService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
    const { email, password, name } = createUserDto;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      name,
    });

    try {
      await this.usersRepository.save(user);

      // Return user without password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result as UserWithoutPassword;
    } catch {
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find();
    // Eliminar contraseñas de la respuesta
    return users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...result } = user;
      return result as User;
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserWithoutPassword> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Si hay un nuevo email, verificar que no exista ya
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    // Si hay una nueva contraseña, hashearla
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    // Actualizar usuario
    Object.assign(user, updateUserDto);

    try {
      await this.usersRepository.save(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...result } = user;
      return result as UserWithoutPassword;
    } catch {
      throw new InternalServerErrorException('Error updating user');
    }
  }

  async remove(id: number): Promise<DeleteResult> {
    return this.usersRepository.delete(id);
  }

  /**
   * Actualiza el plan de un usuario e invalida todos sus tokens de refresh
   * para forzar re-autenticación y obtener un nuevo JWT con el plan actualizado.
   * También permite actualizar otros campos relacionados al plan como fechas,
   * estado de suscripción y stripe customer ID.
   */
  async updatePlan(
    id: number,
    updateUserPlanDto: UpdateUserPlanDto,
  ): Promise<UserWithoutPassword> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Actualizar campos del plan
    user.plan = updateUserPlanDto.plan;

    if (updateUserPlanDto.planStartedAt !== undefined) {
      user.planStartedAt = updateUserPlanDto.planStartedAt;
    }

    if (updateUserPlanDto.planExpiresAt !== undefined) {
      user.planExpiresAt = updateUserPlanDto.planExpiresAt;
    }

    if (updateUserPlanDto.subscriptionStatus !== undefined) {
      user.subscriptionStatus = updateUserPlanDto.subscriptionStatus;
    }

    if (updateUserPlanDto.stripeCustomerId !== undefined) {
      user.stripeCustomerId = updateUserPlanDto.stripeCustomerId;
    }

    try {
      await this.usersRepository.save(user);

      // Invalidar todos los refresh tokens del usuario para forzar re-login
      await this.refreshTokenService.revokeAllUserTokens(id);

      // Retornar usuario sin contraseña
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...result } = user;
      return result as UserWithoutPassword;
    } catch {
      throw new InternalServerErrorException('Error updating user plan');
    }
  }
}
