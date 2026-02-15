/**
 * Tests for Saved Chart Loading Page
 *
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import SavedChartLoading from './loading';

describe('SavedChartLoading', () => {
  it('should render header skeleton', () => {
    render(<SavedChartLoading />);

    expect(screen.getByTestId('skeleton-breadcrumb')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-badge')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-pdf-button')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-menu-button')).toBeInTheDocument();
  });

  it('should render title skeleton', () => {
    render(<SavedChartLoading />);

    expect(screen.getByTestId('skeleton-title')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-date')).toBeInTheDocument();
  });

  it('should render chart wheel card skeleton', () => {
    render(<SavedChartLoading />);

    expect(screen.getByTestId('skeleton-chart-card')).toBeInTheDocument();
  });

  it('should render Big Three card skeleton', () => {
    render(<SavedChartLoading />);

    expect(screen.getByTestId('skeleton-bigthree-card')).toBeInTheDocument();
  });

  it('should render tabs skeleton', () => {
    render(<SavedChartLoading />);

    expect(screen.getByTestId('skeleton-tabs')).toBeInTheDocument();
  });

  it('should have proper layout structure', () => {
    render(<SavedChartLoading />);

    // Check for header
    const header = document.querySelector('header');
    expect(header).toBeInTheDocument();

    // Check for main content
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();

    // Check for grid layout
    const grid = document.querySelector('.grid');
    expect(grid).toBeInTheDocument();
  });
});
