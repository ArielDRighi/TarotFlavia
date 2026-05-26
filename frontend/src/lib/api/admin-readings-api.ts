import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type {
  AdminReadingsFilters,
  AdminReadingsResponse,
  AdminReadingListItem,
} from '@/types/admin-readings.types';

export async function fetchAdminReadings(
  filters: AdminReadingsFilters
): Promise<AdminReadingsResponse> {
  const params: Record<string, boolean> = {};
  if (filters.includeDeleted) {
    params.includeDeleted = true;
  }
  const response = await apiClient.get<AdminReadingsResponse>(API_ENDPOINTS.ADMIN.READINGS, {
    params,
  });
  return response.data;
}

export async function softDeleteReading(id: number): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.ADMIN.READING_SOFT_DELETE(id));
}

export async function restoreReading(id: number): Promise<AdminReadingListItem> {
  const response = await apiClient.patch<AdminReadingListItem>(
    API_ENDPOINTS.ADMIN.READING_RESTORE(id)
  );
  return response.data;
}
