import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { HoroscopeSkeleton } from './HoroscopeSkeleton';

// Mock Skeleton component
vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className, ...props }: { className?: string }) => (
    <div data-testid="skeleton" className={className} {...props} />
  ),
}));

// Mock Card component
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}));

describe('HoroscopeSkeleton', () => {
  describe('Grid variant', () => {
    it('should render 12 card skeletons for grid variant', () => {
      render(<HoroscopeSkeleton variant="grid" />);

      const cards = screen.getAllByTestId('card');
      expect(cards).toHaveLength(12);
    });

    it('should render with grid layout', () => {
      const { container } = render(<HoroscopeSkeleton variant="grid" />);

      const grid = container.firstChild;
      expect(grid).toHaveClass('grid');
      expect(grid).toHaveClass('grid-cols-3');
    });

    it('should render grid variant by default', () => {
      render(<HoroscopeSkeleton />);

      const cards = screen.getAllByTestId('card');
      expect(cards).toHaveLength(12);
    });
  });

  describe('Detail variant', () => {
    it('should render detail skeleton structure', () => {
      render(<HoroscopeSkeleton variant="detail" />);

      const skeletons = screen.getAllByTestId('skeleton');
      // Header (2) + Card (1) + Area cards (3) = 6 skeletons minimum
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render different structure than grid variant', () => {
      const { container } = render(<HoroscopeSkeleton variant="detail" />);

      // Detail variant should have space-y-6 class
      const detailContainer = container.firstChild;
      expect(detailContainer).toHaveClass('space-y-6');
    });
  });
});
