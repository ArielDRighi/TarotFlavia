'use client';

import { Check, X, Info } from 'lucide-react';
import { Toaster as SonnerToaster, type ToasterProps } from 'sonner';

/**
 * Toast notification container component
 *
 * Renders toast notifications with consistent styling:
 * - Success: Green left border (#48BB78), Check icon
 * - Error: Red left border, X icon
 * - Info: Blue left border, Info icon
 *
 * @param props - Toaster configuration props
 *
 * @example
 * ```tsx
 * // In layout.tsx
 * import { Toaster } from '@/components/ui/toaster';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <Toaster />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function Toaster({ position = 'top-right', duration = 3000, ...props }: ToasterProps) {
  return (
    <SonnerToaster
      position={position}
      duration={duration}
      icons={{
        success: <Check className="size-4 text-[#48BB78]" />,
        error: <X className="size-4 text-red-500" />,
        info: <Info className="size-4 text-blue-500" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'group toast bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-start gap-3',
          success: 'border-l-4 border-l-[#48BB78]',
          error: 'border-l-4 border-l-red-500',
          info: 'border-l-4 border-l-blue-500',
          title: 'font-sans text-sm font-medium text-gray-900',
          description: 'font-sans text-sm text-gray-500',
          actionButton: 'bg-primary text-white text-sm px-3 py-1 rounded',
          cancelButton: 'bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded',
        },
      }}
      {...props}
    />
  );
}

export type { ToasterProps };
