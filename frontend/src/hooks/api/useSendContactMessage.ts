/**
 * TanStack Query hook for the public contact form (T-PROD-014)
 */
'use client';

import { useMutation } from '@tanstack/react-query';
import { sendContactMessage } from '@/lib/api/contact-api';
import type { ContactFormData } from '@/lib/validations/contact.schemas';
import type { ContactMessageResponse } from '@/types';

/**
 * Envía el mensaje del formulario de contacto.
 *
 * No invalida ninguna query: el mensaje sale por email, no queda en el estado del
 * servidor. El componente usa `isPending` para el estado de carga y `error` para el
 * mensaje de fallo (incluido el 429 del rate limit).
 */
export function useSendContactMessage() {
  return useMutation<ContactMessageResponse, unknown, ContactFormData>({
    mutationFn: sendContactMessage,
  });
}
