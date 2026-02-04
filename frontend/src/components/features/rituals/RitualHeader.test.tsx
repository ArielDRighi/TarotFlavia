import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RitualHeader } from './RitualHeader';
import {
  RitualCategory,
  RitualDifficulty,
  LunarPhase,
  MaterialType,
  type RitualDetail,
} from '@/types/ritual.types';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('RitualHeader', () => {
  const mockRitual: RitualDetail = {
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
    bestTimeOfDay: 'Noche',
    purpose: 'Establecer intenciones para el nuevo ciclo',
    preparation: 'Busca un espacio tranquilo',
    closing: 'Agradece a la luna',
    tips: ['Escribe en presente', 'Sé específico'],
    audioUrl: null,
    materials: [
      {
        id: 1,
        name: 'Vela blanca',
        description: null,
        type: MaterialType.REQUIRED,
        alternative: null,
        quantity: 1,
        unit: null,
      },
    ],
    steps: [
      {
        id: 1,
        stepNumber: 1,
        title: 'Preparar el espacio',
        description: 'Limpia y ordena tu espacio sagrado',
        durationSeconds: 180,
        imageUrl: null,
        mantra: null,
        visualization: null,
      },
    ],
    completionCount: 42,
  };

  it('should render ritual title', () => {
    render(<RitualHeader ritual={mockRitual} />);

    expect(screen.getByText('Ritual de Luna Nueva')).toBeInTheDocument();
  });

  it('should render ritual image', () => {
    render(<RitualHeader ritual={mockRitual} />);

    const image = screen.getByAltText('Ritual de Luna Nueva');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/rituals/luna-nueva.jpg');
  });

  it('should display category badge', () => {
    render(<RitualHeader ritual={mockRitual} />);

    expect(screen.getByText(/Lunar/i)).toBeInTheDocument();
  });

  it('should display difficulty badge', () => {
    render(<RitualHeader ritual={mockRitual} />);

    expect(screen.getByText(/Principiante/i)).toBeInTheDocument();
  });

  it('should display lunar phase badge when bestLunarPhase is set', () => {
    render(<RitualHeader ritual={mockRitual} />);

    expect(screen.getByText(/Mejor en Luna Nueva/i)).toBeInTheDocument();
  });

  it('should not display lunar phase badge when bestLunarPhase is null', () => {
    const ritualWithoutPhase = { ...mockRitual, bestLunarPhase: null };
    render(<RitualHeader ritual={ritualWithoutPhase} />);

    expect(screen.queryByText(/Mejor en/i)).not.toBeInTheDocument();
  });

  it('should display duration', () => {
    render(<RitualHeader ritual={mockRitual} />);

    expect(screen.getByText(/30 minutos/i)).toBeInTheDocument();
  });

  it('should display steps count', () => {
    render(<RitualHeader ritual={mockRitual} />);

    expect(screen.getByText(/1 pasos/i)).toBeInTheDocument();
  });

  it('should display completion count when greater than 0', () => {
    render(<RitualHeader ritual={mockRitual} />);

    expect(screen.getByText(/42 veces realizado/i)).toBeInTheDocument();
  });

  it('should not display completion count when is 0', () => {
    const ritualWithoutCompletions = { ...mockRitual, completionCount: 0 };
    render(<RitualHeader ritual={ritualWithoutCompletions} />);

    expect(screen.queryByText(/veces realizado/i)).not.toBeInTheDocument();
  });

  it('should have correct data-testid', () => {
    render(<RitualHeader ritual={mockRitual} />);

    expect(screen.getByTestId('ritual-header')).toBeInTheDocument();
  });

  describe('Image fallback handling', () => {
    it('should use placeholder when imageUrl is null', () => {
      const ritualWithNullImage = { ...mockRitual, imageUrl: null as unknown as string };
      render(<RitualHeader ritual={ritualWithNullImage} />);

      const image = screen.getByAltText(mockRitual.title);
      expect(image).toHaveAttribute('src', '/ritual-placeholder.svg');
    });

    it('should use placeholder when imageUrl is undefined', () => {
      const ritualWithUndefinedImage = { ...mockRitual, imageUrl: undefined as unknown as string };
      render(<RitualHeader ritual={ritualWithUndefinedImage} />);

      const image = screen.getByAltText(mockRitual.title);
      expect(image).toHaveAttribute('src', '/ritual-placeholder.svg');
    });

    it('should use placeholder when imageUrl is empty string', () => {
      const ritualWithEmptyImage = { ...mockRitual, imageUrl: '' };
      render(<RitualHeader ritual={ritualWithEmptyImage} />);

      const image = screen.getByAltText(mockRitual.title);
      expect(image).toHaveAttribute('src', '/ritual-placeholder.svg');
    });
  });
});
