import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { USER_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { UserRole } from '../../../../common/enums/user-role.enum';
import { UserWithoutPassword } from '../../entities/user.entity';

/**
 * Use case: Gestionar roles de usuario (agregar/eliminar)
 */
@Injectable()
export class ManageUserRolesUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Añade el rol TAROTIST a un usuario
   */
  async addTarotistRole(userId: number): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.hasRole(UserRole.TAROTIST)) {
      throw new BadRequestException('User already has TAROTIST role');
    }

    user.roles.push(UserRole.TAROTIST);

    try {
      return await this.userRepository.save(user);
    } catch {
      throw new InternalServerErrorException('Error adding TAROTIST role');
    }
  }

  /**
   * Añade el rol ADMIN a un usuario y sincroniza el campo isAdmin
   */
  async addAdminRole(userId: number): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.hasRole(UserRole.ADMIN)) {
      throw new BadRequestException('User already has ADMIN role');
    }

    user.roles.push(UserRole.ADMIN);
    user.isAdmin = true; // Mantener sincronizado para backward compatibility

    try {
      return await this.userRepository.save(user);
    } catch {
      throw new InternalServerErrorException('Error adding ADMIN role');
    }
  }

  /**
   * Elimina un rol de un usuario
   */
  async removeRole(
    userId: number,
    role: UserRole,
  ): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // No permitir eliminar el rol CONSUMER (todos los usuarios deben ser consumidores)
    if (role === UserRole.CONSUMER) {
      throw new BadRequestException('Cannot remove CONSUMER role');
    }

    const roleIndex = user.roles.indexOf(role);
    if (roleIndex === -1) {
      throw new BadRequestException(`User does not have ${role} role`);
    }

    user.roles.splice(roleIndex, 1);

    // Si se elimina el rol ADMIN, sincronizar isAdmin
    if (role === UserRole.ADMIN) {
      user.isAdmin = false;
    }

    try {
      return await this.userRepository.save(user);
    } catch {
      throw new InternalServerErrorException('Error removing role');
    }
  }
}
