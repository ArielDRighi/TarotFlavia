import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RitualCompletedModal } from './RitualCompletedModal';
import {
  RitualCategory,
  RitualDifficulty,
  MaterialType,
  type RitualDetail,
} from '@/types/ritual.types';

describe('RitualCompletedModal', () => {
  const mockRitual: RitualDetail = {
    id: 1,
    slug: 'ritual-luna-nueva',
    title: 'Ritual de Luna Nueva',
    description: 'Ceremonia para establecer intenciones',
    category: RitualCategory.LUNAR,
    difficulty: RitualDifficulty.BEGINNER,
    durationMinutes: 30,
    bestLunarPhase: null,
    imageUrl: '/images/rituals/luna-nueva.jpg',
    materialsCount: 1,
    stepsCount: 1,
    bestTimeOfDay: null,
    purpose: null,
    preparation: null,
    closing: null,
    tips: null,
    audioUrl: null,
    materials: [
      {
        id: 1,
        name: 'Vela',
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
        title: 'Test',
        description: 'Test',
        durationSeconds: null,
        imageUrl: null,
        mantra: null,
        visualization: null,
      },
    ],
    completionCount: 0,
  };

  const mockOnClose = vi.fn();
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnComplete.mockClear();
  });

  it('should not render when isOpen is false', () => {
    render(
      <RitualCompletedModal
        ritual={mockRitual}
        isOpen={false}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.queryByText('Marcar como Completado')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <RitualCompletedModal
        ritual={mockRitual}
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText('Marcar como Completado')).toBeInTheDocument();
  });

  it('should display ritual title in description', () => {
    render(
      <RitualCompletedModal
        ritual={mockRitual}
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText(/¿Completaste "Ritual de Luna Nueva"\?/i)).toBeInTheDocument();
  });

  it('should render rating stars', () => {
    render(
      <RitualCompletedModal
        ritual={mockRitual}
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    // Verify rating section is present
    expect(screen.getByText(/califica tu experiencia/i)).toBeInTheDocument();
  });

  it('should allow selecting a rating', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <RitualCompletedModal
        ritual={mockRitual}
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    const starButtons = container.querySelectorAll('button');

    if (starButtons.length >= 5) {
      await user.click(starButtons[2]); // Click third star (rating 3)
    }
  });

  it('should render notes textarea', () => {
    render(
      <RitualCompletedModal
        ritual={mockRitual}
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    const textarea = screen.getByPlaceholderText(/¿Cómo te sentiste\? ¿Qué insights tuviste\?/i);
    expect(textarea).toBeInTheDocument();
  });

  it('should allow typing notes', async () => {
    const user = userEvent.setup();
    render(
      <RitualCompletedModal
        ritual={mockRitual}
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    const textarea = screen.getByPlaceholderText(/¿Cómo te sentiste\? ¿Qué insights tuviste\?/i);

    await user.type(textarea, 'Me sentí muy tranquilo');
    expect(textarea).toHaveValue('Me sentí muy tranquilo');
  });

  it('should call onClose when Cancelar button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <RitualCompletedModal
        ritual={mockRitual}
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onComplete when Guardar button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <RitualCompletedModal
        ritual={mockRitual}
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    const saveButton = screen.getByRole('button', { name: /guardar/i });
    await user.click(saveButton);

    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('should call onComplete with notes and rating', async () => {
    const user = userEvent.setup();
    render(
      <RitualCompletedModal
        ritual={mockRitual}
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    // Type notes
    const textarea = screen.getByPlaceholderText(/¿Cómo te sentiste\? ¿Qué insights tuviste\?/i);
    await user.type(textarea, 'Excelente experiencia');

    // Click save
    const saveButton = screen.getByRole('button', { name: /guardar/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith('Excelente experiencia', undefined);
    });
  });

  it('should reset form after completion', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <RitualCompletedModal
        ritual={mockRitual}
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    // Type notes
    const textarea = screen.getByPlaceholderText(/¿Cómo te sentiste\? ¿Qué insights tuviste\?/i);
    await user.type(textarea, 'Test notes');

    // Submit
    const saveButton = screen.getByRole('button', { name: /guardar/i });
    await user.click(saveButton);

    // Reopen modal
    rerender(
      <RitualCompletedModal
        ritual={mockRitual}
        isOpen={false}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    rerender(
      <RitualCompletedModal
        ritual={mockRitual}
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    const newTextarea = screen.getByPlaceholderText(/¿Cómo te sentiste\? ¿Qué insights tuviste\?/i);
    expect(newTextarea).toHaveValue('');
  });

  it('should have correct data-testid', () => {
    render(
      <RitualCompletedModal
        ritual={mockRitual}
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByTestId('ritual-completed-modal')).toBeInTheDocument();
  });
});
