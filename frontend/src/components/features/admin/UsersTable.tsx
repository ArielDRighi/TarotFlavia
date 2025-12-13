/**
 * UsersTable Component
 *
 * Tabla responsiva para mostrar usuarios en el panel admin
 */

'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Ban, Shield, CreditCard } from 'lucide-react';
import type { AdminUser } from '@/types/admin-users.types';
import type { UserPlan, UserRole } from '@/types/user.types';

interface UsersTableProps {
  users: AdminUser[];
  onAction: (action: string, user: AdminUser) => void;
}

/**
 * Badge variant por plan
 */
function getPlanVariant(plan: UserPlan): 'default' | 'secondary' | 'outline' {
  const variants: Record<UserPlan, 'default' | 'secondary' | 'outline'> = {
    guest: 'outline',
    free: 'secondary',
    premium: 'default',
    professional: 'default',
  };
  return variants[plan] || 'default';
}

/**
 * Badge variant por rol
 */
function getRoleVariant(role: UserRole): 'default' | 'secondary' | 'outline' {
  const variants: Record<UserRole, 'default' | 'secondary' | 'outline'> = {
    consumer: 'outline',
    tarotist: 'secondary',
    admin: 'default',
  };
  return variants[role] || 'outline';
}

export function UsersTable({ users, onAction }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="border-border bg-bg-main rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">No hay usuarios para mostrar</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Fecha Registro</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    {user.bannedAt && (
                      <Badge variant="destructive" className="mt-1">
                        Baneado
                      </Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={getPlanVariant(user.plan)}>{user.plan}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {user.roles.map((role) => (
                    <Badge key={role} variant={getRoleVariant(role)}>
                      {role}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleDateString('es-ES')}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onAction('change-plan', user)}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Cambiar plan
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAction('manage-roles', user)}>
                      <Shield className="mr-2 h-4 w-4" />
                      Gestionar roles
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {user.bannedAt ? (
                      <DropdownMenuItem onClick={() => onAction('unban', user)}>
                        <Ban className="mr-2 h-4 w-4" />
                        Desbanear
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => onAction('ban', user)}
                        className="text-red-600"
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        Banear
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
