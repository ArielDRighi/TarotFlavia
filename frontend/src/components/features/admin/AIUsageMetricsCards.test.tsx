/**
 * Tests para AIUsageMetricsCards
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AIUsageMetricsCards } from './AIUsageMetricsCards';
import type { AIUsageStats } from '@/types/admin.types';

describe('AIUsageMetricsCards', () => {
  const mockStats: AIUsageStats = {
    statistics: [
      {
        provider: 'GROQ',
        totalCalls: 1000,
        successfulCalls: 950,
        failedCalls: 50,
        errorRate: 5.0,
        totalTokens: 100000,
        inputTokens: 60000,
        outputTokens: 40000,
        averageLatency: 250,
        totalCost: 0.1234,
      },
      {
        provider: 'OPENAI',
        totalCalls: 100,
        successfulCalls: 98,
        failedCalls: 2,
        errorRate: 2.0,
        totalTokens: 20000,
        inputTokens: 12000,
        outputTokens: 8000,
        averageLatency: 300,
        totalCost: 0.0456,
      },
    ],
    groqCallsToday: 100,
    groqRateLimitAlert: false,
    highErrorRateAlert: false,
    highFallbackRateAlert: false,
    highDailyCostAlert: false,
  };

  it('should render all four metric cards', () => {
    render(<AIUsageMetricsCards stats={mockStats} />);

    expect(screen.getByText('Total Requests')).toBeInTheDocument();
    expect(screen.getByText('Tokens Consumidos')).toBeInTheDocument();
    expect(screen.getByText('Costo Total')).toBeInTheDocument();
    expect(screen.getByText('Tasa de Éxito')).toBeInTheDocument();
  });

  it('should calculate and display total requests correctly', () => {
    render(<AIUsageMetricsCards stats={mockStats} />);

    // 1000 + 100 = 1100 (formatted with separators)
    // Should be in the first card (Total Requests)
    const totalRequestsCard = screen.getByText('Total Requests').closest('[data-slot="card"]');
    expect(totalRequestsCard).toHaveTextContent(/1[.,]100/);
  });

  it('should display Groq calls info', () => {
    render(<AIUsageMetricsCards stats={mockStats} />);

    expect(screen.getByText(/100.*14[.,]400/i)).toBeInTheDocument();
  });

  it('should calculate and display total tokens correctly', () => {
    render(<AIUsageMetricsCards stats={mockStats} />);

    // 100000 + 20000 = 120000 (formatted with separators)
    expect(screen.getByText(/120[.,]000/)).toBeInTheDocument();
  });

  it('should display input/output token breakdown', () => {
    render(<AIUsageMetricsCards stats={mockStats} />);

    // 60000 + 12000 = 72000 input
    // 40000 + 8000 = 48000 output
    expect(screen.getByText(/72[.,]000.*input/i)).toBeInTheDocument();
    expect(screen.getByText(/48[.,]000.*output/i)).toBeInTheDocument();
  });

  it('should calculate and display total cost correctly', () => {
    render(<AIUsageMetricsCards stats={mockStats} />);

    // 0.1234 + 0.0456 = 0.1690
    expect(screen.getByText('$0.1690')).toBeInTheDocument();
  });

  it('should calculate and display success rate correctly', () => {
    render(<AIUsageMetricsCards stats={mockStats} />);

    // (950 + 98) / (1000 + 100) = 1048 / 1100 = 95.27%
    expect(screen.getByText('95.27%')).toBeInTheDocument();
  });

  it('should show success rate in green when > 95%', () => {
    render(<AIUsageMetricsCards stats={mockStats} />);

    // Success rate is 95.27%, should be green
    const successCard = screen.getByText('95.27%').closest('.text-green-600');
    expect(successCard).toBeInTheDocument();
  });

  it('should show success rate in yellow when 90% < rate <= 95%', () => {
    const statsWithLowerSuccess: AIUsageStats = {
      ...mockStats,
      statistics: [
        {
          ...mockStats.statistics[0],
          successfulCalls: 920,
          failedCalls: 80,
          errorRate: 8.0,
        },
      ],
    };

    render(<AIUsageMetricsCards stats={statsWithLowerSuccess} />);

    // Success rate is 92%, should be yellow
    const successCard = screen.getByText('92.00%').closest('.text-yellow-600');
    expect(successCard).toBeInTheDocument();
  });

  it('should show success rate in red when < 90%', () => {
    const statsWithLowSuccess: AIUsageStats = {
      ...mockStats,
      statistics: [
        {
          ...mockStats.statistics[0],
          successfulCalls: 850,
          failedCalls: 150,
          errorRate: 15.0,
        },
      ],
    };

    render(<AIUsageMetricsCards stats={statsWithLowSuccess} />);

    // Success rate is 85%, should be red
    const successCard = screen.getByText('85.00%').closest('.text-red-600');
    expect(successCard).toBeInTheDocument();
  });

  it('should handle empty statistics', () => {
    const emptyStats: AIUsageStats = {
      statistics: [],
      groqCallsToday: 0,
      groqRateLimitAlert: false,
      highErrorRateAlert: false,
      highFallbackRateAlert: false,
      highDailyCostAlert: false,
    };

    render(<AIUsageMetricsCards stats={emptyStats} />);

    // Should show zeros
    expect(screen.getByText('$0.0000')).toBeInTheDocument();
    expect(screen.getByText('0.00%')).toBeInTheDocument();
  });
});
