'use server';

import { api } from '@/lib/api';

const MAX_RECENT_ISSUES = 5;

export async function getDashboardData() {
  try {
    const [trucks, routes, issues] = await Promise.all([
      api.admin.getTrucks(),
      api.admin.getRoutes(),
      api.admin.getOpenIssues(),
    ]);

    const activeRoutesCount = routes.filter((r) => r.status === 'active').length;
    const recentIssues = issues.slice(0, MAX_RECENT_ISSUES);

    return {
      trucks,
      activeRoutesCount,
      openIssuesCount: issues.length,
      recentIssues,
    };
  } catch (_error) {
    return {
      trucks: [],
      activeRoutesCount: 0,
      openIssuesCount: 0,
      recentIssues: [],
    };
  }
}
