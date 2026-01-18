import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { ChineseCompatibility } from './ChineseCompatibility';
import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

describe('ChineseCompatibility', () => {
  const mockCompatibility = {
    best: [ChineseZodiacAnimal.RAT, ChineseZodiacAnimal.MONKEY],
    good: [ChineseZodiacAnimal.ROOSTER, ChineseZodiacAnimal.OX],
    challenging: [ChineseZodiacAnimal.DOG, ChineseZodiacAnimal.RABBIT],
  };

  describe('Rendering', () => {
    it('should render compatibility card', () => {
      render(<ChineseCompatibility compatibility={mockCompatibility} />);

      expect(screen.getByTestId('chinese-compatibility')).toBeInTheDocument();
    });

    it('should render "Compatibilidad" title', () => {
      render(<ChineseCompatibility compatibility={mockCompatibility} />);

      expect(screen.getByText('Compatibilidad')).toBeInTheDocument();
    });

    it('should render section titles', () => {
      render(<ChineseCompatibility compatibility={mockCompatibility} />);

      expect(screen.getByText('Excelente compatibilidad')).toBeInTheDocument();
      expect(screen.getByText('Buena compatibilidad')).toBeInTheDocument();
      expect(screen.getByText('Compatibilidad desafiante')).toBeInTheDocument();
    });
  });

  describe('Best compatibility', () => {
    it('should render best compatibility animals', () => {
      render(<ChineseCompatibility compatibility={mockCompatibility} />);

      expect(screen.getByTestId('compatibility-badge-rat')).toBeInTheDocument();
      expect(screen.getByTestId('compatibility-badge-monkey')).toBeInTheDocument();
    });

    it('should display animal names for best compatibility', () => {
      render(<ChineseCompatibility compatibility={mockCompatibility} />);

      expect(screen.getByText(/Rata/)).toBeInTheDocument();
      expect(screen.getByText(/Mono/)).toBeInTheDocument();
    });
  });

  describe('Good compatibility', () => {
    it('should render good compatibility animals', () => {
      render(<ChineseCompatibility compatibility={mockCompatibility} />);

      expect(screen.getByTestId('compatibility-badge-rooster')).toBeInTheDocument();
      expect(screen.getByTestId('compatibility-badge-ox')).toBeInTheDocument();
    });

    it('should display animal names for good compatibility', () => {
      render(<ChineseCompatibility compatibility={mockCompatibility} />);

      expect(screen.getByText(/Gallo/)).toBeInTheDocument();
      expect(screen.getByText(/Buey/)).toBeInTheDocument();
    });
  });

  describe('Challenging compatibility', () => {
    it('should render challenging compatibility animals', () => {
      render(<ChineseCompatibility compatibility={mockCompatibility} />);

      expect(screen.getByTestId('compatibility-badge-dog')).toBeInTheDocument();
      expect(screen.getByTestId('compatibility-badge-rabbit')).toBeInTheDocument();
    });

    it('should display animal names for challenging compatibility', () => {
      render(<ChineseCompatibility compatibility={mockCompatibility} />);

      expect(screen.getByText(/Perro/)).toBeInTheDocument();
      expect(screen.getByText(/Conejo/)).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have three compatibility groups', () => {
      render(<ChineseCompatibility compatibility={mockCompatibility} />);

      const groups = screen.getAllByTestId('compatibility-group');
      expect(groups).toHaveLength(3);
    });

    it('should render correct number of badges', () => {
      render(<ChineseCompatibility compatibility={mockCompatibility} />);

      // 2 best + 2 good + 2 challenging = 6 total
      const badges = screen.getAllByTestId(/compatibility-badge-/);
      expect(badges).toHaveLength(6);
    });
  });

  describe('Empty compatibility lists', () => {
    it('should handle empty best compatibility', () => {
      const emptyBest = {
        best: [],
        good: [ChineseZodiacAnimal.ROOSTER],
        challenging: [ChineseZodiacAnimal.DOG],
      };

      render(<ChineseCompatibility compatibility={emptyBest} />);

      expect(screen.getByText('Excelente compatibilidad')).toBeInTheDocument();
    });

    it('should handle all empty lists', () => {
      const allEmpty = {
        best: [],
        good: [],
        challenging: [],
      };

      render(<ChineseCompatibility compatibility={allEmpty} />);

      const badges = screen.queryAllByTestId(/compatibility-badge-/);
      expect(badges).toHaveLength(0);
    });
  });
});
