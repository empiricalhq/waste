import { BaseRepository } from '@/internal/shared/repository/base-repository';
import { AppError } from '@/internal/shared/utils/errors';
import { HttpStatus } from '@/internal/shared/utils/http-status';
import type {
  CitizenIssueReport,
  CreateCitizenIssueRequest,
  CreateDriverIssueRequest,
  IssueReportSummary,
} from './models';
import { IssueQueries } from './queries';

export class IssueRepository extends BaseRepository {
  async createCitizenIssue(userId: string, data: CreateCitizenIssueRequest): Promise<CitizenIssueReport> {
    const { type, description, photo_url, lat, lng } = data;
    const result = await this.executeQuery<CitizenIssueReport>(
      IssueQueries.createCitizenIssue,
      [userId, type, description, photo_url, lat, lng],
    );
    
    const createdIssue = result[0];
    if (!createdIssue) {
      throw new AppError('Failed to create issue', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    return createdIssue;
  }

  async findCitizenIssuesByUserId(userId: string): Promise<CitizenIssueReport[]> {
    return this.executeQuery<CitizenIssueReport>(IssueQueries.findCitizenIssuesByUserId, [userId]);
  }

  async createDriverIssue(driverId: string, assignmentId: string, data: CreateDriverIssueRequest): Promise<void> {
    const { type, notes, lat, lng } = data;
    await this.executeQuery(IssueQueries.createDriverIssue, [driverId, assignmentId, type, notes, lat, lng]);
  }

  async findAllOpen(): Promise<IssueReportSummary[]> {
    const [driverIssues, citizenIssues] = await Promise.all([
      this.executeQuery<IssueReportSummary>(IssueQueries.findOpenDriverIssues),
      this.executeQuery<IssueReportSummary>(IssueQueries.findOpenCitizenIssues),
    ]);

    const all = [...driverIssues, ...citizenIssues];
    return all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}
