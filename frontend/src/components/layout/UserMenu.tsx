'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Settings, BookOpen, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/authStore';

/**
 * UserMenu component
 * Displays login and register buttons when unauthenticated, or avatar with dropdown menu when authenticated
 */
export function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // Show login and register buttons when not authenticated
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href="/login">Iniciar Sesión</Link>
        </Button>
        <Button variant="default" asChild>
          <Link href="/registro">Registrarse</Link>
        </Button>
      </div>
    );
  }

  // Get user initial for avatar
  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : '?';

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative size-8 rounded-full"
          data-testid="user-menu-trigger"
        >
          <Avatar data-testid="user-avatar">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userInitial}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem asChild>
          <Link href="/perfil" className="flex items-center">
            <User className="mr-2 size-4" />
            Mi Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/historial" className="flex items-center">
            <BookOpen className="mr-2 size-4" />
            Mis Lecturas
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/configuracion" className="flex items-center">
            <Settings className="mr-2 size-4" />
            Configuración
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} variant="destructive">
          <LogOut className="mr-2 size-4" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
