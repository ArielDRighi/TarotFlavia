/**
 * Contact Types (T-PROD-014)
 */

/** Confirmación que devuelve `POST /contact` cuando el mensaje salió por email. */
export interface ContactMessageResponse {
  message: string;
}
