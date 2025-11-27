import {
  Injectable,
  Inject,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { USER_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { UserWithoutPassword } from '../../entities/user.entity';

/**
 * Use case: Gestionar el estado de ban de un usuario
 */
@Injectable()
export class ManageUserBanUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Banea a un usuario
   */
  async banUser(userId: number, reason: string): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.ban(reason);

    try {
      return await this.userRepository.save(user);
    } catch {
      throw new InternalServerErrorException('Error banning user');
    }
  }

  /**
   * Desbanea a un usuario
   */
  async unbanUser(userId: number): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.unban();

    try {
      return await this.userRepository.save(user);
    } catch {
      throw new InternalServerErrorException('Error unbanning user');
    }
  }
}
