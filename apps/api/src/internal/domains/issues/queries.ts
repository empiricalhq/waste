export const IssueQueries = {
  createCitizenIssue: `
    INSERT INTO citizen_issue_report (id, user_id, type, description, photo_url, lat, lng)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
    RETURNING id
  `,
  findCitizenIssuesByUserId: `
    SELECT * FROM citizen_issue_report
    WHERE user_id = $1
    ORDER BY created_at DESC
  `,
  createDriverIssue: `
    INSERT INTO driver_issue_report (id, driver_id, route_assignment_id, type, notes, lat, lng)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
    RETURNING id
  `,
  findOpenDriverIssues: `
    SELECT 'driver' as source, id, type, status, created_at, notes as description, lat, lng
    FROM driver_issue_report
    WHERE status = 'open'
  `,
  findOpenCitizenIssues: `
    SELECT 'citizen' as source, id, type, status, created_at, description, lat, lng
    FROM citizen_issue_report
    WHERE status = 'open'
  `,
} as const;
