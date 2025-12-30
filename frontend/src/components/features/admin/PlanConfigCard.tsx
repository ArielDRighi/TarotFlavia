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
  anonymous: 'bg-gray-100 text-gray-800 border-gray-300',
  free: 'bg-blue-100 text-blue-800 border-blue-300',
  premium: 'bg-purple-100 text-purple-800 border-purple-300',
};

const planLabels = {
  anonymous: 'Anónimo',
  free: 'Gratuito',
  premium: 'Premium',
};

export function PlanConfigCard({ plan, onSave, isLoading }: PlanConfigCardProps) {
  // Usar plan como estado inicial, se resetea cuando cambia el planType (key prop externa)
  const [formData, setFormData] = useState<PlanConfig>(plan);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isAnonymousPlan = plan.planType === 'anonymous';

  // Detectar cambios comparando stringified data
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(plan);

  const handleNumberChange = (field: keyof PlanConfig, value: string, useFloat = false) => {
    const numValue = useFloat ? parseFloat(value) : parseInt(value, 10);
    setFormData((prev) => ({ ...prev, [field]: isNaN(numValue) ? 0 : numValue }));
  };

  const handleBooleanChange = (field: keyof PlanConfig, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar que los números sean positivos o -1 (ilimitado)
    const numberFields: (keyof PlanConfig)[] = ['readingsLimit', 'aiQuotaMonthly'];

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
      name: formData.name,
      description: formData.description || undefined,
      price: formData.price,
      readingsLimit: formData.readingsLimit,
      aiQuotaMonthly: formData.aiQuotaMonthly,
      allowCustomQuestions: formData.allowCustomQuestions,
      allowSharing: formData.allowSharing,
      allowAdvancedSpreads: formData.allowAdvancedSpreads,
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
              {isAnonymousPlan ? 'Plan anónimo (solo lectura)' : 'Configura los límites del plan'}
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
        {/* Nombre del plan */}
        <div className="space-y-2">
          <Label htmlFor={`name-${plan.planType}`}>Nombre del plan</Label>
          <Input
            id={`name-${plan.planType}`}
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            disabled={isAnonymousPlan || isLoading}
          />
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <Label htmlFor={`description-${plan.planType}`}>Descripción</Label>
          <Input
            id={`description-${plan.planType}`}
            type="text"
            value={formData.description || ''}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value || null }))
            }
            disabled={isAnonymousPlan || isLoading}
          />
        </div>

        {/* Límite de lecturas mensuales */}
        <div className="space-y-2">
          <Label htmlFor={`readingsLimit-${plan.planType}`}>
            Lecturas mensuales (-1 = ilimitado)
          </Label>
          <Input
            id={`readingsLimit-${plan.planType}`}
            type="number"
            value={formData.readingsLimit}
            onChange={(e) => handleNumberChange('readingsLimit', e.target.value)}
            disabled={isAnonymousPlan || isLoading}
            className={errors.readingsLimit ? 'border-red-500' : ''}
          />
          {errors.readingsLimit && <p className="text-sm text-red-600">{errors.readingsLimit}</p>}
        </div>

        {/* Cuota mensual de IA */}
        <div className="space-y-2">
          <Label htmlFor={`aiQuotaMonthly-${plan.planType}`}>
            Cuota mensual de IA (-1 = ilimitado)
          </Label>
          <Input
            id={`aiQuotaMonthly-${plan.planType}`}
            type="number"
            value={formData.aiQuotaMonthly}
            onChange={(e) => handleNumberChange('aiQuotaMonthly', e.target.value)}
            disabled={isAnonymousPlan || isLoading}
            className={errors.aiQuotaMonthly ? 'border-red-500' : ''}
          />
          {errors.aiQuotaMonthly && <p className="text-sm text-red-600">{errors.aiQuotaMonthly}</p>}
        </div>

        {/* Precio */}
        <div className="space-y-2">
          <Label htmlFor={`price-${plan.planType}`}>Precio mensual (USD)</Label>
          <Input
            id={`price-${plan.planType}`}
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleNumberChange('price', e.target.value, true)}
            disabled={isAnonymousPlan || isLoading}
            className={errors.price ? 'border-red-500' : ''}
          />
          {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}
        </div>

        {/* Toggles de features */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <Label htmlFor={`allowCustomQuestions-${plan.planType}`}>
              Preguntas personalizadas
            </Label>
            <Switch
              id={`allowCustomQuestions-${plan.planType}`}
              checked={formData.allowCustomQuestions}
              onCheckedChange={(checked) => handleBooleanChange('allowCustomQuestions', checked)}
              disabled={isAnonymousPlan || isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor={`allowSharing-${plan.planType}`}>Compartir lecturas</Label>
            <Switch
              id={`allowSharing-${plan.planType}`}
              checked={formData.allowSharing}
              onCheckedChange={(checked) => handleBooleanChange('allowSharing', checked)}
              disabled={isAnonymousPlan || isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor={`allowAdvancedSpreads-${plan.planType}`}>Tiradas avanzadas</Label>
            <Switch
              id={`allowAdvancedSpreads-${plan.planType}`}
              checked={formData.allowAdvancedSpreads}
              onCheckedChange={(checked) => handleBooleanChange('allowAdvancedSpreads', checked)}
              disabled={isAnonymousPlan || isLoading}
            />
          </div>
        </div>

        {/* Botón de guardar */}
        {!isAnonymousPlan && (
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
