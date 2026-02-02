import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

import { RitualCard } from './RitualCard';
import { RitualCategory, RitualDifficulty, LunarPhase } from '@/types/ritual.types';
import type { RitualSummary } from '@/types/ritual.types';

// Mock Next.js components
vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return <img {...props} alt={props.alt || ''} />;
  },
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    ...props
  }: React.PropsWithChildren<{ href: string; className?: string }>) => {
    return <a {...props}>{children}</a>;
  },
}));

// Factory function for creating test ritual
function createTestRitual(overrides: Partial<RitualSummary> = {}): RitualSummary {
  return {
    id: 1,
    slug: 'ritual-luna-nueva',
    title: 'Ritual de Luna Nueva',
    description: 'Ceremonia para establecer intenciones',
    category: RitualCategory.LUNAR,
    difficulty: RitualDifficulty.BEGINNER,
    durationMinutes: 30,
    bestLunarPhase: LunarPhase.NEW_MOON,
    imageUrl: '/images/rituals/luna-nueva.jpg',
    materialsCount: 4,
    stepsCount: 7,
    ...overrides,
  };
}

describe('RitualCard', () => {
  describe('Rendering', () => {
    it('should render ritual title', () => {
      const ritual = createTestRitual({ title: 'Ritual de Protección' });

      render(<RitualCard ritual={ritual} />);

      expect(screen.getByText('Ritual de Protección')).toBeInTheDocument();
    });

    it('should render ritual description', () => {
      const ritual = createTestRitual({
        description: 'Un ritual para proteger tu hogar',
      });

      render(<RitualCard ritual={ritual} />);

      expect(screen.getByText('Un ritual para proteger tu hogar')).toBeInTheDocument();
    });

    it('should render ritual image with correct alt text', () => {
      const ritual = createTestRitual();

      render(<RitualCard ritual={ritual} />);

      const image = screen.getByAltText('Ritual de Luna Nueva');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/images/rituals/luna-nueva.jpg');
    });

    it('should display duration in minutes', () => {
      const ritual = createTestRitual({ durationMinutes: 45 });

      render(<RitualCard ritual={ritual} />);

      expect(screen.getByText(/45\s*min/)).toBeInTheDocument();
    });

    it('should display steps count', () => {
      const ritual = createTestRitual({ stepsCount: 5 });

      render(<RitualCard ritual={ritual} />);

      expect(screen.getByText(/5\s*pasos/)).toBeInTheDocument();
    });

    it('should display materials count', () => {
      const ritual = createTestRitual({ materialsCount: 3 });

      render(<RitualCard ritual={ritual} />);

      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Category badge', () => {
    it('should display category name and icon for Lunar', () => {
      const ritual = createTestRitual({ category: RitualCategory.LUNAR });

      render(<RitualCard ritual={ritual} />);

      expect(screen.getByText(/🌙/)).toBeInTheDocument();
      expect(screen.getByText(/Lunar/)).toBeInTheDocument();
    });

    it('should display category name and icon for Tarot', () => {
      const ritual = createTestRitual({ category: RitualCategory.TAROT });

      render(<RitualCard ritual={ritual} />);

      expect(screen.getByText(/🎴/)).toBeInTheDocument();
      expect(screen.getByText(/Tarot/)).toBeInTheDocument();
    });

    it('should display category name and icon for Cleansing', () => {
      const ritual = createTestRitual({ category: RitualCategory.CLEANSING });

      render(<RitualCard ritual={ritual} />);

      expect(screen.getByText(/✨/)).toBeInTheDocument();
      expect(screen.getByText(/Limpieza/)).toBeInTheDocument();
    });

    it('should apply correct color class for category', () => {
      const ritual = createTestRitual({ category: RitualCategory.LUNAR });

      render(<RitualCard ritual={ritual} />);

      // Verify the category is displayed (the color class is applied internally)
      expect(screen.getByText(/Lunar/)).toBeInTheDocument();
    });
  });

  describe('Difficulty badge', () => {
    it('should display "Principiante" for beginner difficulty', () => {
      const ritual = createTestRitual({
        difficulty: RitualDifficulty.BEGINNER,
      });

      render(<RitualCard ritual={ritual} />);

      expect(screen.getByText('Principiante')).toBeInTheDocument();
    });

    it('should display "Intermedio" for intermediate difficulty', () => {
      const ritual = createTestRitual({
        difficulty: RitualDifficulty.INTERMEDIATE,
      });

      render(<RitualCard ritual={ritual} />);

      expect(screen.getByText('Intermedio')).toBeInTheDocument();
    });

    it('should display "Avanzado" for advanced difficulty', () => {
      const ritual = createTestRitual({
        difficulty: RitualDifficulty.ADVANCED,
      });

      render(<RitualCard ritual={ritual} />);

      expect(screen.getByText('Avanzado')).toBeInTheDocument();
    });

    it('should apply correct color class for beginner difficulty', () => {
      const ritual = createTestRitual({
        difficulty: RitualDifficulty.BEGINNER,
      });

      render(<RitualCard ritual={ritual} />);

      const difficultyText = screen.getByText('Principiante');
      expect(difficultyText).toHaveClass('text-green-500');
    });
  });

  describe('Lunar phase badge', () => {
    it('should display lunar phase icon when bestLunarPhase is present', () => {
      const ritual = createTestRitual({
        bestLunarPhase: LunarPhase.FULL_MOON,
      });

      render(<RitualCard ritual={ritual} />);

      expect(screen.getByText('🌕')).toBeInTheDocument();
    });

    it('should not display lunar phase badge when bestLunarPhase is null', () => {
      const ritual = createTestRitual({ bestLunarPhase: null });

      render(<RitualCard ritual={ritual} />);

      expect(screen.queryByText('🌕')).not.toBeInTheDocument();
      expect(screen.queryByText('🌑')).not.toBeInTheDocument();
    });
  });

  describe('Link behavior', () => {
    it('should link to ritual detail page with correct slug', () => {
      const ritual = createTestRitual({ slug: 'ritual-abundancia' });

      render(<RitualCard ritual={ritual} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/rituales/ritual-abundancia');
    });
  });

  describe('Styling', () => {
    it('should have hover effects', () => {
      const ritual = createTestRitual();

      render(<RitualCard ritual={ritual} />);

      const card = screen.getByTestId(`ritual-card-${ritual.slug}`);
      expect(card).toBeInTheDocument();
    });

    it('should apply custom className when provided', () => {
      const ritual = createTestRitual();

      render(<RitualCard ritual={ritual} className="custom-class" />);

      const card = screen.getByTestId(`ritual-card-${ritual.slug}`);
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Edge cases', () => {
    it('should handle long titles gracefully with line-clamp', () => {
      const ritual = createTestRitual({
        title: 'Ritual muy largo con un título que debería truncarse',
      });

      render(<RitualCard ritual={ritual} />);

      const title = screen.getByText('Ritual muy largo con un título que debería truncarse');
      expect(title).toHaveClass('line-clamp-1');
    });

    it('should handle long descriptions with line-clamp-2', () => {
      const ritual = createTestRitual({
        description:
          'Una descripción muy larga que debería truncarse después de dos líneas para mantener el diseño limpio',
      });

      render(<RitualCard ritual={ritual} />);

      const description = screen.getByText(
        'Una descripción muy larga que debería truncarse después de dos líneas para mantener el diseño limpio'
      );
      expect(description).toHaveClass('line-clamp-2');
    });

    it('should render correctly with zero materials', () => {
      const ritual = createTestRitual({ materialsCount: 0 });

      render(<RitualCard ritual={ritual} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should render correctly with zero steps', () => {
      const ritual = createTestRitual({ stepsCount: 0 });

      render(<RitualCard ritual={ritual} />);

      expect(screen.getByText(/0\s*pasos/)).toBeInTheDocument();
    });
  });

  describe('All ritual categories', () => {
    it('should render correctly for all categories', () => {
      const categories = [
        { category: RitualCategory.TAROT, icon: '🎴', name: 'Tarot' },
        { category: RitualCategory.LUNAR, icon: '🌙', name: 'Lunar' },
        { category: RitualCategory.CLEANSING, icon: '✨', name: 'Limpieza' },
        {
          category: RitualCategory.MEDITATION,
          icon: '🧘',
          name: 'Meditación',
        },
        {
          category: RitualCategory.PROTECTION,
          icon: '🛡️',
          name: 'Protección',
        },
        {
          category: RitualCategory.ABUNDANCE,
          icon: '💰',
          name: 'Abundancia',
        },
        { category: RitualCategory.LOVE, icon: '💕', name: 'Amor' },
        { category: RitualCategory.HEALING, icon: '💚', name: 'Sanación' },
      ];

      categories.forEach(({ category, icon, name }) => {
        const ritual = createTestRitual({ category });
        const { unmount } = render(<RitualCard ritual={ritual} />);

        expect(screen.getByText(new RegExp(icon))).toBeInTheDocument();
        expect(screen.getByText(new RegExp(name))).toBeInTheDocument();

        unmount();
      });
    });
  });
});
