/**
 * TanStack Query hooks for readings API
 *
 * Custom hooks using TanStack Query for data fetching and caching.
 * These hooks consume the readings-api functions and provide reactive data management.
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/utils/useToast';
import { userQueryKeys } from './useUser';

import {
  getCategories,
  getPredefinedQuestions,
  getSpreads,
  getMyAvailableSpreads,
  getMyReadings,
  getReadingById,
  createReading,
  deleteReading,
  regenerateInterpretation,
  shareReading,
  unshareReading,
  getTrashedReadings,
  restoreReading,
} from '@/lib/api/readings-api';
import type { CreateReadingDto } from '@/types';

// ============================================================================
// Query Keys (for consistency and type safety)
// ============================================================================

export const readingQueryKeys = {
  all: ['readings'] as const,
  lists: () => [...readingQueryKeys.all, 'list'] as const,
  list: (page: number, limit: number) => [...readingQueryKeys.lists(), { page, limit }] as const,
  details: () => [...readingQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...readingQueryKeys.details(), id] as const,
  trash: () => [...readingQueryKeys.all, 'trash'] as const,
  categories: ['categories'] as const,
  questions: (categoryId?: number) => ['questions', categoryId] as const,
  spreads: ['spreads'] as const,
  myAvailableSpreads: ['spreads', 'my-available'] as const,
} as const;

// ============================================================================
// Catalog Queries (Categories, Questions, Spreads)
// ============================================================================

/**
 * Hook to fetch all categories
 * Categories are static data, so staleTime is set to Infinity
 */
export function useCategories() {
  return useQuery({
    queryKey: readingQueryKeys.categories,
    queryFn: getCategories,
    staleTime: Infinity,
  });
}

/**
 * Hook to fetch predefined questions, optionally filtered by category
 * @param categoryId - Optional category ID to filter questions
 */
export function usePredefinedQuestions(categoryId?: number) {
  return useQuery({
    queryKey: readingQueryKeys.questions(categoryId),
    queryFn: () => getPredefinedQuestions(categoryId),
  });
}

/**
 * Hook to fetch all available spreads
 * Spreads are static data, so staleTime is set to Infinity
 */
export function useSpreads() {
  return useQuery({
    queryKey: readingQueryKeys.spreads,
    queryFn: getSpreads,
    staleTime: Infinity,
  });
}

/**
 * Hook to fetch spreads available for the authenticated user based on their plan
 * For authenticated users, this filters spreads based on their subscription tier
 */
export function useMyAvailableSpreads() {
  return useQuery({
    queryKey: readingQueryKeys.myAvailableSpreads,
    queryFn: getMyAvailableSpreads,
    staleTime: 5 * 60 * 1000, // 5 minutes - can change if user upgrades
  });
}

// ============================================================================
// Readings Queries
// ============================================================================

/**
 * Hook to fetch paginated list of user's readings
 * @param page - Page number (1-indexed)
 * @param limit - Number of items per page
 */
export function useMyReadings(page: number, limit: number) {
  return useQuery({
    queryKey: readingQueryKeys.list(page, limit),
    queryFn: () => getMyReadings(page, limit),
  });
}

/**
 * Hook to fetch a single reading by ID
 * @param id - Reading ID (will not fetch if id is 0 or falsy)
 */
export function useReadingDetail(id: number) {
  return useQuery({
    queryKey: readingQueryKeys.detail(id),
    queryFn: () => getReadingById(id),
    enabled: id > 0,
  });
}

// ============================================================================
// Readings Mutations
// ============================================================================

/**
 * Hook to create a new reading
 * On success: invalidates readings list, refreshes user profile, and shows toast
 */
export function useCreateReading() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReadingDto) => createReading(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: readingQueryKeys.all });
      // Invalidate user profile to refresh daily readings count
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile });
      toast.success('Lectura creada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear lectura');
    },
  });
}

/**
 * Hook to soft delete a reading
 * On success: invalidates readings list and shows toast
 */
export function useDeleteReading() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteReading(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: readingQueryKeys.all });
      toast.success('Lectura eliminada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar lectura');
    },
  });
}

/**
 * Hook to regenerate AI interpretation for a reading
 * On success: invalidates the specific reading and shows toast
 */
export function useRegenerateInterpretation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (readingId: number) => regenerateInterpretation(readingId),
    onSuccess: (_, readingId) => {
      queryClient.invalidateQueries({ queryKey: readingQueryKeys.detail(readingId) });
      toast.success('Interpretación regenerada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al regenerar interpretación');
    },
  });
}

// ============================================================================
// Sharing Mutations
// ============================================================================

/**
 * Hook to share a reading publicly
 * On success: invalidates the specific reading and shows toast
 */
export function useShareReading() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (readingId: number) => shareReading(readingId),
    onSuccess: (_, readingId) => {
      queryClient.invalidateQueries({ queryKey: readingQueryKeys.detail(readingId) });
      toast.success('Lectura compartida');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al compartir lectura');
    },
  });
}

/**
 * Hook to remove public sharing from a reading
 * On success: invalidates the specific reading and shows toast
 */
export function useUnshareReading() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (readingId: number) => unshareReading(readingId),
    onSuccess: (_, readingId) => {
      queryClient.invalidateQueries({ queryKey: readingQueryKeys.detail(readingId) });
      toast.success('Lectura dejada de compartir');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al dejar de compartir lectura');
    },
  });
}

// ============================================================================
// Trash Queries & Mutations
// ============================================================================

/**
 * Hook to fetch all trashed (soft-deleted) readings
 */
export function useTrashedReadings() {
  return useQuery({
    queryKey: readingQueryKeys.trash(),
    queryFn: getTrashedReadings,
  });
}

/**
 * Hook to restore a soft-deleted reading
 * On success: invalidates both readings list and trash, shows toast
 */
export function useRestoreReading() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (readingId: number) => restoreReading(readingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: readingQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: readingQueryKeys.trash() });
      toast.success('Lectura restaurada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al restaurar lectura');
    },
  });
}
