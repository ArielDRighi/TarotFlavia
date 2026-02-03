'use client';

import { useQuery } from '@tanstack/react-query';
import { getRitualRecommendations } from '@/lib/api/rituals-api';
import { useAuthStore } from '@/stores/authStore';

/**
 * Hook para obtener recomendaciones personalizadas de rituales
 * Solo funciona para usuarios Premium
 *
 * @returns Query con recomendaciones de rituales basadas en patrones de lecturas
 *
 * @example
 * ```tsx
 * const { data: recommendations, isLoading } = useRitualRecommendations();
 *
 * if (recommendations?.hasRecommendations) {
 *   recommendations.recommendations.forEach(rec => {
 *     console.log(rec.message, rec.suggestedCategories);
 *   });
 * }
 * ```
 */
export function useRitualRecommendations() {
  const { user } = useAuthStore();
  const isPremium = user?.plan === 'premium';

  return useQuery({
    queryKey: ['rituals', 'recommendations'],
    queryFn: getRitualRecommendations,
    enabled: isPremium,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas (no cambia frecuentemente)
  });
}
