import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PendulumResponseDisplay } from './PendulumResponse';
import type { PendulumQueryResponse } from '@/types/pendulum.types';

describe('PendulumResponseDisplay', () => {
  const mockResponse: PendulumQueryResponse = {
    response: 'yes',
    movement: 'vertical',
    responseText: 'Sí',
    interpretation: 'El universo afirma tu camino',
    queryId: 1,
    lunarPhase: '🌕',
    lunarPhaseName: 'Luna Llena',
  };

  it('should render response text', () => {
    render(<PendulumResponseDisplay response={mockResponse} />);

    expect(screen.getByText('Sí')).toBeInTheDocument();
  });

  it('should render interpretation', () => {
    render(<PendulumResponseDisplay response={mockResponse} />);

    expect(screen.getByText(/el universo afirma tu camino/i)).toBeInTheDocument();
  });

  it('should render lunar phase name', () => {
    render(<PendulumResponseDisplay response={mockResponse} />);

    expect(screen.getByText('Luna Llena')).toBeInTheDocument();
  });

  it('should apply correct color for yes response', () => {
    render(<PendulumResponseDisplay response={mockResponse} />);

    const responseElement = screen.getByText('Sí');
    expect(responseElement).toHaveClass('text-green-500');
  });

  it('should apply correct color for no response', () => {
    const noResponse: PendulumQueryResponse = {
      ...mockResponse,
      response: 'no',
      responseText: 'No',
    };

    render(<PendulumResponseDisplay response={noResponse} />);

    const responseElement = screen.getByText('No');
    expect(responseElement).toHaveClass('text-red-500');
  });

  it('should apply correct color for maybe response', () => {
    const maybeResponse: PendulumQueryResponse = {
      ...mockResponse,
      response: 'maybe',
      responseText: 'Quizás',
    };

    render(<PendulumResponseDisplay response={maybeResponse} />);

    const responseElement = screen.getByText('Quizás');
    expect(responseElement).toHaveClass('text-amber-500');
  });

  it('should apply custom className when provided', () => {
    const { container } = render(
      <PendulumResponseDisplay response={mockResponse} className="custom-class" />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });
});
