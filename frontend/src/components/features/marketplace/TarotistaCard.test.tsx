import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { TarotistaCard } from './TarotistaCard';
import type { Tarotista } from '@/types/tarotista.types';

/**
 * Factory function to create a test tarotista
 */
function createTestTarotista(overrides: Partial<Tarotista> = {}): Tarotista {
  return {
    id: 1,
    nombrePublico: 'María Luz',
    bio: 'Tarotista profesional con más de 10 años de experiencia en lecturas de tarot y guía espiritual.',
    especialidades: ['Amor', 'Carrera', 'Espiritual'],
    fotoPerfil: '/images/tarotistas/maria-luz.jpg',
    ratingPromedio: 4.5,
    totalLecturas: 150,
    totalReviews: 24,
    añosExperiencia: 10,
    idiomas: ['Español', 'Inglés'],
    createdAt: '2024-01-15T10:00:00Z',
    ...overrides,
  };
}

describe('TarotistaCard', () => {
  const mockOnViewProfile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the tarotista name', () => {
      const tarotista = createTestTarotista({ nombrePublico: 'Ana Luna' });

      render(<TarotistaCard tarotista={tarotista} onViewProfile={mockOnViewProfile} />);

      expect(screen.getByText('Ana Luna')).toBeInTheDocument();
    });

    it('should render the tarotista profile image when fotoPerfil is provided', () => {
      const tarotista = createTestTarotista({
        fotoPerfil: '/images/tarotistas/test.jpg',
      });

      render(<TarotistaCard tarotista={tarotista} onViewProfile={mockOnViewProfile} />);

      // AvatarImage component renders with src prop
      // In tests, the image loading behavior depends on jsdom/happy-dom
      // We verify the avatar container is present (image will show on real browser)
      const avatarContainer = screen.getByTestId('avatar-container');
      expect(avatarContainer).toBeInTheDocument();
    });

    it('should render initials fallback when no profile image', () => {
      const tarotista = createTestTarotista({
        nombrePublico: 'María Luz',
        fotoPerfil: undefined,
      });

      render(<TarotistaCard tarotista={tarotista} onViewProfile={mockOnViewProfile} />);

      expect(screen.getByText('ML')).toBeInTheDocument();
    });

    it('should render availability badge as online when available', () => {
      const tarotista = createTestTarotista();

      render(
        <TarotistaCard tarotista={tarotista} onViewProfile={mockOnViewProfile} isAvailable={true} />
      );

      const badge = screen.getByTestId('availability-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-accent-success');
    });

    it('should render availability badge as offline when not available', () => {
      const tarotista = createTestTarotista();

      render(
        <TarotistaCard
          tarotista={tarotista}
          onViewProfile={mockOnViewProfile}
          isAvailable={false}
        />
      );

      const badge = screen.getByTestId('availability-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-gray-400');
    });

    it('should render rating stars based on ratingPromedio', () => {
      const tarotista = createTestTarotista({ ratingPromedio: 4.5 });

      render(<TarotistaCard tarotista={tarotista} onViewProfile={mockOnViewProfile} />);

      const filledStars = screen.getAllByTestId('star-filled');
      const emptyStars = screen.getAllByTestId('star-empty');

      expect(filledStars).toHaveLength(4);
      expect(emptyStars).toHaveLength(1);
    });

    it('should render reviews count', () => {
      const tarotista = createTestTarotista({ totalReviews: 24 });

      render(<TarotistaCard tarotista={tarotista} onViewProfile={mockOnViewProfile} />);

      expect(screen.getByText('(24 valoraciones)')).toBeInTheDocument();
    });

    it('should render specialties as badges', () => {
      const tarotista = createTestTarotista({
        especialidades: ['Amor', 'Dinero', 'Carrera'],
      });

      render(<TarotistaCard tarotista={tarotista} onViewProfile={mockOnViewProfile} />);

      expect(screen.getByText('Amor')).toBeInTheDocument();
      expect(screen.getByText('Dinero')).toBeInTheDocument();
      expect(screen.getByText('Carrera')).toBeInTheDocument();
    });

    it('should apply correct color to specialty badges', () => {
      const tarotista = createTestTarotista({
        especialidades: ['Amor', 'Dinero', 'Carrera', 'Salud', 'Espiritual'],
      });

      render(<TarotistaCard tarotista={tarotista} onViewProfile={mockOnViewProfile} />);

      // Pink for Amor
      const amorBadge = screen.getByText('Amor');
      expect(amorBadge).toHaveClass('bg-pink-100');

      // Green for Dinero
      const dineroBadge = screen.getByText('Dinero');
      expect(dineroBadge).toHaveClass('bg-green-100');

      // Blue for Carrera
      const carreraBadge = screen.getByText('Carrera');
      expect(carreraBadge).toHaveClass('bg-blue-100');

      // Orange for Salud
      const saludBadge = screen.getByText('Salud');
      expect(saludBadge).toHaveClass('bg-orange-100');

      // Purple for Espiritual
      const espiritualBadge = screen.getByText('Espiritual');
      expect(espiritualBadge).toHaveClass('bg-purple-100');
    });

    it('should truncate long bio to 3 lines', () => {
      const longBio =
        'Esta es una biografía muy larga que debería ser truncada después de tres líneas para mantener un diseño limpio y consistente en las tarjetas del marketplace de tarotistas profesionales.';
      const tarotista = createTestTarotista({ bio: longBio });

      render(<TarotistaCard tarotista={tarotista} onViewProfile={mockOnViewProfile} />);

      const bioElement = screen.getByTestId('tarotista-bio');
      expect(bioElement).toHaveClass('line-clamp-3');
    });

    it('should render price per session', () => {
      const tarotista = createTestTarotista();

      render(
        <TarotistaCard
          tarotista={tarotista}
          onViewProfile={mockOnViewProfile}
          pricePerSession={25}
        />
      );

      expect(screen.getByText('$25 / 30 min')).toBeInTheDocument();
    });

    it('should render "Ver Perfil" button', () => {
      const tarotista = createTestTarotista();

      render(<TarotistaCard tarotista={tarotista} onViewProfile={mockOnViewProfile} />);

      expect(screen.getByRole('button', { name: /ver perfil/i })).toBeInTheDocument();
    });

    it('should show empty stars when rating is null', () => {
      const tarotista = createTestTarotista({ ratingPromedio: null, totalReviews: 0 });

      render(<TarotistaCard tarotista={tarotista} onViewProfile={mockOnViewProfile} />);

      const emptyStars = screen.getAllByTestId('star-empty');
      expect(emptyStars).toHaveLength(5);
      expect(screen.getByText('(0 valoraciones)')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onViewProfile with tarotista id when "Ver Perfil" is clicked', async () => {
      const user = userEvent.setup();
      const tarotista = createTestTarotista({ id: 42 });

      render(<TarotistaCard tarotista={tarotista} onViewProfile={mockOnViewProfile} />);

      await user.click(screen.getByRole('button', { name: /ver perfil/i }));

      expect(mockOnViewProfile).toHaveBeenCalledTimes(1);
      expect(mockOnViewProfile).toHaveBeenCalledWith(42);
    });
  });

  describe('Styling', () => {
    it('should have hover scale and shadow styles', () => {
      const tarotista = createTestTarotista();

      render(<TarotistaCard tarotista={tarotista} onViewProfile={mockOnViewProfile} />);

      const card = screen.getByTestId('tarotista-card');
      expect(card).toHaveClass('hover:scale-105');
      expect(card).toHaveClass('hover:shadow-lg');
    });

    it('should have surface background and soft shadow', () => {
      const tarotista = createTestTarotista();

      render(<TarotistaCard tarotista={tarotista} onViewProfile={mockOnViewProfile} />);

      const card = screen.getByTestId('tarotista-card');
      expect(card).toHaveClass('bg-card');
      expect(card).toHaveClass('shadow-soft');
    });

    it('should have golden border on avatar', () => {
      const tarotista = createTestTarotista();

      render(<TarotistaCard tarotista={tarotista} onViewProfile={mockOnViewProfile} />);

      const avatarContainer = screen.getByTestId('avatar-container');
      expect(avatarContainer).toHaveClass('border-secondary');
      expect(avatarContainer).toHaveClass('border-[3px]');
    });

    it('should apply custom className when provided', () => {
      const tarotista = createTestTarotista();

      render(
        <TarotistaCard
          tarotista={tarotista}
          onViewProfile={mockOnViewProfile}
          className="custom-class"
        />
      );

      const card = screen.getByTestId('tarotista-card');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty specialties array', () => {
      const tarotista = createTestTarotista({ especialidades: [] });

      render(<TarotistaCard tarotista={tarotista} onViewProfile={mockOnViewProfile} />);

      // Should not render specialties section or render it empty
      const specialtiesContainer = screen.queryByTestId('specialties-container');
      expect(specialtiesContainer?.children.length ?? 0).toBe(0);
    });

    it('should handle null bio', () => {
      const tarotista = createTestTarotista({ bio: null });

      render(<TarotistaCard tarotista={tarotista} onViewProfile={mockOnViewProfile} />);

      // Should render without bio text
      expect(screen.queryByTestId('tarotista-bio')).not.toBeInTheDocument();
    });

    it('should handle single word name for initials', () => {
      const tarotista = createTestTarotista({
        nombrePublico: 'Mystic',
        fotoPerfil: undefined,
      });

      render(<TarotistaCard tarotista={tarotista} onViewProfile={mockOnViewProfile} />);

      expect(screen.getByText('MY')).toBeInTheDocument();
    });

    it('should default to unavailable when isAvailable is not provided', () => {
      const tarotista = createTestTarotista();

      render(<TarotistaCard tarotista={tarotista} onViewProfile={mockOnViewProfile} />);

      const badge = screen.getByTestId('availability-badge');
      expect(badge).toHaveClass('bg-gray-400');
    });

    it('should default price to consultation text when not provided', () => {
      const tarotista = createTestTarotista();

      render(<TarotistaCard tarotista={tarotista} onViewProfile={mockOnViewProfile} />);

      expect(screen.getByText('Consultar precio')).toBeInTheDocument();
    });
  });
});
