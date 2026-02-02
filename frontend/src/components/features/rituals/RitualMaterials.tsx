'use client';

import { Check, Circle, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { MaterialType } from '@/types/ritual.types';
import type { RitualMaterial } from '@/types/ritual.types';

/**
 * RitualMaterials Component Props
 */
export interface RitualMaterialsProps {
  /** List of materials needed for the ritual */
  materials: RitualMaterial[];
}

/**
 * RitualMaterials Component
 *
 * Displays a categorized list of materials needed for a ritual,
 * separated into required and optional sections.
 *
 * Features:
 * - Required materials with green checkmark icon
 * - Optional/alternative materials with circle icon
 * - Quantity and unit display for required materials
 * - Material descriptions when available
 * - Alternative suggestions for optional materials
 * - Responsive card layout
 *
 * @example
 * ```tsx
 * <RitualMaterials materials={ritual.materials} />
 * ```
 */
export function RitualMaterials({ materials }: RitualMaterialsProps) {
  const required = materials.filter((m) => m.type === MaterialType.REQUIRED);
  // Optional includes both OPTIONAL and ALTERNATIVE types
  const optional = materials.filter(
    (m) => m.type === MaterialType.OPTIONAL || m.type === MaterialType.ALTERNATIVE
  );

  return (
    <Card className="p-6" data-testid="ritual-materials">
      <h2 className="mb-4 font-serif text-xl">Materiales Necesarios</h2>

      {required.length > 0 && (
        <div className="mb-4">
          <h3 className="text-muted-foreground mb-2 text-sm font-medium">Requeridos</h3>
          <ul className="space-y-2">
            {required.map((material) => (
              <li key={material.id} className="flex items-start gap-2">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <div>
                  <span className="font-medium">{material.name}</span>
                  {(material.quantity > 1 || (material.quantity === 1 && material.unit)) && (
                    <span className="text-muted-foreground">
                      {' '}
                      × {material.quantity}
                      {material.unit && ` ${material.unit}`}
                    </span>
                  )}
                  {material.description && (
                    <p className="text-muted-foreground text-sm">{material.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {optional.length > 0 && (
        <div>
          <h3 className="text-muted-foreground mb-2 text-sm font-medium">Opcionales</h3>
          <ul className="space-y-2">
            {optional.map((material) => (
              <li key={material.id} className="flex items-start gap-2">
                <Circle className="text-muted-foreground mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <span>{material.name}</span>
                  {material.alternative && (
                    <span className="text-muted-foreground flex items-center gap-1 text-sm">
                      <ArrowRight className="h-3 w-3" />
                      Alternativa: {material.alternative}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
