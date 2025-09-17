'use server';

import type { Route, SystemAlert, Truck, TruckLocation } from '@/db/types';
import { api } from '@/lib/api';

export async function getDashboardData() {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay

  try {
    const [trucksWithLocation, routes, alerts] = await Promise.all([
      api.get<(Truck & TruckLocation)[]>('/api/admin/trucks/locations'),
      api.get<Route[]>('/api/admin/routes'),
      api.get<SystemAlert[]>('/api/admin/alerts'),
    ]);

    const activeRoutesCount = routes.filter((r) => r.status === 'active').length;
    const recentAlerts = alerts.slice(0, 5);

    return {
      trucks: trucksWithLocation,
      trucksCount: trucksWithLocation.length,
      activeRoutesCount,
      openIssuesCount: 0, // Placeholder, as issues endpoint is not defined in detail
      alertsCount: alerts.length,
      recentAlerts,
    };
  } catch {
    // Return empty state on failure to prevent page crash
    return {
      trucks: [],
      trucksCount: 0,
      activeRoutesCount: 0,
      openIssuesCount: 0,
      alertsCount: 0,
      recentAlerts: [],
    };
  }
}
