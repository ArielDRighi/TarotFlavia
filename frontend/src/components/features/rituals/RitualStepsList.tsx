'use client';

import { Clock, Quote, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { RitualStep } from '@/types/ritual.types';

export interface RitualStepsListProps {
  steps: RitualStep[];
  className?: string;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

export function RitualStepsList({ steps, className }: RitualStepsListProps) {
  return (
    <Card className={cn('p-6', className)} data-testid="ritual-steps-list">
      <h2 className="mb-4 font-serif text-xl">Pasos del Ritual</h2>

      <ol className="space-y-6">
        {steps.map((step, index) => (
          <li key={step.id} className="relative pl-8">
            {/* Número del paso */}
            <div className="bg-primary text-primary-foreground absolute top-0 left-0 flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium">
              {step.stepNumber}
            </div>

            {/* Línea conectora */}
            {index < steps.length - 1 && (
              <div className="bg-border absolute top-8 bottom-0 left-[11px] w-0.5" />
            )}

            <div className="pb-6">
              <div className="mb-1 flex items-center gap-2">
                <h3 className="font-medium">{step.title}</h3>
                {step.durationSeconds && (
                  <span className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />~{formatDuration(step.durationSeconds)}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground mb-2 text-sm">{step.description}</p>

              {step.mantra && (
                <div className="bg-muted/50 flex items-start gap-2 rounded p-3 text-sm italic">
                  <Quote className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>&quot;{step.mantra}&quot;</span>
                </div>
              )}

              {step.visualization && (
                <div className="mt-2 flex items-start gap-2 rounded bg-purple-500/10 p-3 text-sm">
                  <Eye className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                  <span>{step.visualization}</span>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
