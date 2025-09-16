import { ROLE_PERMISSIONS } from '@/lib/constants/routes';
import type { User } from '@/lib/types';

export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) {
    return false;
  }

  const rolePermissions = ROLE_PERMISSIONS[user.appRole];
  return rolePermissions?.includes(permission);
}

export function canAccessRoute(user: User | null, route: string): boolean {
  if (!user) {
    return false;
  }

  // Admin can access everything
  if (user.appRole === 'admin') {
    return true;
  }

  // Supervisor access
  if (user.appRole === 'supervisor') {
    const supervisorRoutes = ['/dashboard', '/dashboard/vehicles', '/dashboard/routes', '/dashboard/drivers'];
    return supervisorRoutes.some((allowedRoute) => route.startsWith(allowedRoute));
  }

  // Driver access (very limited)
  if (user.appRole === 'driver') {
    const driverRoutes = ['/dashboard/profile', '/dashboard/my-routes'];
    return driverRoutes.some((allowedRoute) => route.startsWith(allowedRoute));
  }

  return false;
}
