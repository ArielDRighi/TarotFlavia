import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { EncyclopediaSkeleton } from './EncyclopediaSkeleton';

describe('EncyclopediaSkeleton', () => {
  describe('Grid variant', () => {
    it('should render grid skeleton by default', () => {
      render(<EncyclopediaSkeleton />);

      const skeleton = screen.getByTestId('encyclopedia-skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveAttribute('data-variant', 'grid');
    });

    it('should render grid skeleton when variant is "grid"', () => {
      render(<EncyclopediaSkeleton variant="grid" />);

      const skeleton = screen.getByTestId('encyclopedia-skeleton');
      expect(skeleton).toHaveAttribute('data-variant', 'grid');
    });

    it('should render default 12 skeleton cards', () => {
      render(<EncyclopediaSkeleton variant="grid" />);

      const skeletonCards = screen.getAllByTestId('skeleton-card');
      expect(skeletonCards).toHaveLength(12);
    });

    it('should render custom count of skeleton cards', () => {
      render(<EncyclopediaSkeleton variant="grid" count={6} />);

      const skeletonCards = screen.getAllByTestId('skeleton-card');
      expect(skeletonCards).toHaveLength(6);
    });

    it('should apply responsive grid classes', () => {
      const { container } = render(<EncyclopediaSkeleton variant="grid" />);

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('Detail variant', () => {
    it('should render detail skeleton when variant is "detail"', () => {
      render(<EncyclopediaSkeleton variant="detail" />);

      const skeleton = screen.getByTestId('encyclopedia-skeleton');
      expect(skeleton).toHaveAttribute('data-variant', 'detail');
    });

    it('should not render skeleton cards in detail variant', () => {
      render(<EncyclopediaSkeleton variant="detail" />);

      const skeletonCards = screen.queryAllByTestId('skeleton-card');
      expect(skeletonCards).toHaveLength(0);
    });

    it('should render detail skeleton content', () => {
      render(<EncyclopediaSkeleton variant="detail" />);

      const skeleton = screen.getByTestId('encyclopedia-skeleton');
      expect(skeleton).toBeInTheDocument();
    });
  });
});
