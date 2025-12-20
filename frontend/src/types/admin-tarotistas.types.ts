/**
 * Admin Tarotistas Types
 *
 * Tipos para la gestión de tarotistas desde el panel admin
 * Refleja el contrato del backend en /admin/tarotistas
 */

/**
 * Tarotista con información administrativa
 * Backend: Tarotista entity
 */
export interface AdminTarotista {
  id: number;
  userId: number;
  nombrePublico: string;
  bio: string | null;
  fotoPerfil: string | null;
  especialidades: string[];
  idiomas: string[];
  añosExperiencia: number | null;
  ofreceSesionesVirtuales: boolean;
  precioSesionUsd: number | null;
  duracionSesionMinutos: number | null;
  isActive: boolean;
  isAcceptingNewClients: boolean;
  isFeatured: boolean;
  comisiónPorcentaje: number;
  ratingPromedio: number | null;
  totalReviews: number;
  totalLecturas: number;
  totalIngresos: number | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Filtros para búsqueda de tarotistas (query params admin)
 * Backend: GetTarotistasFilterDto
 */
export interface AdminTarotistasFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'createdAt' | 'nombrePublico' | 'ratingPromedio' | 'totalLecturas' | 'totalIngresos';
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Respuesta paginada de tarotistas admin
 * Backend: Usa el formato estándar de paginación
 */
export interface AdminTarotistasResponse {
  data: AdminTarotista[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * Estado de la aplicación
 * Backend: ApplicationStatus enum
 */
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

/**
 * Aplicación para ser tarotista
 * Backend: TarotistaApplication entity
 */
export interface TarotistaApplication {
  id: number;
  userId: number;
  nombrePublico: string;
  biografia: string;
  especialidades: string[];
  motivacion: string;
  experiencia: string;
  status: ApplicationStatus;
  adminNotes: string | null;
  reviewedByUserId: number | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Relación con usuario
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

/**
 * Filtros para aplicaciones pendientes
 */
export interface ApplicationsFilters {
  page?: number;
  limit?: number;
  status?: ApplicationStatus;
}

/**
 * Respuesta paginada de aplicaciones
 */
export interface ApplicationsResponse {
  data: TarotistaApplication[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * DTO para aprobar aplicación
 * Backend: ApproveApplicationDto
 */
export interface ApproveApplicationDto {
  adminNotes?: string;
}

/**
 * DTO para rechazar aplicación
 * Backend: RejectApplicationDto
 */
export interface RejectApplicationDto {
  adminNotes: string;
}

/**
 * Configuración de IA del tarotista
 * Backend: TarotistaConfig entity
 */
export interface TarotistaConfig {
  id: number;
  tarotistaId: number;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  model: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO para actualizar configuración de IA
 */
export interface UpdateTarotistaConfigDto {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

/**
 * Respuesta de acción admin (aprobar/rechazar)
 */
export interface AdminTarotistaActionResponse {
  message: string;
  tarotista?: AdminTarotista;
  application?: TarotistaApplication;
}
