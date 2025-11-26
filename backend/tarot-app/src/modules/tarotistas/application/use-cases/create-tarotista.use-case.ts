import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { ITarotistaRepository } from '../../domain/interfaces/tarotista-repository.interface';
import { CreateTarotistaDto } from '../dto/create-tarotista.dto';
import { Tarotista } from '../../infrastructure/entities/tarotista.entity';

/**
 * Use Case: Create a new Tarotista
 * Responsibility: Handle the business logic for creating a tarotista
 */
@Injectable()
export class CreateTarotistaUseCase {
  constructor(
    @Inject('ITarotistaRepository')
    private readonly tarotistaRepo: ITarotistaRepository,
  ) {}

  async execute(dto: CreateTarotistaDto): Promise<Tarotista> {
    // Business rule: User can only be tarotista once
    const existing = await this.tarotistaRepo.findByUserId(dto.userId);

    if (existing) {
      throw new BadRequestException(
        `El usuario con ID ${dto.userId} ya es tarotista`,
      );
    }

    // Create tarotista
    const tarotista = await this.tarotistaRepo.create({
      userId: dto.userId,
      nombrePublico: dto.nombrePublico,
      bio: dto.biografia, // Map biografia -> bio
      especialidades: dto.especialidades,
      fotoPerfil: dto.fotoPerfil,
      isActive: true,
    });

    // Create default config if custom prompts provided
    if (dto.systemPromptIdentity || dto.systemPromptGuidelines) {
      const systemPrompt = this.buildSystemPrompt(
        dto.systemPromptIdentity,
        dto.systemPromptGuidelines,
      );

      await this.tarotistaRepo.createConfig({
        tarotistaId: tarotista.id,
        systemPrompt,
        temperature: 0.7,
        maxTokens: 500,
        topP: 0.9,
      });
    }

    return tarotista;
  }

  private buildSystemPrompt(identity?: string, guidelines?: string): string {
    const parts: string[] = [];

    if (identity) {
      parts.push(`IDENTIDAD DEL TAROTISTA:\n${identity}`);
    }

    if (guidelines) {
      parts.push(`PAUTAS DE INTERPRETACIÓN:\n${guidelines}`);
    }

    return parts.join('\n\n');
  }
}
