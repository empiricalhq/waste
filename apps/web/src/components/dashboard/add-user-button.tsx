import { getCurrentUser } from '@/features/auth/lib';
import { AddUserDialog } from './add-user-dialog';

export async function AddUserButton() {
  const user = await getCurrentUser();

  if (user?.role !== 'admin' && user?.role !== 'owner') {
    return null;
  }

  return <AddUserDialog />;
}
