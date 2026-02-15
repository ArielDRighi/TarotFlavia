import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { EmptyState, EmptyStateInline } from './EmptyState';

describe('EmptyState', () => {
  describe('type: no-charts', () => {
    it('should render default title and description for no-charts type', () => {
      render(<EmptyState type="no-charts" />);

      expect(screen.getByText('Aún no tienes cartas')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Genera tu primera carta astral y descubre los secretos de tu cielo natal.'
        )
      ).toBeInTheDocument();
    });

    it('should render Star icon with primary color', () => {
      render(<EmptyState type="no-charts" />);

      const iconContainer = screen.getByTestId('empty-state-icon-container');
      expect(iconContainer).toBeInTheDocument();
      // Star icon should be inside
      const icon = iconContainer.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-primary');
    });

    it('should render Plus icon in action button', () => {
      render(<EmptyState type="no-charts" actionLabel="Generar" actionHref="/generate" />);

      const plusIcon = screen.getByTestId('empty-state-action-plus-icon');
      expect(plusIcon).toBeInTheDocument();
    });
  });

  describe('type: no-results', () => {
    it('should render default title and description for no-results type', () => {
      render(<EmptyState type="no-results" />);

      expect(screen.getByText('Sin resultados')).toBeInTheDocument();
      expect(
        screen.getByText('No encontramos cartas que coincidan con tu búsqueda.')
      ).toBeInTheDocument();
    });

    it('should render Search icon with muted color', () => {
      render(<EmptyState type="no-results" />);

      const icon = screen.getByTestId('empty-state-icon-container').querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-muted-foreground');
    });
  });

  describe('type: premium-required', () => {
    it('should render default title and description for premium-required type', () => {
      render(<EmptyState type="premium-required" />);

      expect(screen.getByText('Contenido Premium')).toBeInTheDocument();
      expect(
        screen.getByText('Esta función está disponible exclusivamente para usuarios Premium.')
      ).toBeInTheDocument();
    });

    it('should render Crown icon with amber color', () => {
      render(<EmptyState type="premium-required" />);

      const icon = screen.getByTestId('empty-state-icon-container').querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-amber-500');
    });

    it('should render action button with gradient for premium type', () => {
      render(<EmptyState type="premium-required" actionLabel="Actualizar" actionHref="/premium" />);

      const button = screen.getByRole('link', { name: /Actualizar/ });
      expect(button).toHaveClass('bg-gradient-to-r');
      expect(button).toHaveClass('from-amber-500');
    });

    it('should render Crown icon in action button', () => {
      render(<EmptyState type="premium-required" actionLabel="Actualizar" actionHref="/premium" />);

      const crownIcon = screen.getByTestId('empty-state-action-crown-icon');
      expect(crownIcon).toBeInTheDocument();
    });
  });

  describe('type: limit-reached', () => {
    it('should render default title and description for limit-reached type', () => {
      render(<EmptyState type="limit-reached" />);

      expect(screen.getByText('Límite alcanzado')).toBeInTheDocument();
      expect(
        screen.getByText('Has utilizado todas tus cartas disponibles este período.')
      ).toBeInTheDocument();
    });

    it('should render Sparkles icon with orange color', () => {
      render(<EmptyState type="limit-reached" />);

      const icon = screen.getByTestId('empty-state-icon-container').querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-orange-500');
    });
  });

  describe('type: not-found', () => {
    it('should render default title and description for not-found type', () => {
      render(<EmptyState type="not-found" />);

      expect(screen.getByText('No encontrado')).toBeInTheDocument();
      expect(
        screen.getByText('El recurso que buscas no existe o no tienes acceso.')
      ).toBeInTheDocument();
    });

    it('should render FileX icon with muted color', () => {
      render(<EmptyState type="not-found" />);

      const icon = screen.getByTestId('empty-state-icon-container').querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-muted-foreground');
    });
  });

  describe('custom props', () => {
    it('should render custom title when provided', () => {
      render(<EmptyState type="no-charts" title="Título personalizado" />);

      expect(screen.getByText('Título personalizado')).toBeInTheDocument();
      expect(screen.queryByText('Aún no tienes cartas')).not.toBeInTheDocument();
    });

    it('should render custom description when provided', () => {
      render(<EmptyState type="no-charts" description="Descripción personalizada" />);

      expect(screen.getByText('Descripción personalizada')).toBeInTheDocument();
      expect(
        screen.queryByText(
          'Genera tu primera carta astral y descubre los secretos de tu cielo natal.'
        )
      ).not.toBeInTheDocument();
    });

    it('should render custom className', () => {
      render(<EmptyState type="no-charts" className="custom-class" />);

      const container = screen.getByTestId('empty-state-container');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('actions', () => {
    it('should render action button with href as Link', () => {
      render(<EmptyState type="no-charts" actionLabel="Ir" actionHref="/test" />);

      const link = screen.getByRole('link', { name: /Ir/ });
      expect(link).toHaveAttribute('href', '/test');
    });

    it('should render action button with onClick', async () => {
      const user = userEvent.setup();
      const handleAction = vi.fn();

      render(<EmptyState type="no-charts" actionLabel="Click" onAction={handleAction} />);

      const button = screen.getByRole('button', { name: /Click/ });
      await user.click(button);

      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it('should render ArrowRight icon in action button', () => {
      render(<EmptyState type="no-charts" actionLabel="Ir" actionHref="/test" />);

      const arrowIcon = screen.getByTestId('empty-state-action-arrow-icon');
      expect(arrowIcon).toBeInTheDocument();
    });

    it('should not render action button when no action props provided', () => {
      render(<EmptyState type="no-charts" />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('should render secondary action button when provided', () => {
      render(
        <EmptyState
          type="no-charts"
          actionLabel="Primary"
          actionHref="/primary"
          secondaryActionLabel="Secondary"
          secondaryActionHref="/secondary"
        />
      );

      const secondaryLink = screen.getByRole('link', { name: /Secondary/ });
      expect(secondaryLink).toHaveAttribute('href', '/secondary');
      expect(secondaryLink).toHaveClass('border'); // variant="outline"
    });
  });

  describe('layout', () => {
    it('should center content and apply responsive padding', () => {
      render(<EmptyState type="no-charts" />);

      const container = screen.getByTestId('empty-state-container');
      expect(container).toHaveClass('flex');
      expect(container).toHaveClass('flex-col');
      expect(container).toHaveClass('items-center');
      expect(container).toHaveClass('justify-center');
      expect(container).toHaveClass('text-center');
      expect(container).toHaveClass('py-16');
      expect(container).toHaveClass('px-4');
    });

    it('should have responsive button layout', () => {
      render(
        <EmptyState
          type="no-charts"
          actionLabel="Primary"
          actionHref="/primary"
          secondaryActionLabel="Secondary"
          secondaryActionHref="/secondary"
        />
      );

      const actionsContainer = screen.getByTestId('empty-state-actions');
      expect(actionsContainer).toHaveClass('flex');
      expect(actionsContainer).toHaveClass('flex-col');
      expect(actionsContainer).toHaveClass('sm:flex-row');
    });
  });
});

describe('EmptyStateInline', () => {
  it('should render message', () => {
    render(<EmptyStateInline message="No hay resultados" />);

    expect(screen.getByText('No hay resultados')).toBeInTheDocument();
  });

  it('should render action button when provided', () => {
    render(<EmptyStateInline message="Test" actionLabel="Acción" onAction={() => {}} />);

    expect(screen.getByRole('button', { name: /Acción/ })).toBeInTheDocument();
  });

  it('should call onAction when button is clicked', async () => {
    const user = userEvent.setup();
    const handleAction = vi.fn();

    render(<EmptyStateInline message="Test" actionLabel="Acción" onAction={handleAction} />);

    await user.click(screen.getByRole('button', { name: /Acción/ }));

    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('should not render button when no action provided', () => {
    render(<EmptyStateInline message="Test" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should have compact layout', () => {
    render(<EmptyStateInline message="Test" />);

    const container = screen.getByTestId('empty-state-inline-container');
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('items-center');
    expect(container).toHaveClass('justify-center');
    expect(container).toHaveClass('py-8');
  });

  it('should render action as link button with minimal styling', () => {
    render(<EmptyStateInline message="Test" actionLabel="Acción" onAction={() => {}} />);

    const button = screen.getByRole('button', { name: /Acción/ });
    expect(button).toHaveClass('p-0');
    expect(button).toHaveClass('h-auto');
  });
});
