'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumerologyIntro } from '@/components/features/numerology';
import { useAuthStore } from '@/stores/authStore';
import { useCalculateNumerology } from '@/hooks/api/useNumerology';
import { ROUTES } from '@/lib/constants/routes';

/**
 * Numerología Page
 *
 * Página principal de numerología con calculadora para usuarios anónimos y registrados.
 * Permite calcular números basados en fecha de nacimiento y opcionalmente nombre completo.
 */
export default function NumerologiaPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { mutate, isPending } = useCalculateNumerology();

  const [birthDate, setBirthDate] = useState(user?.birthDate ? user.birthDate.split('T')[0] : '');
  const [fullName, setFullName] = useState(user?.name || '');

  const handleCalculate = () => {
    if (!birthDate) return;

    mutate(
      { birthDate, fullName: fullName || undefined },
      {
        onSuccess: (data) => {
          sessionStorage.setItem('numerologyResult', JSON.stringify(data));
          router.push(ROUTES.NUMEROLOGIA_RESULTADO);
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8" data-testid="numerologia-page">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-serif text-4xl">Numerología</h1>
          <p className="text-muted-foreground">Descubre los números que rigen tu vida</p>
        </div>

        <NumerologyIntro className="mb-8" />

        <Card className="p-6">
          <h2 className="mb-4 font-serif text-xl">Calcula tus Números</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="birthDate">Fecha de Nacimiento *</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                data-testid="birth-date-input"
              />
            </div>

            <div>
              <Label htmlFor="fullName">Nombre Completo (opcional)</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Para números de expresión y alma"
                data-testid="full-name-input"
              />
            </div>

            <Button
              onClick={handleCalculate}
              disabled={!birthDate || isPending}
              className="w-full"
              data-testid="calculate-button"
            >
              {isPending ? 'Calculando...' : 'Calcular mis Números'}
            </Button>
          </div>

          {!isAuthenticated && (
            <p className="text-muted-foreground mt-4 text-center text-sm">
              <Link href={ROUTES.REGISTER} className="text-primary hover:underline">
                Regístrate
              </Link>{' '}
              para guardar tus resultados
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
