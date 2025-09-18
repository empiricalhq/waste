export type MemberRole = 'admin' | 'supervisor' | 'driver' | 'owner';

export interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
}

export interface UserWithRole extends User {
  role: MemberRole;
}
