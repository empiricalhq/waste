'use server';

import { revalidateTag } from 'next/cache';
import { api } from '@/lib/api/client';
import type { Vehicle, VehicleFormData } from '@/lib/types';
import { requireRole } from './auth';

export async function getVehicles(): Promise<Vehicle[]> {
  try {
    await requireRole(['admin', 'supervisor']);
    return await api.admin.vehicles.list();
  } catch (_error) {
    return [];
  }
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  try {
    await requireRole(['admin', 'supervisor']);
    return await api.admin.vehicles.get(id);
  } catch (_error) {
    return null;
  }
}

export async function createVehicle(data: VehicleFormData): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRole(['admin']);
    await api.admin.vehicles.create(data);
    revalidateTag('vehicles');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create vehicle',
    };
  }
}

export async function updateVehicle(
  id: string,
  data: Partial<VehicleFormData>,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRole(['admin', 'supervisor']);
    await api.admin.vehicles.update(id, data);
    revalidateTag('vehicles');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update vehicle',
    };
  }
}

export async function deleteVehicle(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRole(['admin']);
    await api.admin.vehicles.delete(id);
    revalidateTag('vehicles');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete vehicle',
    };
  }
}
