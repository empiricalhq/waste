import type { AppRole } from '@/internal/shared/auth/roles';

export type MemberRole = AppRole;

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface UserWithRole extends User {
  role: MemberRole;
}
