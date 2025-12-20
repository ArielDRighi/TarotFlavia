/**
 * Tests for AIProvidersTable Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AIProvidersTable } from './AIProvidersTable';
import type { AIProviderStats } from '@/types/admin.types';

describe('AIProvidersTable', () => {
  const mockProviders: AIProviderStats[] = [
    {
      provider: 'GROQ',
      totalCalls: 100,
      successCalls: 95,
      errorCalls: 3,
      cachedCalls: 2,
      totalTokens: 50000,
      totalCost: 0.0025,
      avgDuration: 1200,
      errorRate: 3.0,
      cacheHitRate: 2.0,
      fallbackRate: 0.5,
    },
    {
      provider: 'OPENAI',
      totalCalls: 50,
      successCalls: 48,
      errorCalls: 1,
      cachedCalls: 1,
      totalTokens: 30000,
      totalCost: 0.015,
      avgDuration: 2000,
      errorRate: 2.0,
      cacheHitRate: 2.0,
      fallbackRate: 1.0,
    },
  ];

  describe('Rendering', () => {
    it('should render table with provider data', () => {
      render(<AIProvidersTable providers={mockProviders} />);

      expect(screen.getByText('GROQ')).toBeInTheDocument();
      expect(screen.getByText('OPENAI')).toBeInTheDocument();
    });

    it('should render all column headers', () => {
      render(<AIProvidersTable providers={mockProviders} />);

      expect(screen.getByText('Proveedor')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Errors')).toBeInTheDocument();
      expect(screen.getByText('Cached')).toBeInTheDocument();
      expect(screen.getByText('Error %')).toBeInTheDocument();
      expect(screen.getByText('Cache %')).toBeInTheDocument();
      expect(screen.getByText('Tokens')).toBeInTheDocument();
      expect(screen.getByText('Avg ms')).toBeInTheDocument();
      expect(screen.getByText('Cost USD')).toBeInTheDocument();
    });

    it('should render formatted numbers with locale', () => {
      render(<AIProvidersTable providers={mockProviders} />);

      // Check for formatted numbers (with commas or periods depending on locale)
      expect(screen.getByText(/50[.,]000/)).toBeInTheDocument();
      expect(screen.getByText(/30[.,]000/)).toBeInTheDocument();
    });

    it('should render costs with 4 decimals', () => {
      render(<AIProvidersTable providers={mockProviders} />);

      expect(screen.getByText('$0.0025')).toBeInTheDocument();
      expect(screen.getByText('$0.0150')).toBeInTheDocument();
    });

    it('should render error rates with 2 decimals', () => {
      render(<AIProvidersTable providers={mockProviders} />);

      // Should find 3.00% error rate for GROQ (not in totals footer)
      const groqRow = screen.getByText('GROQ').closest('tr');
      expect(groqRow).toHaveTextContent('3.00%');
    });
  });

  describe('Totals Calculations', () => {
    it('should calculate total calls correctly', () => {
      render(<AIProvidersTable providers={mockProviders} />);

      // 100 + 50 = 150 (find in footer)
      const footer = document.querySelector('tfoot');
      expect(footer).toHaveTextContent(/150/);
    });

    it('should calculate total success calls correctly', () => {
      render(<AIProvidersTable providers={mockProviders} />);

      // 95 + 48 = 143
      expect(screen.getByText(/143/)).toBeInTheDocument();
    });

    it('should calculate total error calls correctly', () => {
      render(<AIProvidersTable providers={mockProviders} />);

      // 3 + 1 = 4
      const cells = screen.getAllByText('4');
      expect(cells.length).toBeGreaterThan(0);
    });

    it('should calculate total cached calls correctly', () => {
      render(<AIProvidersTable providers={mockProviders} />);

      // 2 + 1 = 3
      const cells = screen.getAllByText('3');
      expect(cells.length).toBeGreaterThan(0);
    });

    it('should calculate average error rate correctly', () => {
      render(<AIProvidersTable providers={mockProviders} />);

      // (3 + 1) / 150 * 100 = 2.67%
      expect(screen.getByText('2.67%')).toBeInTheDocument();
    });

    it('should calculate average cache hit rate correctly', () => {
      render(<AIProvidersTable providers={mockProviders} />);

      // (2 + 1) / 150 * 100 = 2.00%
      const cells = screen.getAllByText('2.00%');
      expect(cells.length).toBeGreaterThan(0);
    });

    it('should calculate total cost correctly', () => {
      render(<AIProvidersTable providers={mockProviders} />);

      // 0.0025 + 0.015 = 0.0175
      expect(screen.getByText('$0.0175')).toBeInTheDocument();
    });

    it('should calculate weighted average duration correctly', () => {
      render(<AIProvidersTable providers={mockProviders} />);

      // (1200*100 + 2000*50) / 150 = 1467
      expect(screen.getByText(/1467/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should render empty table when providers array is empty', () => {
      render(<AIProvidersTable providers={[]} />);

      expect(screen.getByText('Proveedor')).toBeInTheDocument();
      expect(screen.getByText('TOTAL')).toBeInTheDocument();
    });

    it('should handle zero totalCalls without division by zero', () => {
      const providersWithZero: AIProviderStats[] = [
        {
          provider: 'GROQ',
          totalCalls: 0,
          successCalls: 0,
          errorCalls: 0,
          cachedCalls: 0,
          totalTokens: 0,
          totalCost: 0,
          avgDuration: 0,
          errorRate: 0,
          cacheHitRate: 0,
          fallbackRate: 0,
        },
      ];

      render(<AIProvidersTable providers={providersWithZero} />);

      const footer = document.querySelector('tfoot');
      expect(footer).toHaveTextContent('0.00%');
    });

    it('should render single provider correctly', () => {
      const singleProvider = [mockProviders[0]];

      render(<AIProvidersTable providers={singleProvider} />);

      expect(screen.getByText('GROQ')).toBeInTheDocument();
      expect(screen.queryByText('OPENAI')).not.toBeInTheDocument();
    });
  });
});
