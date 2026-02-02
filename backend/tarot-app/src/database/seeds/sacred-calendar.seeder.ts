import { DataSource } from 'typeorm';
import { SacredEvent } from '../../modules/rituals/entities/sacred-event.entity';
import { SacredCalendarService } from '../../modules/rituals/application/services/sacred-calendar.service';

/**
 * Seed Sacred Calendar Events
 * Puebla la base de datos con eventos del calendario sagrado
 *
 * Features:
 * - Idempotente: Se puede ejecutar múltiples veces sin duplicar
 * - Genera eventos para el año actual y próximo
 * - Incluye Sabbats (ambos hemisferios), fases lunares, portales numéricos
 * - Eventos mensuales especiales (Ritual de la Canela)
 */

export async function seedSacredCalendar(
  dataSource: DataSource,
  sacredCalendarService: SacredCalendarService,
): Promise<void> {
  console.log('🌙 Iniciando seed del calendario sagrado...');

  const sacredEventRepository = dataSource.getRepository(SacredEvent);

  // Verificar si ya existen eventos (idempotencia)
  const existingEventsCount = await sacredEventRepository.count();
  if (existingEventsCount > 0) {
    console.log(
      `✅ Eventos del calendario sagrado ya poblados (${existingEventsCount} eventos encontrados). Saltando...`,
    );
    return;
  }

  // Generar eventos para el año actual y próximo
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1];

  console.log(`📦 Generando eventos para los años: ${years.join(', ')}...`);

  for (const year of years) {
    const eventsCreated = await sacredCalendarService.generateYearEvents(year);
    console.log(`  ✓ ${year}: ${eventsCreated} eventos generados`);
  }

  // Estadísticas finales
  const totalEvents = await sacredEventRepository.count();

  // Contar por tipo de evento
  const eventsByType = await sacredEventRepository
    .createQueryBuilder('event')
    .select('event.eventType', 'eventType')
    .addSelect('COUNT(event.id)', 'count')
    .groupBy('event.eventType')
    .getRawMany();

  // Contar por nivel de importancia
  const eventsByImportance = await sacredEventRepository
    .createQueryBuilder('event')
    .select('event.importance', 'importance')
    .addSelect('COUNT(event.id)', 'count')
    .groupBy('event.importance')
    .getRawMany();

  console.log('\n✅ Seed del calendario sagrado completado exitosamente!');
  console.log(`   Total eventos: ${totalEvents}`);
  console.log('\n   Distribución por tipo:');
  eventsByType.forEach(({ eventType, count }) => {
    console.log(`     - ${eventType}: ${count} evento(s)`);
  });
  console.log('\n   Distribución por importancia:');
  eventsByImportance.forEach(({ importance, count }) => {
    console.log(`     - ${importance}: ${count} evento(s)`);
  });
}
