import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Like, Between } from 'typeorm';
import { SacredEvent } from '../../entities/sacred-event.entity';
import { LunarPhaseService } from './lunar-phase.service';
import {
  Sabbat,
  Hemisphere,
  SacredEventType,
  SacredEventImportance,
  LunarPhase,
  RitualCategory,
} from '../../domain/enums';
import { SABBAT_INFO } from '../../data/sabbats.data';

/**
 * Servicio para gestión del Calendario Sagrado
 *
 * Responsabilidades:
 * - Calcular fechas de Sabbats según hemisferio
 * - Generar eventos del año (Sabbats, lunas, portales, etc.)
 * - Consultar eventos próximos para usuarios
 * - Gestionar eventos destacados
 */
@Injectable()
export class SacredCalendarService {
  private static readonly MIN_YEAR = 1900;
  private static readonly MAX_YEAR = 2200;
  private static readonly MAX_DAYS_LOOKAHEAD = 60;

  constructor(
    @InjectRepository(SacredEvent)
    private readonly eventRepo: Repository<SacredEvent>,
    private readonly lunarService: LunarPhaseService,
  ) {}

  /**
   * Convierte una fecha a string en formato YYYY-MM-DD (timezone local)
   * Helper para evitar problemas de timezone con toISOString()
   * @private
   */
  private toDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Crea slug limpio sin guiones consecutivos o al inicio/final
   * @private
   */
  private cleanSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Obtiene eventos próximos para un usuario (según su hemisferio)
   * @param hemisphere Hemisferio del usuario
   * @param days Número de días hacia adelante (default: 30)
   * @returns Lista de eventos ordenados por fecha e importancia
   */
  async getUpcomingEvents(
    hemisphere: Hemisphere,
    days: number = 30,
  ): Promise<SacredEvent[]> {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + days);

