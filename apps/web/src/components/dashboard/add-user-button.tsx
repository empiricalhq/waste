import { getCurrentUser } from '@/features/auth/lib';
import { AddUserButtonClient } from './add-user-button-client';

export async function AddUserButton() {
  const user = await getCurrentUser();

  if (user?.appRole !== 'admin') {
    return null;
  }

  return <AddUserButtonClient />;
}
