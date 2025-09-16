export const ROUTES = {
  // Public routes
  HOME: '/',
  ABOUT: '/about',

  // Auth routes
  SIGN_IN: '/signin',
  SIGN_UP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',

  // Dashboard routes
  DASHBOARD: '/dashboard',
  DASHBOARD_VEHICLES: '/dashboard/vehicles',
  DASHBOARD_ROUTES: '/dashboard/routes',
  DASHBOARD_DRIVERS: '/dashboard/drivers',
  DASHBOARD_SETTINGS: '/dashboard/settings',

  // API routes
  API_AUTH: '/api/auth',
} as const;

export const ROLE_PERMISSIONS = {
  admin: [
    'create:users',
    'read:users',
    'update:users',
    'delete:users',
    'create:vehicles',
    'read:vehicles',
    'update:vehicles',
    'delete:vehicles',
    'create:routes',
    'read:routes',
    'update:routes',
    'delete:routes',
    'read:dashboard',
    'manage:settings',
  ],
  supervisor: [
    'read:users',
    'update:users', // limited
    'create:vehicles',
    'read:vehicles',
    'update:vehicles',
    'create:routes',
    'read:routes',
    'update:routes',
    'read:dashboard',
  ],
  driver: ['read:assigned_routes', 'update:route_status', 'create:issues', 'read:own_profile', 'update:own_profile'],
} as const;
