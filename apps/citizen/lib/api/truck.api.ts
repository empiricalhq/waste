import type { TruckStatusResponse } from '@/lib/types/truck.types';

const MOCK_DELAY = 1000;

/**
 * Fetches the garbage truck status for a given user.
 * This is the single source of truth for truck status data.
 */
export const getTruckStatusForUser = async (userId: string): Promise<TruckStatusResponse> => {
  console.log(`Fetching truck status for user: ${userId}`);

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

  const isNearby = Math.random() > 0.5;

  if (isNearby) {
    const eta = Math.floor(Math.random() * 10) + 2; // 2-12 minutes
    return {
      status: eta < 5 ? 'NEARBY' : 'ON_THE_WAY',
      etaMinutes: eta,
    };
  }

  return {
    status: 'NOT_SCHEDULED',
    nextCollectionDay: 'Mañana por la mañana',
  };
};
