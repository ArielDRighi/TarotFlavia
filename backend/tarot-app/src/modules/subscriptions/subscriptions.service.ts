import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UserTarotistaSubscription,
  SubscriptionType,
  SubscriptionStatus,
} from '../tarotistas/entities/user-tarotista-subscription.entity';
import { User, UserPlan } from '../users/entities/user.entity';
import { Tarotista } from '../tarotistas/entities/tarotista.entity';

const COOLDOWN_DAYS = 30;
const FLAVIA_TAROTISTA_ID = 1; // ID de Flavia (default)

export interface SubscriptionInfo {
  subscriptionType: SubscriptionType;
  tarotistaId: number | null;
  tarotistaNombre?: string;
  canChange: boolean;
  canChangeAt: Date | null;
  changeCount: number;
}

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(UserTarotistaSubscription)
    private readonly subscriptionRepo: Repository<UserTarotistaSubscription>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Tarotista)
    private readonly tarotistaRepo: Repository<Tarotista>,
  ) {}

  /**
   * Establece el tarotista favorito para un usuario
   * FREE: cooldown de 30 días entre cambios
   * PREMIUM: sin cooldown, asigna tarotista individual
   * PROFESSIONAL: activa all-access automáticamente (ignora tarotistaId)
   */
  async setFavoriteTarotista(
    userId: number,
    tarotistaId: number,
  ): Promise<UserTarotistaSubscription> {
    // 1. Validar que usuario existe
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 2. Validar que tarotista existe y está activo (ANTES del cooldown)
    const tarotista = await this.tarotistaRepo.findOne({
      where: { id: tarotistaId },
    });
    if (!tarotista) {
      throw new NotFoundException('Tarotista no encontrado');
    }
    if (!tarotista.isActive) {
      throw new BadRequestException(
        'Este tarotista no está disponible actualmente',
      );
    }

    // 3. Buscar suscripción actual
    const currentSubscription = await this.subscriptionRepo.findOne({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    // 3.1. Si ya tiene este tarotista, no hacer update innecesario
    if (
      currentSubscription &&
      currentSubscription.tarotistaId === tarotistaId
    ) {
      return currentSubscription;
    }

    // 4. Validar cooldown para FREE
    if (user.plan === UserPlan.FREE && currentSubscription) {
      const now = new Date();
      if (
        currentSubscription.canChangeAt &&
        currentSubscription.canChangeAt > now
      ) {
        const daysRemaining = Math.ceil(
          (currentSubscription.canChangeAt.getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        throw new BadRequestException(
          `No puedes cambiar de tarotista favorito aún. Faltan ${daysRemaining} días. Próximo cambio disponible: ${currentSubscription.canChangeAt.toISOString()}`,
        );
      }
    }

    // 5. Si tiene suscripción, actualizar. Si no, crear nueva
    if (currentSubscription) {
      currentSubscription.tarotistaId = tarotistaId;
      currentSubscription.changeCount += 1;

      // Solo FREE tiene cooldown
      if (user.plan === UserPlan.FREE) {
        const nextChangeDate = new Date();
        nextChangeDate.setDate(nextChangeDate.getDate() + COOLDOWN_DAYS);
        currentSubscription.canChangeAt = nextChangeDate;
      } else {
        currentSubscription.canChangeAt = null;
      }

      return this.subscriptionRepo.save(currentSubscription);
    } else {
      // Crear nueva suscripción
      // PROFESSIONAL: all-access por defecto
      // PREMIUM: individual por defecto
      // FREE: favorito con cooldown
      let subscriptionType: SubscriptionType;
      let tarotistaIdToSet: number | null;

      if (user.plan === UserPlan.PROFESSIONAL) {
        subscriptionType = SubscriptionType.PREMIUM_ALL_ACCESS;
        tarotistaIdToSet = null; // all-access no tiene tarotista específico
      } else if (user.plan === UserPlan.PREMIUM) {
        subscriptionType = SubscriptionType.PREMIUM_INDIVIDUAL;
        tarotistaIdToSet = tarotistaId;
      } else {
        subscriptionType = SubscriptionType.FAVORITE;
        tarotistaIdToSet = tarotistaId;
      }

      const canChangeAt =
        user.plan === UserPlan.FREE
          ? new Date(Date.now() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000)
          : null;

      const newSubscription = this.subscriptionRepo.create({
        userId,
        user,
        tarotistaId: tarotistaIdToSet,
        subscriptionType,
        status: SubscriptionStatus.ACTIVE,
        startedAt: new Date(),
        canChangeAt,
        changeCount: 0,
      });

      return this.subscriptionRepo.save(newSubscription);
    }
  }

  /**
   * Resuelve qué tarotista usar para una lectura según suscripción del usuario
   * - FREE: su tarotista favorito
   * - PREMIUM individual: su tarotista elegido
   * - PREMIUM all-access: uno aleatorio de los activos
   * - Sin suscripción: Flavia (default)
   */
  async resolveTarotistaForReading(userId: number): Promise<number> {
    const subscription = await this.subscriptionRepo.findOne({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    // Sin suscripción → Flavia
    if (!subscription) {
      return FLAVIA_TAROTISTA_ID;
    }

    // PREMIUM all-access → aleatorio
    if (subscription.subscriptionType === SubscriptionType.PREMIUM_ALL_ACCESS) {
      const tarotistas = await this.tarotistaRepo.find({
        where: { isActive: true },
      });

      if (tarotistas.length === 0) {
        throw new BadRequestException('No hay tarotistas activos disponibles');
      }

      // Evitar seleccionar el último tarotista usado (mejor UX y distribución)
      const lastTarotistaId = subscription.tarotistaId;
      let availableTarotistas = tarotistas;

      if (lastTarotistaId) {
        const filtered = tarotistas.filter((t) => t.id !== lastTarotistaId);
        if (filtered.length > 0) {
          availableTarotistas = filtered;
        }
      }

      const randomIndex = Math.floor(
        Math.random() * availableTarotistas.length,
      );
      return availableTarotistas[randomIndex].id;
    }

    // FREE o PREMIUM individual → retornar el específico
    if (subscription.tarotistaId) {
      // Verificar que el tarotista siga activo
      const tarotista = await this.tarotistaRepo.findOne({
        where: { id: subscription.tarotistaId, isActive: true },
      });

      if (!tarotista) {
        // Tarotista desactivado, usar Flavia como fallback
        return FLAVIA_TAROTISTA_ID;
      }

      return subscription.tarotistaId;
    }

    // Fallback a Flavia
    return FLAVIA_TAROTISTA_ID;
  }

  /**
   * Obtiene información de suscripción del usuario
   */
  async getSubscriptionInfo(userId: number): Promise<SubscriptionInfo | null> {
    const subscription = await this.subscriptionRepo.findOne({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['tarotista'],
    });

    if (!subscription) {
      return null;
    }

    const now = new Date();
    const canChange =
      !subscription.canChangeAt || subscription.canChangeAt <= now;

    return {
      subscriptionType: subscription.subscriptionType,
      tarotistaId: subscription.tarotistaId,
      tarotistaNombre: subscription.tarotista?.nombrePublico,
      canChange,
      canChangeAt: subscription.canChangeAt,
      changeCount: subscription.changeCount,
    };
  }

  /**
   * Activa modo all-access para usuarios PREMIUM
   */
  async enableAllAccessMode(
    userId: number,
  ): Promise<UserTarotistaSubscription> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.plan !== UserPlan.PREMIUM && user.plan !== UserPlan.PROFESSIONAL) {
      throw new ForbiddenException(
        'Solo usuarios PREMIUM o PROFESSIONAL pueden activar modo all-access',
      );
    }

    const subscription = await this.subscriptionRepo.findOne({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Usuario no tiene suscripción activa');
    }

    subscription.subscriptionType = SubscriptionType.PREMIUM_ALL_ACCESS;
    subscription.tarotistaId = null;

    return this.subscriptionRepo.save(subscription);
  }
}
