import type { Database } from '@/internal/database/connection';
import { IssueQueries } from '@/internal/database/queries';
import type {
  CitizenIssueReport,
  CreateCitizenIssueRequest,
  CreateDriverIssueRequest,
  IssueReportSummary,
} from '@/internal/models/issue';

export class IssueRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async createCitizenIssue(userId: string, data: CreateCitizenIssueRequest): Promise<void> {
    const { type, description, photo_url, lat, lng } = data;
    await this.db.query(IssueQueries.createCitizenIssue, [userId, type, description, photo_url, lat, lng]);
  }

  async findCitizenIssuesByUserId(userId: string): Promise<CitizenIssueReport[]> {
    const result = await this.db.query<CitizenIssueReport>(IssueQueries.findCitizenIssuesByUserId, [userId]);
    return result.rows;
  }

  async createDriverIssue(driverId: string, assignmentId: string, data: CreateDriverIssueRequest): Promise<void> {
    const { type, notes, lat, lng } = data;
    await this.db.query(IssueQueries.createDriverIssue, [driverId, assignmentId, type, notes, lat, lng]);
  }

  async findAllOpen(): Promise<IssueReportSummary[]> {
    const [driverIssues, citizenIssues] = await Promise.all([
      this.db.query<IssueReportSummary>(IssueQueries.findOpenDriverIssues),
      this.db.query<IssueReportSummary>(IssueQueries.findOpenCitizenIssues),
    ]);

    const all = [...driverIssues.rows, ...citizenIssues.rows];
    return all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}
