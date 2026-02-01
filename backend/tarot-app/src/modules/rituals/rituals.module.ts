import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Ritual,
  RitualStep,
  RitualMaterial,
  UserRitualHistory,
} from './entities';

/**
 * Módulo de Rituales
 * Gestiona rituales espirituales, pasos, materiales e historial de usuarios
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ritual,
      RitualStep,
      RitualMaterial,
      UserRitualHistory,
    ]),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class RitualsModule {}
