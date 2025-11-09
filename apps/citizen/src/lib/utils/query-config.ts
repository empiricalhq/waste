import type { UseQueryOptions } from '@tanstack/react-query';

/**
 * Get adaptive query options based on connection type
 * Use this to adjust query behavior for cellular vs WiFi connections
 */
export const getAdaptiveQueryOptions = (
  isWifi: boolean,
  baseOptions?: Partial<UseQueryOptions>
): Partial<UseQueryOptions> => {
  if (isWifi) {
    // On WiFi, use default aggressive refetching
    return {
      ...baseOptions,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    };
  }

  // On cellular, be more conservative
  return {
    ...baseOptions,
    staleTime: 15 * 60 * 1000, // 15 minutes (vs 5 minutes default)
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    refetchInterval: false, // Disable polling
  };
};

/**
 * Check if a query should refetch based on connection type
 */
export const shouldRefetch = (isWifi: boolean, isStale: boolean): boolean => {
  // Always refetch stale data on WiFi
  if (isWifi && isStale) {
    return true;
  }

  // On cellular, only refetch if data is very stale (>30 minutes)
  if (!isWifi && isStale) {
    return false; // Let the longer staleTime handle this
  }

  return false;
};
