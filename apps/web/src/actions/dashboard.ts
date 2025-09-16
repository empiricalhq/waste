'use server';

import { cache } from 'react';
import { api } from '@/lib/api/client';
import type { Alert, Issue, Route, Vehicle } from '@/lib/types';
import { requireRole } from './auth';

interface DashboardData {
  vehicles: Vehicle[];
  activeRoutesCount: number;
  openIssuesCount: number;
  alertsCount: number;
  recentAlerts: Alert[];
}

export const getDashboardData = cache(async (): Promise<DashboardData> => {
  try {
    // Ensure user has proper permissions
    await requireRole(['admin', 'supervisor']);

    // Fetch all required data in parallel
    const [vehicles, routes, issues, alerts] = await Promise.allSettled([
      api.admin.vehicles.list(),
      api.admin.routes.list(),
      api.admin.issues.list(),
      api.admin.alerts.list(),
    ]);

    // Handle results safely
    const vehiclesData = vehicles.status === 'fulfilled' ? vehicles.value : [];
    const routesData = routes.status === 'fulfilled' ? routes.value : [];
    const issuesData = issues.status === 'fulfilled' ? issues.value : [];
    const alertsData = alerts.status === 'fulfilled' ? alerts.value : [];

    // Calculate derived data
    const activeRoutesCount = routesData.filter((r: Route) => r.status === 'active').length;
    const openIssuesCount = issuesData.filter((i: Issue) => i.status === 'open').length;
    const recentAlerts = alertsData.slice(0, 5); // Get 5 most recent alerts

    return {
      vehicles: vehiclesData,
      activeRoutesCount,
      openIssuesCount,
      alertsCount: alertsData.length,
      recentAlerts,
    };
  } catch (_error) {
    // Return empty data on error
    return {
      vehicles: [],
      activeRoutesCount: 0,
      openIssuesCount: 0,
      alertsCount: 0,
      recentAlerts: [],
    };
  }
});
