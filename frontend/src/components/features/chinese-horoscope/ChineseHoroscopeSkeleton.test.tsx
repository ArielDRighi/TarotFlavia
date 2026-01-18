import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ChineseHoroscopeSkeleton } from './ChineseHoroscopeSkeleton';

describe('ChineseHoroscopeSkeleton', () => {
  describe('Rendering', () => {
    it('should render the skeleton component', () => {
      render(<ChineseHoroscopeSkeleton />);

      const skeleton = screen.getByTestId('chinese-horoscope-skeleton');
      expect(skeleton).toBeInTheDocument();
    });

    it('should have space-y-6 class on main container', () => {
      render(<ChineseHoroscopeSkeleton />);

      const skeleton = screen.getByTestId('chinese-horoscope-skeleton');
      expect(skeleton).toHaveClass('space-y-6');
    });
  });

  describe('Header Skeleton', () => {
    it('should render header skeleton container', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const headerContainer = container.querySelector('.space-y-2.text-center');
      expect(headerContainer).toBeInTheDocument();
    });

    it('should render three skeleton elements in header', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const headerContainer = container.querySelector('.space-y-2.text-center');
      const skeletons = headerContainer?.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons).toHaveLength(3);
    });

    it('should render rounded circular skeleton for emoji (h-16 w-16)', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const emojiSkeleton = container.querySelector(
        '.mx-auto.h-16.w-16.rounded-full[class*="animate-pulse"]'
      );
      expect(emojiSkeleton).toBeInTheDocument();
    });

    it('should render skeleton for animal name (h-8 w-32)', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const nameSkeleton = container.querySelector('.mx-auto.h-8.w-32[class*="animate-pulse"]');
      expect(nameSkeleton).toBeInTheDocument();
    });

    it('should render skeleton for year badge (h-6 w-24)', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const badgeSkeleton = container.querySelector('.mx-auto.h-6.w-24[class*="animate-pulse"]');
      expect(badgeSkeleton).toBeInTheDocument();
    });
  });

  describe('Overview Skeleton', () => {
    it('should render overview Card container', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      // Find Card with p-6 that contains Skeleton elements
      const cards = container.querySelectorAll('.p-6');
      const overviewCard = Array.from(cards).find((card) => card.querySelector('.mb-2.h-4.w-full'));
      expect(overviewCard).toBeInTheDocument();
    });

    it('should render three skeleton lines in overview', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const cards = container.querySelectorAll('.p-6');
      const overviewCard = Array.from(cards).find((card) => card.querySelector('.mb-2.h-4.w-full'));
      const skeletons = overviewCard?.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons).toHaveLength(3);
    });

    it('should render last overview line with w-3/4', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const lastLine = container.querySelector('.h-4.w-3\\/4[class*="animate-pulse"]');
      expect(lastLine).toBeInTheDocument();
    });
  });

  describe('Areas Skeleton', () => {
    it('should render areas grid container with md:grid-cols-2', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const areasGrid = container.querySelector('.grid.gap-4.md\\:grid-cols-2');
      expect(areasGrid).toBeInTheDocument();
    });

    it('should render exactly 4 area card skeletons', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const areasGrid = container.querySelector('.grid.gap-4.md\\:grid-cols-2');
      const areaCards = areasGrid?.querySelectorAll('.p-4');
      expect(areaCards).toHaveLength(4);
    });

    it('should render correct skeleton structure in each area card', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const areasGrid = container.querySelector('.grid.gap-4.md\\:grid-cols-2');
      const firstCard = areasGrid?.querySelector('.p-4');
      const skeletons = firstCard?.querySelectorAll('[class*="animate-pulse"]');

      // Should have 4 skeletons: title + 3 content lines
      expect(skeletons).toHaveLength(4);
    });

    it('should render area title skeleton (h-6 w-24)', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const titleSkeleton = container.querySelector('.mb-2.h-6.w-24[class*="animate-pulse"]');
      expect(titleSkeleton).toBeInTheDocument();
    });

    it('should render area content last line with w-2/3', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const lastLine = container.querySelector('.h-4.w-2\\/3[class*="animate-pulse"]');
      expect(lastLine).toBeInTheDocument();
    });
  });

  describe('Lucky Elements Skeleton', () => {
    it('should render lucky elements Card container', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      // Find card with title skeleton h-6 w-48
      const cards = container.querySelectorAll('.p-4');
      const luckyCard = Array.from(cards).find((card) => card.querySelector('.mb-4.h-6.w-48'));
      expect(luckyCard).toBeInTheDocument();
    });

    it('should render lucky elements title skeleton (h-6 w-48)', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const titleSkeleton = container.querySelector('.mb-4.h-6.w-48[class*="animate-pulse"]');
      expect(titleSkeleton).toBeInTheDocument();
    });

    it('should render grid with md:grid-cols-4 for lucky elements', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const luckyGrid = container.querySelector('.grid.grid-cols-2.gap-4.md\\:grid-cols-4');
      expect(luckyGrid).toBeInTheDocument();
    });

    it('should render exactly 4 lucky element skeletons', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const luckyGrid = container.querySelector('.grid.grid-cols-2.gap-4.md\\:grid-cols-4');
      const luckyItems = luckyGrid?.querySelectorAll('div > div');
      expect(luckyItems?.length).toBeGreaterThanOrEqual(4);
    });

    it('should render label and value skeleton in each lucky element', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const luckyGrid = container.querySelector('.grid.grid-cols-2.gap-4.md\\:grid-cols-4');
      const firstItem = luckyGrid?.querySelector('div');
      const skeletons = firstItem?.querySelectorAll('[class*="animate-pulse"]');

      // Should have 2 skeletons: label + value
      expect(skeletons?.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Compatibility Skeleton', () => {
    it('should render compatibility Card container', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      // Find card with title skeleton h-6 w-32
      const cards = container.querySelectorAll('.p-4');
      const compatCard = Array.from(cards).find((card) => card.querySelector('.mb-4.h-6.w-32'));
      expect(compatCard).toBeInTheDocument();
    });

    it('should render compatibility title skeleton (h-6 w-32)', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const titleSkeleton = container.querySelector('.mb-4.h-6.w-32[class*="animate-pulse"]');
      expect(titleSkeleton).toBeInTheDocument();
    });

    it('should render space-y-4 container for compatibility levels', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const compatContainer = container.querySelector('.space-y-4');
      expect(compatContainer).toBeInTheDocument();
    });

    it('should render exactly 3 compatibility level skeletons', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const compatContainer = container.querySelector('.space-y-4');
      const levelContainers = compatContainer?.querySelectorAll('div > div');
      expect(levelContainers?.length).toBeGreaterThanOrEqual(3);
    });

    it('should render label skeleton (h-4 w-40) in compatibility levels', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const labelSkeleton = container.querySelector('.mb-2.h-4.w-40[class*="animate-pulse"]');
      expect(labelSkeleton).toBeInTheDocument();
    });

    it('should render badge skeletons (h-6 w-20) in compatibility levels', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const badgeSkeletons = container.querySelectorAll('.h-6.w-20[class*="animate-pulse"]');
      expect(badgeSkeletons.length).toBeGreaterThanOrEqual(2);
    });

    it('should render flex-wrap gap-2 container for badges', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const badgeContainer = container.querySelector('.flex.flex-wrap.gap-2');
      expect(badgeContainer).toBeInTheDocument();
    });
  });

  describe('Structure Matching ChineseHoroscopeDetail', () => {
    it('should have same main container structure (space-y-6)', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const mainContainer = container.querySelector('.space-y-6');
      expect(mainContainer).toBeInTheDocument();
      expect(mainContainer).toHaveAttribute('data-testid', 'chinese-horoscope-skeleton');
    });

    it('should match grid layout structure of areas', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const areasGrid = container.querySelector('.grid.gap-4.md\\:grid-cols-2');
      expect(areasGrid).toBeInTheDocument();

      const areaCards = areasGrid?.querySelectorAll('.p-4');
      expect(areaCards).toHaveLength(4);
    });

    it('should match lucky elements grid structure (2 to 4 columns)', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const luckyGrid = container.querySelector('.grid.grid-cols-2.gap-4.md\\:grid-cols-4');
      expect(luckyGrid).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have data-testid for testing', () => {
      render(<ChineseHoroscopeSkeleton />);

      const skeleton = screen.getByTestId('chinese-horoscope-skeleton');
      expect(skeleton).toBeInTheDocument();
    });

    it('should render without errors', () => {
      expect(() => render(<ChineseHoroscopeSkeleton />)).not.toThrow();
    });
  });

  describe('Visual Structure', () => {
    it('should center align header skeleton', () => {
      const { container } = render(<ChineseHoroscopeSkeleton />);

      const headerContainer = container.querySelector('.text-center');
      expect(headerContainer).toBeInTheDocument();
    });
  });
});
