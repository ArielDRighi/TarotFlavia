'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCalculateNumerology } from '@/hooks/api/useNumerology';
import { calculateLifePathNumber } from '@/lib/utils/numerology';
import type { NumerologyResponseDto } from '@/types/numerology.types';
import { NumberCard } from './NumberCard';

interface Props {
  showNameField?: boolean;
  onCalculated?: (result: NumerologyResponseDto) => void;
  className?: string;
}

export function NumerologyCalculator({ showNameField = false, onCalculated, className }: Props) {
  const [birthDate, setBirthDate] = useState('');
  const [fullName, setFullName] = useState('');
  const [quickResult, setQuickResult] = useState<number | null>(null);

  const { mutate: calculate, isPending } = useCalculateNumerology();

  const isValid = !!birthDate;

  // Vista rápida: calcula solo camino de vida en cliente
  const handleQuickPreview = () => {
    if (!birthDate) return;
    const date = new Date(birthDate);
    const lifePathNumber = calculateLifePathNumber(date);
    setQuickResult(lifePathNumber);
  };

  // Calcular perfil completo: llama al backend
  const handleFullCalculate = () => {
    if (!birthDate) return;

    calculate(
      {
        birthDate,
        fullName: fullName || undefined,
      },
      {
        onSuccess: (data) => {
          setQuickResult(null); // Clear quick result
          onCalculated?.(data);
        },
      }
    );
  };

  return (
    <Card className={className} data-testid="numerology-calculator">
      <CardHeader>
        <CardTitle>Calcula tu Número de Vida</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Birth Date Input */}
        <div className="space-y-2">
          <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
          <Input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(e) => {
              setBirthDate(e.target.value);
              setQuickResult(null); // Reset quick result on change
            }}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Full Name Input (optional) */}
        {showNameField && (
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre Completo (opcional)</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej: María José González"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleQuickPreview}
            disabled={!isValid || isPending}
            variant="outline"
            className="flex-1"
          >
            Vista rápida
          </Button>
          <Button onClick={handleFullCalculate} disabled={!isValid || isPending} className="flex-1">
            {isPending ? 'Calculando...' : 'Calcular perfil'}
          </Button>
        </div>

        {/* Quick Result Display */}
        {quickResult !== null && (
          <div className="mt-4">
            <NumberCard
              number={{
                value: quickResult,
                name: `Número ${quickResult}`,
                keywords: [],
                description: 'Vista rápida - Usa "Calcular perfil" para más detalles',
                isMaster: [11, 22, 33].includes(quickResult),
              }}
              context="lifePath"
              variant="compact"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
