import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { CardKeywords } from './CardKeywords';
import type { CardKeywords as Keywords } from '@/types/encyclopedia.types';

describe('CardKeywords', () => {
  const defaultKeywords: Keywords = {
    upright: ['Nuevos comienzos', 'Inocencia', 'Aventura', 'Libertad'],
    reversed: ['Imprudencia', 'Ingenuidad', 'Riesgo', 'Miedo'],
  };

  describe('Rendering', () => {
    it('should render component with data-testid', () => {
      render(<CardKeywords keywords={defaultKeywords} />);

      expect(screen.getByTestId('card-keywords')).toBeInTheDocument();
    });

    it('should render "Palabras Clave" heading', () => {
      render(<CardKeywords keywords={defaultKeywords} />);

      expect(screen.getByText('Palabras Clave')).toBeInTheDocument();
    });

    it('should render all upright keywords as badges', () => {
      render(<CardKeywords keywords={defaultKeywords} />);

      for (const keyword of defaultKeywords.upright) {
        expect(screen.getByText(keyword)).toBeInTheDocument();
      }
    });

    it('should render all reversed keywords as badges', () => {
      render(<CardKeywords keywords={defaultKeywords} />);

      for (const keyword of defaultKeywords.reversed) {
        expect(screen.getByText(keyword)).toBeInTheDocument();
      }
    });

    it('should render "Derecha" label for upright section', () => {
      render(<CardKeywords keywords={defaultKeywords} />);

      expect(screen.getByText('Derecha')).toBeInTheDocument();
    });

    it('should render "Invertida" label for reversed section', () => {
      render(<CardKeywords keywords={defaultKeywords} />);

      expect(screen.getByText('Invertida')).toBeInTheDocument();
    });
  });

  describe('Empty keywords', () => {
    it('should render correctly when upright keywords are empty', () => {
      render(<CardKeywords keywords={{ upright: [], reversed: defaultKeywords.reversed }} />);

      expect(screen.getByTestId('card-keywords')).toBeInTheDocument();
    });

    it('should render correctly when reversed keywords are empty', () => {
      render(<CardKeywords keywords={{ upright: defaultKeywords.upright, reversed: [] }} />);

      expect(screen.getByTestId('card-keywords')).toBeInTheDocument();
    });
  });
});
