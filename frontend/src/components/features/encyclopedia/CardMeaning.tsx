'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface CardMeaningProps {
  meaningUpright: string;
  meaningReversed: string;
}

export function CardMeaning({ meaningUpright, meaningReversed }: CardMeaningProps) {
  return (
    <Card data-testid="card-meaning" className="p-6">
      <Tabs defaultValue="upright">
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="upright" className="gap-2">
            <ArrowUp className="h-4 w-4" />
            Derecha
          </TabsTrigger>
          <TabsTrigger value="reversed" className="gap-2">
            <ArrowDown className="h-4 w-4" />
            Invertida
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upright" className="mt-0">
          <p className="text-muted-foreground leading-relaxed">{meaningUpright}</p>
        </TabsContent>

        <TabsContent value="reversed" className="mt-0">
          <p className="text-muted-foreground leading-relaxed">{meaningReversed}</p>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
