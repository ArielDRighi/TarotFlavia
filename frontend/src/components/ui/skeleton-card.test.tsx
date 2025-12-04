import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SkeletonCard } from './skeleton-card';

describe('SkeletonCard', () => {
  describe('variant: tarotist', () => {
    it('should render a circular skeleton for the photo', () => {
      render(<SkeletonCard variant="tarotist" />);

      const circularSkeleton = screen.getByTestId('skeleton-tarotist-photo');
      expect(circularSkeleton).toBeInTheDocument();
      expect(circularSkeleton).toHaveClass('rounded-full');
    });

    it('should render three text line skeletons', () => {
      render(<SkeletonCard variant="tarotist" />);

      const textLines = screen.getAllByTestId(/skeleton-tarotist-line/);
      expect(textLines).toHaveLength(3);
    });

    it('should have correct structure: circle on top + 3 lines below', () => {
      const { container } = render(<SkeletonCard variant="tarotist" />);

      const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThanOrEqual(4); // 1 circle + 3 lines
    });
  });

  describe('variant: reading', () => {
    it('should render a rectangular skeleton for the card', () => {
      render(<SkeletonCard variant="reading" />);

      const rectangleSkeleton = screen.getByTestId('skeleton-reading-card');
      expect(rectangleSkeleton).toBeInTheDocument();
    });

    it('should render two text line skeletons', () => {
      render(<SkeletonCard variant="reading" />);

      const textLines = screen.getAllByTestId(/skeleton-reading-line/);
      expect(textLines).toHaveLength(2);
    });
  });

  describe('variant: session', () => {
    it('should render a line skeleton at the top', () => {
      render(<SkeletonCard variant="session" />);

      const topLine = screen.getByTestId('skeleton-session-top-line');
      expect(topLine).toBeInTheDocument();
    });

    it('should render a rectangular skeleton in the middle', () => {
      render(<SkeletonCard variant="session" />);

      const rectangle = screen.getByTestId('skeleton-session-rectangle');
      expect(rectangle).toBeInTheDocument();
    });

    it('should render a line skeleton at the bottom', () => {
      render(<SkeletonCard variant="session" />);

      const bottomLine = screen.getByTestId('skeleton-session-bottom-line');
      expect(bottomLine).toBeInTheDocument();
    });
  });

  describe('common props', () => {
    it('should accept custom className', () => {
      const { container } = render(<SkeletonCard variant="tarotist" className="custom-class" />);

      const card = container.firstChild;
      expect(card).toHaveClass('custom-class');
    });

    it('should spread additional props to the container', () => {
      render(<SkeletonCard variant="tarotist" data-testid="custom-skeleton" />);

      expect(screen.getByTestId('custom-skeleton')).toBeInTheDocument();
    });
  });
});
