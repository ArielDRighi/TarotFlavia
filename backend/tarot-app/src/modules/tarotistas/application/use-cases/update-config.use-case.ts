import { Injectable, Inject } from '@nestjs/common';
import { ITarotistaRepository } from '../../domain/interfaces/tarotista-repository.interface';
import { UpdateTarotistaConfigDto } from '../../dto/update-tarotista-config.dto';
import { TarotistaConfig } from '../../entities/tarotista-config.entity';

/**
 * Use Case: Update Tarotista Configuration
 * Responsibility: Handle configuration updates including AI prompts and settings
 */
@Injectable()
export class UpdateConfigUseCase {
  constructor(
    @Inject('ITarotistaRepository')
    private readonly tarotistaRepo: ITarotistaRepository,
  ) {}

  async execute(
    tarotistaId: number,
    dto: UpdateTarotistaConfigDto,
  ): Promise<TarotistaConfig> {
    // Upsert config (create if not exists)
    return await this.tarotistaRepo.updateConfig(tarotistaId, dto);
  }

  async resetToDefault(tarotistaId: number): Promise<TarotistaConfig> {
    const defaultConfig = this.getDefaultConfig();

    return await this.tarotistaRepo.updateConfig(tarotistaId, defaultConfig);
  }

  private getDefaultConfig(): Partial<TarotistaConfig> {
    return {
      systemPrompt: this.getDefaultSystemPrompt(),
      temperature: 0.7,
      maxTokens: 500,
      topP: 0.9,
      styleConfig: null,
    };
  }

  private getDefaultSystemPrompt(): string {
    return (
      `Eres un tarotista experto y empático. Tu objetivo es proporcionar interpretaciones del tarot que sean:\n` +
      `- Profundas y significativas\n` +
      `- Respetuosas y sin juicios\n` +
      `- Centradas en el crecimiento personal\n` +
      `- Basadas en el simbolismo tradicional del tarot\n` +
      `- Adaptadas al contexto de la pregunta del consultante`
    );
  }
}
