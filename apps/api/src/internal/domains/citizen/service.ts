import type { DatabaseInterface } from '@/internal/shared/database/database';
import { BaseService } from '@/internal/shared/services/base-service';
import type { CitizenIssueReport, CreateCitizenIssueRequest } from '../issues/models';
import type { IssueRepository } from '../issues/repository';
import type { TruckStatusResponse } from '../locations/models';
import { LocationQueries } from '../locations/queries';

const ETA_MINUTES_PER_KM = 10;
const NEARBY_DISTANCE_THRESHOLD_KM = 0.1;
const MINIMUM_ETA_MINUTES = 1;

export class CitizenService extends BaseService {
  private readonly issueRepo: IssueRepository;
  private readonly db: DatabaseInterface;

  constructor(issueRepo: IssueRepository, db: DatabaseInterface) {
    super();
    this.issueRepo = issueRepo;
    this.db = db;
  }

  async getTruckStatus(userId: string): Promise<TruckStatusResponse> {
    const profileResult = await this.db.query<{ lat: number; lng: number }>(
      LocationQueries.findCitizenProfileLocation,
      [userId],
    );

    const profile = profileResult.rows[0];
    if (!profile?.lat) {
      return { message: 'Please set your location first', status: 'LOCATION_NOT_SET' };
    }

    const { lat, lng } = profile;
    const nearbyResult = await this.db.query<{ truck_name: string; distance_km: number }>(
      LocationQueries.findNearbyTrucks,
      [lat, lng],
    );

    const nearbyTruck = nearbyResult.rows[0];
    if (nearbyTruck) {
      const { truck_name, distance_km } = nearbyTruck;
      const etaMinutes = Math.round(distance_km * ETA_MINUTES_PER_KM);

      return {
        status: distance_km < NEARBY_DISTANCE_THRESHOLD_KM ? 'NEARBY' : 'ON_THE_WAY',
        etaMinutes: Math.max(MINIMUM_ETA_MINUTES, etaMinutes),
        truck: truck_name,
      };
    }

    return { message: 'No trucks currently scheduled for your area', status: 'NOT_SCHEDULED' };
  }

  async updateLocation(userId: string, lat: number, lng: number): Promise<void> {
    await this.db.query(LocationQueries.upsertCitizenProfileLocation, [userId, lat, lng]);
  }

  async reportIssue(userId: string, data: CreateCitizenIssueRequest): Promise<void> {
    await this.issueRepo.createCitizenIssue(userId, data);
  }

  async getUserIssues(userId: string): Promise<CitizenIssueReport[]> {
    return this.issueRepo.findCitizenIssuesByUserId(userId);
  }
}
