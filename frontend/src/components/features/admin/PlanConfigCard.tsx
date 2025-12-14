/**
 * PlanConfigCard - Tarjeta editable para configuración de plan
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Save } from 'lucide-react';
import type { PlanConfig, UpdatePlanConfigDto } from '@/types/admin.types';
import { cn } from '@/lib/utils';

interface PlanConfigCardProps {
  plan: PlanConfig;
  onSave: (data: UpdatePlanConfigDto) => void;
  isLoading: boolean;
}

const planColors = {
  guest: 'bg-gray-100 text-gray-800 border-gray-300',
  free: 'bg-blue-100 text-blue-800 border-blue-300',
  premium: 'bg-purple-100 text-purple-800 border-purple-300',
  professional: 'bg-amber-100 text-amber-800 border-amber-300',
};

const planLabels = {
  guest: 'Guest',
  free: 'Free',
  premium: 'Premium',
  professional: 'Professional',
};

export function PlanConfigCard({ plan, onSave, isLoading }: PlanConfigCardProps) {
  // Usar plan como estado inicial, se resetea cuando cambia el planType (key prop externa)
  const [formData, setFormData] = useState<PlanConfig>(plan);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isGuestPlan = plan.planType === 'guest';

  // Detectar cambios comparando stringified data
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(plan);

  const handleNumberChange = (field: keyof PlanConfig, value: string) => {
    const numValue = parseInt(value, 10);
    setFormData((prev) => ({ ...prev, [field]: isNaN(numValue) ? 0 : numValue }));
  };

  const handleBooleanChange = (field: keyof PlanConfig, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar que los números positivos o -1 (ilimitado)
    const numberFields: (keyof PlanConfig)[] = [
      'dailyReadingLimit',
      'monthlyAIQuota',
      'maxRegenerationsPerReading',
      'historyLimit',
    ];

    numberFields.forEach((field) => {
      const value = formData[field] as number;
      if (value < -1) {
        newErrors[field] = 'Debe ser positivo o -1 para ilimitado';
      }
    });

    // Validar precio
    if (formData.price < 0) {
      newErrors.price = 'Debe ser positivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const updateDto: UpdatePlanConfigDto = {
      dailyReadingLimit: formData.dailyReadingLimit,
      monthlyAIQuota: formData.monthlyAIQuota,
      canUseCustomQuestions: formData.canUseCustomQuestions,
      canRegenerateInterpretations: formData.canRegenerateInterpretations,
      maxRegenerationsPerReading: formData.maxRegenerationsPerReading,
      canShareReadings: formData.canShareReadings,
      historyLimit: formData.historyLimit,
      canBookSessions: formData.canBookSessions,
      price: formData.price,
    };

    onSave(updateDto);
  };

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {planLabels[plan.planType]}
              <Badge className={cn('border', planColors[plan.planType])}>
                {planLabels[plan.planType]}
              </Badge>
            </CardTitle>
            <CardDescription>
              {isGuestPlan ? 'Plan de invitado (solo lectura)' : 'Configura los límites del plan'}
            </CardDescription>
          </div>
          {hasChanges && (
            <div className="flex items-center gap-1 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span>Cambios sin guardar</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Límite diario */}
        <div className="space-y-2">
          <Label htmlFor={`dailyReadingLimit-${plan.planType}`}>Lecturas diarias</Label>
          <Input
            id={`dailyReadingLimit-${plan.planType}`}
            type="number"
            value={formData.dailyReadingLimit}
            onChange={(e) => handleNumberChange('dailyReadingLimit', e.target.value)}
            disabled={isGuestPlan || isLoading}
            className={errors.dailyReadingLimit ? 'border-red-500' : ''}
          />
          {errors.dailyReadingLimit && (
            <p className="text-sm text-red-600">{errors.dailyReadingLimit}</p>
          )}
        </div>

        {/* Cuota mensual de IA */}
        <div className="space-y-2">
          <Label htmlFor={`monthlyAIQuota-${plan.planType}`}>
            Cuota mensual de IA (-1 = ilimitado)
          </Label>
          <Input
            id={`monthlyAIQuota-${plan.planType}`}
            type="number"
            value={formData.monthlyAIQuota}
            onChange={(e) => handleNumberChange('monthlyAIQuota', e.target.value)}
            disabled={isGuestPlan || isLoading}
            className={errors.monthlyAIQuota ? 'border-red-500' : ''}
          />
          {errors.monthlyAIQuota && <p className="text-sm text-red-600">{errors.monthlyAIQuota}</p>}
        </div>

        {/* Máximo de regeneraciones */}
        <div className="space-y-2">
          <Label htmlFor={`maxRegenerationsPerReading-${plan.planType}`}>
            Regeneraciones por lectura
          </Label>
          <Input
            id={`maxRegenerationsPerReading-${plan.planType}`}
            type="number"
            value={formData.maxRegenerationsPerReading}
            onChange={(e) => handleNumberChange('maxRegenerationsPerReading', e.target.value)}
            disabled={isGuestPlan || isLoading}
            className={errors.maxRegenerationsPerReading ? 'border-red-500' : ''}
          />
          {errors.maxRegenerationsPerReading && (
            <p className="text-sm text-red-600">{errors.maxRegenerationsPerReading}</p>
          )}
        </div>

        {/* Límite de historial */}
        <div className="space-y-2">
          <Label htmlFor={`historyLimit-${plan.planType}`}>
            Límite de historial (-1 = ilimitado)
          </Label>
          <Input
            id={`historyLimit-${plan.planType}`}
            type="number"
            value={formData.historyLimit}
            onChange={(e) => handleNumberChange('historyLimit', e.target.value)}
            disabled={isGuestPlan || isLoading}
            className={errors.historyLimit ? 'border-red-500' : ''}
          />
          {errors.historyLimit && <p className="text-sm text-red-600">{errors.historyLimit}</p>}
        </div>

        {/* Precio */}
        <div className="space-y-2">
          <Label htmlFor={`price-${plan.planType}`}>Precio mensual (USD)</Label>
          <Input
            id={`price-${plan.planType}`}
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleNumberChange('price', e.target.value)}
            disabled={isGuestPlan || isLoading}
            className={errors.price ? 'border-red-500' : ''}
          />
          {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}
        </div>

        {/* Toggles de features */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <Label htmlFor={`canUseCustomQuestions-${plan.planType}`}>
              Preguntas personalizadas
            </Label>
            <Switch
              id={`canUseCustomQuestions-${plan.planType}`}
              checked={formData.canUseCustomQuestions}
              onCheckedChange={(checked) => handleBooleanChange('canUseCustomQuestions', checked)}
              disabled={isGuestPlan || isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor={`canRegenerateInterpretations-${plan.planType}`}>
              Regenerar interpretaciones
            </Label>
            <Switch
              id={`canRegenerateInterpretations-${plan.planType}`}
              checked={formData.canRegenerateInterpretations}
              onCheckedChange={(checked) =>
                handleBooleanChange('canRegenerateInterpretations', checked)
              }
              disabled={isGuestPlan || isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor={`canShareReadings-${plan.planType}`}>Compartir lecturas</Label>
            <Switch
              id={`canShareReadings-${plan.planType}`}
              checked={formData.canShareReadings}
              onCheckedChange={(checked) => handleBooleanChange('canShareReadings', checked)}
              disabled={isGuestPlan || isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor={`canBookSessions-${plan.planType}`}>Reservar sesiones</Label>
            <Switch
              id={`canBookSessions-${plan.planType}`}
              checked={formData.canBookSessions}
              onCheckedChange={(checked) => handleBooleanChange('canBookSessions', checked)}
              disabled={isGuestPlan || isLoading}
            />
          </div>
        </div>

        {/* Botón de guardar */}
        {!isGuestPlan && (
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
            className="w-full"
            variant="default"
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
