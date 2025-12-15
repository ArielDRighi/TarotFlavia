/**
 * Shared Reading View Tests
 *
 * Tests for the public shared reading view component
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SharedReadingView, type SharedReadingViewProps } from './SharedReadingView';
import type { SharedReading } from '@/types';

describe('SharedReadingView', () => {
  const mockReading: SharedReading = {
    id: 1,
    question: 'deprecated field',
    predefinedQuestionId: null,
    customQuestion: '¿Encontraré el amor este año?',
    questionType: 'custom',
    tarotistaId: null,
    cards: [
      {
        id: 1,
        name: 'The Fool',
        arcana: 'major',
        number: 0,
        suit: null,
        imageUrl: '/cards/fool.jpg',
      },
      {
        id: 2,
        name: 'The Magician',
        arcana: 'major',
        number: 1,
        suit: null,
        imageUrl: '/cards/magician.jpg',
      },
    ],
    cardPositions: [
      {
        cardId: 1,
        position: 'Present',
        isReversed: false,
      },
      {
        cardId: 2,
        position: 'Challenge',
        isReversed: true,
      },
    ],
    deck: {
      id: 1,
      name: 'Rider-Waite',
    },
    category: null,
    predefinedQuestion: null,
    interpretation: `# Tu lectura

Esta es una interpretación de ejemplo que puede contener **markdown** y otros elementos.

## Significado General
El Loco y el Mago juntos indican un nuevo comienzo lleno de potencial.`,
    sharedToken: 'abc123xyz456',
    isPublic: true,
    viewCount: 10,
    createdAt: '2025-12-15T10:00:00Z',
    updatedAt: '2025-12-15T10:00:00Z',
    regenerationCount: 0,
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
