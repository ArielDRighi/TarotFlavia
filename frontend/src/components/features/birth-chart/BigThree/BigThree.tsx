'use client';

// 1. React & Next.js
import { useState } from 'react';

// 2. Icons
import { Sun, Moon, Sunrise, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

// 3. Third-party
// N/A

// 4. Custom hooks
// N/A

// 5. Components (ui → features)
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

// 6. Utils & types
import { cn } from '@/lib/utils';
import type { BigThreeInterpretation } from '@/types/birth-chart-interpretation.types';
import { ZODIAC_SIGNS, ZodiacSign } from '@/types/birth-chart.enums';

// Constants
const BIG_THREE_CONFIG = {
  sun: {
    icon: Sun,
    label: 'Sol',
    title: 'Tu esencia',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    description: 'Representa tu identidad central, tu ego y propósito de vida',
  },
  moon: {
    icon: Moon,
    label: 'Luna',
    title: 'Tu mundo emocional',
    color: 'text-slate-400',
    bgColor: 'bg-slate-400/10',
    borderColor: 'border-slate-400/30',
    description: 'Refleja tus emociones, intuición y necesidades internas',
  },
  ascendant: {
    icon: Sunrise,
    label: 'Ascendente',
    title: 'Tu máscara social',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    description: 'Define cómo te perciben los demás y tu primera impresión',
  },
} as const;

// Types
interface BigThreeProps {
  data: BigThreeInterpretation;
  defaultExpanded?: boolean;
  showInterpretations?: boolean;
  variant?: 'default' | 'compact' | 'hero';
  className?: string;
}

// Main Component
export function BigThree({
  data,
  defaultExpanded = false,
  showInterpretations = true,
  variant = 'default',
  className,
}: BigThreeProps) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    sun: defaultExpanded,
    moon: defaultExpanded,
    ascendant: defaultExpanded,
  });

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Renderizar un item del Big Three
  const renderItem = (
    key: 'sun' | 'moon' | 'ascendant',
    itemData: { sign: ZodiacSign; signName: string; interpretation: string }
  ) => {
    const config = BIG_THREE_CONFIG[key];
    const Icon = config.icon;
    const signMetadata = ZODIAC_SIGNS[itemData.sign];
    const isOpen = openItems[key];

    // Variante Hero (grande, para página de resultado)
    if (variant === 'hero') {
      return (
        <div
          key={key}
          className={cn(
            'relative min-w-0 overflow-hidden rounded-xl border-2 p-6',
            config.borderColor,
            config.bgColor
          )}
        >
          {/* Ícono decorativo de fondo */}
          <div className="absolute -top-4 -right-4 opacity-10">
            <Icon className="h-32 w-32" />
          </div>

          <div className="relative">
            {/* Header */}
            <div className="mb-4 flex items-start gap-4">
              <div className={cn('rounded-full p-3', config.bgColor)}>
                <Icon className={cn('h-8 w-8', config.color)} />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">{config.label}</p>
                <h3 className="flex items-center gap-2 text-2xl font-bold break-words">
                  <span className="text-3xl">{signMetadata?.symbol}</span>
                  <span className="min-w-0">{itemData.signName}</span>
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">{config.title}</p>
              </div>
            </div>

            {/* Interpretación */}
            {showInterpretations && (
              <div className="border-border/50 mt-4 border-t pt-4">
                <p className="text-sm leading-relaxed">{itemData.interpretation}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Variante Compact (para sidebar o resumen)
    if (variant === 'compact') {
      return (
        <TooltipProvider key={key}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn('flex items-center gap-2 rounded-lg p-2', config.bgColor)}
              >
                <Icon className={cn('h-4 w-4', config.color)} />
                <span className="text-lg">{signMetadata?.symbol}</span>
                <span className="text-sm font-medium">{itemData.signName}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="font-medium">
                {config.label} en {itemData.signName}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">{config.description}</p>
              {showInterpretations && <p className="mt-2 text-sm">{itemData.interpretation}</p>}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Variante Default (colapsable)
    return (
      <Collapsible
        key={key}
        open={isOpen}
        onOpenChange={() => toggleItem(key)}
        className={cn(
          'rounded-lg border transition-colors',
          isOpen ? config.borderColor : 'border-border',
          isOpen && config.bgColor
        )}
      >
        <CollapsibleTrigger asChild>
          <button className="hover:bg-muted/50 flex w-full items-center justify-between rounded-lg p-4 transition-colors">
            <div className="flex items-center gap-3">
              <div className={cn('rounded-full p-2', config.bgColor)}>
                <Icon className={cn('h-5 w-5', config.color)} />
              </div>
              <div className="text-left">
                <p className="text-muted-foreground text-xs">{config.label}</p>
                <p className="flex items-center gap-2 font-medium">
                  <span className="text-xl">{signMetadata?.symbol}</span>
                  {itemData.signName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:flex">
                {config.title}
              </Badge>
              {isOpen ? (
                <ChevronUp className="text-muted-foreground h-4 w-4" />
              ) : (
                <ChevronDown className="text-muted-foreground h-4 w-4" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pt-0 pb-4">
            <div className="pl-12">
              <p className="text-muted-foreground mb-2 text-sm">{config.description}</p>
              {showInterpretations && (
                <div className="bg-background/50 mt-3 rounded-lg p-3">
                  <p className="text-sm leading-relaxed">{itemData.interpretation}</p>
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  // Layout según variante
  if (variant === 'hero') {
    return (
      <div className={cn('grid gap-4 md:grid-cols-3', className)}>
        {renderItem('sun', data.sun)}
        {renderItem('moon', data.moon)}
        {renderItem('ascendant', data.ascendant)}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {renderItem('sun', data.sun)}
        {renderItem('moon', data.moon)}
        {renderItem('ascendant', data.ascendant)}
      </div>
    );
  }

  // Default: con card
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-primary h-5 w-5" />
          Tu Big Three
        </CardTitle>
        <CardDescription>Los tres pilares fundamentales de tu carta astral</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {renderItem('sun', data.sun)}
        {renderItem('moon', data.moon)}
        {renderItem('ascendant', data.ascendant)}
      </CardContent>
    </Card>
  );
}
