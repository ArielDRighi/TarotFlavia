/**
 * Tests for CacheStatsCards component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CacheStatsCards } from './CacheStatsCards';
import type { CacheStats } from '@/types/admin-cache.types';

describe('CacheStatsCards', () => {
  const mockStats: CacheStats = {
    totalEntries: 150,
    hitRate: 85.5,
    missRate: 14.5,
    memoryUsageMB: 25.3,
  };

  it('should render all stat cards', () => {
    // Act
    render(<CacheStatsCards stats={mockStats} />);

    // Assert
    expect(screen.getByText('Total Entries')).toBeInTheDocument();
    expect(screen.getByText('Hit Rate')).toBeInTheDocument();
    expect(screen.getByText('Miss Rate')).toBeInTheDocument();
    expect(screen.getByText('Memory Usage')).toBeInTheDocument();
  });

  it('should display total entries value', () => {
    // Act
    render(<CacheStatsCards stats={mockStats} />);

    // Assert
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('should display hit rate with percentage', () => {
    // Act
    render(<CacheStatsCards stats={mockStats} />);

    // Assert
    expect(screen.getByText('85.5%')).toBeInTheDocument();
  });

  it('should display miss rate with percentage', () => {
    // Act
    render(<CacheStatsCards stats={mockStats} />);

    // Assert
    expect(screen.getByText('14.5%')).toBeInTheDocument();
  });

  it('should display memory usage in MB', () => {
    // Act
    render(<CacheStatsCards stats={mockStats} />);

    // Assert
    expect(screen.getByText('25.3 MB')).toBeInTheDocument();
  });

  it('should apply green color to hit rate when > 80%', () => {
    // Act
    const { container } = render(<CacheStatsCards stats={mockStats} />);

    // Assert
    const hitRateValue = container.querySelector('[data-testid="hit-rate-card"] .text-green-600');
    expect(hitRateValue).toBeInTheDocument();
  });

  it('should not apply green color to hit rate when <= 80%', () => {
    // Arrange
    const lowHitRateStats: CacheStats = {
      ...mockStats,
      hitRate: 75,
    };

    // Act
    const { container } = render(<CacheStatsCards stats={lowHitRateStats} />);

    // Assert
    const hitRateValue = container.querySelector('[data-testid="hit-rate-card"] .text-green-600');
    expect(hitRateValue).not.toBeInTheDocument();
  });

  it('should handle zero values', () => {
    // Arrange
    const zeroStats: CacheStats = {
      totalEntries: 0,
      hitRate: 0,
      missRate: 0,
      memoryUsageMB: 0,
    };

    // Act
    render(<CacheStatsCards stats={zeroStats} />);

    // Assert
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getAllByText(/0%/)[0]).toBeInTheDocument();
    expect(screen.getByText('0 MB')).toBeInTheDocument();
  });
});
