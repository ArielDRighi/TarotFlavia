import { Injectable, Inject } from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { CreateUserUseCase } from '../use-cases/create-user.use-case';
import { UpdateUserUseCase } from '../use-cases/update-user.use-case';
import { UpdateUserPlanUseCase } from '../use-cases/update-user-plan.use-case';
import { ManageUserRolesUseCase } from '../use-cases/manage-user-roles.use-case';
import { ManageUserBanUseCase } from '../use-cases/manage-user-ban.use-case';
import { GetUserDetailUseCase } from '../use-cases/get-user-detail.use-case';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { ITarotistaRepository } from '../../domain/interfaces/tarotista-repository.interface';
import { USER_REPOSITORY, TAROTISTA_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateUserPlanDto } from '../dto/update-user-plan.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { UserListResponseDto } from '../dto/user-list-response.dto';
import { UserDetailDto } from '../dto/user-detail.dto';
import { User, UserWithoutPassword } from '../../entities/user.entity';
import { UserRole } from '../../../../common/enums/user-role.enum';
import { Tarotista } from '../../../tarotistas/entities/tarotista.entity';

/**
 * Orchestrator Service (Facade Pattern)
 * Coordina los use cases del módulo users
 * Punto de entrada único para la capa de aplicación
 */
@Injectable()
export class UsersOrchestratorService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly updateUserPlanUseCase: UpdateUserPlanUseCase,
    private readonly manageUserRolesUseCase: ManageUserRolesUseCase,
    private readonly manageUserBanUseCase: ManageUserBanUseCase,
    private readonly getUserDetailUseCase: GetUserDetailUseCase,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(TAROTISTA_REPOSITORY)
    private readonly tarotistaRepository: ITarotistaRepository,
  ) {}

  // === USER CRUD OPERATIONS ===

  async create(createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
    return this.createUserUseCase.execute(createUserDto);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserWithoutPassword> {
    return this.updateUserUseCase.execute(id, updateUserDto);
  }

  async remove(id: number): Promise<DeleteResult> {
    return this.userRepository.delete(id);
  }

  // === PLAN MANAGEMENT ===

  async updatePlan(id: number, updateUserPlanDto: UpdateUserPlanDto): Promise<UserWithoutPassword> {
    return this.updateUserPlanUseCase.execute(id, updateUserPlanDto);
  }

  // === ROLE MANAGEMENT ===

  async addTarotistRole(userId: number): Promise<UserWithoutPassword> {
    return this.manageUserRolesUseCase.addTarotistRole(userId);
  }

  async addAdminRole(userId: number): Promise<UserWithoutPassword> {
    return this.manageUserRolesUseCase.addAdminRole(userId);
  }

  async removeRole(userId: number, role: UserRole): Promise<UserWithoutPassword> {
    return this.manageUserRolesUseCase.removeRole(userId, role);
  }

  // === BAN MANAGEMENT ===

  async banUser(userId: number, reason: string): Promise<UserWithoutPassword> {
    return this.manageUserBanUseCase.banUser(userId, reason);
  }

  async unbanUser(userId: number): Promise<UserWithoutPassword> {
    return this.manageUserBanUseCase.unbanUser(userId);
  }

  // === QUERY OPERATIONS ===

  async findAllWithFilters(query: UserQueryDto): Promise<UserListResponseDto> {
    return this.userRepository.findWithFilters(query);
  }

  async getUserDetail(userId: number): Promise<UserDetailDto> {
    return this.getUserDetailUseCase.execute(userId);
  }

  async getTarotistaByUserId(userId: number): Promise<Tarotista | null> {
    return this.tarotistaRepository.findByUserId(userId);
  }
}
