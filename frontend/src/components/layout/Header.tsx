'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { UserMenu } from './UserMenu';
import { NotificationBell } from '@/components/features/notifications';
import { ROUTES } from '@/lib/constants/routes';

/**
 * Header component
 * Main navigation header with logo, navigation links, and user menu
 * Responsive with hamburger menu on mobile
 */
export function Header() {
  const { user } = useAuthStore();

  return (
    <header className="bg-surface shadow-soft sticky top-0 z-50 w-full border-b" role="banner">
      <nav
        className="container mx-auto flex h-16 items-center justify-between px-4"
        aria-label="Navegación principal"
      >
        {/* Mobile menu button - TODO: Implement mobile navigation panel in TASK 2.3 */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Menú"
          aria-expanded={false}
          aria-haspopup="true"
        >
          <Menu className="size-5" />
        </Button>

        {/* Logo - centered on mobile, left on desktop */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
          <span className="text-primary font-serif text-2xl font-semibold">Tarot</span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href={ROUTES.CARTA_DEL_DIA}
            className="text-text-primary hover:text-primary text-sm font-medium transition-colors"
          >
            Tarot del Día
          </Link>
          <Link
            href={ROUTES.HOROSCOPO}
            className="text-text-primary hover:text-primary text-sm font-medium transition-colors"
          >
            Horóscopo
          </Link>
          <Link
            href={ROUTES.HOROSCOPO_CHINO}
            className="text-text-primary hover:text-primary text-sm font-medium transition-colors"
          >
            Horóscopo Chino
          </Link>
          <Link
            href={ROUTES.NUMEROLOGIA}
            className="text-text-primary hover:text-primary text-sm font-medium transition-colors"
          >
            Numerología
          </Link>
          <Link
            href={ROUTES.RITUALES}
            className="text-text-primary hover:text-primary text-sm font-medium transition-colors"
          >
            Rituales
          </Link>
          <Link
            href={ROUTES.ENCICLOPEDIA}
            className="text-text-primary hover:text-primary text-sm font-medium transition-colors"
          >
            Enciclopedia Mística
          </Link>
          <Link
            href={ROUTES.PENDULO}
            className="text-text-primary hover:text-primary text-sm font-medium transition-colors"
          >
            Péndulo
          </Link>
          <Link
            href={ROUTES.CARTA_ASTRAL}
            className="text-text-primary hover:text-primary text-sm font-medium transition-colors"
          >
            Carta Astral
          </Link>
          {user && (
            <>
              <Link
                href="/ritual"
                className="text-text-primary hover:text-primary text-sm font-medium transition-colors"
              >
                Tirada de Tarot
              </Link>
              {/* "Explorar" link hidden in MVP - single tarotista (Flavia) */}
              {/* TODO: Enable when multiple tarotistas are supported */}
              {/* <Link
                href="/explorar"
                className="text-text-primary hover:text-primary text-sm font-medium transition-colors"
              >
                Explorar
              </Link> */}
              {/* "Mis Sesiones" link hidden in MVP - no user sessions implemented yet */}
              {/* Sessions endpoints exist only for tarotistas (/tarotist/scheduling/sessions) */}
              {/* TODO: Enable when user sessions feature is implemented */}
              {/* <Link
                href="/sesiones"
                className="text-text-primary hover:text-primary text-sm font-medium transition-colors"
              >
                Mis Sesiones
              </Link> */}
            </>
          )}
        </div>

        {/* User menu and notifications - always visible on right */}
        <div className="flex items-center gap-2">
          {user && <NotificationBell />}
          <UserMenu />
        </div>
      </nav>
    </header>
  );
}
