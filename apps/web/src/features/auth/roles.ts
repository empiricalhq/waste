export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  DRIVER: 'driver',
  CITIZEN: 'citizen',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// access: protected dashboard layout
export const PROTECTED_ROLES: Role[] = [ROLES.OWNER, ROLES.ADMIN, ROLES.SUPERVISOR];

// access: settings page (stricter)
export const SETTINGS_ROLES: Role[] = [ROLES.OWNER, ROLES.ADMIN];
