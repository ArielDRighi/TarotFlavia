/**
 * Shared Reading View Tests
 *
 * Tests for the public shared reading view component
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SharedReadingView, type SharedReadingViewProps } from './SharedReadingView';
import type { ReadingDetail } from '@/types';

describe('SharedReadingView', () => {
  const mockReading: ReadingDetail = {
    id: 1,
    userId: 1,
    spreadId: 1,
    question: '¿Encontraré el amor este año?',
    cards: [
      {
        id: 1,
        name: 'The Fool',
        arcana: 'major',
        number: 0,
        suit: null,
        orientation: 'upright',
        position: 1,
        positionName: 'Present',
        imageUrl: '/cards/fool.jpg',
      },
      {
        id: 2,
        name: 'The Magician',
        arcana: 'major',
        number: 1,
        suit: null,
        orientation: 'reversed',
        position: 2,
        positionName: 'Challenge',
        imageUrl: '/cards/magician.jpg',
      },
    ],
    interpretation: `# Tu lectura

Esta es una interpretación de ejemplo que puede contener **markdown** y otros elementos.

## Significado General
El Loco y el Mago juntos indican un nuevo comienzo lleno de potencial.`,
    createdAt: '2025-12-15T10:00:00Z',
    shareToken: 'abc123xyz456',
  };

  const defaultProps: SharedReadingViewProps = {
    reading: mockReading,
    spreadName: 'Tirada de 3 Cartas',
  };

  it('should render reading question as title', () => {
    render(<SharedReadingView {...defaultProps} />);

    // Get all h1 elements and find the one with our question
    const headings = screen.getAllByRole('heading', { level: 1 });
    const questionHeading = headings.find((h) => h.textContent === '¿Encontraré el amor este año?');
    expect(questionHeading).toBeInTheDocument();
  });

  it('should render spread name badge', () => {
    render(<SharedReadingView {...defaultProps} />);

    expect(screen.getByText('Tirada de 3 Cartas')).toBeInTheDocument();
  });

  it('should render formatted date', () => {
    render(<SharedReadingView {...defaultProps} />);

    // Should show formatted date (15 de diciembre de 2025)
    expect(screen.getByText(/15 de diciembre de 2025/i)).toBeInTheDocument();
  });

  it('should render all cards with their positions', () => {
    render(<SharedReadingView {...defaultProps} />);

    // Check cards are present (may appear multiple times due to TarotCard component)
    expect(screen.getAllByText('The Fool').length).toBeGreaterThan(0);
    expect(screen.getByText('Present')).toBeInTheDocument();
    expect(screen.getAllByText('The Magician').length).toBeGreaterThan(0);
    expect(screen.getByText('Challenge')).toBeInTheDocument();
  });

  it('should render interpretation as markdown', () => {
    render(<SharedReadingView {...defaultProps} />);

    // Check for markdown heading
    expect(screen.getByRole('heading', { level: 1, name: /tu lectura/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /significado general/i })
    ).toBeInTheDocument();
  });

  it('should render CTA footer with link to registration', () => {
    render(<SharedReadingView {...defaultProps} />);

    expect(screen.getByText('¿Quieres tu propia lectura?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /crear mi cuenta gratis/i })).toHaveAttribute(
      'href',
      '/registro'
    );
  });

  it('should handle string interpretation', () => {
    const propsWithStringInterpretation: SharedReadingViewProps = {
      ...defaultProps,
      reading: {
        ...mockReading,
        interpretation: 'Esta es una interpretación simple como string',
      },
    };

    render(<SharedReadingView {...propsWithStringInterpretation} />);

    expect(screen.getByText('Esta es una interpretación simple como string')).toBeInTheDocument();
  });

  it('should display TarotFlavia logo', () => {
    render(<SharedReadingView {...defaultProps} />);

    expect(screen.getByText('TarotFlavia')).toBeInTheDocument();
  });
});
