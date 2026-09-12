import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import { getSessionFingerprint } from '@/lib/utils/fingerprint';
import type {
  PendulumQueryRequest,
  PendulumQueryResponse,
  PendulumHistoryItem,
  PendulumStats,
  PendulumResponse,
} from '@/types/pendulum.types';

/**
 * Consultar el péndulo
 * Acepta pregunta opcional (solo Premium)
 *
 * Envía el mismo fingerprint de sesión que `GET /users/capabilities` para que el
 * backend registre el consumo anónimo bajo una única clave (TASK-515). Sin él, el
 * guard usa IP + User-Agent y capabilities nunca ve la consulta consumida.
 *
 * Nota: NO transforma errores. Re-lanza el AxiosError original (o el RateLimitError
 * del interceptor en 429) para que el componente pueda leer `response.status` y
 * `response.data.message` / `code` (BLOCKED_CONTENT).
 */
export async function queryPendulum(request: PendulumQueryRequest): Promise<PendulumQueryResponse> {
  const fingerprint = request.fingerprint ?? (await getSessionFingerprint());
  const response = await apiClient.post<PendulumQueryResponse>(API_ENDPOINTS.PENDULUM.QUERY, {
    ...request,
    fingerprint,
  });
  return response.data;
}

/**
 * Obtener historial de consultas del péndulo (solo Premium)
 */
export async function getPendulumHistory(
  limit?: number,
  filterResponse?: PendulumResponse
): Promise<PendulumHistoryItem[]> {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (filterResponse) params.append('response', filterResponse);

  const url = params.toString()
    ? `${API_ENDPOINTS.PENDULUM.HISTORY}?${params.toString()}`
    : API_ENDPOINTS.PENDULUM.HISTORY;

  const response = await apiClient.get<PendulumHistoryItem[]>(url);
  return response.data;
}

/**
 * Obtener estadísticas de consultas del péndulo (solo Premium)
 */
export async function getPendulumStats(): Promise<PendulumStats> {
  const response = await apiClient.get<PendulumStats>(API_ENDPOINTS.PENDULUM.STATS);
  return response.data;
}

/**
 * Eliminar consulta del historial (solo Premium)
 */
export async function deletePendulumQuery(queryId: number): Promise<void> {
  await apiClient.delete(`${API_ENDPOINTS.PENDULUM.HISTORY}/${queryId}`);
}
