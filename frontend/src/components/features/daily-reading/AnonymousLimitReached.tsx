'use client';

import { useRouter } from 'next/navigation';
import { UserPlus, LogIn } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * AnonymousLimitReached Component
 *
 * Displays a message when an anonymous user has reached their daily limit
 * for viewing the daily card. Provides CTAs to register or login.
 *
 * Features:
 * - Clear message about limit reached
 * - Primary CTA: Register (create free account)
 * - Secondary CTA: Login (existing account)
 * - Accessible with role="alert"
 */
export function AnonymousLimitReached() {
  const router = useRouter();

  const handleRegister = () => {
    router.push(ROUTES.REGISTER);
  };

  const handleLogin = () => {
    router.push(ROUTES.LOGIN);
  };

  return (
    <Card
      role="alert"
      className="bg-surface shadow-soft animate-fade-in border-primary/20 w-full max-w-lg"
    >
      <CardHeader>
        <CardTitle className="text-center text-xl">Límite Alcanzado</CardTitle>
        <CardDescription className="text-center">
          Ya viste tu carta del día. Regístrate para acceder a más lecturas.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-primary/5 rounded-lg p-4 text-center text-sm">
          <p className="font-medium">Con una cuenta gratuita obtienes:</p>
          <ul className="mt-2 space-y-1 text-left">
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> 1 carta del día
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> 1 lectura de tarot diaria
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Historial de tus lecturas
            </li>
          </ul>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleRegister} className="w-full sm:w-auto" size="lg">
          <UserPlus className="h-4 w-4" />
          Crear cuenta gratis
        </Button>
        <Button onClick={handleLogin} variant="outline" className="w-full sm:w-auto" size="lg">
          <LogIn className="h-4 w-4" />
          Iniciar sesión
        </Button>
      </CardFooter>
    </Card>
  );
}
