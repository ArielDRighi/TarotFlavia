'use client';

import Link from 'next/link';
import { Plus, History, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Quick action card component
 */
interface QuickActionCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  variant?: 'primary' | 'secondary';
}

function QuickActionCard({
  href,
  icon,
  title,
  description,
  variant = 'secondary',
}: QuickActionCardProps) {
  const isPrimary = variant === 'primary';

  return (
    <Link
      href={href}
      className={cn(
        'block rounded-lg p-6 transition-all duration-200',
        'hover:scale-105 hover:shadow-lg',
        isPrimary
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
          : 'border border-gray-200 bg-white hover:border-purple-300 dark:border-gray-700 dark:bg-gray-800'
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full',
            isPrimary ? 'bg-white/20' : 'bg-purple-100 dark:bg-purple-900/30'
          )}
        >
          <div className={cn(isPrimary ? 'text-white' : 'text-purple-600 dark:text-purple-400')}>
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <h3
            className={cn(
              'mb-1 font-serif text-xl font-semibold',
              isPrimary ? 'text-white' : 'text-gray-900 dark:text-gray-100'
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              'text-sm',
              isPrimary ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'
            )}
          >
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}

/**
 * Quick Actions component for user dashboard
 *
 * Displays action cards for:
 * - Nueva Lectura (primary)
 * - Historial de Lecturas
 * - Carta del Día
 *
 * @example
 * ```tsx
 * <QuickActions />
 * ```
 */
export function QuickActions() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <QuickActionCard
        href="/ritual/tirada"
        icon={<Plus className="h-6 w-6" />}
        title="Nueva Lectura"
        description="Comienza una nueva tirada de tarot"
        variant="primary"
      />

      <QuickActionCard
        href="/historial"
        icon={<History className="h-6 w-6" />}
        title="Historial de Lecturas"
        description="Revisa tus lecturas anteriores"
      />

      <QuickActionCard
        href="/carta-del-dia"
        icon={<Sparkles className="h-6 w-6" />}
        title="Carta del Día"
        description="Obtén tu carta diaria de inspiración"
      />
    </div>
  );
}
