export type TruckStatus = 'NEARBY' | 'ON_THE_WAY' | 'NOT_SCHEDULED' | 'LOADING' | 'ERROR';

export type TruckStatusResponse =
  | { status: 'NEARBY' | 'ON_THE_WAY'; etaMinutes: number }
  | { status: 'NOT_SCHEDULED'; nextCollectionDay: string };

export interface TruckState {
  status: TruckStatus;
  etaMinutes: number | null;
  nextCollectionDay: string | null;
  error: string | null;
  fetchTruckStatus: (userId: string) => Promise<void>;
}
