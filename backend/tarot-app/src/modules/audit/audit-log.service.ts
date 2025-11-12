import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

export interface AuditLogListResponse {
  logs: AuditLog[];
  meta: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(data: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(data);
    return await this.auditLogRepository.save(auditLog);
  }

  async findAll(query: QueryAuditLogDto): Promise<AuditLogListResponse> {
    const {
      userId,
      action,
      entityType,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = query;

    const where: FindOptionsWhere<AuditLog> = {};

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = action;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    }

    const skip = (page - 1) * limit;

    const [logs, totalItems] = await this.auditLogRepository.findAndCount({
      where,
      relations: ['user', 'targetUser'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      logs,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }
}
