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
      successfulCalls: acc.successfulCalls + provider.successfulCalls,
      failedCalls: acc.failedCalls + provider.failedCalls,
      totalTokens: acc.totalTokens + provider.totalTokens,
      totalCost: acc.totalCost + provider.totalCost,
      totalLatency: acc.totalLatency + provider.averageLatency * provider.totalCalls,
    }),
    {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      totalTokens: 0,
      totalCost: 0,
      totalLatency: 0,
    }
  );

  const averageLatency = totals.totalCalls > 0 ? totals.totalLatency / totals.totalCalls : 0;
  const averageErrorRate =
    totals.totalCalls > 0 ? (totals.failedCalls / totals.totalCalls) * 100 : 0;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Proveedor</TableHead>
            <TableHead className="text-right">Total Calls</TableHead>
            <TableHead className="text-right">Successful</TableHead>
            <TableHead className="text-right">Failed</TableHead>
            <TableHead className="text-right">Error Rate %</TableHead>
            <TableHead className="text-right">Total Tokens</TableHead>
            <TableHead className="text-right">Avg Latency (ms)</TableHead>
            <TableHead className="text-right">Total Cost (USD)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.map((provider) => (
            <TableRow key={provider.provider}>
              <TableCell className="font-medium">{provider.provider}</TableCell>
              <TableCell className="text-right">{provider.totalCalls.toLocaleString()}</TableCell>
              <TableCell className="text-right">
                {provider.successfulCalls.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">{provider.failedCalls.toLocaleString()}</TableCell>
              <TableCell className="text-right">{provider.errorRate.toFixed(2)}%</TableCell>
              <TableCell className="text-right">{provider.totalTokens.toLocaleString()}</TableCell>
              <TableCell className="text-right">{Math.round(provider.averageLatency)}</TableCell>
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
              {totals.successfulCalls.toLocaleString()}
            </TableCell>
            <TableCell className="text-right font-bold">
              {totals.failedCalls.toLocaleString()}
            </TableCell>
            <TableCell className="text-right font-bold">{averageErrorRate.toFixed(2)}%</TableCell>
            <TableCell className="text-right font-bold">
              {totals.totalTokens.toLocaleString()}
            </TableCell>
            <TableCell className="text-right font-bold">{Math.round(averageLatency)}</TableCell>
            <TableCell className="text-right font-bold">${totals.totalCost.toFixed(4)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
