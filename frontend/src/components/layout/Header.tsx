'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuthStore } from '@/stores/authStore';
import { UserMenu } from './UserMenu';
import { NotificationBell } from '@/components/features/notifications';
import { HeaderNavLinks } from './HeaderNavLinks';

/**
 * Header component
 * Main navigation header with logo, navigation links, and user menu
 * Responsive with hamburger menu on mobile (Sheet) and horizontal nav on desktop
 */
export function Header() {
  const { user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-surface shadow-soft sticky top-0 z-50 w-full border-b" role="banner">
      <nav
        className="container mx-auto flex h-16 items-center justify-between px-4"
        aria-label="Navegación principal"
      >
        {/* Mobile menu button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Menú"
              aria-expanded={mobileMenuOpen}
              aria-haspopup="true"
              aria-controls="mobile-nav-panel"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" id="mobile-nav-panel" className="w-72 pt-10">
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <HeaderNavLinks
              variant="mobile"
              user={user}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>

        {/* Logo - centered on mobile, left on desktop */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
          <span className="text-primary font-serif text-2xl font-semibold">Auguria</span>
        </Link>

        {/* Desktop navigation */}
        <HeaderNavLinks variant="desktop" user={user} />

        {/* User menu and notifications - always visible on right */}
        <div className="flex items-center gap-2">
          {user && <NotificationBell />}
          <UserMenu />
        </div>
      </nav>
    </header>
  );
}
