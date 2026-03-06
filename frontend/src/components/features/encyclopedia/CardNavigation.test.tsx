import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { CardNavigation } from './CardNavigation';
import { ArcanaType } from '@/types/encyclopedia.types';
import type { CardSummary } from '@/types/encyclopedia.types';

// Mock the useCardNavigation hook
vi.mock('@/hooks/api/useEncyclopedia', () => ({
  useCardNavigation: vi.fn(),
}));

import { useCardNavigation } from '@/hooks/api/useEncyclopedia';

const mockUseCardNavigation = vi.mocked(useCardNavigation);

function createNavCard(slug: string, nameEs: string): CardSummary {
  return {
    id: 1,
    slug,
    nameEs,
    arcanaType: ArcanaType.MAJOR,
    number: 1,
    suit: null,
    thumbnailUrl: `/images/${slug}.jpg`,
  };
}

describe('CardNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading state', () => {
    it('should render nothing while loading', () => {
      mockUseCardNavigation.mockReturnValue({
        data: undefined,
        isLoading: true,
      } as ReturnType<typeof useCardNavigation>);

      const { container } = render(<CardNavigation slug="the-fool" />);

      expect(container.firstChild).toBeNull();
    });

    it('should render nothing when no data', () => {
      mockUseCardNavigation.mockReturnValue({
        data: undefined,
        isLoading: false,
      } as ReturnType<typeof useCardNavigation>);

      const { container } = render(<CardNavigation slug="the-fool" />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Navigation with both cards', () => {
    it('should render component with data-testid', () => {
      mockUseCardNavigation.mockReturnValue({
        data: {
          previous: createNavCard('the-fool', 'El Loco'),
          next: createNavCard('the-high-priestess', 'La Sacerdotisa'),
        },
        isLoading: false,
      } as ReturnType<typeof useCardNavigation>);

      render(<CardNavigation slug="the-magician" />);

      expect(screen.getByTestId('card-navigation')).toBeInTheDocument();
    });

    it('should render previous card link', () => {
      mockUseCardNavigation.mockReturnValue({
        data: {
          previous: createNavCard('the-fool', 'El Loco'),
          next: createNavCard('the-high-priestess', 'La Sacerdotisa'),
        },
        isLoading: false,
      } as ReturnType<typeof useCardNavigation>);

      render(<CardNavigation slug="the-magician" />);

      const prevLink = screen.getByTestId('card-navigation-prev');
      expect(prevLink).toBeInTheDocument();
      expect(prevLink).toHaveAttribute('href', '/enciclopedia/the-fool');
    });

    it('should render next card link', () => {
      mockUseCardNavigation.mockReturnValue({
        data: {
          previous: createNavCard('the-fool', 'El Loco'),
          next: createNavCard('the-high-priestess', 'La Sacerdotisa'),
        },
        isLoading: false,
      } as ReturnType<typeof useCardNavigation>);

      render(<CardNavigation slug="the-magician" />);

      const nextLink = screen.getByTestId('card-navigation-next');
      expect(nextLink).toBeInTheDocument();
      expect(nextLink).toHaveAttribute('href', '/enciclopedia/the-high-priestess');
    });

    it('should display previous card name', () => {
      mockUseCardNavigation.mockReturnValue({
        data: {
          previous: createNavCard('the-fool', 'El Loco'),
          next: createNavCard('the-high-priestess', 'La Sacerdotisa'),
        },
        isLoading: false,
      } as ReturnType<typeof useCardNavigation>);

      render(<CardNavigation slug="the-magician" />);

      expect(screen.getByText('El Loco')).toBeInTheDocument();
    });

    it('should display next card name', () => {
      mockUseCardNavigation.mockReturnValue({
        data: {
          previous: createNavCard('the-fool', 'El Loco'),
          next: createNavCard('the-high-priestess', 'La Sacerdotisa'),
        },
        isLoading: false,
      } as ReturnType<typeof useCardNavigation>);

      render(<CardNavigation slug="the-magician" />);

      expect(screen.getByText('La Sacerdotisa')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should not render previous link when previous is null', () => {
      mockUseCardNavigation.mockReturnValue({
        data: {
          previous: null,
          next: createNavCard('the-magician', 'El Mago'),
        },
        isLoading: false,
      } as ReturnType<typeof useCardNavigation>);

      render(<CardNavigation slug="the-fool" />);

      expect(screen.queryByTestId('card-navigation-prev')).not.toBeInTheDocument();
    });

    it('should not render next link when next is null', () => {
      mockUseCardNavigation.mockReturnValue({
        data: {
          previous: createNavCard('the-world', 'El Mundo'),
          next: null,
        },
        isLoading: false,
      } as ReturnType<typeof useCardNavigation>);

      render(<CardNavigation slug="the-fool" />);

      expect(screen.queryByTestId('card-navigation-next')).not.toBeInTheDocument();
    });
  });
});
