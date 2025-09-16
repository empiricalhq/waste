'use server';

import { revalidateTag } from 'next/cache';
import { api } from '@/lib/api/client';
import type { Route, RouteFormData } from '@/lib/types';
import { requireRole } from './auth';

export async function getRoutes(): Promise<Route[]> {
  try {
    await requireRole(['admin', 'supervisor']);
    return await api.admin.routes.list();
  } catch (_error) {
    return [];
  }
}

export async function getRoute(id: string): Promise<Route | null> {
  try {
    await requireRole(['admin', 'supervisor']);
    return await api.admin.routes.get(id);
  } catch (_error) {
    return null;
  }
}

export async function createRoute(data: RouteFormData): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRole(['admin', 'supervisor']);
    await api.admin.routes.create(data);
    revalidateTag('routes');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create route',
    };
  }
}

export async function updateRoute(
  id: string,
  data: Partial<RouteFormData>,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRole(['admin', 'supervisor']);
    await api.admin.routes.update(id, data);
    revalidateTag('routes');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update route',
    };
  }
}

export async function deleteRoute(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRole(['admin']);
    await api.admin.routes.delete(id);
    revalidateTag('routes');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete route',
    };
  }
}
