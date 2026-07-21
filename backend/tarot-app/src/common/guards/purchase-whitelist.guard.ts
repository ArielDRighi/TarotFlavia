import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface RequestWithUser extends Request {
  user?: {
    email?: string;
  };
}

/**
 * PurchaseWhitelistGuard — restringe las COMPRAS a una lista de emails.
 *
 * Durante la etapa de prueba el registro está abierto a todos, pero las compras
 * (suscripción premium y servicios holísticos) se habilitan solo para los emails
 * de `PURCHASE_WHITELIST` (separados por coma). Si la variable no está seteada
 * (o está vacía), las compras quedan abiertas para todos — comportamiento normal
 * de producción.
 *
 * Se aplica a nivel de método, después de `JwtAuthGuard` (que puebla `req.user`).
 */
@Injectable()
export class PurchaseWhitelistGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const whitelist = this.configService.get<string>('PURCHASE_WHITELIST');

    // Sin lista (o vacía): compras abiertas para todos.
    if (!whitelist || whitelist.trim() === '') {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const email = request.user?.email?.trim().toLowerCase();

    if (!email) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const allowed = whitelist
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0);

    if (!allowed.includes(email)) {
      throw new ForbiddenException(
        'Las compras están habilitadas solo para un grupo de prueba por ahora. Pronto estará disponible para todos.',
      );
    }

    return true;
  }
}
