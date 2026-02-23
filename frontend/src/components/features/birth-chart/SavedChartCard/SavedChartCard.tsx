'use client';

// 1. React & Next.js
import { useCallback } from 'react';
import Link from 'next/link';

// 2. Icons
import {
  Calendar,
  Clock,
  Sun,
  Moon,
  Sunrise,
  Eye,
  Download,
  Pencil,
  Trash2,
  MoreVertical,
} from 'lucide-react';

// 3. Third-party
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// 4. Custom hooks
// N/A

// 5. Components (ui → features)
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

// 6. Utils & types
import { cn } from '@/lib/utils';
import { formatTimeAgo, parseDateString } from '@/lib/utils/date';
import type { SavedChart } from '@/types/birth-chart.types';
import { ZODIAC_SIGNS, ZodiacSign } from '@/types/birth-chart.enums';

/**
 * Mapeo de elementos a clases de gradiente Tailwind
 */
const ELEMENT_GRADIENTS = {
  fire: 'from-red-500 to-orange-500',
  earth: 'from-green-600 to-emerald-600',
  air: 'from-blue-400 to-cyan-400',
  water: 'from-blue-600 to-indigo-600',
} as const;

/**
 * Props del componente SavedChartCard
 */
interface SavedChartCardProps {
  /** Carta guardada a mostrar */
  chart: SavedChart;
  /** Callback cuando se hace clic en "Ver carta" */
  onView: (chart: SavedChart) => void;
  /** Callback cuando se hace clic en "Descargar PDF" */
  onDownload: (chart: SavedChart) => void;
  /** Callback cuando se hace clic en "Renombrar" */
  onRename: (chart: SavedChart) => void;
  /** Callback cuando se hace clic en "Eliminar" */
  onDelete: (chart: SavedChart) => void;
}

/**
 * Obtiene el gradiente CSS según el elemento del signo solar
 */
function getElementGradient(sunSign: string): string {
  const zodiacKey = sunSign as ZodiacSign;
  const element = ZODIAC_SIGNS[zodiacKey]?.element || 'air';
  return ELEMENT_GRADIENTS[element];
}

/**
 * Componente de tarjeta para carta astral guardada
 *
 * Muestra información resumida de una carta astral guardada:
 * - Nombre y fecha de nacimiento
 * - Big Three (Sol, Luna, Ascendente) con símbolos zodiacales
 * - Gradiente de fondo según elemento del Sol
 * - Menú de acciones (ver, descargar, renombrar, eliminar)
 * - Indicador de tiempo desde creación
 * - Link a vista detallada
 */
export function SavedChartCard({
  chart,
  onView,
  onDownload,
  onRename,
  onDelete,
}: SavedChartCardProps) {
  // Obtener metadata de signos (normalizar a lowercase por si el backend devuelve nombre capitalizado)
  const sunSignKey = chart.sunSign.toLowerCase() as ZodiacSign;
  const moonSignKey = chart.moonSign.toLowerCase() as ZodiacSign;
  const ascendantSignKey = chart.ascendantSign.toLowerCase() as ZodiacSign;

  const sunSignData = ZODIAC_SIGNS[sunSignKey] ?? {
    name: chart.sunSign,
    symbol: '★',
    element: 'air' as const,
  };
  const moonSignData = ZODIAC_SIGNS[moonSignKey] ?? {
    name: chart.moonSign,
    symbol: '★',
    element: 'air' as const,
  };
  const ascendantSignData = ZODIAC_SIGNS[ascendantSignKey] ?? {
    name: chart.ascendantSign,
    symbol: '★',
    element: 'air' as const,
  };

  // Formatear fechas
  // BUGFIX: Use parseDateString to avoid UTC timezone shift on DATE-only strings
  // (e.g. "1979-10-19" parsed by new Date() is UTC midnight → shows Oct 18 in UTC-3)
  const birthDateObj = parseDateString(chart.birthDate);
  const formattedBirthDate = format(birthDateObj, "d 'de' MMMM 'de' yyyy", {
    locale: es,
  });
  // BUGFIX: Use formatTimeAgo instead of formatDistanceToNow to avoid UTC timezone issues
  // that could show "en 3 horas" for recently created charts (e.g. UTC-3 users).
  const timeAgo = formatTimeAgo(chart.createdAt);

  // Gradiente según elemento del sol (normalizar key)
  const gradientClasses = getElementGradient(chart.sunSign.toLowerCase());

  // Handlers
  const handleView = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onView(chart);
    },
    [chart, onView]
  );

  const handleDownload = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDownload(chart);
    },
    [chart, onDownload]
  );

  const handleRename = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onRename(chart);
    },
    [chart, onRename]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDelete(chart);
    },
    [chart, onDelete]
  );

  const handleMenuOpen = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <Link href={`/carta-astral/resultado/${chart.id}`}>
      <Card
        data-testid="saved-chart-card"
        data-chart-id={chart.id}
        className={cn(
          'group relative overflow-hidden transition-all duration-300',
          'hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg',
          'cursor-pointer'
        )}
      >
        {/* Gradiente de fondo según elemento */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-10',
            'transition-opacity duration-300 group-hover:opacity-20',
            gradientClasses
          )}
        />

        {/* Contenido de la tarjeta */}
        <div className="relative z-10">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate text-lg font-semibold">{chart.name}</CardTitle>
                <CardDescription className="mt-1 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-sm">{formattedBirthDate}</span>
                </CardDescription>
              </div>

              {/* Menú de acciones */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={handleMenuOpen}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    aria-label="Más opciones"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleView}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver carta
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar PDF
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleRename}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Renombrar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="pb-3">
            {/* Big Three */}
            <div className="flex items-center justify-around gap-4">
              {/* Sol */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="flex flex-col items-center gap-1"
                      aria-label={`Sol en ${sunSignData.name}`}
                    >
                      <Sun className="text-muted-foreground h-4 w-4" />
                      <span className="text-2xl" role="img" aria-hidden="true">
                        {sunSignData.symbol}
                      </span>
                      <span className="text-muted-foreground text-xs">{sunSignData.name}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sol en {sunSignData.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Luna */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="flex flex-col items-center gap-1"
                      aria-label={`Luna en ${moonSignData.name}`}
                    >
                      <Moon className="text-muted-foreground h-4 w-4" />
                      <span className="text-2xl" role="img" aria-hidden="true">
                        {moonSignData.symbol}
                      </span>
                      <span className="text-muted-foreground text-xs">{moonSignData.name}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Luna en {moonSignData.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Ascendente */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="flex flex-col items-center gap-1"
                      aria-label={`Ascendente en ${ascendantSignData.name}`}
                    >
                      <Sunrise className="text-muted-foreground h-4 w-4" />
                      <span className="text-2xl" role="img" aria-hidden="true">
                        {ascendantSignData.symbol}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {ascendantSignData.name}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ascendente en {ascendantSignData.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>

          <CardFooter className="border-t pt-3">
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5" />
              <span>{timeAgo}</span>
            </div>
          </CardFooter>
        </div>
      </Card>
    </Link>
  );
}

/**
 * Componente skeleton para loading state
 */
export function SavedChartCardSkeleton() {
  return (
    <Card data-testid="saved-chart-card-skeleton" className="animate-pulse overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex items-center justify-around gap-4">
          {/* Sol */}
          <div className="flex flex-col items-center gap-1">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>

          {/* Luna */}
          <div className="flex flex-col items-center gap-1">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>

          {/* Ascendente */}
          <div className="flex flex-col items-center gap-1">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t pt-3">
        <Skeleton className="h-3 w-24" />
      </CardFooter>
    </Card>
  );
}
