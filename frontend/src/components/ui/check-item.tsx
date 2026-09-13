import type { ReactNode } from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

const TONE_CLASS = {
  primary: 'text-primary',
  success: 'text-green-600',
} as const;

export interface CheckItemProps {
  children: ReactNode;
  /** Color del check (default `primary`). */
  tone?: keyof typeof TONE_CLASS;
  /** Clases del `<li>`. */
  className?: string;
  'data-testid'?: string;
}

/**
 * Ítem de lista con check (T-UI-12).
 *
 * Reemplaza el patrón `<li><span>✓</span> texto</li>` de las listas de
 * beneficios y límites por el icono `Check` de lucide, que se ve igual en
 * todos los SO. Va dentro de un `<ul>`.
 *
 * @example
 * ```tsx
 * <ul className="space-y-1">
 *   <CheckItem>1 carta del día</CheckItem>
 *   <CheckItem tone="success">3 tiradas por día</CheckItem>
 * </ul>
 * ```
 */
export function CheckItem({
  children,
  tone = 'primary',
  className,
  'data-testid': testId,
}: CheckItemProps) {
  return (
    <li className={cn('flex items-start gap-2', className)} data-testid={testId}>
      <Check className={cn('mt-0.5 h-4 w-4 shrink-0', TONE_CLASS[tone])} aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}
