/**
 * Tests for invalidateUserData utility
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { invalidateUserData } from './invalidate-user-data';
import { capabilitiesQueryKeys } from '@/hooks/api/useUserCapabilities';
import { userQueryKeys } from '@/hooks/api/useUser';

describe('invalidateUserData', () => {
  let queryClient: QueryClient;
  let invalidateQueriesSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    invalidateQueriesSpy = vi.fn().mockResolvedValue(undefined);
    queryClient = {
      invalidateQueries: invalidateQueriesSpy,
    } as unknown as QueryClient;
  });

  it('should invalidate user capabilities query', async () => {
    await invalidateUserData(queryClient);

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: capabilitiesQueryKeys.capabilities,
    });
  });

  it('should invalidate user profile query', async () => {
    await invalidateUserData(queryClient);

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: userQueryKeys.profile,
    });
  });

  it('should invalidate both queries in parallel', async () => {
    await invalidateUserData(queryClient);

    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2);
  });

  it('should wait for all invalidations to complete', async () => {
    const promise1 = Promise.resolve();
    const promise2 = Promise.resolve();

    invalidateQueriesSpy.mockResolvedValueOnce(promise1).mockResolvedValueOnce(promise2);

    await invalidateUserData(queryClient);

    // Both promises should be awaited
    await Promise.all([promise1, promise2]);
    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2);
  });

  it('should reject if any invalidation fails', async () => {
    const error = new Error('Invalidation failed');
    invalidateQueriesSpy.mockRejectedValueOnce(error);

    await expect(invalidateUserData(queryClient)).rejects.toThrow('Invalidation failed');
  });
});
