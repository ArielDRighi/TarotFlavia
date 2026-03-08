'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { PLANETS, ASPECTS, PLANET_ENCYCLOPEDIA_SLUGS } from '@/types/birth-chart.enums';
import type { PlanetInterpretation as PlanetInterpretationType } from '@/types/birth-chart-interpretation.types';
import { ROUTES } from '@/lib/constants/routes';

interface PlanetInterpretationProps {
  interpretation: PlanetInterpretationType;
  showAspects?: boolean;
  className?: string;
}

export function PlanetInterpretation({
  interpretation,
  showAspects = true,
  className,
}: PlanetInterpretationProps) {
  const { planet, planetName, intro, inSign, inHouse, aspects } = interpretation;

  const planetMetadata = PLANETS[planet];
  const hasAspects = aspects && aspects.length > 0;

  const getNatureBadgeText = (nature: 'harmonious' | 'challenging' | 'neutral'): string => {
    switch (nature) {
      case 'harmonious':
        return 'Armónico';
      case 'challenging':
        return 'Desafiante';
      case 'neutral':
        return 'Neutral';
    }
  };

  const getNatureBadgeVariant = (
    nature: 'harmonious' | 'challenging' | 'neutral'
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (nature) {
      case 'harmonious':
        return 'default';
      case 'challenging':
        return 'destructive';
      case 'neutral':
        return 'secondary';
    }
  };

  return (
    <Card data-testid="planet-interpretation" className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{planetMetadata.unicode}</span>
          <Link
            href={ROUTES.ENCICLOPEDIA_PLANETA(PLANET_ENCYCLOPEDIA_SLUGS[planet])}
            className="text-xl font-semibold hover:underline"
          >
            {planetName}
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {intro && (
          <>
            <p className="text-muted-foreground text-sm">{intro}</p>
            <Separator />
          </>
        )}

        {inSign && (
          <>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">En Signo</h4>
              <p className="text-muted-foreground text-sm">{inSign}</p>
            </div>
            <Separator />
          </>
        )}

        {inHouse && (
          <>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">En Casa</h4>
              <p className="text-muted-foreground text-sm">{inHouse}</p>
            </div>
            {showAspects && hasAspects && <Separator />}
          </>
        )}

        {showAspects && hasAspects && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Aspectos</h4>
            <Accordion type="single" collapsible className="w-full">
              {aspects.map((aspect, index) => {
                const aspectMetadata = ASPECTS[aspect.aspectType as keyof typeof ASPECTS];
                if (!aspectMetadata) {
                  // Skip rendering if metadata for this aspect type is not defined
                  return null;
                }
                const badgeText = getNatureBadgeText(aspectMetadata.nature);
                const badgeVariant = getNatureBadgeVariant(aspectMetadata.nature);
                const aspectId = `aspect-${aspect.aspectType}-${aspect.withPlanetName}-${index}`;

                return (
                  <AccordionItem key={aspectId} value={aspectId}>
                    <AccordionTrigger className="text-sm hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span>{aspectMetadata.symbol}</span>
                        <span>
                          {aspect.aspectName} con {aspect.withPlanetName}
                        </span>
                        <Badge variant={badgeVariant} className="ml-2">
                          {badgeText}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground pl-4 text-sm">{aspect.interpretation}</p>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
