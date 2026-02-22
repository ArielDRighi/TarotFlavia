/**
 * Tests for Saved Chart Loading Page
 *
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import SavedChartLoading from './loading';

describe('SavedChartLoading', () => {
  it('should render navigation skeleton inside main content (not a separate sticky header)', () => {
    render(<SavedChartLoading />);

    expect(screen.getByTestId('skeleton-nav')).toBeInTheDocument();
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

  it('should have proper layout structure without sticky header', () => {
    render(<SavedChartLoading />);

    // No debe haber un <header> sticky — la navegación está dentro del <main>
    const stickyHeader = document.querySelector('header.sticky');
    expect(stickyHeader).not.toBeInTheDocument();

    // El área de navegación vive dentro del <main>
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
    const navInMain = main?.querySelector('[data-testid="skeleton-nav"]');
    expect(navInMain).toBeInTheDocument();

    // Check for grid layout
    const grid = document.querySelector('.grid');
    expect(grid).toBeInTheDocument();
  });
});
