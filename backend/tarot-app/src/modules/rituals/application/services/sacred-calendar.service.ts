import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Like } from 'typeorm';
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
  constructor(
    @InjectRepository(SacredEvent)
    private readonly eventRepo: Repository<SacredEvent>,
    private readonly lunarService: LunarPhaseService,
  ) {}

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
        today: today.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
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
    const today = new Date().toISOString().split('T')[0];

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

    return new Date(`${year}-${dateStr}`);
  }

  /**
   * Genera eventos para un año completo
   * Incluye: Sabbats, fases lunares, portales numéricos, eventos mensuales
   * @param year Año a generar
   * @returns Número de eventos creados
   */
  async generateYearEvents(year: number): Promise<number> {
    let eventsCreated = 0;

    // 1. Generar Sabbats para ambos hemisferios
    for (const sabbat of Object.values(Sabbat)) {
      for (const hemisphere of Object.values(Hemisphere)) {
        const date = this.getSabbatDate(sabbat, year, hemisphere);
        const existing = await this.eventRepo.findOne({
          where: { sabbat, hemisphere, eventDate: date },
        });

        if (!existing) {
          await this.createSabbatEvent(sabbat, date, hemisphere);
          eventsCreated++;
        }
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
   * @private
   */
  private async generateLunarEvents(year: number): Promise<number> {
    const events: Partial<SacredEvent>[] = [];

    // Calcular fechas de lunas llenas y nuevas para el año
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1);

      // Luna Nueva
      const newMoonDate = this.getNextPhaseDate(startDate, LunarPhase.NEW_MOON);
      if (newMoonDate.getFullYear() === year) {
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

      // Luna Llena
      const fullMoonDate = this.getNextPhaseDate(
        startDate,
        LunarPhase.FULL_MOON,
      );
      if (fullMoonDate.getFullYear() === year) {
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

    // Insertar eventos que no existan
    let created = 0;
    for (const event of events) {
      const whereClause: {
        eventType: SacredEventType | undefined;
        lunarPhase: LunarPhase | undefined;
        eventDate: Date | undefined;
      } = {
        eventType: event.eventType,
        lunarPhase: event.lunarPhase || undefined,
        eventDate: event.eventDate,
      };

      const existing = await this.eventRepo.findOne({
        where: whereClause,
      });
      if (!existing) {
        await this.eventRepo.save(this.eventRepo.create(event));
        created++;
      }
    }
    return created;
  }

  /**
   * Calcula la fecha aproximada de la próxima fase lunar específica
   * Algoritmo simplificado basado en ciclo lunar de 29.53 días
   * @private
   */
  private getNextPhaseDate(startDate: Date, targetPhase: LunarPhase): Date {
    const SYNODIC_MONTH = 29.530588853;

    // Calcular fase actual
    const currentPhase = this.lunarService.calculatePhase(startDate);
    const phases = [
      LunarPhase.NEW_MOON,
      LunarPhase.WAXING_CRESCENT,
      LunarPhase.FIRST_QUARTER,
      LunarPhase.WAXING_GIBBOUS,
      LunarPhase.FULL_MOON,
      LunarPhase.WANING_GIBBOUS,
      LunarPhase.LAST_QUARTER,
      LunarPhase.WANING_CRESCENT,
    ];

    const currentIndex = phases.indexOf(currentPhase);
    const targetIndex = phases.indexOf(targetPhase);

    // Calcular días hasta la fase objetivo
    const phasesAhead = (targetIndex - currentIndex + 8) % 8;
    const daysPerPhase = SYNODIC_MONTH / 8;
    const daysAhead = phasesAhead * daysPerPhase;

    const nextDate = new Date(startDate);
    nextDate.setDate(nextDate.getDate() + Math.round(daysAhead));

    return nextDate;
  }

  /**
   * Genera eventos de portales numéricos (1/1, 2/2, etc.)
   * @private
   */
  private async generatePortalEvents(year: number): Promise<number> {
    const portals = [
      {
        date: `${year}-01-01`,
        name: 'Portal 1/1',
        desc: 'Nuevos comienzos del año',
        importance: SacredEventImportance.MEDIUM,
      },
      {
        date: `${year}-02-02`,
        name: 'Portal 2/2',
        desc: 'Equilibrio y dualidad',
        importance: SacredEventImportance.MEDIUM,
      },
      {
        date: `${year}-03-03`,
        name: 'Portal 3/3',
        desc: 'Creatividad y expresión',
        importance: SacredEventImportance.MEDIUM,
      },
      {
        date: `${year}-04-04`,
        name: 'Portal 4/4',
        desc: 'Estabilidad y fundamentos',
        importance: SacredEventImportance.MEDIUM,
      },
      {
        date: `${year}-05-05`,
        name: 'Portal 5/5',
        desc: 'Cambio y libertad',
        importance: SacredEventImportance.MEDIUM,
      },
      {
        date: `${year}-06-06`,
        name: 'Portal 6/6',
        desc: 'Amor y armonía',
        importance: SacredEventImportance.MEDIUM,
      },
      {
        date: `${year}-07-07`,
        name: 'Portal 7/7',
        desc: 'Espiritualidad y sabiduría',
        importance: SacredEventImportance.MEDIUM,
      },
      {
        date: `${year}-08-08`,
        name: 'Portal del León 8/8',
        desc: "Lion's Gate - Abundancia y poder personal",
        importance: SacredEventImportance.HIGH,
      },
      {
        date: `${year}-09-09`,
        name: 'Portal 9/9',
        desc: 'Culminación y servicio',
        importance: SacredEventImportance.MEDIUM,
      },
      {
        date: `${year}-10-10`,
        name: 'Portal 10/10',
        desc: 'Manifestación completa',
        importance: SacredEventImportance.MEDIUM,
      },
      {
        date: `${year}-11-11`,
        name: 'Portal 11/11',
        desc: 'Despertar espiritual - Portal de manifestación',
        importance: SacredEventImportance.HIGH,
      },
      {
        date: `${year}-12-12`,
        name: 'Portal 12/12',
        desc: 'Cierre de ciclos',
        importance: SacredEventImportance.MEDIUM,
      },
    ];

    let created = 0;
    for (const portal of portals) {
      const existing = await this.eventRepo.findOne({
        where: {
          eventDate: portal.date as unknown as Date,
          eventType: SacredEventType.PORTAL,
        },
      });
      if (!existing) {
        await this.eventRepo.save(
          this.eventRepo.create({
            name: portal.name,
            slug: portal.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            description: portal.desc,
            eventType: SacredEventType.PORTAL,
            sabbat: null,
            lunarPhase: null,
            eventDate: new Date(portal.date),
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
    let created = 0;
    for (let month = 0; month < 12; month++) {
      const date = new Date(year, month, 1);
      const dateStr = date.toISOString().split('T')[0];
      const existing = await this.eventRepo.findOne({
        where: {
          eventType: SacredEventType.CULTURAL,
          eventDate: dateStr as unknown as Date,
          name: Like('%Canela%'),
        },
      });
      if (!existing) {
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
