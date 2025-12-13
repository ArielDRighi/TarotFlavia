/**
 * AIProvidersTable Component
 *
 * Displays AI provider statistics in a table
 */

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AIProviderStats } from '@/types/admin.types';

interface AIProvidersTableProps {
  providers: AIProviderStats[];
}

export function AIProvidersTable({ providers }: AIProvidersTableProps) {
  // Calculate totals
  const totals = providers.reduce(
    (acc, provider) => ({
      totalCalls: acc.totalCalls + provider.totalCalls,
      successCalls: acc.successCalls + provider.successCalls,
      errorCalls: acc.errorCalls + provider.errorCalls,
      cachedCalls: acc.cachedCalls + provider.cachedCalls,
      totalTokens: acc.totalTokens + provider.totalTokens,
      totalCost: acc.totalCost + provider.totalCost,
      totalDuration: acc.totalDuration + provider.avgDuration * provider.totalCalls,
    }),
    {
      totalCalls: 0,
      successCalls: 0,
      errorCalls: 0,
      cachedCalls: 0,
      totalTokens: 0,
      totalCost: 0,
      totalDuration: 0,
    }
  );

  const avgDuration = totals.totalCalls > 0 ? totals.totalDuration / totals.totalCalls : 0;
  const avgErrorRate = totals.totalCalls > 0 ? (totals.errorCalls / totals.totalCalls) * 100 : 0;
  const avgCacheHitRate =
    totals.totalCalls > 0 ? (totals.cachedCalls / totals.totalCalls) * 100 : 0;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Proveedor</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Success</TableHead>
            <TableHead className="text-right">Errors</TableHead>
            <TableHead className="text-right">Cached</TableHead>
            <TableHead className="text-right">Error %</TableHead>
            <TableHead className="text-right">Cache %</TableHead>
            <TableHead className="text-right">Tokens</TableHead>
            <TableHead className="text-right">Avg ms</TableHead>
            <TableHead className="text-right">Cost USD</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.map((provider) => (
            <TableRow key={provider.provider}>
              <TableCell className="font-medium">{provider.provider}</TableCell>
              <TableCell className="text-right">{provider.totalCalls.toLocaleString()}</TableCell>
              <TableCell className="text-right">{provider.successCalls.toLocaleString()}</TableCell>
              <TableCell className="text-right">{provider.errorCalls.toLocaleString()}</TableCell>
              <TableCell className="text-right">{provider.cachedCalls.toLocaleString()}</TableCell>
              <TableCell className="text-right">{provider.errorRate.toFixed(2)}%</TableCell>
              <TableCell className="text-right">{provider.cacheHitRate.toFixed(2)}%</TableCell>
              <TableCell className="text-right">{provider.totalTokens.toLocaleString()}</TableCell>
              <TableCell className="text-right">{Math.round(provider.avgDuration)}</TableCell>
              <TableCell className="text-right">${provider.totalCost.toFixed(4)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="font-bold">TOTAL</TableCell>
            <TableCell className="text-right font-bold">
              {totals.totalCalls.toLocaleString()}
            </TableCell>
            <TableCell className="text-right font-bold">
              {totals.successCalls.toLocaleString()}
            </TableCell>
            <TableCell className="text-right font-bold">
              {totals.errorCalls.toLocaleString()}
            </TableCell>
            <TableCell className="text-right font-bold">
              {totals.cachedCalls.toLocaleString()}
            </TableCell>
            <TableCell className="text-right font-bold">{avgErrorRate.toFixed(2)}%</TableCell>
            <TableCell className="text-right font-bold">{avgCacheHitRate.toFixed(2)}%</TableCell>
            <TableCell className="text-right font-bold">
              {totals.totalTokens.toLocaleString()}
            </TableCell>
            <TableCell className="text-right font-bold">{Math.round(avgDuration)}</TableCell>
            <TableCell className="text-right font-bold">${totals.totalCost.toFixed(4)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
