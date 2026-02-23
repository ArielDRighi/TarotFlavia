'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Crown,
  RefreshCw,
  Copy,
  Check,
  Clock,
  Cpu,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AISynthesis as AISynthesisType } from '@/types';
import { formatTimeAgo } from '@/lib/utils/date';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface AISynthesisProps {
  data: AISynthesisType;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  showMetadata?: boolean;
  className?: string;
}

export function AISynthesis({
  data,
  onRegenerate,
  isRegenerating = false,
  showMetadata = true,
  className,
}: AISynthesisProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup del timeout cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Copiar al portapapeles
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.content);
      setCopied(true);

      // Limpiar timeout anterior si existe
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }

      // Guardar referencia al nuevo timeout
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  // Formatear fecha
  // BUGFIX: Use formatTimeAgo to avoid UTC timezone issues that show wrong relative time
  const formattedDate = data.generatedAt ? formatTimeAgo(data.generatedAt) : null;

  // Dividir contenido en párrafos para mejor legibilidad
  const paragraphs = data.content.split('\n\n').filter((p) => p.trim());

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-2 border-amber-500/30',
        'bg-gradient-to-br from-amber-500/5 via-transparent to-purple-500/5',
        className
      )}
    >
      {/* Decoración de fondo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Ícono premium */}
            <div className="rounded-full bg-gradient-to-br from-amber-500 to-orange-500 p-2">
              <Sparkles className="h-5 w-5 text-white" />
            </div>

            <div>
              <CardTitle className="flex items-center gap-2">
                Síntesis Personalizada
                <Badge className="border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <Crown className="mr-1 h-3 w-3" />
                  Premium
                </Badge>
              </CardTitle>
              <CardDescription>Análisis único generado por inteligencia artificial</CardDescription>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleCopy}
                    aria-label={copied ? 'Copiado!' : 'Copiar texto'}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{copied ? 'Copiado!' : 'Copiar texto'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {onRegenerate && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={onRegenerate}
                      disabled={isRegenerating}
                      aria-label="Regenerar síntesis"
                    >
                      <RefreshCw className={cn('h-4 w-4', isRegenerating && 'animate-spin')} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Regenerar síntesis</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? 'Colapsar' : 'Expandir'}
              aria-expanded={isExpanded}
              aria-controls="synthesis-content"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent id="synthesis-content" className="relative pt-0">
          {/* Contenido de la síntesis */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {isRegenerating ? (
              <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
                <Sparkles className="mb-4 h-8 w-8 animate-pulse text-amber-500" />
                <p>Generando nueva síntesis...</p>
                <p className="text-sm">Esto puede tomar unos segundos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className={cn(
                      'text-sm leading-relaxed',
                      index === 0 && 'text-base font-medium'
                    )}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Metadata */}
          {showMetadata && !isRegenerating && (
            <div className="border-border/50 text-muted-foreground mt-6 flex flex-wrap gap-4 border-t pt-4 text-xs">
              {formattedDate && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Generado {formattedDate}</span>
                </div>
              )}
              {data.provider && (
                <div className="flex items-center gap-1">
                  <Cpu className="h-3 w-3" />
                  <span>Modelo: {data.provider}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Placeholder para usuarios Free (upsell)
 */
export function AISynthesisPlaceholder({ className }: { className?: string }) {
  return (
    <Card
      className={cn(
        'border-muted-foreground/30 relative overflow-hidden border-2 border-dashed',
        className
      )}
    >
      <CardContent className="py-12">
        <div className="text-center">
          <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Sparkles className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Síntesis Personalizada</h3>
          <p className="text-muted-foreground mx-auto mb-6 max-w-md text-sm">
            Obtén un análisis único generado por inteligencia artificial que conecta todos los
            elementos de tu carta y revela patrones ocultos.
          </p>
          <Button
            type="button"
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Crown className="mr-2 h-4 w-4" />
            Desbloquear con Premium
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