    return this.eventRepo
      .createQueryBuilder('event')
      .where('event.eventDate BETWEEN :today AND :endDate', {
        today: this.toDateString(today),
        endDate: this.toDateString(endDate),
      })
      .andWhere(
        '(event.hemisphere IS NULL OR event.hemisphere = :hemisphere)',
        { hemisphere },
      )
      .andWhere('event.isActive = true')
      .orderBy('event.eventDate', 'ASC')
      .addOrderBy('event.importance', 'DESC')
      .getMany();
  }

  /**
   * Obtiene eventos destacados del día (para widget del home)
   * @param hemisphere Hemisferio del usuario
   * @returns Eventos de hoy ordenados por importancia
   */
  async getTodayEvents(hemisphere: Hemisphere): Promise<SacredEvent[]> {
    const today = this.toDateString(new Date());

    // TypeORM's find() can accept date strings for date columns despite type definitions
    return this.eventRepo.find({
      where: [
        { eventDate: today as unknown as Date, hemisphere: IsNull() },
        { eventDate: today as unknown as Date, hemisphere },
      ],
      order: { importance: 'DESC' },
    });
  }

  /**
   * Calcula fecha de un Sabbat para un año y hemisferio
   * Las fechas del hemisferio sur están desplazadas 6 meses
   * @param sabbat Sabbat a calcular
   * @param year Año
   * @param hemisphere Hemisferio
   * @returns Fecha del sabbat
   */
  getSabbatDate(sabbat: Sabbat, year: number, hemisphere: Hemisphere): Date {
    const sabbatDates: Record<Sabbat, { north: string; south: string }> = {
      [Sabbat.SAMHAIN]: { north: '10-31', south: '04-30' },
      [Sabbat.YULE]: { north: '12-21', south: '06-21' },
      [Sabbat.IMBOLC]: { north: '02-01', south: '08-01' },
      [Sabbat.OSTARA]: { north: '03-21', south: '09-21' },
      [Sabbat.BELTANE]: { north: '05-01', south: '10-31' },
      [Sabbat.LITHA]: { north: '06-21', south: '12-21' },
      [Sabbat.LAMMAS]: { north: '08-01', south: '02-01' },
      [Sabbat.MABON]: { north: '09-21', south: '03-21' },
    };

    const dateStr =
      hemisphere === Hemisphere.SOUTH
        ? sabbatDates[sabbat].south
        : sabbatDates[sabbat].north;

    // Usar new Date(year, month, day) para evitar problemas de timezone
    const parts = dateStr.split('-');
    const month = parseInt(parts[0], 10) - 1; // Date months are 0-based
    const day = parseInt(parts[1], 10);

    return new Date(year, month, day);
  }

  /**
   * Genera eventos para un año completo
   * Incluye: Sabbats, fases lunares, portales numéricos, eventos mensuales
   * @param year Año a generar
   * @returns Número de eventos creados
   */
  async generateYearEvents(year: number): Promise<number> {
    // Validar rango de año
    if (
      year < SacredCalendarService.MIN_YEAR ||
      year > SacredCalendarService.MAX_YEAR
    ) {
      throw new Error(
        `Year must be between ${SacredCalendarService.MIN_YEAR} and ${SacredCalendarService.MAX_YEAR}`,
      );
    }

    let eventsCreated = 0;

    // 1. Generar Sabbats para ambos hemisferios (optimizado: bulk query)
    const sabbats = Object.values(Sabbat);
    const hemispheres = Object.values(Hemisphere);
    const sabbatDates: Array<{
      sabbat: Sabbat;
      hemisphere: Hemisphere;
      date: Date;
    }> = [];

    for (const sabbat of sabbats) {
      for (const hemisphere of hemispheres) {
        const date = this.getSabbatDate(sabbat, year, hemisphere);
        sabbatDates.push({ sabbat, hemisphere, date });
      }
    }

    // Verificar cuáles ya existen (una sola query)
    const existingSabbats = await this.eventRepo.find({
      where: {
        eventType: SacredEventType.SABBAT,
        eventDate: Between(new Date(year, 0, 1), new Date(year, 11, 31)),
      },
      select: ['sabbat', 'hemisphere', 'eventDate'],
    });

    const existingKeys = new Set(
      existingSabbats.map(
        (e) => `${e.sabbat}-${e.hemisphere}-${this.toDateString(e.eventDate)}`,
      ),
    );

    // Crear solo los que no existen
    for (const { sabbat, hemisphere, date } of sabbatDates) {
      const key = `${sabbat}-${hemisphere}-${this.toDateString(date)}`;
      if (!existingKeys.has(key)) {
        await this.createSabbatEvent(sabbat, date, hemisphere);
        eventsCreated++;
      }
    }

    // 2. Generar eventos lunares (globales)
    const lunarEvents = await this.generateLunarEvents(year);
    eventsCreated += lunarEvents;

    // 3. Generar portales numéricos
    const portalEvents = await this.generatePortalEvents(year);
    eventsCreated += portalEvents;

    // 4. Generar primer día de cada mes (Ritual de la Canela)
    const monthlyEvents = await this.generateMonthlyEvents(year);
    eventsCreated += monthlyEvents;

    return eventsCreated;
  }

  /**
   * Crea un evento de Sabbat
   * @private
   */
  private async createSabbatEvent(
    sabbat: Sabbat,
    date: Date,
    hemisphere: Hemisphere,
  ): Promise<void> {
    const info = SABBAT_INFO[sabbat];
    const event = this.eventRepo.create({
      name: info.name,
      slug: `${sabbat}-${date.getFullYear()}-${hemisphere}`,
      description: info.description,
      eventType: SacredEventType.SABBAT,
      sabbat,
      eventDate: date,
      hemisphere,
      importance: SacredEventImportance.HIGH,
      energyDescription: info.energy,
      suggestedRitualCategories: info.suggestedCategories,
      isActive: true,
    });

    await this.eventRepo.save(event);
  }

  /**
   * Genera eventos de lunas nuevas y llenas para todo el año
   * Usa búsqueda iterativa día a día para mayor precisión
   * @private
   */
  private async generateLunarEvents(year: number): Promise<number> {
    const events: Partial<SacredEvent>[] = [];

    // Calcular fechas de lunas llenas y nuevas para el año
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1);

      // Luna Nueva (con validación de mes)
      const newMoonDate = this.getNextPhaseDate(startDate, LunarPhase.NEW_MOON);
      if (
        newMoonDate.getFullYear() === year &&
        newMoonDate.getMonth() === month
      ) {
        events.push({
          name: `Luna Nueva de ${this.getMonthName(newMoonDate.getMonth())}`,
          slug: `luna-nueva-${newMoonDate.getFullYear()}-${String(newMoonDate.getMonth() + 1).padStart(2, '0')}`,
          description: `Luna Nueva en el mes de ${this.getMonthName(newMoonDate.getMonth())}. Ideal para nuevos comienzos y sembrar intenciones.`,
          eventType: SacredEventType.LUNAR_PHASE,
          lunarPhase: LunarPhase.NEW_MOON,
          sabbat: null,
          eventDate: newMoonDate,
          eventTime: null,
          hemisphere: null, // Global
          importance: SacredEventImportance.HIGH,
          energyDescription:
            'Ideal para nuevos comienzos, sembrar intenciones y planificar.',
          suggestedRitualCategories: [
            RitualCategory.LUNAR,
            RitualCategory.ABUNDANCE,
          ],
          suggestedRitualIds: null,
          isActive: true,
        });
      }

      // Luna Llena (con validación de mes)
      const fullMoonDate = this.getNextPhaseDate(
        startDate,
        LunarPhase.FULL_MOON,
      );
      if (
        fullMoonDate.getFullYear() === year &&
        fullMoonDate.getMonth() === month
      ) {
        events.push({
          name: `Luna Llena de ${this.getMonthName(fullMoonDate.getMonth())}`,
          slug: `luna-llena-${fullMoonDate.getFullYear()}-${String(fullMoonDate.getMonth() + 1).padStart(2, '0')}`,
          description: `Luna Llena en el mes de ${this.getMonthName(fullMoonDate.getMonth())}. Momento de culminación y liberación.`,
          eventType: SacredEventType.LUNAR_PHASE,
          lunarPhase: LunarPhase.FULL_MOON,
          sabbat: null,
          eventDate: fullMoonDate,
          eventTime: null,
          hemisphere: null,
          importance: SacredEventImportance.HIGH,
          energyDescription:
            'Momento de culminación, liberación y carga energética.',
          suggestedRitualCategories: [
            RitualCategory.LUNAR,
            RitualCategory.CLEANSING,
          ],
          suggestedRitualIds: null,
          isActive: true,
        });
      }
    }

    // Optimización: bulk query para verificar existentes
    const existingLunarEvents = await this.eventRepo.find({
      where: {
        eventType: SacredEventType.LUNAR_PHASE,
        eventDate: Between(new Date(year, 0, 1), new Date(year, 11, 31)),
      },
      select: ['lunarPhase', 'eventDate'],
    });

    const existingKeys = new Set(
      existingLunarEvents.map(
        (e) => `${e.lunarPhase}-${this.toDateString(e.eventDate)}`,
      ),
    );

    // Insertar solo los que no existan
    let created = 0;
    for (const event of events) {
      const key = `${event.lunarPhase}-${this.toDateString(event.eventDate!)}`;
      if (!existingKeys.has(key)) {
        await this.eventRepo.save(this.eventRepo.create(event));
        created++;
      }
    }
    return created;
  }

  /**
   * Calcula la fecha aproximada de la próxima fase lunar específica.
   *
   * En lugar de usar solo una aproximación matemática fija (29.53 / 8 días),
   * avanza día a día hasta encontrar la siguiente fecha en la que
   * LunarPhaseService.calculatePhase coincide con la fase objetivo.
   *
   * Esto mantiene el rendimiento (búsqueda acotada) pero reduce los desajustes
   * de 1–2 días que podía producir el algoritmo simplificado original.
   *
   * @private
   */
  private getNextPhaseDate(startDate: Date, targetPhase: LunarPhase): Date {
    // Siempre buscamos la *próxima* ocurrencia, no el mismo día
    const searchStart = new Date(startDate);
    searchStart.setDate(searchStart.getDate() + 1);

    let candidate = new Date(searchStart);
    for (
      let offset = 0;
      offset < SacredCalendarService.MAX_DAYS_LOOKAHEAD;
      offset++
    ) {
      const phaseAtCandidate = this.lunarService.calculatePhase(candidate);
      if (phaseAtCandidate === targetPhase) {
        return candidate;
      }
      candidate = new Date(searchStart);
      candidate.setDate(searchStart.getDate() + offset + 1);
    }

    // Fallback de seguridad: si no se encuentra dentro del rango esperado,
    // devolvemos una fecha aproximada 29.53 días después del inicio.
    const fallback = new Date(startDate);
    fallback.setDate(fallback.getDate() + 30);
    return fallback;
  }

  /**
   * Genera eventos de portales numéricos (1/1, 2/2, etc.)
   * @private
   */
  private async generatePortalEvents(year: number): Promise<number> {
    const portals = [
      {
        month: 0,
        day: 1,
        name: 'Portal 1/1',
        desc: 'Nuevos comienzos del año',
        importance: SacredEventImportance.MEDIUM,
      },
      {
        month: 1,
        day: 2,
        name: 'Portal 2/2',
        desc: 'Equilibrio y dualidad',
        importance: SacredEventImportance.MEDIUM,
      },
      {
        month: 2,
        day: 3,
        name: 'Portal 3/3',
        desc: 'Creatividad y expresión',
        importance: SacredEventImportance.MEDIUM,
      },
      {
        month: 3,
        day: 4,
        name: 'Portal 4/4',
        desc: 'Estabilidad y fundamentos',
        importance: SacredEventImportance.MEDIUM,
      },
      {
        month: 4,
        day: 5,
        name: 'Portal 5/5',
        desc: 'Cambio y libertad',
        importance: SacredEventImportance.MEDIUM,
      },
      {
        month: 5,
        day: 6,
        name: 'Portal 6/6',
        desc: 'Amor y armonía',
        importance: SacredEventImportance.MEDIUM,
      },
      {
        month: 6,
        day: 7,
        name: 'Portal 7/7',
        desc: 'Espiritualidad y sabiduría',
        importance: SacredEventImportance.MEDIUM,
      },
      {
        month: 7,
        day: 8,
        name: 'Portal del León 8/8',
        desc: "Lion's Gate - Abundancia y poder personal",
        importance: SacredEventImportance.HIGH,
      },
      {
        month: 8,
        day: 9,
        name: 'Portal 9/9',
        desc: 'Culminación y servicio',
        importance: SacredEventImportance.MEDIUM,
      },
      {
        month: 9,
        day: 10,
        name: 'Portal 10/10',
        desc: 'Manifestación completa',
        importance: SacredEventImportance.MEDIUM,
      },
      {
        month: 10,
        day: 11,
        name: 'Portal 11/11',
        desc: 'Despertar espiritual - Portal de manifestación',
        importance: SacredEventImportance.HIGH,
      },
      {
        month: 11,
        day: 12,
        name: 'Portal 12/12',
        desc: 'Cierre de ciclos',
        importance: SacredEventImportance.MEDIUM,
      },
    ];

    // Optimización: bulk query para verificar portales existentes
    const existingPortals = await this.eventRepo.find({
      where: {
        eventType: SacredEventType.PORTAL,
        eventDate: Between(new Date(year, 0, 1), new Date(year, 11, 31)),
      },
      select: ['eventDate'],
    });

    const existingDates = new Set(
      existingPortals.map((e) => this.toDateString(e.eventDate)),
    );

    let created = 0;
    for (const portal of portals) {
      const date = new Date(year, portal.month, portal.day);
      const dateKey = this.toDateString(date);

      if (!existingDates.has(dateKey)) {
        await this.eventRepo.save(
          this.eventRepo.create({
            name: portal.name,
            slug: this.cleanSlug(portal.name),
            description: portal.desc,
            eventType: SacredEventType.PORTAL,
            sabbat: null,
            lunarPhase: null,
            eventDate: date,
            eventTime: null,
            hemisphere: null,
            importance: portal.importance,
            energyDescription: portal.desc,
            suggestedRitualCategories: [
              RitualCategory.ABUNDANCE,
              RitualCategory.MEDITATION,
            ],
            suggestedRitualIds: null,
            isActive: true,
          }),
        );
        created++;
      }
    }
    return created;
  }

  /**
   * Genera eventos del primer día de cada mes (Ritual de la Canela)
   * @private
   */
  private async generateMonthlyEvents(year: number): Promise<number> {
    // Optimización: bulk query para verificar eventos mensuales existentes
    const existingMonthlyEvents = await this.eventRepo.find({
      where: {
        eventType: SacredEventType.CULTURAL,
        eventDate: Between(new Date(year, 0, 1), new Date(year, 11, 31)),
        name: Like('%Canela%'),
      },
      select: ['eventDate'],
    });

    const existingDates = new Set(
      existingMonthlyEvents.map((e) => this.toDateString(e.eventDate)),
    );

    let created = 0;
    for (let month = 0; month < 12; month++) {
      const date = new Date(year, month, 1);
      const dateKey = this.toDateString(date);

      if (!existingDates.has(dateKey)) {
        await this.eventRepo.save(
          this.eventRepo.create({
            name: `Ritual de la Canela - ${this.getMonthName(month)}`,
            slug: `ritual-canela-${this.getMonthName(month).toLowerCase()}-${year}`,
            description:
              'Sopla canela en tu puerta para atraer abundancia este mes.',
            eventType: SacredEventType.CULTURAL,
            sabbat: null,
            lunarPhase: null,
            eventDate: date,
            eventTime: null,
            hemisphere: null,
            importance: SacredEventImportance.MEDIUM,
            energyDescription:
              'El primer día del mes es ideal para rituales de prosperidad.',
            suggestedRitualCategories: [RitualCategory.ABUNDANCE],
            suggestedRitualIds: null,
            isActive: true,
          }),
        );
        created++;
      }
    }
    return created;
  }

  /**
   * Obtiene el nombre del mes en español
   * @private
   */
  private getMonthName(month: number): string {
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return months[month];
  }
}
