import { Injectable, Inject } from '@nestjs/common';
import { IMetricsRepository } from '../../domain/interfaces/metrics-repository.interface';
import { MetricsQueryDto, TarotistaMetricsDto } from '../dto/metrics-query.dto';

@Injectable()
export class GetTarotistaMetricsUseCase {
  constructor(
    @Inject('IMetricsRepository')
    private readonly metricsRepository: IMetricsRepository,
  ) {}

  async execute(dto: MetricsQueryDto): Promise<TarotistaMetricsDto> {
    return await this.metricsRepository.getTarotistaMetrics(dto);
  }
}
