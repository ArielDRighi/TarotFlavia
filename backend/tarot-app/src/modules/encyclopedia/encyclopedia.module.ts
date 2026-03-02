import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncyclopediaTarotCard } from './entities/encyclopedia-tarot-card.entity';

/**
 * Módulo de la Enciclopedia Mística
 *
 * Gestiona las 78 cartas del Tarot con acceso público (sin restricciones de plan).
 * Las tareas TASK-302, TASK-303 y TASK-304 completarán este módulo con
 * seeder de datos, servicio y endpoints REST.
 */
@Module({
  imports: [TypeOrmModule.forFeature([EncyclopediaTarotCard])],
  providers: [],
  controllers: [],
  exports: [TypeOrmModule],
})
export class EncyclopediaModule {}
