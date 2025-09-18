export const UserQueries = {
  findDrivers: `
    SELECT u.id, u.name, u.email, u."isActive", u."createdAt", m.role
    FROM "user" u
    JOIN member m ON u.id = m."userId"
    WHERE m.role = 'driver'
    ORDER BY u."createdAt" DESC
  `,
} as const;
