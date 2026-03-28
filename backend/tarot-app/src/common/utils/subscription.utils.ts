import { SubscriptionStatus } from '../../modules/users/entities/user.entity';
import { SubscriptionStatusType } from '../../modules/users/application/dto/user-capabilities.dto';

/**
 * Mapea el enum SubscriptionStatus (entity) al tipo string del contrato de API (SubscriptionStatusType).
 * Centraliza la conversión para evitar duplicación en use cases y servicios.
 *
 * @param status - Estado de suscripción de la entidad (puede ser null/undefined para usuarios free)
 * @returns El string correspondiente al estado, o null si no hay suscripción
 */
export function mapSubscriptionStatus(
  status: SubscriptionStatus | null | undefined,
): SubscriptionStatusType {
  if (!status) {
    return null;
  }
  switch (status) {
    case SubscriptionStatus.ACTIVE:
      return 'active';
    case SubscriptionStatus.CANCELLED:
      return 'cancelled';
    case SubscriptionStatus.EXPIRED:
      return 'expired';
    default:
      return null;
  }
}
