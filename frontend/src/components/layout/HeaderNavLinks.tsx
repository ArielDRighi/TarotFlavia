'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useUserPlanFeatures } from '@/hooks/utils/useUserPlanFeatures';
import { ROUTES } from '@/lib/constants/routes';
import type { AuthUser } from '@/types';

interface HeaderNavLinksProps {
  variant: 'mobile' | 'desktop';
  user: AuthUser | null;
  onNavigate?: () => void;
}

interface NavLink {
  href: string;
  label: string;
  requiresAuth?: boolean;
  requiresNonPremium?: boolean;
  isActive?: (pathname: string) => boolean;
  isPremiumLink?: boolean;
}

const PUBLIC_NAV_LINKS: NavLink[] = [
  { href: ROUTES.CARTA_DEL_DIA, label: 'Tarot del Día' },
  { href: ROUTES.HOROSCOPO, label: 'Horóscopo' },
  { href: ROUTES.HOROSCOPO_CHINO, label: 'Horóscopo Chino' },
  { href: ROUTES.NUMEROLOGIA, label: 'Numerología' },
  { href: ROUTES.RITUALES, label: 'Rituales' },
  { href: ROUTES.ENCICLOPEDIA, label: 'Enciclopedia Mística' },
  { href: ROUTES.PENDULO, label: 'Péndulo' },
  { href: ROUTES.CARTA_ASTRAL, label: 'Carta Astral' },
  {
    href: ROUTES.SERVICIOS,
    label: 'Servicios',
    isActive: (pathname: string) => pathname.startsWith('/servicios'),
  },
];

const AUTH_NAV_LINKS: NavLink[] = [
  { href: ROUTES.TAROT, label: 'Tirada de Tarot', requiresAuth: true },
  {
    href: ROUTES.PREMIUM,
    label: 'Premium',
    requiresAuth: true,
    requiresNonPremium: true,
    isPremiumLink: true,
  },
];

export function HeaderNavLinks({ variant, user, onNavigate }: HeaderNavLinksProps) {
  const pathname = usePathname();
  // Premium gating from capabilities (fresh), not the persisted authStore plan,
  // so premium/non-premium nav links update right after an upgrade/expiry.
  const { isPremium } = useUserPlanFeatures();

  const isMobile = variant === 'mobile';

  const containerClass = isMobile ? 'flex flex-col gap-1' : 'hidden items-center gap-6 md:flex';

  const baseLinkClass = isMobile
    ? 'block rounded-md px-3 py-3 text-base font-medium transition-colors'
    : 'text-sm font-medium transition-colors';

  const allLinks: NavLink[] = [
    ...PUBLIC_NAV_LINKS,
    ...AUTH_NAV_LINKS.filter((link) => {
      if (link.requiresAuth && !user) return false;
      if (link.requiresNonPremium && isPremium) return false;
      return true;
    }),
  ];

  return (
    <div className={containerClass} data-testid={`nav-links-${variant}`}>
      {allLinks.map((link) => {
        const isActive = link.isActive ? link.isActive(pathname) : false;

        if (link.isPremiumLink) {
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={cn(
                baseLinkClass,
                'text-secondary hover:text-secondary/80 flex items-center gap-1'
              )}
              data-testid="premium-nav-link"
            >
              <Star className="size-4 fill-current" aria-hidden="true" />
              {link.label}
            </Link>
          );
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              baseLinkClass,
              isActive ? 'text-primary font-semibold' : 'text-text-primary hover:text-primary'
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
