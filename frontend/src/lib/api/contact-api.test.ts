/**
 * Tests for contact-api (T-PROD-014)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import { sendContactMessage } from './contact-api';
import type { ContactFormData } from '@/lib/validations/contact.schemas';

vi.mock('./axios-config', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe('contact-api', () => {
  const formData: ContactFormData = {
    name: 'Ana García',
    email: 'ana@example.com',
    subject: 'Consulta de prueba',
    message: 'Este es un mensaje de prueba.',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendContactMessage', () => {
    it('should post the form data to the centralized contact endpoint', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { message: 'Mensaje enviado' } });

      await sendContactMessage(formData);

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.CONTACT.BASE, formData);
    });

    it('should return the backend confirmation', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { message: 'Mensaje enviado exitosamente. Te responderemos a la brevedad.' },
      });

      const result = await sendContactMessage(formData);

      expect(result.message).toBe('Mensaje enviado exitosamente. Te responderemos a la brevedad.');
    });

    it('should propagate the error: swallowing it here would resurrect the bug of the fake success', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Network Error'));

      await expect(sendContactMessage(formData)).rejects.toThrow('Network Error');
    });
  });
});
