/**
 * API functions for the public contact form (T-PROD-014)
 *
 * Endpoint público (no requiere autenticación) y limitado a 3 mensajes/hora por IP en
 * el backend: pasado el límite responde 429.
 */

import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type { ContactFormData } from '@/lib/validations/contact.schemas';
import type { ContactMessageResponse } from '@/types';

/**
 * Envía el mensaje del formulario de contacto al buzón de Auguria.
 *
 * Si falla, el error se propaga a propósito: el bug de esta tarea era mostrarle al
 * visitante un "mensaje enviado" mientras el mensaje no salía a ningún lado.
 */
export async function sendContactMessage(data: ContactFormData): Promise<ContactMessageResponse> {
  const response = await apiClient.post<ContactMessageResponse>(API_ENDPOINTS.CONTACT.BASE, data);
  return response.data;
}
