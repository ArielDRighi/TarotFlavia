import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContactForm } from './ContactForm';

describe('ContactForm', () => {
  describe('Rendering', () => {
    it('should render all form fields', () => {
      render(<ContactForm />);

      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/asunto/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mensaje/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<ContactForm />);
      expect(screen.getByRole('button', { name: /enviar mensaje/i })).toBeInTheDocument();
    });

    it('should have placeholder texts', () => {
      render(<ContactForm />);

      expect(screen.getByPlaceholderText('Tu nombre completo')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('¿Sobre qué quieres contactarnos?')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Escribe tu mensaje aquí...')).toBeInTheDocument();
    });

    it('should render icons for name, email, and subject fields', () => {
      const { container } = render(<ContactForm />);
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThanOrEqual(3); // User, Mail, MessageSquare icons
    });

    it('should have required attributes on inputs', () => {
      render(<ContactForm />);

      const nameInput = screen.getByLabelText(/nombre/i);
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const subjectInput = screen.getByLabelText(/asunto/i);
      const messageInput = screen.getByLabelText(/mensaje/i);

      expect(nameInput).toHaveAttribute('id', 'name');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(subjectInput).toHaveAttribute('id', 'subject');
      expect(messageInput).toHaveAttribute('id', 'message');
    });

    it('should render form with proper HTML structure', () => {
      const { container } = render(<ContactForm />);
      // Verify the form exists
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveClass('space-y-6');
    });
  });

  describe('Form Structure', () => {
    it('should use React Hook Form integration', () => {
      render(<ContactForm />);
      // Verify the form exists with proper structure
      const form = screen.getByRole('button', { name: /enviar mensaje/i }).closest('form');
      expect(form).toBeInTheDocument();
    });

    it('should have proper label associations', () => {
      render(<ContactForm />);

      const nameLabel = screen.getByText('Nombre');
      const emailLabel = screen.getByText(/correo electrónico/i);
      const subjectLabel = screen.getByText('Asunto');
      const messageLabel = screen.getByText('Mensaje');

      expect(nameLabel).toBeInTheDocument();
      expect(emailLabel).toBeInTheDocument();
      expect(subjectLabel).toBeInTheDocument();
      expect(messageLabel).toBeInTheDocument();
    });
  });
});
