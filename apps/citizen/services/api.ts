type TruckStatusResponse =
  | { status: 'NEARBY' | 'ON_THE_WAY'; etaMinutes: number }
  | { status: 'NOT_SCHEDULED'; nextCollectionDay: string };

/**
 * Simulates fetching the garbage truck status for a given user.
 * This is the single point of contact for this piece of data.
 * @param {string} userId - The ID of the logged-in citizen.
 * @returns {Promise<TruckStatusResponse>}
 */
export const getTruckStatusForUser = async (userId: string): Promise<TruckStatusResponse> => {
  console.log(`Fetching truck status for user: ${userId}`);
  
  await new Promise(resolve => setTimeout(resolve, 1000));

  const isNearby = Math.random() > 0.5;

  if (isNearby) {
    const eta = Math.floor(Math.random() * 10) + 2; // 2 to 12 minutes
    return {
      status: eta < 5 ? 'NEARBY' : 'ON_THE_WAY',
      etaMinutes: eta,
    };
  } else {
    return {
      status: 'NOT_SCHEDULED',
      nextCollectionDay: 'Mañana por la mañana',
    };
  }
};
