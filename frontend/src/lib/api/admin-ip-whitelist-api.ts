import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type {
  WhitelistResponse,
  WhitelistIPDto,
  WhitelistActionResponse,
} from '@/types/admin-security.types';

/**
 * Obtiene la lista de IPs en la whitelist
 * GET /admin/ip-whitelist
 */
export async function getIpWhitelist(): Promise<WhitelistResponse> {
  const response = await apiClient.get<WhitelistResponse>(API_ENDPOINTS.ADMIN.IP_WHITELIST);
  return response.data;
}

/**
 * Agrega una IP a la whitelist
 * POST /admin/ip-whitelist
 */
export async function addIpToWhitelist(dto: WhitelistIPDto): Promise<WhitelistActionResponse> {
  const response = await apiClient.post<WhitelistActionResponse>(
    API_ENDPOINTS.ADMIN.IP_WHITELIST,
    dto
  );
  return response.data;
}

/**
 * Elimina una IP de la whitelist
 * DELETE /admin/ip-whitelist (IP en el body para soportar IPv6)
 */
export async function removeIpFromWhitelist(dto: WhitelistIPDto): Promise<WhitelistActionResponse> {
  const response = await apiClient.delete<WhitelistActionResponse>(
    API_ENDPOINTS.ADMIN.IP_WHITELIST,
    { data: dto }
  );
  return response.data;
}
