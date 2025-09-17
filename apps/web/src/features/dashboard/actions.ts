'use server';

import type { Issue, Route, Truck } from '@/db/types';
import { api } from '@/lib/api';

const MAX_RECENT_ISSUES = 5;

export async function getDashboardData() {
  try {
    const [trucks, routes, issues] = await Promise.all([
      api.get<Truck[]>('/api/admin/trucks'),
      api.get<Route[]>('/api/admin/routes'),
      api.get<Issue[]>('/api/admin/issues'),
    ]);

    const activeRoutesCount = routes.filter((r) => r.status === 'active').length;
    const recentIssues = issues.slice(0, MAX_RECENT_ISSUES);

    return {
      trucks,
      activeRoutesCount,
      openIssuesCount: issues.length,
      recentIssues,
    };
  } catch {
    return {
      trucks: [],
      activeRoutesCount: 0,
      openIssuesCount: 0,
      recentIssues: [],
    };
  }
}
