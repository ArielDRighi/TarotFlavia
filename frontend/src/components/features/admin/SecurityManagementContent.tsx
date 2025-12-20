/**
 * SecurityManagementContent Component
 *
 * Main content component for admin security management page
 * Contains tabs for Rate Limiting and Security Events
 */

'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RateLimitingTab } from './RateLimitingTab';
import { SecurityEventsTab } from './SecurityEventsTab';

export function SecurityManagementContent() {
  const [activeTab, setActiveTab] = useState('rate-limiting');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="rate-limiting">Rate Limiting</TabsTrigger>
        <TabsTrigger value="security-events">Eventos de Seguridad</TabsTrigger>
      </TabsList>

      <TabsContent value="rate-limiting" className="mt-6">
        <RateLimitingTab />
      </TabsContent>

      <TabsContent value="security-events" className="mt-6">
        <SecurityEventsTab />
      </TabsContent>
    </Tabs>
  );
}
