/**
 * Tarotista Types (Marketplace)
 */

/**
 * Tarotista básico para listados
 * Coincide con GET /api/tarotistas response
 */
export interface Tarotista {
  id: number;
  nombrePublico: string;
  bio: string;
  especialidades: string[];
  fotoPerfil?: string;
  ratingPromedio: number;
  totalLecturas: number;
  totalReviews: number;
  añosExperiencia: number;
  idiomas: string[];
  createdAt: string;
}

/**
 * Detalle completo de tarotista (perfil público)
 * Coincide con GET /api/tarotistas/:id response
 */
export interface TarotistaDetail extends Tarotista {
  isActive: boolean;
  updatedAt: string;
}

/**
 * Filtros para búsqueda de tarotistas
 * Coincide con query params de GET /api/tarotistas
 */
export interface TarotistaFilters {
  page?: number;
  limit?: number;
  search?: string;
  especialidad?: string;
  orderBy?: 'rating' | 'totalLecturas' | 'nombrePublico' | 'createdAt';
  order?: 'ASC' | 'DESC';
}

/**
 * Respuesta paginada de tarotistas
 * Coincide con estructura del backend
 */
export interface PaginatedTarotistas {
  data: Tarotista[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Review de tarotista (para futuras implementaciones)
 */
export interface TarotistaReview {
  id: number;
  tarotistaId: number;
  userId: number;
  userName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

/**
 * Slot de reserva (para futuras implementaciones)
 */
export interface BookingSlot {
  id: number;
  tarotistaId: number;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}
