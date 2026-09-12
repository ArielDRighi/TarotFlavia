import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ContactDetails } from './ContactDetails';
import { CONFIG } from '@/lib/constants';

describe('ContactDetails (T-SEO-015)', () => {
  it('publica correo (mailto), ubicación, horario de respuesta y quién responde', () => {
    render(<ContactDetails />);

    const details = screen.getByTestId('contact-details');
    expect(screen.getByTestId('contact-email-link')).toHaveAttribute(
      'href',
      `mailto:${CONFIG.CONTACT_EMAIL}`
    );
    expect(details).toHaveTextContent(CONFIG.CONTACT_LOCATION);
    expect(details).toHaveTextContent(CONFIG.CONTACT_RESPONSE_WINDOW);
    expect(details).toHaveTextContent(/quién responde/i);
    expect(details.querySelectorAll('dt')).toHaveLength(4);
  });

  it('no publica ninguna dirección del dominio equivocado', () => {
    const { container } = render(<ContactDetails />);

    expect(container.textContent).not.toMatch(/@auguria\.com\b/);
  });
});
