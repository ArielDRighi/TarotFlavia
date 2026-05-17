'use client';

// 1. React & Next.js
import { useState } from 'react';
// 2. Icons
import { ChevronDown, ChevronUp, Sparkles, RefreshCw } from 'lucide-react';
// 3. Third-party
import { toast } from 'sonner';
// 4. Custom hooks
import {
  useChineseHoroscopeAdminStatus,
  useGenerateMissingChineseHoroscopes,
} from '@/hooks/api/useAdminChineseHoroscope';
// 5. Components (ui → features)
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { ErrorDisplay } from '@/components/ui/error-display';
// 6. Utils & types
import type { MissingCombination } from '@/types/admin-chinese-horoscope.types';

// Constants
const ANIMAL_LABEL: Record<string, string> = {
  rat: 'Rata 🐀',
  ox: 'Buey 🐂',
  tiger: 'Tigre 🐯',
  rabbit: 'Conejo 🐰',
  dragon: 'Dragón 🐉',
  snake: 'Serpiente 🐍',
  horse: 'Caballo 🐴',
  goat: 'Cabra 🐐',
  monkey: 'Mono 🐒',
  rooster: 'Gallo 🐓',
  dog: 'Perro 🐕',
  pig: 'Cerdo 🐖',
};

const ELEMENT_LABEL: Record<string, string> = {
  metal: 'Metal ⚙️',
  water: 'Agua 💧',
  wood: 'Madera 🌿',
  fire: 'Fuego 🔥',
  earth: 'Tierra 🌍',
};

// Types
interface MissingTableProps {
  missing: MissingCombination[];
}

// Sub-components
function MissingCombinationsTable({ missing }: MissingTableProps) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-muted-foreground border-b text-left">
          <th className="pr-4 pb-2 font-medium">Animal</th>
          <th className="pb-2 font-medium">Elemento</th>
        </tr>
      </thead>
      <tbody>
        {missing.map((combo) => (
          <tr key={`${combo.animal}-${combo.element}`} className="border-b last:border-0">
            <td className="py-1.5 pr-4">{ANIMAL_LABEL[combo.animal] ?? combo.animal}</td>
            <td className="py-1.5">{ELEMENT_LABEL[combo.element] ?? combo.element}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Main Component
export function ChineseHoroscopeAdminPanel() {
  // 1. State
  const [missingExpanded, setMissingExpanded] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  const currentYear = new Date().getFullYear();

  // 2. Hooks
  const {
    data: status,
    isLoading,
    isError,
  } = useChineseHoroscopeAdminStatus(currentYear, {
    pollingEnabled: isPolling,
  });
  const generateMutation = useGenerateMissingChineseHoroscopes();

  // 3. Derived state
  const hasMissing = (status?.missing.length ?? 0) > 0;
  const isFullyGenerated = status !== undefined && status.generated === status.total;

  // 4. Handlers
  const handleGenerate = () => {
    setIsPolling(true);
    generateMutation.mutate(currentYear, {
      onSuccess: (response) => {
        toast.success(response.message);
      },
      onError: (error) => {
        setIsPolling(false);
        toast.error(`Error al generar faltantes: ${error.message}`);
      },
    });
  };

  // 5. Render
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorDisplay
        title="Error al cargar el estado"
        message="No se pudo obtener el estado de generación del horóscopo chino."
      />
    );
  }

  return (
    <div data-testid="chinese-horoscope-admin-panel" className="space-y-4">
      {/* Status card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Horóscopo Chino {currentYear}
          </CardTitle>
          <CardDescription>Estado de generación de combinaciones animal + elemento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Counter */}
          <div className="flex items-center gap-3">
            <span data-testid="generated-counter" className="text-3xl font-bold tabular-nums">
              {status?.generated ?? 0}
              <span className="text-muted-foreground"> / {status?.total ?? 60}</span>
            </span>
            <span className="text-muted-foreground text-sm">generados</span>
            {isFullyGenerated && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                Completo ✓
              </span>
            )}
          </div>

          {/* Actions */}
          {hasMissing && (
            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${generateMutation.isPending ? 'animate-spin' : ''}`}
              />
              {generateMutation.isPending ? 'Generando...' : 'Generar faltantes'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Collapsible missing combinations */}
      {hasMissing && status && (
        <Card>
          <CardHeader
            className="cursor-pointer select-none"
            onClick={() => setMissingExpanded((prev) => !prev)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 p-0 hover:bg-transparent"
                  aria-expanded={missingExpanded}
                >
                  {missingExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  Faltantes ({status.missing.length})
                </Button>
              </CardTitle>
            </div>
          </CardHeader>
          {missingExpanded && (
            <CardContent>
              <MissingCombinationsTable missing={status.missing} />
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
