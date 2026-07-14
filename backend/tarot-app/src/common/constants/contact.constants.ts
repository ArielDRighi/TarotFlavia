/**
 * Datos de contacto del proyecto.
 *
 * Espeja `CONFIG.CONTACT_EMAIL` del frontend: el email vive en un solo lugar por
 * capa para que no vuelva a divergir (el rebrand a `auguriatarot.com` se filtró
 * justamente porque el string estaba repetido a mano).
 */

/**
 * Única dirección de contacto del backend. Es la casilla real del dominio del
 * proyecto (`auguriatarot.com`); cualquier otro dominio rebota.
 */
export const CONTACT_EMAIL = 'consultas@auguriatarot.com';

/**
 * `User-Agent` de las llamadas de geocoding (Photon y Nominatim).
 *
 * La política de uso de Nominatim exige identificar la aplicación con un medio
 * de contacto **válido**: es su vía para avisarnos antes de bloquearnos. Con un
 * buzón inexistente el aviso rebota y el bloqueo llega sin previo aviso —
 * y sin geocoding no se puede generar ninguna carta natal nueva.
 *
 * @see https://operations.osmfoundation.org/policies/nominatim/
 */
export const GEOCODING_USER_AGENT = `Auguria/1.0 (${CONTACT_EMAIL})`;
