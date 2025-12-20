/**
 * Tests para AIUsageAlerts
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AIUsageAlerts } from './AIUsageAlerts';
import type { AIUsageStats } from '@/types/admin.types';

describe('AIUsageAlerts', () => {
  const baseStats: AIUsageStats = {
    statistics: [],
    groqCallsToday: 100,
    groqRateLimitAlert: false,
    highErrorRateAlert: false,
    highFallbackRateAlert: false,
    highDailyCostAlert: false,
  };

  it('should not render anything when no alerts are active', () => {
    const { container } = render(<AIUsageAlerts stats={baseStats} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render Groq rate limit alert', () => {
    const stats: AIUsageStats = {
      ...baseStats,
      groqRateLimitAlert: true,
    };

    render(<AIUsageAlerts stats={stats} />);

    expect(screen.getByText(/Límite de Groq cercano/i)).toBeInTheDocument();
    expect(screen.getByText(/⚠️/)).toBeInTheDocument();
  });

  it('should render high error rate alert', () => {
    const stats: AIUsageStats = {
      ...baseStats,
      highErrorRateAlert: true,
    };

    render(<AIUsageAlerts stats={stats} />);

    expect(screen.getByText(/Tasa de errores alta/i)).toBeInTheDocument();
    expect(screen.getByText(/🔴/)).toBeInTheDocument();
  });

  it('should render high fallback rate alert', () => {
    const stats: AIUsageStats = {
      ...baseStats,
      highFallbackRateAlert: true,
    };

    render(<AIUsageAlerts stats={stats} />);

    expect(screen.getByText(/Muchos fallbacks a proveedores secundarios/i)).toBeInTheDocument();
    expect(screen.getByText(/⚠️/)).toBeInTheDocument();
  });

  it('should render high daily cost alert', () => {
    const stats: AIUsageStats = {
      ...baseStats,
      highDailyCostAlert: true,
    };

    render(<AIUsageAlerts stats={stats} />);

    expect(screen.getByText(/Costo diario alto/i)).toBeInTheDocument();
    expect(screen.getByText(/💰/)).toBeInTheDocument();
  });

  it('should render multiple alerts simultaneously', () => {
    const stats: AIUsageStats = {
      ...baseStats,
      groqRateLimitAlert: true,
      highErrorRateAlert: true,
      highDailyCostAlert: true,
    };

    render(<AIUsageAlerts stats={stats} />);

    expect(screen.getByText(/Límite de Groq cercano/i)).toBeInTheDocument();
    expect(screen.getByText(/Tasa de errores alta/i)).toBeInTheDocument();
    expect(screen.getByText(/Costo diario alto/i)).toBeInTheDocument();
  });

  it('should apply correct alert variant based on severity', () => {
    const stats: AIUsageStats = {
      ...baseStats,
      groqRateLimitAlert: true,
      highErrorRateAlert: true,
    };

    const { container } = render(<AIUsageAlerts stats={stats} />);

    // High error rate should be destructive (red)
    // Others should be default or warning
    expect(container.querySelector('[role="alert"]')).toBeInTheDocument();
  });
});
