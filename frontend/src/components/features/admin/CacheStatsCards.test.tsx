/**
 * Tests for CacheStatsCards component
 * Actualizado para usar props separadas (hitRate, savings, responseTime)
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CacheStatsCards } from './CacheStatsCards';
import type {
  HitRateMetrics,
  SavingsMetrics,
  ResponseTimeMetrics,
} from '@/types/admin-cache.types';

describe('CacheStatsCards', () => {
  const mockHitRate: HitRateMetrics = {
    percentage: 85.5,
    totalRequests: 1000,
    cacheHits: 855,
    cacheMisses: 145,
    windowHours: 24,
  };

  const mockSavings: SavingsMetrics = {
    openaiSavings: 1.5525,
    deepseekSavings: 0.276,
    groqRateLimitSaved: 855,
    groqRateLimitPercentage: 5.9,
  };

  const mockResponseTime: ResponseTimeMetrics = {
    cacheAvg: 50,
    aiAvg: 1500,
    improvementFactor: 30,
  };

  it('should render all 4 stat cards', () => {
    // Act
    render(
      <CacheStatsCards
        hitRate={mockHitRate}
        savings={mockSavings}
        responseTime={mockResponseTime}
      />
    );

    // Assert
    expect(screen.getByText('Total Requests')).toBeInTheDocument();
    expect(screen.getByText('Hit Rate')).toBeInTheDocument();
    expect(screen.getByText('Miss Rate')).toBeInTheDocument();
    expect(screen.getByText('Speed Improvement')).toBeInTheDocument();
  });

  it('should display total requests correctly', () => {
    // Act
    render(
      <CacheStatsCards
        hitRate={mockHitRate}
        savings={mockSavings}
        responseTime={mockResponseTime}
      />
    );

    // Assert
    expect(screen.getByText(/1[,.]000/)).toBeInTheDocument(); // Handles both 1,000 and 1.000
    expect(screen.getByText('Last 24h')).toBeInTheDocument();
  });

  it('should display hit rate percentage', () => {
    // Act
    render(
      <CacheStatsCards
        hitRate={mockHitRate}
        savings={mockSavings}
        responseTime={mockResponseTime}
      />
    );

    // Assert
    expect(screen.getByText('85.5%')).toBeInTheDocument();
    expect(screen.getByText('855 cache hits')).toBeInTheDocument();
  });

  it('should apply green color when hit rate > 80%', () => {
    // Act
    render(
      <CacheStatsCards
        hitRate={mockHitRate}
        savings={mockSavings}
        responseTime={mockResponseTime}
      />
    );

    // Assert
    const hitRateCard = screen.getByTestId('hit-rate-card');
    const hitRateValue = hitRateCard.querySelector('.text-green-600');
    expect(hitRateValue).toBeInTheDocument();
    expect(hitRateValue).toHaveTextContent('85.5%');
  });

  it('should NOT apply green color when hit rate <= 80%', () => {
    // Arrange
    const lowHitRate: HitRateMetrics = {
      ...mockHitRate,
      percentage: 75.0,
      cacheHits: 750,
      cacheMisses: 250,
    };

    // Act
    render(
      <CacheStatsCards hitRate={lowHitRate} savings={mockSavings} responseTime={mockResponseTime} />
    );

    // Assert
    const hitRateCard = screen.getByTestId('hit-rate-card');
    const hitRateValue = hitRateCard.querySelector('.text-green-600');
    expect(hitRateValue).not.toBeInTheDocument();
  });

  it('should calculate and display miss rate correctly', () => {
    // Act
    render(
      <CacheStatsCards
        hitRate={mockHitRate}
        savings={mockSavings}
        responseTime={mockResponseTime}
      />
    );

    // Assert
    const missRate = 100 - 85.5;
    expect(screen.getByText(`${missRate.toFixed(1)}%`)).toBeInTheDocument();
    expect(screen.getByText('145 AI generations')).toBeInTheDocument();
  });

  it('should display speed improvement factor', () => {
    // Act
    render(
      <CacheStatsCards
        hitRate={mockHitRate}
        savings={mockSavings}
        responseTime={mockResponseTime}
      />
    );

    // Assert
    expect(screen.getByText('30x')).toBeInTheDocument();
    expect(screen.getByText('Cache: 50ms vs AI: 1500ms')).toBeInTheDocument();
  });

  it('should handle zero values gracefully', () => {
    // Arrange
    const zeroHitRate: HitRateMetrics = {
      percentage: 0,
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      windowHours: 24,
    };

    const zeroResponseTime: ResponseTimeMetrics = {
      cacheAvg: 0,
      aiAvg: 0,
      improvementFactor: 0,
    };

    // Act
    render(
      <CacheStatsCards
        hitRate={zeroHitRate}
        savings={mockSavings}
        responseTime={zeroResponseTime}
      />
    );

    // Assert
    expect(screen.getByText('0')).toBeInTheDocument(); // Total requests
    expect(screen.getByText('0.0%')).toBeInTheDocument(); // Hit rate
    expect(screen.getByText('0x')).toBeInTheDocument(); // Speed improvement
  });
});
