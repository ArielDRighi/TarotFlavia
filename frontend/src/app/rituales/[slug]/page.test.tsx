import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import RitualDetailPage from './page';
import { RitualCategory, RitualDifficulty, MaterialType } from '@/types/ritual.types';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useParams: () => ({
    slug: 'ritual-luna-nueva',
  }),
}));

// Mock hooks
vi.mock('@/hooks/api/useRituals', () => ({
  useRitual: vi.fn(),
  useCompleteRitual: vi.fn(),
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('@/hooks/utils/useToast', () => ({
  useToast: () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    },
  }),
}));

import { useRitual, useCompleteRitual } from '@/hooks/api/useRituals';
import { useAuthStore } from '@/stores/authStore';

const mockRitual = {
  id: 1,
  slug: 'ritual-luna-nueva',
  title: 'Ritual de Luna Nueva',
  description: 'Ceremonia para establecer intenciones',
  category: RitualCategory.LUNAR,
  difficulty: RitualDifficulty.BEGINNER,
  durationMinutes: 30,
  bestLunarPhase: null,
  bestTimeOfDay: 'Noche',
  purpose: 'Establecer intenciones para el nuevo ciclo',
  preparation: 'Preparar espacio tranquilo',
  closing: 'Agradecer y cerrar',
  tips: ['Tip 1', 'Tip 2'],
  imageUrl: '/images/ritual1.jpg',
  materialsCount: 3,
  stepsCount: 5,
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
      title: 'Preparar espacio',
      description: 'Limpia el área',
      durationSeconds: 180,
      imageUrl: null,
      mantra: null,
      visualization: null,
    },
  ],
  completionCount: 10,
};

describe('RitualDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useRitual as any).mockReturnValue({
      data: mockRitual,
      isLoading: false,
      error: null,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useCompleteRitual as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
  });

  it('renders ritual title', () => {
    render(<RitualDetailPage />);

    expect(screen.getByText('Ritual de Luna Nueva')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useRitual as any).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<RitualDetailPage />);

    // Skeleton should be rendered
    expect(screen.queryByText('Ritual de Luna Nueva')).not.toBeInTheDocument();
  });

  it('shows error message when ritual not found', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useRitual as any).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Not found'),
    });

    render(<RitualDetailPage />);

    expect(screen.getByText('Ritual no encontrado')).toBeInTheDocument();
  });

  it('renders back button', () => {
    render(<RitualDetailPage />);

    expect(screen.getByText('Rituales')).toBeInTheDocument();
  });

  it('renders complete button', () => {
    render(<RitualDetailPage />);

    expect(screen.getByText('Marcar como Completado')).toBeInTheDocument();
  });

  it('shows login message when not authenticated', () => {
    render(<RitualDetailPage />);

    expect(screen.getByText('Inicia sesión para guardar tu progreso')).toBeInTheDocument();
  });

  it('does not show login message when authenticated', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
    });

    render(<RitualDetailPage />);

    expect(screen.queryByText('Inicia sesión para guardar tu progreso')).not.toBeInTheDocument();
  });

  it('renders purpose section', () => {
    render(<RitualDetailPage />);

    expect(screen.getByText('Propósito')).toBeInTheDocument();
    expect(screen.getByText('Establecer intenciones para el nuevo ciclo')).toBeInTheDocument();
  });

  it('renders preparation section', () => {
    render(<RitualDetailPage />);

    expect(screen.getByText('Preparación')).toBeInTheDocument();
    expect(screen.getByText('Preparar espacio tranquilo')).toBeInTheDocument();
  });

  it('renders materials section', () => {
    render(<RitualDetailPage />);

    expect(screen.getByText('Materiales Necesarios')).toBeInTheDocument();
    expect(screen.getByText('Vela blanca')).toBeInTheDocument();
  });

  it('renders steps section', () => {
    render(<RitualDetailPage />);

    expect(screen.getByText('Pasos del Ritual')).toBeInTheDocument();
    expect(screen.getByText('Preparar espacio')).toBeInTheDocument();
  });

  it('renders closing section', () => {
    render(<RitualDetailPage />);

    expect(screen.getByText('Cierre del Ritual')).toBeInTheDocument();
    expect(screen.getByText('Agradecer y cerrar')).toBeInTheDocument();
  });

  it('renders tips section', () => {
    render(<RitualDetailPage />);

    expect(screen.getByText('Consejos')).toBeInTheDocument();
    expect(screen.getByText('• Tip 1')).toBeInTheDocument();
    expect(screen.getByText('• Tip 2')).toBeInTheDocument();
  });

  it('opens completion modal when button clicked', async () => {
    const user = userEvent.setup();

    render(<RitualDetailPage />);

    const completeButton = screen.getByText('Marcar como Completado');
    await user.click(completeButton);

    // Modal should open
    // The modal content would need to be verified here
  });

  it('renders best time of day', () => {
    render(<RitualDetailPage />);

    expect(screen.getByText('Mejor momento para realizar')).toBeInTheDocument();
    expect(screen.getByText('Noche')).toBeInTheDocument();
  });
});
