'use server';

import { revalidateTag } from 'next/cache';
import { api } from '@/lib/api/client';
import type { User } from '@/lib/types';
import { requireRole } from './auth';

export async function getDrivers(): Promise<User[]> {
  try {
    await requireRole(['admin', 'supervisor']);
    return await api.admin.drivers.list();
  } catch (_error) {
    return [];
  }
}

export async function getDriver(id: string): Promise<User | null> {
  try {
    await requireRole(['admin', 'supervisor']);
    return await api.admin.drivers.get(id);
  } catch (_error) {
    return null;
  }
}

export async function updateDriverStatus(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRole(['admin', 'supervisor']);
    await api.admin.drivers.update(id, { isActive });
    revalidateTag('drivers');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update driver status',
    };
  }
}
