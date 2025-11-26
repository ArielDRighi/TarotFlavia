import { Injectable, Inject } from '@nestjs/common';
import { IMetricsRepository } from '../../domain/interfaces/metrics-repository.interface';
import {
  PlatformMetricsQueryDto,
  PlatformMetricsDto,
} from '../dto/metrics-query.dto';

@Injectable()
export class GetPlatformMetricsUseCase {
  constructor(
    @Inject('IMetricsRepository')
    private readonly metricsRepository: IMetricsRepository,
  ) {}

  async execute(dto: PlatformMetricsQueryDto): Promise<PlatformMetricsDto> {
    return await this.metricsRepository.getPlatformMetrics(dto);
  }
}
