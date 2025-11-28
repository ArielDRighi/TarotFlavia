import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { User, UserWithoutPassword } from '../../entities/user.entity';
import { UserQueryDto } from '../../application/dto/user-query.dto';
import { UserListResponseDto } from '../../application/dto/user-list-response.dto';

/**
 * Implementación TypeORM del repositorio de usuarios
 */
@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(
    email: string,
    hashedPassword: string,
    name: string,
  ): Promise<UserWithoutPassword> {
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      name,
    });

    try {
      await this.usersRepository.save(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result as UserWithoutPassword;
    } catch {
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
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

  async save(user: User): Promise<UserWithoutPassword> {
    try {
      await this.usersRepository.save(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...result } = user;
      return result as UserWithoutPassword;
    } catch {
      throw new InternalServerErrorException('Error saving user');
    }
  }

  async delete(id: number): Promise<DeleteResult> {
    return this.usersRepository.delete(id);
  }

  async findWithFilters(query: UserQueryDto): Promise<UserListResponseDto> {
    const {
      search,
      role,
      plan,
      banned,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 10,
    } = query as Required<UserQueryDto>;

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    // Aplicar filtro de búsqueda (email o nombre)
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(user.email) LIKE LOWER(:search) OR LOWER(user.name) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    // Filtrar por rol
    if (role) {
      queryBuilder.andWhere(':role = ANY(user.roles)', {
        role: role as string,
      });
    }

    // Filtrar por plan
    if (plan) {
      queryBuilder.andWhere('user.plan = :plan', {
        plan: plan as string,
      });
    }

    // Filtrar por estado de ban
    if (banned !== undefined) {
      if (banned) {
        queryBuilder.andWhere('user.bannedAt IS NOT NULL');
      } else {
        queryBuilder.andWhere('user.bannedAt IS NULL');
      }
    }

    // Ordenamiento con whitelist para prevenir SQL injection
    const allowedSortColumns: Record<string, string> = {
      createdAt: 'user.createdAt',
      lastLogin: 'user.lastLogin',
      email: 'user.email',
      name: 'user.name',
    };
    const sortColumn =
      allowedSortColumns[sortBy] || allowedSortColumns['createdAt'];
    queryBuilder.orderBy(sortColumn, sortOrder);

    // Paginación
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [users, totalItems] = await queryBuilder.getManyAndCount();

    // Remover contraseñas
    const usersWithoutPassword = users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...result } = user;
      return result as UserWithoutPassword;
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      users: usersWithoutPassword,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages,
      },
    };
  }

  async findByIdWithReadings(userId: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id: userId },
      relations: ['readings'],
    });
  }
}
